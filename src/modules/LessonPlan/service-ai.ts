import mongoose from 'mongoose';
import { z } from 'zod/v4';
import { AIService } from '../../services/ai.service.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import {
  verifyRefs,
  assertTopicMatchesClassGrade,
  assertTeacherCanPlanForClassSubject,
} from './service.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

/** Max AI lesson-plan generations per teacher per hour. */
const RATE_LIMIT_PER_HOUR = 30;

interface GenerateInput {
  curriculumTopicId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
  date: string;
  durationMinutes?: number;
}

/**
 * Durable AI contract: the AI outputs *suggestions* (titles + hints), never
 * real IDs. The teacher maps each suggestion to an actual Quiz /
 * ContentResource / Question via a picker in the frontend before saving.
 * This prevents hallucinated references to records that don't exist.
 */
export type HomeworkSuggestion =
  | { type: 'quiz'; title: string; questionCount: number; topicHint: string }
  | { type: 'reading'; title: string; pageRangeHint?: string; topicHint: string }
  | { type: 'exercise'; title: string; questionCount: number; topicHint: string };

export interface GeneratedDraft {
  topic: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  homeworkSuggestions: HomeworkSuggestion[];
}

const homeworkSuggestionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reading'),
    title: z.string(),
    pageRangeHint: z.string().optional(),
    topicHint: z.string(),
  }),
  z.object({
    type: z.literal('exercise'),
    title: z.string(),
    questionCount: z.number(),
    topicHint: z.string(),
  }),
  z.object({
    type: z.literal('quiz'),
    title: z.string(),
    questionCount: z.number(),
    topicHint: z.string(),
  }),
]);

const draftSchema = z.object({
  topic: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  resources: z.array(z.string()).default([]),
  homeworkSuggestions: z.array(homeworkSuggestionSchema).default([]),
});

export class LessonPlanAIService {
  static async generate(input: GenerateInput, teacherId: string, actorRole = 'teacher'): Promise<GeneratedDraft> {
    // Rate limit check — per teacher, last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await AIUsageLog.countDocuments({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      type: 'lesson_plan_generation',
      createdAt: { $gte: oneHourAgo },
    });
    if (recentCount >= RATE_LIMIT_PER_HOUR) {
      throw new ForbiddenError(
        `AI generation rate limit reached (${RATE_LIMIT_PER_HOUR}/hour). Please try again later.`,
      );
    }

    await verifyRefs(input.schoolId, input.classId, input.subjectId, input.curriculumTopicId);
    await assertTopicMatchesClassGrade(input.curriculumTopicId, input.classId, input.schoolId);
    await assertTeacherCanPlanForClassSubject(
      teacherId,
      actorRole,
      input.schoolId,
      input.classId,
      input.subjectId,
    );

    // Curriculum topic must either belong to this school OR be a school-agnostic
    // reference (schoolId: null). This prevents leaking another school's
    // private curriculum content into the prompt.
    const schoolOid = new mongoose.Types.ObjectId(input.schoolId);
    const topic = await CurriculumNode.findOne({
      _id: input.curriculumTopicId,
      isDeleted: false,
      $or: [{ schoolId: schoolOid }, { schoolId: null }],
    }).lean();
    if (!topic) throw new NotFoundError('Curriculum topic not found');

    const duration = input.durationMinutes ?? 45;
    const systemPrompt = `You are an experienced South African teacher drafting a single lesson plan that aligns with the CAPS curriculum. Output strictly valid JSON matching the specified schema. No markdown, no prose outside JSON.`;

    const capsReference = topic.metadata?.capsReference ?? '(none)';
    const notionalHours = topic.metadata?.notionalHours ?? 1;
    const assessmentStandards = (topic.metadata?.assessmentStandards ?? []).join(', ') || '(none)';
    const description = topic.description && topic.description.length > 0
      ? topic.description
      : '(no description)';

    // Durable contract: the AI must NEVER output real IDs (quizId,
    // contentResourceId, questionIds). It only emits descriptive
    // suggestions — titles and topic hints — which the teacher maps to
    // real entities via a picker UI before saving the plan.
    const userPrompt = `Draft a ${duration}-minute lesson plan for the following curriculum topic.

Topic: ${topic.title}
Description: ${description}
CAPS reference: ${capsReference}
Notional hours: ${notionalHours}
Assessment standards: ${assessmentStandards}

Return JSON with this exact shape (do not include real IDs — you do not know the teacher's DB):
{
  "topic": string (concise lesson title, max 80 chars),
  "objectives": string[] (3-5 specific, measurable learning objectives),
  "activities": string[] (4-6 sequenced classroom activities, each ~1 sentence with approximate minute marks),
  "resources": string[] (2-4 concrete resources: textbook pages, worksheets, apparatus, digital tools),
  "homeworkSuggestions": Array<
    | { "type": "reading", "title": string, "pageRangeHint": string, "topicHint": string }
    | { "type": "exercise", "title": string, "questionCount": number, "topicHint": string }
    | { "type": "quiz", "title": string, "questionCount": number, "topicHint": string }
  > (0-3 suggestions; prefer reading + exercise over quiz for primary grades)
}

topicHint: a short phrase the teacher can search for when picking a real resource/question/quiz in Campusly. Never output IDs.`;

    const { text: raw, usage } = await AIService.generateCompletionWithUsage(
      systemPrompt,
      userPrompt,
      { maxTokens: 2048, temperature: 0.5 },
    );

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(cleaned);
    } catch {
      throw new BadRequestError('AI returned invalid JSON — please try again');
    }

    const validation = draftSchema.safeParse(rawParsed);
    if (!validation.success) {
      throw new BadRequestError('AI returned a malformed lesson plan — please try again');
    }
    const parsed = validation.data;

    const draft: GeneratedDraft = {
      topic: parsed.topic && parsed.topic.length > 0 ? parsed.topic : topic.title,
      objectives: parsed.objectives,
      activities: parsed.activities,
      resources: parsed.resources,
      homeworkSuggestions: parsed.homeworkSuggestions,
    };

    // Log usage — fire-and-forget; don't fail the request if logging fails
    AIUsageLog.create({
      schoolId: input.schoolId,
      teacherId,
      type: 'lesson_plan_generation',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    }).catch((err: unknown) => {
      console.error('Failed to log AI lesson-plan usage:', err);
    });

    return draft;
  }
}
