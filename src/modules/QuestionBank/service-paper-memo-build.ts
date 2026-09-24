// src/modules/QuestionBank/service-paper-memo-build.ts
//
// A paper's memo, built from the paper's own questions: each answer takes the
// question's model answer and marks. Used when a paper is created and to add
// a memo to a paper that has none (seeded or older papers).

import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import { PaperMemo, type IMemoSection, type IPaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { NotFoundError } from '../../common/errors.js';
import { assertCanEditPaper } from './service-papers-auth.js';

interface PaperSectionLike {
  title: string;
  order: number;
  questions: Array<{ marks: number; position: number; modelAnswer?: string | null; markingGuideline?: string | null }>;
}

/** Memo sections mirroring the paper: answers numbered "section.question". */
export function memoSectionsFromPaper(sections: readonly PaperSectionLike[]): IMemoSection[] {
  return sections.map((section) => ({
    sectionTitle: section.title,
    answers: section.questions.map((question) => ({
      questionNumber: `${section.order + 1}.${question.position + 1}`,
      // Empty, not a placeholder string — an unanswered question must not
      // print fake memo text on the PDF. The UI shows a placeholder instead.
      expectedAnswer: question.modelAnswer?.trim() ?? '',
      markAllocation: [{ criterion: question.markingGuideline ?? 'Full marks', marks: question.marks }],
      commonMistakes: [],
      acceptableAlternatives: [],
    })),
  }));
}

/** The paper's memo, created from its questions if it has none. Safe to call repeatedly. */
export async function buildPaperMemo(
  paperId: string,
  schoolId: string,
  actorId: string,
  actorRole: string,
): Promise<IPaperMemo> {
  const paper = await AssessmentPaper.findOne({
    _id: new mongoose.Types.ObjectId(paperId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).lean();
  if (!paper) throw new NotFoundError('Paper not found');
  // Owner or admin only. A finalised paper that never had a memo gets a final
  // one built from its model answers; the paper itself doesn't change.
  assertCanEditPaper(paper, actorId, actorRole, 'finalise');
  const memoStatus = paper.status === 'finalised' ? 'final' : 'draft';

  const existing = await PaperMemo.findOne({ paperId: paper._id, schoolId: paper.schoolId });
  if (existing && !existing.isDeleted) return existing;

  const sections = memoSectionsFromPaper(paper.sections ?? []);
  const totalMarks = (paper.sections ?? [])
    .flatMap((s) => s.questions)
    .reduce((sum, q) => sum + (q.marks ?? 0), 0) || paper.totalMarks;

  if (existing) {
    // A deleted memo keeps the paperId (unique index): bring it back with fresh content.
    existing.set({ sections, totalMarks, status: memoStatus, isDeleted: false, teacherId: paper.createdBy });
    return existing.save();
  }
  try {
    return await PaperMemo.create({
      paperId: paper._id,
      schoolId: paper.schoolId,
      teacherId: paper.createdBy,
      sections,
      totalMarks,
      status: memoStatus,
    });
  } catch (err: unknown) {
    // Two clicks at once: the other request created it.
    if ((err as { code?: number }).code === 11000) {
      const created = await PaperMemo.findOne({ paperId: paper._id, schoolId: paper.schoolId, isDeleted: false });
      if (created) return created;
    }
    throw err;
  }
}
