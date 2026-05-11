import crypto from 'crypto';
import mongoose from 'mongoose';
import { ContentResource } from './model.js';
import type { IContentBlock, BlockType, ResourceFormat } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { ICurriculumNode } from '../CurriculumStructure/model.js';
import type { GenerateContentInput, RefineResourceInput } from './validation.js';
import { checkUsageLimit } from '../../middleware/usageLimits.js';
import {
  resolveTextbookContextForTopic,
  renderTextbookSourceSection,
} from '../Textbook/service-textbook-context.js';
import type { TextbookContext } from '../Textbook/service-textbook-context.js';
import { logger } from '../../common/logger.js';

const INTERACTIVE_TYPES: ReadonlySet<string> = new Set([
  'quiz', 'fill_blank', 'drag_drop', 'match_columns', 'ordering', 'hotspot',
]);

export class GenerationService {
  static async generateContent(
    schoolId: string,
    userId: string,
    data: GenerateContentInput,
  ) {
    const limitCheck = await checkUsageLimit(schoolId, 'maxAiGenerationsPerDay');

    if (!limitCheck.allowed) {
      throw new BadRequestError(
        `Daily AI generation limit reached (${limitCheck.current}/${limitCheck.limit} on ${limitCheck.plan} plan). Try again tomorrow.`,
      );
    }

    const node = await CurriculumNode.findOne({
      _id: new mongoose.Types.ObjectId(data.curriculumNodeId),
      isDeleted: false,
    }).lean();

    if (!node) throw new NotFoundError('Curriculum node not found');

    // Optional textbook grounding — failures are logged and ignored so the
    // generator falls back to the topic title + description only.
    let textbookCtx: TextbookContext = { source: 'none', text: '' };
    try {
      textbookCtx = await resolveTextbookContextForTopic(
        data.curriculumNodeId,
        new mongoose.Types.ObjectId(schoolId),
      );
    } catch (err: unknown) {
      logger.warn({ err }, '[content-gen] textbook-context resolver failed; continuing without');
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(data, node, textbookCtx);

    const aiResponse = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 8192,
      temperature: 0.4,
    });

    const blocks = parseAIResponseToBlocks(aiResponse, data.blockTypes);
    const format: ResourceFormat = blocks.some((b) => INTERACTIVE_TYPES.has(b.type))
      ? 'interactive'
      : 'static';

    const resource = await ContentResource.create({
      curriculumNodeId: new mongoose.Types.ObjectId(data.curriculumNodeId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      type: data.type,
      format,
      title: `${node.title} — ${data.type.replace('_', ' ')}`,
      blocks,
      source: 'ai_generated',
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      term: data.term,
      tags: [],
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
      aiModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      aiPrompt: userPrompt,
      difficulty: data.difficulty,
      estimatedMinutes: 0,
      prerequisites: [],
    });

    return resource.toObject();
  }

  static async refineContent(
    resourceId: string,
    schoolId: string,
    userId: string,
    data: RefineResourceInput,
  ) {
    const oid = new mongoose.Types.ObjectId(resourceId);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const resource = await ContentResource.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');
    if (resource.createdBy.toString() !== userId) {
      throw new BadRequestError('Only the creator can refine this resource');
    }

    const currentBlocksJson = JSON.stringify(resource.blocks, null, 2);

    const systemPrompt =
      'You are refining an existing educational resource for South African CAPS curriculum. ' +
      'The teacher has requested a change. You must return the COMPLETE updated blocks array ' +
      '(not just the changes). Maintain the same JSON format. Keep all existing content that ' +
      "wasn't mentioned in the instruction. Apply the teacher's instruction precisely.\n\n" +
      'You MUST respond with valid JSON only. No markdown, no code fences, no explanation — just the JSON array.';

    const userPrompt =
      `CURRENT BLOCKS:\n${currentBlocksJson}\n\n` +
      `TEACHER INSTRUCTION: ${data.instruction}`;

    const aiResponse = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 8192,
      temperature: 0.3,
    });

    const blockTypes = resource.blocks.map(
      (b: { type: string }) => b.type,
    );
    const blocks = parseAIResponseToBlocks(aiResponse, blockTypes);
    const format = blocks.some((b) => INTERACTIVE_TYPES.has(b.type))
      ? 'interactive'
      : 'static';

    const updated = await ContentResource.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { blocks, format } },
      { new: true },
    ).lean();

    return updated;
  }
}

function buildSystemPrompt(): string {
  return `You are a world-class South African CAPS curriculum content author. You produce rich, pedagogically sound educational resources for South African learners from Grade R to Grade 12.

RESPONSE FORMAT
Respond with ONLY a valid JSON array of content blocks. No markdown fences, no preamble, no commentary — just the JSON array.

BLOCK SCHEMA
Each element in the array must be an object with these fields:
- "blockId": a unique UUID string (e.g. "b1", "b2", … or a full UUID)
- "type": one of "text", "image", "quiz", "fill_blank", "drag_drop", "match_columns", "ordering", "hotspot", "step_reveal", "code"
- "order": integer starting at 0
- "content": string (see content rules per type below)
- "points": number (0 for non-question blocks, positive integer for question blocks)
- "hints": array of hint strings (empty for non-question blocks)
- "explanation": string with a full worked explanation (empty for non-question blocks)
- "metadata": object with type-specific data (see below)

CONTENT RULES BY BLOCK TYPE

1. TEXT blocks (type: "text")
   - Content is rich Markdown with:
     * Headings using ## and ###
     * **Bold** and *italic* for emphasis
     * Bullet lists and numbered lists
     * Inline LaTeX math: $x^2 + y^2 = r^2$
     * Display LaTeX math on its own line: $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
     * GFM tables for comparisons and data
     * Blockquotes (> ) for tips, memory aids, exam advice
   - metadata: {}

2. QUIZ blocks (type: "quiz")
   - Content is the question text (may include LaTeX math)
   - metadata MUST contain:
     * "questionType": "mcq"
     * "options": array of 4 option strings
     * "correctAnswer": the exact text of the correct option
   - points: 1-3 depending on difficulty
   - hints: 1-2 helpful hints
   - explanation: full worked solution

3. FILL_BLANK blocks (type: "fill_blank")
   - Content uses ___ (triple underscore) to mark each blank
   - metadata MUST contain:
     * "blanks": array of correct answers in order
   - points: 1 per blank
   - hints: 1 hint per blank
   - explanation: why each answer is correct

4. IMAGE blocks (type: "image")
   - For diagrams, flowcharts, hierarchies, cycles, and processes
   - Content is a valid Mermaid diagram string (graph TD, flowchart LR, sequenceDiagram, classDiagram, pie, etc.)
   - metadata MUST contain:
     * "renderer": "mermaid"
     * "caption": descriptive caption string
   - points: 0, hints: [], explanation: ""

5. MATCH_COLUMNS blocks (type: "match_columns")
   - Content describes the matching task
   - metadata MUST contain:
     * "pairs": array of {"left": "...", "right": "..."} objects
   - points: 1 per pair
   - hints and explanation as appropriate

6. ORDERING blocks (type: "ordering")
   - Content describes what to order
   - metadata MUST contain:
     * "correctOrder": array of items in the correct sequence
   - points: based on number of items

7. DRAG_DROP blocks (type: "drag_drop")
   - Content describes the activity
   - metadata MUST contain:
     * "items": array of draggable item strings
     * "targets": array of target zone strings
     * "correctMapping": object mapping item to target

SOUTH AFRICAN CONTEXT AND TERMINOLOGY (CRITICAL)
- ALWAYS use "learners" (never "students")
- ALWAYS use "educator" in formal references (never "teacher")
- Use South African English spelling (colour, metre, organisation, analyse, centre)
- Currency examples in Rand (R) — e.g. "R150", "R2 500", never dollars
- Reference "Matric" for Grade 12, "NSC" for National Senior Certificate
- Use "SBA" for School-Based Assessment, not "coursework"
- Use "control test" not "quiz" for formal assessments
- Use SA geography: Table Mountain, Kruger National Park, Drakensberg, uMgeni River, Limpopo
- Reference SA flora/fauna: protea, springbok, African penguin, baobab tree
- Use SA names: Thabo, Naledi, Sipho, Ayanda, Fatima, Pieter, Lerato, Kagiso, Zanele
- Reference SA context: load shedding, taxi routes, braai, Ubuntu, Eskom, SARS (tax), Telkom
- Use SA measurement conventions: km (not miles), °C (not °F), litres (not gallons)
- Align to CAPS curriculum standards and assessment terminology throughout

PEDAGOGICAL STRUCTURE
For LESSONS: follow this flow:
  1. Introduction / Hook — engage curiosity with a real-world SA scenario
  2. Key Concepts — clear explanations with definitions, LaTeX math where applicable
  3. Worked Examples — step-by-step solutions
  4. Visual Aid — Mermaid diagram if the topic benefits from it
  5. Practice — interactive quiz and fill_blank blocks
  6. Summary — key takeaways in a blockquote

For WORKSHEETS: structure with progressive difficulty:
  - Section A: Easy recall questions (quiz/fill_blank)
  - Section B: Medium application questions
  - Section C: Challenging analysis/evaluation questions
  Include a mix of question types. Start with a text block stating instructions.

For ACTIVITIES: hands-on, exploratory:
  - Context-setting text block
  - Step-by-step instructions
  - Interactive checkpoints (quiz/fill_blank)
  - Reflection or discussion prompt

For STUDY_NOTES: comprehensive reference:
  - Topic overview with key definitions
  - Detailed explanations with examples
  - Summary tables (GFM markdown)
  - Memory aids in blockquotes
  - Self-check quiz at the end

For WORKED_EXAMPLES: step-by-step problem solving:
  - Problem statement
  - Method/approach explanation
  - Step-by-step solution with LaTeX math
  - Common mistakes to avoid
  - Practice problem (quiz block)

BLOCK COUNT REQUIREMENTS
- Lessons: 8–12 blocks
- Worksheets: 6–10 blocks
- Activities: 5–8 blocks
- Study notes: 8–12 blocks
- Worked examples: 6–10 blocks

MANDATORY MINIMUMS
- At least 2 interactive blocks (quiz or fill_blank) per resource
- At least 1 Mermaid diagram (image block) when the topic benefits from visual representation (processes, hierarchies, cycles, relationships, data flow)
- ALL mathematical expressions must use LaTeX notation (inline $ or display $$)

When a TEXTBOOK SOURCE is provided in the user prompt, ground your content in it: reuse the source's vocabulary, examples, and conventions; do not contradict it.`;
}

function buildUserPrompt(
  data: GenerateContentInput,
  node: Pick<ICurriculumNode, 'title' | 'description'>,
  textbookCtx: TextbookContext,
): string {
  const nodeTitle = node.title;
  const nodeDesc = node.description;
  const difficultyLabels: Record<number, string> = {
    1: 'Very Easy (Grade-entry level)',
    2: 'Easy (Below average)',
    3: 'Medium (Grade-appropriate)',
    4: 'Hard (Above average)',
    5: 'Very Hard (Extension / Olympiad prep)',
  };
  const diffLabel = difficultyLabels[data.difficulty] ?? `${data.difficulty}/5`;
  const typeLabel = data.type.replace(/_/g, ' ');
  const blockTypesStr = data.blockTypes.join(', ');

  const lines = [
    `Generate a CAPS-aligned ${typeLabel} for South African learners.`,
    ``,
    `TOPIC: ${nodeTitle}${nodeDesc ? ` — ${nodeDesc}` : ''}`,
    `TERM: ${data.term}`,
    `DIFFICULTY: ${diffLabel}`,
    `REQUESTED BLOCK TYPES: ${blockTypesStr}`,
    ``,
    `Requirements:`,
    `- Use the requested block types: ${blockTypesStr}`,
    `- Include at least 2 interactive blocks (quiz or fill_blank)`,
    `- Include a Mermaid diagram if the topic benefits from visual representation`,
    `- All math must use LaTeX ($ for inline, $$ for display)`,
    `- Use South African context, names, and examples throughout`,
    `- Follow the pedagogical structure for a "${typeLabel}" as described in your instructions`,
  ];

  if (data.instructions) {
    lines.push(``, `ADDITIONAL TEACHER INSTRUCTIONS: ${data.instructions}`);
  }

  const sourceSection = renderTextbookSourceSection(textbookCtx);
  if (sourceSection) lines.push(sourceSection);

  return lines.join('\n');
}

function parseAIResponseToBlocks(
  response: string,
  requestedTypes: string[],
): IContentBlock[] {
  const validTypes = new Set([
    'text', 'image', 'video', 'quiz', 'drag_drop', 'fill_blank',
    'match_columns', 'ordering', 'hotspot', 'step_reveal', 'code',
  ]);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Parsed value is not an array');

    return parsed.map((block: unknown, index: number) => {
      const b = block as Record<string, unknown>;

      const rawType = typeof b.type === 'string' ? b.type : requestedTypes[0];
      const blockType: BlockType = (
        validTypes.has(rawType) ? rawType : 'text'
      ) as BlockType;

      const rawContent = typeof b.content === 'string'
        ? b.content
        : JSON.stringify(b.content ?? '');

      const rawMetadata = (
        b.metadata !== null && typeof b.metadata === 'object' && !Array.isArray(b.metadata)
      )
        ? b.metadata as Record<string, unknown>
        : {};

      const metadata: Record<string, unknown> = { ...rawMetadata };

      if (blockType === 'quiz') {
        if (!metadata.questionType) metadata.questionType = 'mcq';
        if (!metadata.options && Array.isArray(b.options)) {
          metadata.options = b.options;
        }
        if (!metadata.correctAnswer && typeof b.correctAnswer === 'string') {
          metadata.correctAnswer = b.correctAnswer;
        }
      }

      if (blockType === 'fill_blank') {
        if (!metadata.blanks && Array.isArray(b.blanks)) {
          metadata.blanks = b.blanks;
        }
      }

      if (blockType === 'image') {
        if (!metadata.renderer && typeof b.renderer === 'string') {
          metadata.renderer = b.renderer;
        }
        if (!metadata.caption && typeof b.caption === 'string') {
          metadata.caption = b.caption;
        }
      }

      if (blockType === 'match_columns') {
        if (!metadata.pairs && Array.isArray(b.pairs)) {
          metadata.pairs = b.pairs;
        }
      }

      if (blockType === 'ordering') {
        if (!metadata.correctOrder && Array.isArray(b.correctOrder)) {
          metadata.correctOrder = b.correctOrder;
        }
      }

      if (blockType === 'drag_drop') {
        if (!metadata.items && Array.isArray(b.items)) metadata.items = b.items;
        if (!metadata.targets && Array.isArray(b.targets)) metadata.targets = b.targets;
        if (!metadata.correctMapping && typeof b.correctMapping === 'object') {
          metadata.correctMapping = b.correctMapping;
        }
      }

      return {
        blockId: typeof b.blockId === 'string' ? b.blockId : crypto.randomUUID(),
        type: blockType,
        order: typeof b.order === 'number' ? b.order : index,
        content: rawContent,
        curriculumNodeId: null,
        cognitiveLevel: null,
        points: typeof b.points === 'number' ? b.points : 0,
        hints: Array.isArray(b.hints)
          ? (b.hints as unknown[]).filter((h): h is string => typeof h === 'string')
          : [],
        explanation: typeof b.explanation === 'string' ? b.explanation : '',
        metadata,
      };
    });
  } catch {
    return [
      {
        blockId: crypto.randomUUID(),
        type: 'text',
        order: 0,
        content: response,
        curriculumNodeId: null,
        cognitiveLevel: null,
        points: 0,
        hints: [],
        explanation: '',
        metadata: {},
      },
    ];
  }
}
