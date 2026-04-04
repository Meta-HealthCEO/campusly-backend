import mongoose from 'mongoose';
import { Question } from './model.js';
import type { IQuestionOption } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { GenerateQuestionsInput, ExtractFromPaperInput } from './validation.js';

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

    // ── Build prompt ──
    const systemPrompt = [
      'You are an expert assessment question creator for South African schools.',
      'You create questions aligned with the CAPS curriculum.',
      'Respond ONLY with a valid JSON array of question objects.',
      'Each object must have: stem (string), options (array of {label, text, isCorrect} for MCQ, empty array otherwise),',
      'answer (string with model answer), markingRubric (string), marks (number).',
      'For MCQ: provide 4 options with labels A-D, exactly one isCorrect: true.',
      'For true_false: provide 2 options with labels "True" and "False".',
      'For other types: leave options as empty array and provide detailed answer and markingRubric.',
    ].join(' ');

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

    // ── Save all as drafts ──
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const cnoid = new mongoose.Types.ObjectId(data.curriculumNodeId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);

    const docs = parsed.map((q) => ({
      curriculumNodeId: cnoid,
      schoolId: soid,
      subjectId: suboid,
      gradeId: groid,
      type: data.type,
      stem: q.stem,
      media: [],
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

    const result = await AIService.generateVisionCompletion(
      systemPrompt,
      userText,
      data.image,
      data.imageType as 'image/jpeg' | 'image/png' | 'image/webp',
      { maxTokens: 8192, temperature: 0.2 },
    );

    return parseExtractedQuestions(result.text);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  stem: string;
  options: IQuestionOption[];
  answer: string;
  markingRubric: string;
  marks: number;
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

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : data.difficulty,
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
      },
    ];
  }
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
