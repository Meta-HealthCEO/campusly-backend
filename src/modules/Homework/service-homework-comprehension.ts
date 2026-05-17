import mongoose from 'mongoose';
import { z } from 'zod/v4';
import { logger } from '../../common/logger.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { Question } from '../QuestionBank/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Textbook } from '../Textbook/model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';

// Accept TextbookRef-shaped input where ObjectId fields may arrive as either
// hex strings (HTTP path, post-Zod) or Types.ObjectId (already-cast docs).
export type TextbookRefInput =
  | {
      source: 'internal';
      textbookId: string | mongoose.Types.ObjectId;
      chapterId?: string | mongoose.Types.ObjectId;
      pageStart?: number;
      pageEnd?: number;
      notes?: string;
    }
  | {
      source: 'external';
      title: string;
      publisher?: string;
      isbn?: string;
      pageStart?: number;
      pageEnd?: number;
      excerpt?: string;
      notes?: string;
    };

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

// ── Inner helper: AI call + Question.insertMany ────────────────────────────
async function generateComprehensionFromText(args: {
  sourceText: string;
  sourceLabel: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  gradeId: string;
  curriculumNodeId: string;
  count: number;
}): Promise<mongoose.Types.ObjectId[]> {
  const {
    sourceText,
    sourceLabel,
    schoolId,
    teacherId,
    subjectId,
    gradeId,
    curriculumNodeId,
    count,
  } = args;

  if (sourceText.length < 50) {
    throw new BadRequestError('Resource text too short to generate questions');
  }

  const userPrompt = `Generate ${count} comprehension questions for: ${sourceLabel}\n\n${sourceText}`;
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

export async function generateComprehensionQuestions(
  contentResourceId: string,
  schoolId: string,
  teacherId: string,
  subjectId: string,
  gradeId: string,
  curriculumNodeId: string,
  count = 4,
): Promise<mongoose.Types.ObjectId[]> {
  const { subjectIds, gradeIds } = await resolveAcademicFilterIds({ subjectId, gradeId });
  const resource = await ContentResource.findOne({
    _id: contentResourceId,
    isDeleted: false,
    subjectId: { $in: subjectIds ?? [new mongoose.Types.ObjectId(subjectId)] },
    gradeId: { $in: gradeIds ?? [new mongoose.Types.ObjectId(gradeId)] },
    $or: [
      { schoolId: null, status: 'approved' },
      { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'approved' },
    ],
  }).lean();
  if (!resource) throw new NotFoundError('Content resource not found');

  const sourceText = extractText(resource as ContentResourceLike);
  const sourceLabel = (resource as ContentResourceLike).title ?? 'Reading passage';

  return generateComprehensionFromText({
    sourceText,
    sourceLabel,
    schoolId,
    teacherId,
    subjectId,
    gradeId,
    curriculumNodeId,
    count,
  });
}

// ── New entry point: comprehension from a TextbookRef ──────────────────────
export async function generateComprehensionFromTextbook(
  textbookRef: TextbookRefInput,
  schoolId: string,
  teacherId: string,
  subjectId: string,
  gradeId: string,
  curriculumNodeId: string,
  count = 4,
): Promise<mongoose.Types.ObjectId[]> {
  let sourceText = '';
  let sourceLabel = '';

  if (textbookRef.source === 'internal') {
    // Multi-tenancy: allow CAPS national textbooks (schoolId: null) and the
    // teacher's own school textbooks. Always require isDeleted: false.
    const soid = new mongoose.Types.ObjectId(schoolId);
    const tid = new mongoose.Types.ObjectId(teacherId);
    const textbook = await Textbook.findOne({
      _id: textbookRef.textbookId,
      isDeleted: false,
      $or: [
        { schoolId: null, status: 'published' },
        { schoolId: soid, status: 'published' },
        { schoolId: soid, createdBy: tid },
      ],
    }).lean();
    if (!textbook) throw new NotFoundError('Textbook not found');

    const chapter = textbookRef.chapterId
      ? textbook.chapters.find(
          (c) => c._id?.toString() === textbookRef.chapterId?.toString(),
        )
      : undefined;
    sourceLabel = `${textbook.title}${chapter ? ` — ${chapter.title}` : ''}`;
    // Fallback chain: chapter description → textbook description → synthetic
    // hint so the inner helper's min-length guard doesn't reject the request
    // (mirrors the external "no excerpt" behavior).
    const candidate = chapter?.description?.trim() || textbook.description?.trim() || '';
    sourceText = candidate.length > 0
      ? candidate
      : `(no excerpt provided — generate generic comprehension questions about the topic of: ${sourceLabel})`;
  } else {
    sourceLabel = `${textbookRef.title}${textbookRef.publisher ? ` (${textbookRef.publisher})` : ''}`;
    if (textbookRef.excerpt) {
      sourceText = textbookRef.excerpt;
    } else {
      const range = textbookRef.pageStart && textbookRef.pageEnd
        ? `pages ${textbookRef.pageStart}-${textbookRef.pageEnd}`
        : 'this section';
      sourceText = `(no excerpt provided — generate based on topic only, referencing ${range})`;
    }
  }

  return generateComprehensionFromText({
    sourceText,
    sourceLabel,
    schoolId,
    teacherId,
    subjectId,
    gradeId,
    curriculumNodeId,
    count,
  });
}
