// src/modules/QuestionBank/service-papers-read.ts
//
// Who may read a paper (and its memo and PDFs): its author, school admins
// and principals, and an HOD when the author is in their department — the
// same membership rule as the HOD moderation queue.

import mongoose from 'mongoose';
import { User } from '../Auth/model.js';
import { ForbiddenError } from '../../common/errors.js';
import { assertCanEditPaper } from './service-papers-auth.js';
import type { IAssessmentPaper } from './model-papers.js';

function creatorIdOf(paper: Pick<IAssessmentPaper, 'createdBy'>): string {
  const createdBy = paper.createdBy as unknown;
  return createdBy && typeof createdBy === 'object' && '_id' in createdBy
    ? String((createdBy as { _id: unknown })._id)
    : String(createdBy);
}

export async function assertCanReadPaper(
  paper: Pick<IAssessmentPaper, '_id' | 'createdBy' | 'status' | 'schoolId'>,
  actorId: string,
  actorRole: string,
  hodDepartmentId?: string | null,
): Promise<void> {
  try {
    assertCanEditPaper(paper, actorId, actorRole, 'read');
    return;
  } catch (err: unknown) {
    if (!hodDepartmentId) throw err;
  }
  const inDepartment = await User.exists({
    _id: new mongoose.Types.ObjectId(creatorIdOf(paper)),
    schoolId: paper.schoolId,
    departmentId: new mongoose.Types.ObjectId(hodDepartmentId),
    isDeleted: false,
  });
  if (!inDepartment) throw new ForbiddenError('You can only open papers from your department');
}
