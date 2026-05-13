// src/modules/QuestionBank/service-paper-question-bank.ts
//
// "Save to bank" promotion for a single question on a paper. Two cases:
//
//   (a) Inline question (paper.section.question.questionId === null) — there
//       is no Question doc in the bank yet. Create one with status='approved',
//       carry over the question text/options/answer/rubric, then swap the
//       paper section's question to reference it (questionId set, questionText
//       cleared so the bank becomes the source of truth).
//
//   (b) Bank-ref question already exists (questionId set) but its Question
//       doc is in 'draft' or 'pending_review'. Just flip its status to
//       'approved' — paper section already references the right doc.
//
// Either way the bank ends up containing only what the teacher explicitly
// committed.

import mongoose from 'mongoose';
import { AssessmentPaper, Question, type IPaperQuestion } from './model.js';
import type { IAssessmentPaper } from './model-papers.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

function toOid(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function inferQuestionType(opts: IPaperQuestion['options']): 'mcq' | 'short_answer' {
  return Array.isArray(opts) && opts.length > 0 ? 'mcq' : 'short_answer';
}

interface SaveResult {
  questionId: string;
  alreadyApproved: boolean;
}

export async function savePaperQuestionToBank(
  paperId: string,
  schoolId: string,
  sectionIdx: number,
  position: number,
  userId: string,
): Promise<SaveResult> {
  const paper = await AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  });
  if (!paper) throw new NotFoundError('Paper not found');

  const section = paper.sections[sectionIdx];
  if (!section) throw new BadRequestError('Invalid sectionIdx');
  const pq = section.questions.find((q) => q.position === position);
  if (!pq) throw new BadRequestError('Invalid question position');

  // ── Case (b): already a bank-ref ────────────────────────────────────
  if (pq.questionId) {
    const existing = await Question.findOne({
      _id: pq.questionId,
      schoolId: toOid(schoolId),
      isDeleted: false,
    });
    if (!existing) {
      throw new NotFoundError(
        'Linked bank question not found — paper reference is stale.',
      );
    }
    if (existing.status === 'approved') {
      return { questionId: String(existing._id), alreadyApproved: true };
    }
    if (existing.status === 'rejected') {
      throw new BadRequestError('Rejected questions cannot be saved to the bank.');
    }
    existing.status = 'approved';
    existing.reviewedBy = toOid(userId);
    existing.reviewedAt = new Date();
    await existing.save();
    return { questionId: String(existing._id), alreadyApproved: false };
  }

  // ── Case (a): inline → promote to a fresh Question doc ─────────────
  const text = pq.questionText?.trim();
  if (!text) {
    throw new BadRequestError('Question has no text to save.');
  }

  const created = await Question.create({
    curriculumNodeId: paper.topicIds?.[0] ?? paper.subjectId,
    schoolId: toOid(schoolId),
    subjectId: paper.subjectId,
    gradeId: paper.gradeId,
    type: inferQuestionType(pq.options),
    stem: text,
    media: [],
    options: pq.options ?? [],
    answer: pq.modelAnswer ?? '',
    markingRubric: pq.markingGuideline ?? '',
    marks: pq.marks,
    cognitiveLevel: { caps: 'routine', blooms: 'apply' },
    difficulty: 3,
    tags: ['committed_from_paper'],
    source: 'teacher' as const,
    status: 'approved' as const,
    reviewedBy: toOid(userId),
    reviewedAt: new Date(),
    createdBy: toOid(userId),
  });

  // Swap the paper's section question to reference the bank doc. Clear the
  // inline copy of the stem (the bank now owns it) but keep the per-paper
  // overrides (modelAnswer / markingGuideline / marks / position) untouched
  // — those are paper-scoped and may diverge from the bank entry over time.
  pq.questionId = created._id as mongoose.Types.ObjectId;
  pq.questionText = null;
  await paper.save();

  return { questionId: String(created._id), alreadyApproved: false };
}

export type { IAssessmentPaper };
