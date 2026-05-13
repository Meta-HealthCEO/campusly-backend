// src/modules/QuestionBank/service-submissions-teacher.ts
//
// Teacher-facing queries on student submissions for a given paper. Used by
// the paper-detail Submissions tab to drive a "who has submitted, who's
// in progress, which need review" board.

import mongoose from 'mongoose';
import { PaperSubmission, type IPaperSubmission } from './model-submissions.js';
import { AssessmentPaper } from './model.js';
import { NotFoundError } from '../../common/errors.js';

function toOid(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

export interface SubmissionSummary {
  submissionId: string;
  paperId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: IPaperSubmission['status'];
  submittedAt: string | null;
  markingId: string | null;
}

export async function listSubmissionsForPaper(
  paperId: string,
  schoolId: string,
): Promise<SubmissionSummary[]> {
  // Make sure the paper actually belongs to this school before exposing
  // its submissions — defensive even though the route already authorises.
  const paper = await AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('_id').lean();
  if (!paper) throw new NotFoundError('Paper not found');

  const subs = await PaperSubmission.find({
    paperId: toOid(paperId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();

  return subs.map((s) => ({
    submissionId: String(s._id),
    paperId: String(s.paperId),
    classId: String(s.classId),
    studentId: String(s.studentId),
    studentName: s.studentName,
    status: s.status,
    submittedAt: s.submittedAt ? s.submittedAt.toISOString() : null,
    markingId: s.markingId ? String(s.markingId) : null,
  }));
}

export async function getSubmissionDetail(
  submissionId: string,
  schoolId: string,
): Promise<IPaperSubmission> {
  const sub = await PaperSubmission.findOne({
    _id: toOid(submissionId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).lean();
  if (!sub) throw new NotFoundError('Submission not found');
  return sub;
}
