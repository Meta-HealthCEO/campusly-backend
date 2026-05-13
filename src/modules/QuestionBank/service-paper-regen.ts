import type { IAssessmentPaper } from './model.js';
import { Grade, Subject } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError } from '../../common/errors.js';
import {
  getTemplatesForGrade,
  formatTemplatesForPrompt,
} from '../../lib/tikz-templates.js';

// ─── regenerateSingleQuestion ───────────────────────────────────────────────
//
// Pure compute: takes a paper + position and returns a freshly AI-generated
// replacement question. The caller (service-paper-questions.regeneratePaperQuestion)
// is responsible for writing the result back to the paper, mirroring to the
// memo, and scheduling diagram render. This separation keeps the regen prompt
// owned next to the canonical paper generator while letting the questions
// service own paper-state mutations + memo mirroring.
//
// Lifted from AITools/service.ts during Module 2 Task 6 — the AITools
// version operated on the legacy IGeneratedPaper model and saved the paper
// itself; this version is model-agnostic-ish (just consumes IAssessmentPaper)
// and side-effect-free.

export interface RegenerateInput {
  paper: IAssessmentPaper;
  sectionIdx: number;
  position: number;
  targetMarks: number;
}

export interface RegenerateResult {
  questionText: string;
  marks: number;
  options?: Array<{ label: string; text: string; isCorrect: boolean }>;
  modelAnswer?: string;
  markingGuideline?: string;
  diagram?: { tikz: string; caption?: string };
}

interface AIRegeneratedQuestion {
  questionText: string;
  marks: number;
  options?: Array<{ label?: unknown; text?: unknown; isCorrect?: unknown }>;
  modelAnswer?: string;
  markingGuideline?: string;
  diagram?: {
    tikz: string;
    caption?: string;
    alt?: string;
  };
}

export async function regenerateSingleQuestion(
  input: RegenerateInput,
): Promise<RegenerateResult> {
  const { paper, sectionIdx, position, targetMarks } = input;

  const section = paper.sections[sectionIdx];
  if (!section) throw new BadRequestError('Invalid section index');
  const oldQuestion = section.questions[position];
  if (!oldQuestion) throw new BadRequestError('Invalid question position');

  const { subjectName, gradeLabel, gradeNumber, topicTitles } =
    await resolvePaperContext(paper);

  const templates = getTemplatesForGrade(gradeNumber);
  const templateBlock = formatTemplatesForPrompt(templates);
  const diagramInstructions = templateBlock
    ? `\nIf the question benefits from a visual, include a "diagram" field: { "tikz": "<TikZ code>", "caption": "<short caption>" }. Otherwise omit "diagram" entirely.\n\nAvailable TikZ templates:\n${templateBlock}`
    : '';

  // The original question text may be null when the slot was a bank-ref —
  // in that case we just signal "regenerate from topic context" without a
  // diversity constraint.
  const oldText = oldQuestion.questionText?.trim() ?? '';

  const systemPrompt = `You are an expert South African CAPS-aligned exam question generator.
Generate a single replacement question that fits the same section and is worth exactly ${targetMarks} marks.
Match question depth to marks:
- 1-2 marks: direct recall or single-step. Keep brief.
- 3-5 marks: 2-3 steps or one short explanation.
- 6-10 marks: multi-part, requires working shown, or one long-answer paragraph.
- 10+ marks: complex structured question with sub-parts OR an extended essay.

Use South African English. No trick questions. The model answer must be defensible against the marking guideline.

Return JSON with this exact structure:
{
  "questionText": "...",
  "marks": ${targetMarks},
  "options": [{ "label": "A", "text": "...", "isCorrect": false }],
  "modelAnswer": "...",
  "markingGuideline": "...",
  "diagram": { "tikz": "...", "caption": "..." }
}
For multiple-choice questions, include exactly 4 options and mark one correct option. For non-multiple-choice questions, use an empty options array.
The "diagram" field is optional — only include it when the question genuinely benefits from a visual.${diagramInstructions}`;

  const userPrompt = `Generate a replacement question for:
- Subject: ${subjectName}
- Grade: ${gradeLabel}
- Topic(s): ${topicTitles}
- Section: ${section.title}
- Marks: ${targetMarks}
- Difficulty: ${paper.difficulty}
${oldText ? `\nThe new question must be DIFFERENT from this previous question:\n"${oldText}"` : ''}`;

  const { data: aiResult } = await AIService.generateJSONWithUsage<AIRegeneratedQuestion>(
    systemPrompt,
    userPrompt,
  );

  return validateAndShape(aiResult, targetMarks);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function resolvePaperContext(paper: IAssessmentPaper): Promise<{
  subjectName: string;
  gradeLabel: string;
  gradeNumber: number;
  topicTitles: string;
}> {
  // Resolve human-readable context: subject name, grade label + numeric
  // order index for tikz template selection, and topic titles. Each is
  // best-effort — if a lookup fails we fall back to ids/defaults rather
  // than aborting the regen.
  const [subjectDoc, gradeDoc, topicDocs] = await Promise.all([
    Subject.findById(paper.subjectId).select('name').lean(),
    Grade.findById(paper.gradeId).select('name orderIndex').lean(),
    paper.topicIds.length > 0
      ? CurriculumNode.find({ _id: { $in: paper.topicIds } })
          .select('title')
          .lean()
      : Promise.resolve([] as Array<{ title: string }>),
  ]);

  return {
    subjectName: subjectDoc?.name ?? 'this subject',
    gradeLabel: gradeDoc?.name ?? `Grade ${gradeDoc?.orderIndex ?? '?'}`,
    gradeNumber: gradeDoc?.orderIndex ?? 7,
    topicTitles: topicDocs.length > 0
      ? topicDocs.map((t) => t.title).join(', ')
      : 'general curriculum',
  };
}

function validateAndShape(
  aiResult: AIRegeneratedQuestion,
  targetMarks: number,
): RegenerateResult {
  // Defensive validation — AIService.generateJSONWithUsage already JSON-parses,
  // but the returned shape is untyped. Verify the fields we actually consume.
  if (
    typeof aiResult.questionText !== 'string' ||
    aiResult.questionText.trim().length === 0
  ) {
    throw new BadRequestError(
      'AI returned an empty question. Please try regenerating again.',
    );
  }
  if (typeof aiResult.marks !== 'number' || aiResult.marks < 0) {
    throw new BadRequestError(
      'AI returned an invalid marks value. Please try regenerating again.',
    );
  }

  const result: RegenerateResult = {
    questionText: aiResult.questionText,
    // Trust the prompt-enforced target over what the model actually returned —
    // a paper's totalMarks invariant depends on this slot keeping its marks.
    marks: targetMarks,
  };
  if (Array.isArray(aiResult.options)) {
    result.options = aiResult.options
      .map((option, index) => ({
        label: typeof option.label === 'string' && option.label.trim()
          ? option.label.trim()
          : String.fromCharCode(65 + index),
        text: typeof option.text === 'string' ? option.text.trim() : '',
        isCorrect: option.isCorrect === true,
      }))
      .filter((option) => option.text.length > 0);
  }
  if (typeof aiResult.modelAnswer === 'string') {
    result.modelAnswer = aiResult.modelAnswer;
  }
  if (typeof aiResult.markingGuideline === 'string') {
    result.markingGuideline = aiResult.markingGuideline;
  }
  if (
    aiResult.diagram &&
    typeof aiResult.diagram.tikz === 'string' &&
    aiResult.diagram.tikz.trim().length > 0
  ) {
    // Accept either "caption" (new IAssessmentPaper shape) or "alt" (legacy
    // IGeneratedPaper diagram shape) — the model may emit either depending
    // on the system prompt's bias.
    const caption =
      typeof aiResult.diagram.caption === 'string'
        ? aiResult.diagram.caption
        : typeof aiResult.diagram.alt === 'string'
          ? aiResult.diagram.alt
          : undefined;
    result.diagram = caption !== undefined
      ? { tikz: aiResult.diagram.tikz, caption }
      : { tikz: aiResult.diagram.tikz };
  }
  return result;
}
