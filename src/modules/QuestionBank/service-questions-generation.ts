import mongoose from 'mongoose';
import { z } from 'zod/v4';
import { AIService } from '../../services/ai.service.js';
import { logger } from '../../common/logger.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { Question } from './model.js';
import {
  CAPS_LEVELS,
  BLOOMS_LEVELS,
  type QuestionType,
  type CapsLevel,
  type BloomsLevel,
} from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import {
  resolveTextbookContextForTopic,
  renderTextbookSourceSection,
} from '../Textbook/service-textbook-context.js';
import type { TextbookContext } from '../Textbook/service-textbook-context.js';

// ── Public types ───────────────────────────────────────────────────────────
export type GenerateQuestionType = 'mcq' | 'true_false' | 'short_answer' | 'structured';
export type GenerateCognitiveLevel = 'recall' | 'application' | 'analysis';
export type GenerateDifficulty = 'easy' | 'medium' | 'hard';

export interface GenerateQuestionsInput {
  count: number;
  questionTypes: GenerateQuestionType[];
  cognitiveLevel?: GenerateCognitiveLevel;
  difficulty?: GenerateDifficulty;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  gradeId: string;
  curriculumNodeId: string;
  topicHint?: string;
}

// ── Mappings between high-level inputs and Question model enums ────────────
const COGNITIVE_TO_CAPS: Record<GenerateCognitiveLevel, CapsLevel> = {
  recall: 'knowledge',
  application: 'routine',
  analysis: 'complex',
};

const COGNITIVE_TO_BLOOMS: Record<GenerateCognitiveLevel, BloomsLevel> = {
  recall: 'remember',
  application: 'apply',
  analysis: 'analyse',
};

const DIFFICULTY_TO_NUMERIC: Record<GenerateDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

// Default mark band per question type when AI fails to set a sensible value.
function defaultMarksForType(type: GenerateQuestionType): number {
  if (type === 'structured') return 6; // 5–10 typical
  return 2; // 1–3 typical for mcq/true_false/short_answer
}

// ── AI output schemas ──────────────────────────────────────────────────────
const aiOptionSchema = z.object({
  label: z.string().min(1).max(8),
  text: z.string().min(1).max(500),
  isCorrect: z.boolean(),
});

const aiQuestionSchema = z.object({
  type: z.enum(['mcq', 'true_false', 'short_answer', 'structured']),
  text: z.string().min(5).max(2000),
  answer: z.string().min(1).max(2000),
  markingRubric: z.string().max(2000).optional().default(''),
  marks: z.number().int().min(1).max(20),
  options: z.array(aiOptionSchema).min(2).max(6).optional(),
  cognitiveLevel: z.enum(['recall', 'application', 'analysis']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

const aiResponseSchema = z.object({
  questions: z.array(aiQuestionSchema).min(1).max(50),
});

type AIQuestion = z.infer<typeof aiQuestionSchema>;

// ── Prompt builders ────────────────────────────────────────────────────────
const SYSTEM_PROMPT_BASE = `You are a CAPS-aligned question writer for South African schools.
Produce a JSON object with shape: { "questions": [ ... ] }.
Each question object MUST contain:
  - "type": one of "mcq" | "true_false" | "short_answer" | "structured"
  - "text": the question stem (clear, self-contained, 5–2000 chars)
  - "answer": the model answer (for mcq this MUST equal the text of the correct option)
  - "markingRubric": brief marking guidance (may be empty string)
  - "marks": integer 1–20
  - "cognitiveLevel" (optional): "recall" | "application" | "analysis"
  - "difficulty" (optional): "easy" | "medium" | "hard"
  - For "mcq": include "options" with 4 entries shaped { "label": "A"|"B"|"C"|"D", "text": string, "isCorrect": boolean }. Exactly ONE option must have isCorrect: true. The "answer" string must equal the correct option's "text".
  - For "true_false": "answer" must be exactly "true" or "false". Do not include options.
  - For "short_answer": 1–2 sentence expected answer; no options.
  - For "structured": multi-part question; "answer" outlines the expected response; "markingRubric" lists per-part marks; assign 5–10 marks total.

Mark guidance:
  - mcq / true_false / short_answer: 1–3 marks
  - structured: 5–10 marks

Anchor every question to the supplied curriculum topic. When a TEXTBOOK SOURCE is provided, ground your questions in it. Do NOT include explanations, markdown, or commentary outside the JSON.`;

function buildUserPrompt(
  input: GenerateQuestionsInput,
  topicTitle: string,
  topicCode: string,
  textbookCtx: TextbookContext,
): string {
  const lines: string[] = [];
  lines.push(`Topic: ${topicTitle}${topicCode ? ` (${topicCode})` : ''}`);
  lines.push(`Generate exactly ${input.count} questions.`);
  lines.push(`Allowed question types: ${input.questionTypes.join(', ')}.`);
  if (input.cognitiveLevel) {
    lines.push(`Target cognitive level: ${input.cognitiveLevel}.`);
  }
  if (input.difficulty) {
    lines.push(`Target difficulty: ${input.difficulty}.`);
  }
  if (input.topicHint) {
    lines.push(`Teacher hint: ${input.topicHint}`);
  }
  lines.push('Return ONLY a JSON object of shape { "questions": [...] }.');
  const sourceSection = renderTextbookSourceSection(textbookCtx);
  if (sourceSection) lines.push(sourceSection);
  return lines.join('\n');
}

// ── Validation refinements (cross-field) ──────────────────────────────────
function refineParsedQuestion(q: AIQuestion): string | null {
  if (q.type === 'mcq') {
    if (!q.options || q.options.length < 2) {
      return 'mcq question missing options';
    }
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      return `mcq question must have exactly one correct option (got ${correctCount})`;
    }
    const correct = q.options.find((o) => o.isCorrect);
    if (correct && correct.text.trim() !== q.answer.trim()) {
      return 'mcq answer must match the correct option text';
    }
  } else if (q.type === 'true_false') {
    const v = q.answer.trim().toLowerCase();
    if (v !== 'true' && v !== 'false') {
      return 'true_false answer must be "true" or "false"';
    }
  }
  return null;
}

function validateAllOrFirstError(questions: AIQuestion[]): string | null {
  for (let i = 0; i < questions.length; i++) {
    const err = refineParsedQuestion(questions[i]);
    if (err) return `question[${i}]: ${err}`;
  }
  return null;
}

// ── Mapping AI output → Question insert payload ───────────────────────────
function mapToQuestionDoc(
  q: AIQuestion,
  ctx: {
    schoolId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    gradeId: mongoose.Types.ObjectId;
    curriculumNodeId: mongoose.Types.ObjectId;
    fallbackCognitive: GenerateCognitiveLevel;
    fallbackDifficulty: GenerateDifficulty;
  },
): Record<string, unknown> {
  const cognitive = q.cognitiveLevel ?? ctx.fallbackCognitive;
  const difficulty = q.difficulty ?? ctx.fallbackDifficulty;
  const caps: CapsLevel = COGNITIVE_TO_CAPS[cognitive];
  const blooms: BloomsLevel = COGNITIVE_TO_BLOOMS[cognitive];

  // Sanity-clamp marks against reasonable defaults per type.
  const marks = Math.max(1, Math.min(20, q.marks || defaultMarksForType(q.type)));

  const questionType: QuestionType = q.type;

  const options =
    q.type === 'mcq' && q.options
      ? q.options.map((opt, i) => ({
          label: opt.label || String.fromCharCode(65 + i),
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      : [];

  // Sentinel safety: ensure CAPS_LEVELS / BLOOMS_LEVELS contain what we picked.
  if (!CAPS_LEVELS.includes(caps) || !BLOOMS_LEVELS.includes(blooms)) {
    throw new Error(`Invalid cognitive level mapping: caps=${caps}, blooms=${blooms}`);
  }

  return {
    schoolId: ctx.schoolId,
    subjectId: ctx.subjectId,
    gradeId: ctx.gradeId,
    curriculumNodeId: ctx.curriculumNodeId,
    type: questionType,
    stem: q.text,
    media: [],
    diagram: null,
    options,
    answer: q.answer,
    markingRubric: q.markingRubric ?? '',
    marks,
    cognitiveLevel: { caps, blooms },
    difficulty: DIFFICULTY_TO_NUMERIC[difficulty],
    tags: ['ai_generated'],
    source: 'ai_generated' as const,
    status: 'approved' as const,
    createdBy: ctx.teacherId,
    usageCount: 0,
    isDeleted: false,
  };
}

// ── Public: AI bulk question generator ────────────────────────────────────
export async function generateAIQuestions(
  input: GenerateQuestionsInput,
): Promise<mongoose.Types.ObjectId[]> {
  if (input.count < 1 || input.count > 50) {
    throw new BadRequestError('count must be between 1 and 50');
  }
  if (!input.questionTypes || input.questionTypes.length === 0) {
    throw new BadRequestError('questionTypes must not be empty');
  }

  // Load curriculum node for topical context. Allow national (schoolId: null)
  // or this-school nodes — matches the CAPS visibility model used elsewhere.
  const soid = new mongoose.Types.ObjectId(input.schoolId);
  const node = await CurriculumNode.findOne({
    _id: new mongoose.Types.ObjectId(input.curriculumNodeId),
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
  })
    .select('title code')
    .lean();
  if (!node) throw new NotFoundError('Curriculum topic not found');

  // Resolve textbook context for grounding. Optional — when no textbook
  // matches the topic, returns { source: 'none', text: '' } and the prompt
  // is unchanged.
  let textbookCtx: TextbookContext = { source: 'none', text: '' };
  try {
    textbookCtx = await resolveTextbookContextForTopic(input.curriculumNodeId, soid);
  } catch (err: unknown) {
    logger.warn({ err }, '[questions-gen] textbook-context resolver failed; continuing without');
  }

  const userPrompt = buildUserPrompt(input, node.title, node.code, textbookCtx);

  // Attempt parse + validate up to 2 times. The retry uses a stricter prompt.
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const systemPrompt =
      attempt === 1
        ? SYSTEM_PROMPT_BASE
        : `${SYSTEM_PROMPT_BASE}\n\nPREVIOUS ATTEMPT FAILED VALIDATION: ${lastError}\nReturn ONLY the JSON. Re-check every constraint.`;

    let raw: unknown;
    try {
      raw = await AIService.generateJSON<unknown>(systemPrompt, userPrompt);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'AI call failed';
      logger.warn({ err, attempt }, '[questions-gen] AI call failed');
      continue;
    }

    const parsed = aiResponseSchema.safeParse(raw);
    if (!parsed.success) {
      lastError = parsed.error.message;
      logger.warn({ attempt, err: lastError }, '[questions-gen] schema validation failed');
      continue;
    }

    const questions = parsed.data.questions;
    const refineErr = validateAllOrFirstError(questions);
    if (refineErr) {
      lastError = refineErr;
      logger.warn({ attempt, err: refineErr }, '[questions-gen] cross-field validation failed');
      continue;
    }

    // Clamp/extend to requested count: trim if AI over-produced; warn if under.
    const finalQuestions = questions.slice(0, input.count);
    if (finalQuestions.length < input.count) {
      logger.warn(
        { requested: input.count, got: finalQuestions.length },
        '[questions-gen] AI returned fewer questions than requested',
      );
    }

    const ctx = {
      schoolId: soid,
      teacherId: new mongoose.Types.ObjectId(input.teacherId),
      subjectId: new mongoose.Types.ObjectId(input.subjectId),
      gradeId: new mongoose.Types.ObjectId(input.gradeId),
      curriculumNodeId: new mongoose.Types.ObjectId(input.curriculumNodeId),
      fallbackCognitive: input.cognitiveLevel ?? 'application',
      fallbackDifficulty: input.difficulty ?? 'medium',
    };

    const docs = finalQuestions.map((q) => mapToQuestionDoc(q, ctx));

    let inserted: Awaited<ReturnType<typeof Question.insertMany>> = [];
    try {
      inserted = await Question.insertMany(docs, { ordered: true });
      return inserted.map((q) => q._id as mongoose.Types.ObjectId);
    } catch (err: unknown) {
      // Best-effort rollback for any partial inserts.
      if (inserted.length) {
        try {
          await Question.deleteMany({ _id: { $in: inserted.map((q) => q._id) } });
        } catch (delErr: unknown) {
          logger.error(
            { delErr, count: inserted.length },
            '[questions-gen] rollback delete failed',
          );
        }
      }
      logger.error({ err }, '[questions-gen] Question.insertMany failed');
      throw err;
    }
  }

  throw new Error(`AI question generation failed after 2 attempts: ${lastError}`);
}
