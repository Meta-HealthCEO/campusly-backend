import mongoose from 'mongoose';
import { Question } from './model.js';
import type { IQuestionOption, IDiagram } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { GenerateQuestionsInput, ExtractFromPaperInput } from './validation.js';
import { getTemplatesForGrade, formatTemplatesForPrompt } from '../../lib/tikz-templates.js';
import { renderDiagram } from './service-diagram.js';
import type { DiagramInput } from './service-diagram.js';

const DAILY_LIMIT = 20;

export class GenerationService {
  static async generateQuestions(
    schoolId: string,
    userId: string,
    data: GenerateQuestionsInput,
  ) {
    // ── Rate limit: 20 per day per teacher ──
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Question.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId),
      source: 'ai_generated',
      createdAt: { $gte: startOfDay },
      isDeleted: false,
    });

    if (todayCount >= DAILY_LIMIT) {
      throw new BadRequestError(
        `Daily AI generation limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
      );
    }

    // ── Fetch curriculum node for context ──
    const node = await CurriculumNode.findOne({
      _id: new mongoose.Types.ObjectId(data.curriculumNodeId),
      isDeleted: false,
    }).lean();

    if (!node) throw new NotFoundError('Curriculum node not found');

    // ── Build prompt (with optional diagram support) ──
    const gradeLevel = data.gradeLevel ?? 7;
    const templates = getTemplatesForGrade(gradeLevel);
    const templateBlock = formatTemplatesForPrompt(templates);

    const diagramInstructions = templateBlock
      ? [
          '\n\nDIAGRAM SUPPORT:',
          'When a question involves geometry, graphs, data representation, shapes, number lines, or coordinate planes,',
          'include a "diagram" field in the question object with this structure:',
          '{ "tikz": "<TikZ code string>", "data": { "type": "<template_name>", ...parameters }, "alt": "<accessibility description>" }.',
          'Use the templates below as reference — adapt the placeholder values to fit the question.',
          'If a question is pure algebra, arithmetic, or text-based, omit the "diagram" field entirely (do not set it to null).',
          '\nAvailable TikZ templates:\n',
          templateBlock,
        ].join(' ')
      : '';

    const systemPrompt = [
      'You are an expert assessment question creator for South African schools.',
      'You create questions aligned with the CAPS curriculum.',
      'Respond ONLY with a valid JSON array of question objects.',
      'Each object must have: stem (string), options (array of {label, text, isCorrect} for MCQ, empty array otherwise),',
      'answer (string with model answer), markingRubric (string), marks (number).',
      'For MCQ: provide 4 options with labels A-D, exactly one isCorrect: true.',
      'For true_false: provide 2 options with labels "True" and "False".',
      'For other types: leave options as empty array and provide detailed answer and markingRubric.',
      diagramInstructions,
    ]
      .filter(Boolean)
      .join(' ');

    const userPrompt = [
      `Create ${data.count} ${data.type.replace(/_/g, ' ')} question(s) for:`,
      `Topic: ${node.title}${node.description ? ` — ${node.description}` : ''}`,
      `Cognitive level: CAPS ${data.cognitiveLevel.caps}, Blooms ${data.cognitiveLevel.blooms}`,
      `Difficulty: ${data.difficulty}/5`,
      `Each question should be worth appropriate marks for its type and difficulty.`,
    ]
      .filter(Boolean)
      .join('\n');

    // ── Call AI ──
    const aiResponse = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // ── Parse response into Question documents ──
    const parsed = parseAIQuestions(aiResponse, data);

    // ── Render diagrams (fire-and-forget failures — question saves regardless) ──
    const renderedDiagrams = await renderParsedDiagrams(parsed);

    // ── Save all as drafts ──
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const cnoid = new mongoose.Types.ObjectId(data.curriculumNodeId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);

    const docs = parsed.map((q, idx) => ({
      curriculumNodeId: cnoid,
      schoolId: soid,
      subjectId: suboid,
      gradeId: groid,
      type: data.type,
      stem: q.stem,
      media: [],
      diagram: renderedDiagrams[idx],
      options: q.options,
      answer: q.answer,
      markingRubric: q.markingRubric,
      marks: q.marks,
      cognitiveLevel: data.cognitiveLevel,
      difficulty: data.difficulty,
      tags: [],
      source: 'ai_generated' as const,
      status: 'draft' as const,
      createdBy: uoid,
    }));

    const questions = await Question.insertMany(docs);
    return questions.map((q) => q.toObject());
  }

  /**
   * Extract questions from an uploaded paper image using AI vision.
   * Returns parsed question objects (NOT saved) so the teacher can review first.
   */
  static async extractFromPaper(
    schoolId: string,
    userId: string,
    data: ExtractFromPaperInput,
  ) {
    const systemPrompt = [
      'You are an expert at reading South African school exam papers.',
      'You will be shown a photo/scan of an exam paper page.',
      'Extract every question you can identify from the page.',
      'Respond ONLY with a valid JSON array of question objects.',
      'Each object must have:',
      '  stem (string — the full question text),',
      '  type (one of: mcq, true_false, short_answer, structured, essay, match, fill_blank, calculation, diagram_label, case_study),',
      '  options (array of {label, text, isCorrect} for MCQ/true_false — set isCorrect to false if answer is unknown, empty array for other types),',
      '  answer (string — if visible on the paper, otherwise empty string),',
      '  markingRubric (string — if visible, otherwise empty string),',
      '  marks (number — the mark allocation if visible, otherwise 1),',
      '  capsLevel (one of: knowledge, routine, complex, problem_solving — your best estimate),',
      '  difficulty (number 1-5 — your best estimate).',
      'If no questions are found, return an empty array [].',
      'Do NOT include section headers, instructions, or non-question text.',
    ].join(' ');

    const userText = 'Extract all exam/test questions from this paper image.';

    const result = await AIService.generateDocumentCompletion(
      systemPrompt,
      userText,
      data.image,
      data.imageType as 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp',
      { maxTokens: 8192, temperature: 0.2 },
    );

    return parseExtractedQuestions(result.text);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ParsedDiagram {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
}

interface ParsedQuestion {
  stem: string;
  options: IQuestionOption[];
  answer: string;
  markingRubric: string;
  marks: number;
  diagram: ParsedDiagram | null;
}

function parseAIQuestions(
  response: string,
  data: GenerateQuestionsInput,
): ParsedQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Parsed value is not an array');

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;

      const options: IQuestionOption[] = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      const diagram = parseDiagramField(q.diagram);

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : data.difficulty,
        diagram,
      };
    });
  } catch {
    // Fallback: return a single question wrapping the raw response
    return [
      {
        stem: response.slice(0, 500),
        options: [],
        answer: response,
        markingRubric: '',
        marks: data.difficulty,
        diagram: null,
      },
    ];
  }
}

function parseDiagramField(raw: unknown): ParsedDiagram | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;

  const tikz = typeof d.tikz === 'string' ? d.tikz.trim() : '';
  if (!tikz) return null;

  const data =
    d.data && typeof d.data === 'object' && !Array.isArray(d.data)
      ? (d.data as Record<string, unknown>)
      : {};
  const alt = typeof d.alt === 'string' ? d.alt : 'Diagram';

  return { tikz, data, alt };
}

async function renderParsedDiagrams(
  parsed: ParsedQuestion[],
): Promise<(IDiagram | null)[]> {
  const results: (IDiagram | null)[] = new Array(parsed.length).fill(null);
  const jobs = parsed
    .map((q, idx) => (q.diagram ? { idx, d: q.diagram } : null))
    .filter((j): j is { idx: number; d: ParsedDiagram } => j !== null);

  if (jobs.length === 0) return results;

  await Promise.allSettled(
    jobs.map(async ({ idx, d }) => {
      try {
        const input: DiagramInput = { tikz: d.tikz, data: d.data, alt: d.alt };
        const r = await renderDiagram(input);
        results[idx] = {
          tikz: d.tikz, data: d.data, alt: d.alt,
          svgUrl: r.svgUrl ?? null, pdfUrl: r.pdfUrl ?? null,
          hash: r.hash, renderStatus: r.renderStatus, renderError: r.renderError ?? null,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown render error';
        results[idx] = {
          tikz: d.tikz, data: d.data, alt: d.alt,
          svgUrl: null, pdfUrl: null, hash: '', renderStatus: 'failed', renderError: msg,
        };
      }
    }),
  );
  return results;
}

// ─── Extract helpers ──────────────────────────────────────────────────────

interface ExtractedQuestion {
  stem: string;
  type: string;
  options: IQuestionOption[];
  answer: string;
  markingRubric: string;
  marks: number;
  capsLevel: string;
  difficulty: number;
}

const VALID_TYPES = new Set([
  'mcq', 'true_false', 'short_answer', 'structured', 'essay',
  'match', 'fill_blank', 'calculation', 'diagram_label', 'case_study',
]);

const VALID_CAPS = new Set(['knowledge', 'routine', 'complex', 'problem_solving']);

function parseExtractedQuestions(response: string): ExtractedQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;

      const options: IQuestionOption[] = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      const rawType = typeof q.type === 'string' ? q.type : 'short_answer';
      const rawCaps = typeof q.capsLevel === 'string' ? q.capsLevel : 'knowledge';

      return {
        stem: typeof q.stem === 'string' ? q.stem : '',
        type: VALID_TYPES.has(rawType) ? rawType : 'short_answer',
        options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : 1,
        capsLevel: VALID_CAPS.has(rawCaps) ? rawCaps : 'knowledge',
        difficulty: typeof q.difficulty === 'number' && q.difficulty >= 1 && q.difficulty <= 5
          ? q.difficulty : 3,
      };
    }).filter((q: ExtractedQuestion) => q.stem.length > 0);
  } catch {
    return [];
  }
}
