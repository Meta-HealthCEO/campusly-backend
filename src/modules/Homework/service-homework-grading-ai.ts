import { z } from 'zod/v4';
import { AIService } from '../../services/ai.service.js';
import { logger } from '../../common/logger.js';
import type { IQuestion } from '../QuestionBank/model.js';
import type { GradingResult } from './service-homework-grading.js';

const aiResponseSchema = z.object({
  awarded: z.number().min(0),
  rationale: z.string().max(2000),
});

const SYSTEM_PROMPT = `You are an experienced South African CAPS teacher grading a single student answer.
Return strict JSON: { "awarded": number, "rationale": string }.
- awarded: integer or half-mark (0.5 step), bounded by [0, maxMarks]
- rationale: 1-2 sentences explaining the mark
Be fair: partial credit for partially correct answers. Be strict: zero for blank/off-topic answers.`;

function buildUserPrompt(
  question: { stem: string; answer: string; markingRubric: string; marks: number },
  studentAnswer: string,
): string {
  return [
    `Question: ${question.stem}`,
    '',
    `Maximum marks: ${question.marks}`,
    '',
    `Memo / model answer: ${question.answer || '(none provided)'}`,
    '',
    `Marking rubric: ${question.markingRubric || '(none provided)'}`,
    '',
    `Student's answer: ${studentAnswer || '(blank)'}`,
    '',
    `Grade this answer. Return JSON only.`,
  ].join('\n');
}

export async function gradeWithAI(
  question: IQuestion,
  studentAnswer: string,
): Promise<GradingResult> {
  try {
    const userPrompt = buildUserPrompt(
      {
        stem: question.stem,
        answer: question.answer,
        markingRubric: question.markingRubric,
        marks: question.marks,
      },
      studentAnswer,
    );
    const raw = await AIService.generateJSON<unknown>(SYSTEM_PROMPT, userPrompt);
    const parsed = aiResponseSchema.parse(raw);
    const awarded = Math.min(Math.max(0, parsed.awarded), question.marks);
    return { awarded, rationale: parsed.rationale, gradingMethod: 'ai' };
  } catch (err: unknown) {
    logger.error({ err, questionId: question._id }, 'AI grading failed');
    throw err;
  }
}
