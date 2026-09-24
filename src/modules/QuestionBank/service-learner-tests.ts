// src/modules/QuestionBank/service-learner-tests.ts
//
// Where a class's assessment paper stands for one learner, so the learner
// dashboard and Aura's recommendations agree on what is still to come.

import type mongoose from 'mongoose';
import { PaperSubmission } from './model-submissions.js';
import { PaperMarking } from '../AITools/model-marking.js';

export type LearnerTestState = 'upcoming' | 'overdue' | 'done';

/**
 * The papers this learner has finished: a digital script handed in, or a
 * script (digital or on paper) the teacher has marked.
 */
export async function findDonePaperIds(
  schoolId: mongoose.Types.ObjectId,
  studentId: mongoose.Types.ObjectId,
): Promise<Set<string>> {
  const [submissions, markings] = await Promise.all([
    PaperSubmission.find({ schoolId, studentId, isDeleted: false, status: { $ne: 'in_progress' } })
      .select('paperId')
      .lean(),
    PaperMarking.find({ schoolId, studentId, isDeleted: false }).select('paperId').lean(),
  ]);
  return new Set([...submissions, ...markings].map((doc) => String(doc.paperId)));
}

/** Done once written; overdue once its due date passes unwritten; otherwise still to come. */
export function learnerTestState(
  paperId: string,
  dueAt: Date | null | undefined,
  done: ReadonlySet<string>,
  now: Date,
): LearnerTestState {
  if (done.has(paperId)) return 'done';
  if (dueAt && dueAt.getTime() < now.getTime()) return 'overdue';
  return 'upcoming';
}
