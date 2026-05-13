// src/modules/QuestionBank/service-paper-assignments.ts
//
// Attach / detach a finalised paper to a teaching group (Class). Each
// assignment carries a delivery mode (`digital` for on-device test-take,
// `paper` for a printed copy with answer space) plus optional release / due
// timestamps. Storage lives on the paper itself — see
// AssessmentPaper.assignments in model-papers.ts.
//
// Only finalised papers can be assigned. Draft papers would risk a class
// taking a half-built test; archived papers shouldn't be re-issued.

import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type { IAssessmentPaper, PaperAssignmentMode } from './model-papers.js';
import { Class } from '../Academic/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

interface CreateAssignmentInput {
  classId: string;
  mode: PaperAssignmentMode;
  releaseAt?: string | null;
  dueAt?: string | null;
}

function toOid(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function findPaperOrThrow(paperId: string, schoolId: string): Promise<IAssessmentPaper> {
  return AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).then((paper) => {
    if (!paper) throw new NotFoundError('Paper not found');
    return paper;
  });
}

export async function listAssignments(
  paperId: string,
  schoolId: string,
): Promise<IAssessmentPaper['assignments']> {
  const paper = await findPaperOrThrow(paperId, schoolId);
  return paper.assignments;
}

export async function addAssignment(
  paperId: string,
  schoolId: string,
  teacherId: string,
  input: CreateAssignmentInput,
): Promise<IAssessmentPaper['assignments']> {
  const paper = await findPaperOrThrow(paperId, schoolId);

  if (paper.status !== 'finalised') {
    throw new BadRequestError('Only finalised papers can be assigned to a class.');
  }

  // Sanity-check the target class belongs to the same school.
  const cls = await Class.findOne({
    _id: toOid(input.classId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('_id').lean();
  if (!cls) throw new BadRequestError('Class not found in this school.');

  // De-dupe — one (paper, class) pairing only. If the teacher wants to
  // change the mode they should remove the existing assignment first.
  const exists = paper.assignments.some((a) => String(a.classId) === input.classId);
  if (exists) {
    throw new BadRequestError('This class is already assigned to this paper.');
  }

  paper.assignments.push({
    _id: new mongoose.Types.ObjectId(),
    classId: toOid(input.classId),
    mode: input.mode,
    releaseAt: input.releaseAt ? new Date(input.releaseAt) : null,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    assignedBy: toOid(teacherId),
    assignedAt: new Date(),
  });
  await paper.save();
  return paper.assignments;
}

export async function removeAssignment(
  paperId: string,
  schoolId: string,
  assignmentId: string,
): Promise<IAssessmentPaper['assignments']> {
  const paper = await findPaperOrThrow(paperId, schoolId);
  const before = paper.assignments.length;
  paper.assignments = paper.assignments.filter(
    (a) => String(a._id) !== assignmentId,
  );
  if (paper.assignments.length === before) {
    throw new NotFoundError('Assignment not found on this paper');
  }
  await paper.save();
  return paper.assignments;
}
