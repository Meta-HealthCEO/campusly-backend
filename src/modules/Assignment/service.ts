// Assignment service — CRUD + class-assignment + submission + marking +
// gradebook publish. Mirrors the architectural template from Homework and
// QuestionBank/papers but with rubric-based marking instead of memo-based.

import mongoose from 'mongoose';
import {
  Assignment,
  AssignmentSubmission,
  type IAssignment,
  type IAssignmentSubmission,
} from './model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { publishAssignmentGrade } from '../Academic/service-gradebook-publish.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  CreateClassAssignmentInput,
  SubmitAssignmentInput,
  MarkSubmissionInput,
} from './validation.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toOid(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

async function findAssignmentOrThrow(
  id: string,
  schoolId: string,
): Promise<IAssignment> {
  const assignment = await Assignment.findOne({
    _id: toOid(id),
    schoolId: toOid(schoolId),
    isDeleted: false,
  });
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment;
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createAssignment(
  data: CreateAssignmentInput,
  teacherId: string,
  schoolId: string,
): Promise<IAssignment> {
  const assignment = await Assignment.create({
    ...data,
    schoolId,
    teacherId,
    rubric: data.rubric,
    status: 'draft',
    version: 1,
  });
  return assignment.toObject() as unknown as IAssignment;
}

export async function listAssignments(
  schoolId: string,
  query: ListQuery,
): Promise<PaginatedResult<IAssignment>> {
  const { page, limit, skip, sortField } = getPagination(query);
  const filter: Record<string, unknown> = {
    schoolId: toOid(schoolId),
    isDeleted: false,
  };
  if (query.subjectId) filter.subjectId = toOid(query.subjectId);
  if (query.teacherId) filter.teacherId = toOid(query.teacherId);
  if (query.status) filter.status = query.status;
  if (query.classId) filter['assignedClasses.classId'] = toOid(query.classId);
  if (query.search) {
    filter.$or = [{ title: new RegExp(escapeRegex(query.search), 'i') }];
  }

  const [data, total] = await Promise.all([
    Assignment.find(filter)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  return {
    data: data as unknown as IAssignment[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAssignmentById(
  id: string,
  schoolId: string,
): Promise<IAssignment> {
  const assignment = await Assignment.findOne({
    _id: toOid(id),
    schoolId: toOid(schoolId),
    isDeleted: false,
  })
    .populate('subjectId', 'name code')
    .populate('gradeId', 'name')
    .populate('curriculumNodeId', 'title type')
    .populate('teacherId', 'firstName lastName')
    .populate('assignedClasses.classId', 'name')
    .lean();
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment as unknown as IAssignment;
}

export async function updateAssignment(
  id: string,
  schoolId: string,
  data: UpdateAssignmentInput,
): Promise<IAssignment> {
  // If totalMarks or rubric is changing, re-validate sum.
  if (data.rubric !== undefined || data.totalMarks !== undefined) {
    const existing = await findAssignmentOrThrow(id, schoolId);
    const nextRubric = data.rubric ?? existing.rubric.map((c) => ({
      name: c.name,
      description: c.description,
      maxMarks: c.maxMarks,
    }));
    const nextTotal = data.totalMarks ?? existing.totalMarks;
    if (nextRubric.length > 0) {
      const sum = nextRubric.reduce((acc, c) => acc + c.maxMarks, 0);
      if (sum !== nextTotal) {
        throw new BadRequestError(
          `Sum of rubric criterion maxMarks (${sum}) must equal totalMarks (${nextTotal}).`,
        );
      }
    }
  }

  const assignment = await Assignment.findOneAndUpdate(
    { _id: toOid(id), schoolId: toOid(schoolId), isDeleted: false },
    { $set: data, $inc: { version: 1 } },
    { new: true, runValidators: true },
  );
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment.toObject() as unknown as IAssignment;
}

export async function deleteAssignment(id: string, schoolId: string): Promise<void> {
  const result = await Assignment.findOneAndUpdate(
    { _id: toOid(id), schoolId: toOid(schoolId), isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true },
  );
  if (!result) throw new NotFoundError('Assignment not found');
}

// ─── Class assignment operations ────────────────────────────────────────────

export async function listClassAssignments(
  id: string,
  schoolId: string,
): Promise<IAssignment['assignedClasses']> {
  const assignment = await findAssignmentOrThrow(id, schoolId);
  return assignment.assignedClasses;
}

export async function addClassAssignment(
  id: string,
  schoolId: string,
  teacherId: string,
  input: CreateClassAssignmentInput,
): Promise<IAssignment['assignedClasses']> {
  const assignment = await findAssignmentOrThrow(id, schoolId);

  if (assignment.status !== 'published') {
    throw new BadRequestError('Only published assignments can be pushed to a class.');
  }

  const cls = await Class.findOne({
    _id: toOid(input.classId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('_id').lean();
  if (!cls) throw new BadRequestError('Class not found in this school.');

  const exists = assignment.assignedClasses.some(
    (a) => String(a.classId) === input.classId,
  );
  if (exists) {
    throw new BadRequestError('This class is already assigned to this assignment.');
  }

  assignment.assignedClasses.push({
    _id: new mongoose.Types.ObjectId(),
    classId: toOid(input.classId),
    releaseAt: input.releaseAt ? new Date(input.releaseAt) : null,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    assignedBy: toOid(teacherId),
    assignedAt: new Date(),
  });
  await assignment.save();
  return assignment.assignedClasses;
}

export async function removeClassAssignment(
  id: string,
  schoolId: string,
  classAssignmentId: string,
): Promise<IAssignment['assignedClasses']> {
  const assignment = await findAssignmentOrThrow(id, schoolId);
  const before = assignment.assignedClasses.length;
  assignment.assignedClasses = assignment.assignedClasses.filter(
    (a) => String(a._id) !== classAssignmentId,
  );
  if (assignment.assignedClasses.length === before) {
    throw new NotFoundError('Class assignment not found.');
  }
  await assignment.save();
  return assignment.assignedClasses;
}

// ─── Student-side: list + submit ────────────────────────────────────────────

export async function listAssignmentsForStudent(
  studentId: string,
  schoolId: string,
): Promise<Array<Record<string, unknown>>> {
  const student = await Student.findOne({
    _id: toOid(studentId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('classId').lean();
  if (!student) throw new NotFoundError('Student not found.');

  const classId = String(student.classId);
  const assignments = await Assignment.find({
    schoolId: toOid(schoolId),
    isDeleted: false,
    status: 'published',
    'assignedClasses.classId': toOid(classId),
  })
    .populate('subjectId', 'name')
    .sort('-createdAt')
    .lean();

  const submissionMap = await AssignmentSubmission.find({
    schoolId: toOid(schoolId),
    studentId: toOid(studentId),
    isDeleted: false,
    assignmentId: { $in: assignments.map((a) => a._id) },
  })
    .select('assignmentId status submittedAt totalMark')
    .lean()
    .then((subs) => new Map(subs.map((s) => [String(s.assignmentId), s])));

  return assignments.map((a) => {
    const classMeta = a.assignedClasses.find((ac) => String(ac.classId) === classId);
    const sub = submissionMap.get(String(a._id));
    return {
      ...a,
      classAssignment: classMeta ?? null,
      submission: sub ?? null,
    };
  });
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  schoolId: string,
  input: SubmitAssignmentInput,
): Promise<IAssignmentSubmission> {
  const assignment = await Assignment.findOne({
    _id: toOid(assignmentId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).lean();
  if (!assignment) throw new NotFoundError('Assignment not found.');

  if (assignment.status !== 'published') {
    throw new BadRequestError('Assignment is not yet published.');
  }

  // Confirm the student's class is one this assignment targets, and capture
  // which class-assignment the submission belongs to.
  const student = await Student.findOne({
    _id: toOid(studentId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('classId').lean();
  if (!student) throw new NotFoundError('Student profile not found.');

  const classId = String(student.classId);
  const classAssignment = assignment.assignedClasses.find(
    (a) => String(a.classId) === classId,
  );
  if (!classAssignment) {
    throw new ForbiddenError('This assignment was not pushed to your class.');
  }

  // Format gate: enforce that the student gave us what the teacher asked for.
  const hasFiles = input.files.length > 0;
  const hasText = !!input.textAnswer && input.textAnswer.trim().length > 0;
  if (assignment.submissionFormat === 'file' && !hasFiles) {
    throw new BadRequestError('This assignment requires a file submission.');
  }
  if (assignment.submissionFormat === 'text' && !hasText) {
    throw new BadRequestError('This assignment requires a text submission.');
  }

  const now = new Date();
  const dueAt = classAssignment.dueAt;
  const isLate = !!dueAt && now > dueAt;

  if (isLate && assignment.latePolicy === 'block') {
    throw new BadRequestError('Late submissions are blocked for this assignment.');
  }

  // Upsert: one submission per (assignment, student). Resubmissions reset
  // marking state — we don't keep partial marks across resubmits.
  const submission = await AssignmentSubmission.findOneAndUpdate(
    {
      assignmentId: toOid(assignmentId),
      studentId: toOid(studentId),
    },
    {
      $set: {
        schoolId: toOid(schoolId),
        classId: toOid(classId),
        assignmentVersion: assignment.version,
        files: input.files.map((f) => ({ ...f, uploadedAt: now })),
        textAnswer: input.textAnswer ?? undefined,
        submittedAt: now,
        isLate,
        status: 'submitted',
        rubricMarks: [],
        totalMark: undefined,
        teacherFeedback: undefined,
        markedAt: undefined,
        markedBy: null,
        lateMarkAdjustment: undefined,
        isDeleted: false,
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  if (!submission) throw new Error('Submission upsert failed.');
  return submission;
}

// ─── Teacher-side: roster + marking ─────────────────────────────────────────

export async function listSubmissionsForAssignment(
  assignmentId: string,
  schoolId: string,
): Promise<IAssignmentSubmission[]> {
  await findAssignmentOrThrow(assignmentId, schoolId);
  return AssignmentSubmission.find({
    assignmentId: toOid(assignmentId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  })
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' },
    })
    .populate('markedBy', 'firstName lastName')
    .sort('-submittedAt')
    .lean() as unknown as Promise<IAssignmentSubmission[]>;
}

export async function getSubmissionById(
  submissionId: string,
  schoolId: string,
): Promise<IAssignmentSubmission> {
  const sub = await AssignmentSubmission.findOne({
    _id: toOid(submissionId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  })
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' },
    })
    .populate('markedBy', 'firstName lastName')
    .lean();
  if (!sub) throw new NotFoundError('Submission not found.');
  return sub as unknown as IAssignmentSubmission;
}

export async function markSubmission(
  submissionId: string,
  schoolId: string,
  teacherId: string,
  input: MarkSubmissionInput,
): Promise<IAssignmentSubmission> {
  const submission = await AssignmentSubmission.findOne({
    _id: toOid(submissionId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  });
  if (!submission) throw new NotFoundError('Submission not found.');

  const assignment = await Assignment.findOne({
    _id: submission.assignmentId,
    schoolId: toOid(schoolId),
    isDeleted: false,
  });
  if (!assignment) throw new NotFoundError('Parent assignment not found.');

  // Validate each rubric mark against the assignment's rubric — both that
  // the criterion exists and that awarded doesn't exceed its maxMarks.
  const criterionById = new Map(
    assignment.rubric.map((c) => [String(c._id), c]),
  );
  let rawMark = 0;
  for (const mark of input.rubricMarks) {
    const criterion = criterionById.get(mark.criterionId);
    if (!criterion) {
      throw new BadRequestError(`Unknown rubric criterion: ${mark.criterionId}`);
    }
    if (mark.awarded > criterion.maxMarks) {
      throw new BadRequestError(
        `Awarded mark (${mark.awarded}) exceeds criterion max (${criterion.maxMarks}) for "${criterion.name}".`,
      );
    }
    rawMark += mark.awarded;
  }

  // Apply late penalty if applicable.
  let finalMark = rawMark;
  let lateAdjustment: IAssignmentSubmission['lateMarkAdjustment'];
  if (
    submission.isLate &&
    assignment.latePolicy === 'penalty' &&
    typeof assignment.latePenaltyPercent === 'number' &&
    assignment.latePenaltyPercent > 0
  ) {
    const penalty = (rawMark * assignment.latePenaltyPercent) / 100;
    finalMark = Math.max(0, rawMark - penalty);
    lateAdjustment = {
      rawMark,
      penaltyPercent: assignment.latePenaltyPercent,
      finalMark,
    };
  }

  submission.rubricMarks = input.rubricMarks.map((m) => ({
    criterionId: toOid(m.criterionId),
    awarded: m.awarded,
    feedback: m.feedback,
  }));
  submission.totalMark = finalMark;
  submission.teacherFeedback = input.teacherFeedback;
  submission.markedAt = new Date();
  submission.markedBy = toOid(teacherId);
  submission.lateMarkAdjustment = lateAdjustment;
  submission.status = 'marked';

  await submission.save();

  // Publish to gradebook if requested OR if the assignment is set to
  // auto-publish. Either signal is sufficient.
  const shouldPublish = input.publish || assignment.gradebookAutoPublish;
  if (shouldPublish) {
    await publishAssignmentGrade(
      {
        _id: submission._id as mongoose.Types.ObjectId,
        studentId: submission.studentId,
        schoolId: submission.schoolId,
        classId: submission.classId,
        totalMark: submission.totalMark,
      },
      assignment,
    );
    submission.status = 'published';
    await submission.save();
  }

  return submission.toObject() as unknown as IAssignmentSubmission;
}
