import mongoose from 'mongoose';
import { AIService } from '../../services/ai.service.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

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

interface GeneratedDraft {
  topic: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  homework?: string;
}

export class LessonPlanAIService {
  static async generate(input: GenerateInput, teacherId: string): Promise<GeneratedDraft> {
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

    const userPrompt = `Draft a ${duration}-minute lesson plan for the following curriculum topic.

Topic: ${topic.title}
Description: ${description}
CAPS reference: ${capsReference}
Notional hours: ${notionalHours}
Assessment standards: ${assessmentStandards}

Output JSON shape:
{
  "topic": "<concise lesson title, max 80 chars>",
  "objectives": ["<3-5 specific, measurable learning objectives>"],
  "activities": ["<4-6 sequenced classroom activities with approximate minute marks>"],
  "resources": ["<3-5 concrete resources: textbook pages, worksheets, apparatus, digital tools>"],
  "homework": "<single brief homework task, optional; omit or empty string if not applicable>"
}`;

    const { text: raw, usage } = await AIService.generateCompletionWithUsage(
      systemPrompt,
      userPrompt,
      { maxTokens: 2048, temperature: 0.5 },
    );

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new BadRequestError('AI returned invalid JSON — please try again');
    }

    const result = parsed as Partial<GeneratedDraft>;
    const draft: GeneratedDraft = {
      topic: String(result.topic ?? topic.title),
      objectives: Array.isArray(result.objectives) ? result.objectives.map(String) : [],
      activities: Array.isArray(result.activities) ? result.activities.map(String) : [],
      resources: Array.isArray(result.resources) ? result.resources.map(String) : [],
      homework: result.homework ? String(result.homework) : undefined,
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
