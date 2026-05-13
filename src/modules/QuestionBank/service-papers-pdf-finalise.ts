// service-papers-pdf-finalise.ts
//
// Task 9 — finalise + PDF + memo-getter service helpers. Lives in its own
// file because `service-papers.ts` is already over the 350-line cap; adding
// these here keeps both files within the limit and isolates the
// solo-principal finalise flow from the legacy validation-heavy one.

import mongoose from 'mongoose';
import { AssessmentPaper, type IAssessmentPaper } from './model.js';
import { Assessment } from '../Academic/model.js';
import { PaperMemo, type IPaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { School } from '../School/model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { assertCanEditPaper, PAPER_ADMIN_ROLES } from './service-papers-auth.js';
import { PdfService } from './service-pdf.js';
import { generateMemoPdf } from './service-memo-pdf.js';

const PAPER_TYPE_TO_ASSESSMENT_TYPE: Record<string, 'test' | 'exam' | 'assignment'> = {
  class_test: 'test',
  assignment: 'assignment',
  mid_year: 'exam',
  trial: 'exam',
  final: 'exam',
  custom: 'test',
};

function localTodayDate(): Date {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}`);
}

async function ensureLinkedAssessment(paper: IAssessmentPaper): Promise<void> {
  const existing = await Assessment.findOne({
    paperId: paper._id,
    isDeleted: false,
  }).lean();
  if (existing) return;

  const assessmentType = PAPER_TYPE_TO_ASSESSMENT_TYPE[paper.paperType] ?? 'test';
  await Assessment.create({
    name: paper.title,
    subjectId: paper.subjectId,
    classId: null,
    schoolId: paper.schoolId,
    type: assessmentType,
    totalMarks: paper.totalMarks,
    weight: 0,
    term: paper.term,
    academicYear: paper.year,
    date: localTodayDate(),
    paperId: paper._id,
  });
}

function assertPaperReadyToFinalise(paper: IAssessmentPaper): void {
  const questionCount = paper.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );
  const actualTotal = paper.sections.reduce(
    (sum, section) => sum + section.questions.reduce((total, question) => total + question.marks, 0),
    0,
  );

  if (questionCount === 0) {
    throw new BadRequestError('Add at least one question before finalising this paper');
  }
  if (actualTotal <= 0) {
    throw new BadRequestError('Paper total marks must be greater than zero before finalising');
  }
  if (paper.totalMarks !== actualTotal) {
    paper.totalMarks = actualTotal;
  }
}

// ─── finalisePaper (solo-principal bypass) ───────────────────────────────────

/**
 * Mark a draft paper as `finalised`. The Module 2 spec defers a real
 * moderation flow; in the meantime, school principals and admins
 * (super_admin/school_admin) auto-finalise without moderation. Anyone else
 * is blocked with a 403 explaining moderation isn't yet enabled.
 *
 * Idempotent: re-finalising an already-finalised paper is a no-op.
 * On finalise we also flip the linked PaperMemo to `final` — soft-skip if
 * the memo doesn't exist yet (legacy papers).
 */
export async function finalisePaper(
  paperId: string,
  schoolId: string,
  actorId: string,
  actorRole: string,
  actorIsPrincipal: boolean,
): Promise<IAssessmentPaper> {
  const paper = await AssessmentPaper.findOne({
    _id: paperId,
    schoolId,
    isDeleted: false,
  });
  if (!paper) throw new NotFoundError('Paper not found');
  assertCanEditPaper(paper, actorId, actorRole, 'finalise');

  if (paper.status === 'finalised') return paper;
  assertPaperReadyToFinalise(paper);

  // Solo-principal bypass: auto-finalise without moderation.
  if (actorIsPrincipal || PAPER_ADMIN_ROLES.has(actorRole)) {
    paper.status = 'finalised';
    await paper.save();

    try {
      await PaperMemo.updateOne(
        { paperId: paper._id, isDeleted: false },
        { $set: { status: 'final' } },
      );
    } catch (err: unknown) {
      logger.error(
        { err, paperId: String(paper._id) },
        'Failed to set memo status to final',
      );
    }

    // Best-effort auto-create the linked Assessment so this paper shows
    // up in the gradebook. Failure here is logged, not thrown — the
    // finalise itself succeeded.
    try {
      await ensureLinkedAssessment(paper);
    } catch (err: unknown) {
      logger.error(
        { err, paperId: String(paper._id) },
        'Failed to auto-create linked Assessment on finalise',
      );
    }
    return paper;
  }

  throw new ForbiddenError(
    'Paper finalisation requires moderation. Moderation flow is not yet enabled — contact your school admin.',
  );
}

// ─── getPaperPdfBuffer ───────────────────────────────────────────────────────

/**
 * Render the paper PDF. Uses the existing `PdfService.generatePaperPdf`
 * which already does its own load + populate + render. We pre-load the
 * paper here purely for auth assertion; the buffer generation re-loads.
 */
export async function getPaperPdfBuffer(
  paperId: string,
  schoolId: string,
  actorId: string,
  actorRole: string,
): Promise<Buffer> {
  const paper = await AssessmentPaper.findOne({
    _id: paperId,
    schoolId,
    isDeleted: false,
  }).lean();
  if (!paper) throw new NotFoundError('Paper not found');
  assertCanEditPaper(paper, actorId, actorRole, 'read');

  return PdfService.generatePaperPdf(paperId, schoolId);
}

// ─── getPaperMemo (read) ─────────────────────────────────────────────────────

/**
 * Return the linked PaperMemo for a paper, or null if none exists. Frontend
 * (Task 14) needs this to populate the memo editor without forcing a memo
 * regeneration when none is present yet.
 */
export async function getPaperMemo(
  paperId: string,
  schoolId: string,
  actorId: string,
  actorRole: string,
): Promise<IPaperMemo | null> {
  const paper = await AssessmentPaper.findOne({
    _id: paperId,
    schoolId,
    isDeleted: false,
  }).lean();
  if (!paper) throw new NotFoundError('Paper not found');
  assertCanEditPaper(paper, actorId, actorRole, 'read');

  return PaperMemo.findOne({ paperId, schoolId, isDeleted: false });
}

// ─── getMemoPdfBuffer ────────────────────────────────────────────────────────

/**
 * Render the memo PDF using Task 8's `generateMemoPdf`. Loads the paper
 * (with subject/grade populated for the title block), the memo, and the
 * school. Throws NotFoundError if any are missing.
 */
export async function getMemoPdfBuffer(
  paperId: string,
  schoolId: string,
  actorId: string,
  actorRole: string,
): Promise<Buffer> {
  const paper = await AssessmentPaper.findOne({
    _id: paperId,
    schoolId,
    isDeleted: false,
  })
    .populate('subjectId', 'name')
    .populate('gradeId', 'name')
    .lean();
  if (!paper) throw new NotFoundError('Paper not found');
  assertCanEditPaper(paper, actorId, actorRole, 'read');

  const memo = await PaperMemo.findOne({ paperId, schoolId, isDeleted: false }).lean();
  if (!memo) throw new NotFoundError('Memo not found');

  const school = await School.findById(paper.schoolId).select('name').lean();
  if (!school) throw new NotFoundError('School not found');

  return generateMemoPdf(paper, memo, school);
}

// ─── cascadeMemoOnPaperDelete ────────────────────────────────────────────────

/**
 * Cascade-soft-delete the memo when its paper is soft-deleted. Soft-skips
 * failures so the paper delete still proceeds — Module 1's lesson: cascade
 * failures should not roll back the parent op when the child is best-effort.
 */
export async function cascadeMemoOnPaperDelete(
  paperId: mongoose.Types.ObjectId | string,
): Promise<void> {
  try {
    await PaperMemo.updateOne(
      { paperId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
  } catch (err: unknown) {
    logger.error(
      { err, paperId: String(paperId) },
      'Failed to cascade-delete memo',
    );
  }
}
