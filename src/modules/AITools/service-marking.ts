// src/modules/AITools/service-marking.ts
import mongoose from 'mongoose';
import { PaperMarking } from './model-marking.js';
import { GeneratedPaper } from './model.js';
import { AssessmentPaper, Question } from '../QuestionBank/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { MarkingResponseSchema } from './validation-marking.js';

export interface MarkPapersPayload {
  paperId: string;
  studentName: string;
  studentId?: string;
  images: string[];
  imageTypes: Array<'image/jpeg' | 'image/png' | 'image/webp'>;
}

export interface MarkPaperQuestionResult {
  questionNumber: string;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

export interface MarkPaperResult {
  id: string;
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  questions: MarkPaperQuestionResult[];
  extractedHeader: string | null;
  paperMismatch: boolean;
  mismatchReason: string | null;
  status: 'processing' | 'completed' | 'needs_review' | 'failed' | 'published';
}

export async function markPaperFromImages(
  teacherId: string,
  schoolId: string,
  payload: MarkPapersPayload,
): Promise<MarkPaperResult> {
  if (payload.images.length === 0) {
    throw new BadRequestError('At least one image is required.');
  }
  if (payload.images.length !== payload.imageTypes.length) {
    throw new BadRequestError('images and imageTypes arrays must have the same length.');
  }

  const paperInfo = await loadPaperInfo(payload.paperId, schoolId);
  if (!paperInfo) throw new NotFoundError('Paper not found');

  const marking = await PaperMarking.create({
    paperId: new mongoose.Types.ObjectId(payload.paperId),
    paperType: paperInfo.kind,
    studentId: payload.studentId ? new mongoose.Types.ObjectId(payload.studentId) : undefined,
    studentName: payload.studentName,
    teacherId: new mongoose.Types.ObjectId(teacherId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    imageCount: payload.images.length,
    totalMarks: 0,
    maxMarks: paperInfo.totalMarks,
    percentage: 0,
    questions: [],
    status: 'processing',
  });

  try {
    const { systemPrompt, userPrompt } = buildPrompts(paperInfo);

    const { text } = await AIService.generateVisionCompletionWithImages(
      systemPrompt,
      userPrompt,
      payload.images.map((b, i) => ({ base64: b, mediaType: payload.imageTypes[i] })),
      { maxTokens: 4096, temperature: 0.2 },
    );

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let raw: unknown;
    try {
      raw = JSON.parse(cleaned);
    } catch {
      throw new BadRequestError('AI returned non-JSON output. Please try again.');
    }

    const validation = MarkingResponseSchema.safeParse(raw);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const where = issue?.path.join('.') || '(root)';
      throw new BadRequestError(
        `AI response did not match expected structure at "${where}": ${issue?.message ?? 'unknown'}.`,
      );
    }
    const validated = validation.data;

    const terminalStatus = validated.paperMismatch ? 'needs_review' : 'completed';

    marking.totalMarks = validated.totalMarks;
    marking.maxMarks = validated.maxMarks || paperInfo.totalMarks;
    marking.percentage = validated.percentage;
    marking.questions = validated.questions.map((q) => ({
      questionNumber: String(q.questionNumber),
      studentAnswer: q.studentAnswer,
      correctAnswer: q.correctAnswer,
      marksAwarded: q.marksAwarded,
      maxMarks: q.maxMarks,
      feedback: q.feedback,
    }));
    marking.extractedHeader = validated.extractedHeader || null;
    marking.paperMismatch = validated.paperMismatch;
    marking.mismatchReason = validated.mismatchReason || null;
    marking.aiRawResult = validated as unknown as Record<string, unknown>;
    marking.status = terminalStatus;
    await marking.save();

    return toResult(marking);
  } catch (err: unknown) {
    marking.status = 'failed';
    marking.errorMessage = err instanceof Error ? err.message : 'Unknown error';
    try { await marking.save(); } catch { /* never throw from cleanup */ }
    throw err;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

interface PaperInfo {
  kind: 'generated' | 'assessment';
  subject: string;
  grade: string;
  topic: string;
  totalMarks: number;
  memoLines: string[];
}

async function loadPaperInfo(paperId: string, schoolId: string): Promise<PaperInfo | null> {
  const oid = new mongoose.Types.ObjectId(paperId);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const gen = await GeneratedPaper.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
  if (gen) {
    const memoLines: string[] = [];
    for (const sec of gen.sections ?? []) {
      for (const q of sec.questions ?? []) {
        memoLines.push(
          `Question ${q.questionNumber} (${q.marks} marks):\n  Question: ${q.questionText}\n  Correct Answer: ${q.modelAnswer}\n  Marking Guideline: ${q.markingGuideline}`,
        );
      }
    }
    return {
      kind: 'generated',
      subject: gen.subject,
      grade: String(gen.grade),
      topic: gen.topic,
      totalMarks: gen.totalMarks,
      memoLines,
    };
  }

  const asm = await AssessmentPaper.findOne({ _id: oid, schoolId: soid, isDeleted: false })
    .populate([{ path: 'subjectId', select: 'name' }, { path: 'gradeId', select: 'name level' }])
    .lean();
  if (asm) {
    // Collect bank-question IDs (inline questions have null questionId).
    const qIds: mongoose.Types.ObjectId[] = [];
    for (const sec of asm.sections ?? []) {
      for (const pq of sec.questions ?? []) {
        if (pq.questionId) qIds.push(pq.questionId as mongoose.Types.ObjectId);
      }
    }
    const qDocs = qIds.length
      ? await Question.find({ _id: { $in: qIds }, schoolId: soid, isDeleted: false }).lean()
      : [];
    const qMap = new Map(qDocs.map((q) => [q._id.toString(), q]));
    const memoLines: string[] = [];
    (asm.sections ?? []).forEach((sec, sectionIdx) => {
      (sec.questions ?? []).forEach((pq) => {
        // Display label uses 1-indexed section + position (matches the
        // PDF rendering convention in QuestionBank/service-pdf.ts).
        const number = `${sectionIdx + 1}.${pq.position + 1}`;
        if (pq.questionId) {
          const q = qMap.get(pq.questionId.toString());
          if (!q) return;
          memoLines.push(
            `Question ${number} (${pq.marks} marks):\n  Question: ${q.stem}\n  Correct Answer: ${pq.modelAnswer ?? q.answer ?? ''}\n  Marking Guideline: ${pq.markingGuideline ?? q.markingRubric ?? ''}`,
          );
        } else if (pq.questionText) {
          // Inline question — paper carries the stem/answer/rubric directly.
          memoLines.push(
            `Question ${number} (${pq.marks} marks):\n  Question: ${pq.questionText}\n  Correct Answer: ${pq.modelAnswer ?? ''}\n  Marking Guideline: ${pq.markingGuideline ?? ''}`,
          );
        }
      });
    });
    const subj = (asm.subjectId as { name?: string } | undefined)?.name ?? '';
    const gr = (asm.gradeId as { name?: string } | undefined)?.name ?? '';
    return {
      kind: 'assessment',
      subject: subj,
      grade: gr,
      topic: asm.title ?? '',
      totalMarks: asm.totalMarks ?? 0,
      memoLines,
    };
  }

  return null;
}

function buildPrompts(paper: PaperInfo): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are marking a South African school test paper. You will be shown photographs of a student's handwritten answers (one or more pages). Compare each answer against the memo provided. Award marks according to the marking guideline. For partial answers, award partial marks where appropriate. Be fair but accurate.

FIRST: Read the paper header/title from page 1. Compare it against the expected paper metadata in the user message. If the photographed paper is clearly different from the expected paper (different subject, grade, or title), set "paperMismatch": true and explain in "mismatchReason". Otherwise set "paperMismatch": false.

Return ONLY valid JSON with this exact structure:
{
  "studentName": "...",
  "extractedHeader": "<the subject/grade/topic text you read from page 1>",
  "paperMismatch": false,
  "mismatchReason": "",
  "totalMarks": 0,
  "maxMarks": 0,
  "percentage": 0,
  "questions": [
    { "questionNumber": "1", "studentAnswer": "...", "correctAnswer": "...", "marksAwarded": 0, "maxMarks": 0, "feedback": "..." }
  ]
}

Rules:
- Read the handwriting carefully. If a word is illegible, include "[illegible]" in studentAnswer.
- Match each visible answer to the corresponding question number.
- If a question appears unanswered, award 0 and set feedback "No answer provided".
- percentage = totalMarks / maxMarks * 100 rounded to 1 decimal.
- Return ONLY JSON. No markdown fences, no explanation.`;

  const userPrompt = `Expected paper metadata:
- Subject: ${paper.subject}
- Grade: ${paper.grade}
- Topic/Title: ${paper.topic}
- Total Marks: ${paper.totalMarks}

MEMORANDUM:
${paper.memoLines.join('\n\n')}

Please read the student's handwritten answers from the attached images and grade them against this memo.`;

  return { systemPrompt, userPrompt };
}

function toResult(marking: InstanceType<typeof PaperMarking>): MarkPaperResult {
  return {
    id: marking._id.toString(),
    studentName: marking.studentName,
    totalMarks: marking.totalMarks,
    maxMarks: marking.maxMarks,
    percentage: marking.percentage,
    questions: marking.questions.map((q) => ({
      questionNumber: q.questionNumber,
      studentAnswer: q.studentAnswer,
      correctAnswer: q.correctAnswer,
      marksAwarded: q.marksAwarded,
      maxMarks: q.maxMarks,
      feedback: q.feedback,
    })),
    extractedHeader: marking.extractedHeader,
    paperMismatch: marking.paperMismatch,
    mismatchReason: marking.mismatchReason,
    status: marking.status,
  };
}
