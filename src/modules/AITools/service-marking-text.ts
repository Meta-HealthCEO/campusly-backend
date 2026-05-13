// src/modules/AITools/service-marking-text.ts
//
// Digital text variant of the OCR marking flow. Used when a student answered
// the paper digitally (typed answers, online quiz, etc.) — there are no
// images to OCR; the teacher (or upstream submission flow) supplies plain
// text answers per question. The same memo + AI prompts are reused so the
// resulting PaperMarking is structurally identical to OCR markings and can
// share the same review / publish UI.

import mongoose from 'mongoose';
import { PaperMarking } from './model-marking.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { MarkingResponseSchema } from './validation-marking.js';
import {
  loadPaperInfo,
  loadPaperVersion,
  toResult,
  type PaperInfo,
  type MarkPaperResult,
} from './service-marking.js';

export interface MarkPaperTextAnswer {
  questionNumber: string;
  answer: string;
}

export interface MarkPaperTextPayload {
  paperId: string;
  paperType?: 'generated' | 'assessment';
  studentName: string;
  studentId?: string | null;
  classId?: string | null;
  answers: MarkPaperTextAnswer[];
}

export async function markPaperFromText(
  teacherId: string,
  schoolId: string,
  payload: MarkPaperTextPayload,
): Promise<MarkPaperResult> {
  if (!payload.answers || payload.answers.length === 0) {
    throw new BadRequestError('At least one answer is required.');
  }

  const paperInfo = await loadPaperInfo(payload.paperId, schoolId);
  if (!paperInfo) throw new NotFoundError('Paper not found');

  const paperVersion = await loadPaperVersion(payload.paperId, paperInfo.kind);

  const marking = await PaperMarking.create({
    paperId: new mongoose.Types.ObjectId(payload.paperId),
    paperType: paperInfo.kind,
    studentId: payload.studentId ? new mongoose.Types.ObjectId(payload.studentId) : undefined,
    studentName: payload.studentName,
    classId: payload.classId ? new mongoose.Types.ObjectId(payload.classId) : null,
    teacherId: new mongoose.Types.ObjectId(teacherId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    imageCount: 0,
    totalMarks: 0,
    maxMarks: paperInfo.totalMarks,
    percentage: 0,
    questions: [],
    status: 'processing',
    paperVersion,
    images: [],
  });

  try {
    const { systemPrompt, userPrompt } = buildTextPrompts(paperInfo, payload);

    const text = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.2,
    });

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
      rationale: q.rationale,
    }));
    // Digital flow has no header to extract and no risk of paper mismatch —
    // the teacher explicitly chose the paper.
    marking.extractedHeader = null;
    marking.paperMismatch = false;
    marking.mismatchReason = null;
    marking.aiRawResult = validated as unknown as Record<string, unknown>;
    marking.status = 'completed';
    await marking.save();

    return toResult(marking);
  } catch (err: unknown) {
    marking.status = 'failed';
    marking.errorMessage = err instanceof Error ? err.message : 'Unknown error';
    try { await marking.save(); } catch { /* never throw from cleanup */ }
    throw err;
  }
}

function buildTextPrompts(
  paper: PaperInfo,
  payload: MarkPaperTextPayload,
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are marking a South African school test paper that was completed digitally. The student typed their answers — there is no handwriting to interpret. Compare each answer against the memorandum and award marks per the marking guideline. Award partial marks where appropriate. Be fair but accurate.

Return ONLY valid JSON with this exact structure:
{
  "studentName": "${payload.studentName}",
  "extractedHeader": "",
  "paperMismatch": false,
  "mismatchReason": "",
  "totalMarks": 0,
  "maxMarks": 0,
  "percentage": 0,
  "questions": [
    { "questionNumber": "1", "studentAnswer": "...", "correctAnswer": "...", "marksAwarded": 0, "maxMarks": 0, "feedback": "...", "rationale": "1-2 sentence justification of the awarded mark." }
  ]
}

Rules:
- Match each answer to the corresponding question by questionNumber.
- If a question has no answer (empty string), award 0 and set feedback "No answer provided".
- Echo the student's typed answer back in studentAnswer (verbatim, do not rewrite).
- percentage = totalMarks / maxMarks * 100 rounded to 1 decimal.
- rationale: provide a 1-2 sentence justification explaining why the awarded mark was given.
- Return ONLY JSON. No markdown fences, no explanation.`;

  const answerLines = payload.answers
    .map((a) => `Question ${a.questionNumber}:\n${a.answer || '(no answer provided)'}`)
    .join('\n\n');

  const userPrompt = `Expected paper metadata:
- Subject: ${paper.subject}
- Grade: ${paper.grade}
- Topic/Title: ${paper.topic}
- Total Marks: ${paper.totalMarks}

MEMORANDUM:
${paper.memoLines.join('\n\n')}

STUDENT'S TYPED ANSWERS:
${answerLines}

Please grade the student's answers against this memo and return JSON.`;

  return { systemPrompt, userPrompt };
}
