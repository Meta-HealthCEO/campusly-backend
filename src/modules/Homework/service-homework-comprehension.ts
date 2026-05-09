import mongoose from 'mongoose';
import { z } from 'zod/v4';
import { logger } from '../../common/logger.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { Question } from '../QuestionBank/model.js';
import { ContentResource } from '../ContentLibrary/model.js';

const SYSTEM_PROMPT = `You are a CAPS-aligned reading comprehension question writer.
Given a piece of text, generate {count} mixed-type comprehension questions that test understanding.
Return strict JSON: { "questions": [{ "type": "mcq" | "true_false" | "short_answer", "stem": string, "answer": string, "options"?: string[], "marks": number }] }
- mcq: include 4 distinct "options"; "answer" must equal one of the options
- true_false: "answer" must be exactly "true" or "false"; no options
- short_answer: 1-2 sentence expected answer; no options
- marks: 1-3 per question
- Cover at least 2 different question types in the set`;

const aiQuestionSchema = z.object({
  type: z.enum(['mcq', 'true_false', 'short_answer']),
  stem: z.string().min(5).max(500),
  answer: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).optional(),
  marks: z.number().int().min(1).max(5),
});

const aiResponseSchema = z.object({
  questions: z.array(aiQuestionSchema).min(2).max(10),
});

interface ContentResourceLike {
  title?: string;
  blocks?: Array<{ type?: string; content?: string }>;
}

function extractText(resource: ContentResourceLike): string {
  const parts: string[] = [];
  if (resource.title) parts.push(`Title: ${resource.title}`);
  for (const b of resource.blocks ?? []) {
    if (typeof b.content === 'string') parts.push(b.content);
  }
  return parts.join('\n\n').slice(0, 12_000); // bound prompt size
}

export async function generateComprehensionQuestions(
  contentResourceId: string,
  schoolId: string,
  teacherId: string,
  subjectId: string,
  gradeId: string,
  curriculumNodeId: string,
  count = 4,
): Promise<mongoose.Types.ObjectId[]> {
  const resource = await ContentResource.findOne({
    _id: contentResourceId,
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).lean();
  if (!resource) throw new NotFoundError('Content resource not found');

  const text = extractText(resource as ContentResourceLike);
  if (text.length < 50) {
    throw new BadRequestError('Resource text too short to generate questions');
  }

  const userPrompt = `Generate ${count} comprehension questions for this text:\n\n${text}`;
  const raw = await AIService.generateJSON<unknown>(SYSTEM_PROMPT, userPrompt);
  const parsed = aiResponseSchema.parse(raw);

  const docs = parsed.questions.map((q) => ({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    gradeId: new mongoose.Types.ObjectId(gradeId),
    curriculumNodeId: new mongoose.Types.ObjectId(curriculumNodeId),
    type: q.type,
    stem: q.stem,
    media: [],
    diagram: null,
    options: q.type === 'mcq' && q.options
      ? q.options.map((opt, i) => ({
          label: String.fromCharCode(65 + i), // A, B, C, D
          text: opt,
          isCorrect: opt === q.answer,
        }))
      : [],
    answer: q.answer,
    markingRubric: '',
    marks: q.marks,
    cognitiveLevel: { caps: 'routine' as const, blooms: 'understand' as const },
    difficulty: 3,
    tags: ['comprehension', 'ai_generated'],
    source: 'ai_generated' as const,
    status: 'approved' as const,
    createdBy: new mongoose.Types.ObjectId(teacherId),
    usageCount: 0,
    isDeleted: false,
  }));

  let inserted: Awaited<ReturnType<typeof Question.insertMany>> = [];
  try {
    inserted = await Question.insertMany(docs);
    return inserted.map((q) => q._id as mongoose.Types.ObjectId);
  } catch (err: unknown) {
    if (inserted.length) {
      try {
        await Question.deleteMany({ _id: { $in: inserted.map((q) => q._id) } });
      } catch (delErr: unknown) {
        logger.error({ delErr, count: inserted.length }, 'Comprehension Q rollback failed');
      }
    }
    logger.error({ err }, 'Comprehension Q insertMany failed');
    throw err;
  }
}
