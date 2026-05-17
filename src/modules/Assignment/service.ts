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
import { Student } from '../Student/model.js';
import { publishAssignmentGrade } from '../Academic/service-gradebook-publish.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import {
  assertAssignmentAcademicContext,
  assertCanUseClass,
  assignmentAccessFilter,
  canManageAllAssignments,
  isAssignmentActor,
  schoolIdFromScope,
  schoolObjectId,
  toObjectId,
  type AssignmentActor,
  type AssignmentScope,
} from './service-access.js';
import { ASSIGNMENT_STATUSES } from './model.js';
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

function toOid(
  id: string | mongoose.Types.ObjectId,
  label = 'id',
): mongoose.Types.ObjectId {
  return toObjectId(id, label);
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
  scope: AssignmentScope,
): Promise<IAssignment> {
  const assignment = await Assignment.findOne({
    _id: toOid(id, 'assignmentId'),
    ...assignmentAccessFilter(scope),
  });
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment;
}

function assertStaffScope(scope: AssignmentScope): asserts scope is AssignmentActor {
  if (!isAssignmentActor(scope)) return;
  if (
    scope.role !== 'teacher'
    && scope.role !== 'school_admin'
    && scope.role !== 'super_admin'
  ) {
    throw new ForbiddenError('You do not have permission to access assignments');
  }
}

function validateLatePolicy(
  assignment: Pick<IAssignment, 'latePolicy' | 'latePenaltyPercent'>,
  patch?: UpdateAssignmentInput,
): void {
  const latePolicy = patch?.latePolicy ?? assignment.latePolicy;
  const latePenaltyPercent = patch?.latePenaltyPercent ?? assignment.latePenaltyPercent;
  if (
    latePolicy === 'penalty'
    && (!(typeof latePenaltyPercent === 'number') || latePenaltyPercent <= 0)
  ) {
    throw new BadRequestError('latePenaltyPercent must be > 0 when latePolicy is penalty');
  }
}

function validatePublishable(assignment: Pick<IAssignment, 'rubric' | 'totalMarks'>): void {
  if (assignment.rubric.length === 0) {
    throw new BadRequestError('Published assignments must have at least one rubric criterion');
  }
  const sum = assignment.rubric.reduce((acc, c) => acc + c.maxMarks, 0);
  if (sum !== assignment.totalMarks) {
    throw new BadRequestError(
      `Sum of rubric criterion maxMarks (${sum}) must equal totalMarks (${assignment.totalMarks}).`,
    );
  }
}

function visibleClassAssignment(
  assignedClasses: IAssignment['assignedClasses'],
  classId: string,
  now = new Date(),
) {
  return assignedClasses.find((a) => {
    const ref = a.classId as unknown;
    const refId = typeof ref === 'object' && ref !== null && '_id' in ref
      ? String((ref as { _id: unknown })._id)
      : String(a.classId);
    if (refId !== classId) return false;
    return !a.releaseAt || a.releaseAt <= now;
  });
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createAssignment(
  data: CreateAssignmentInput,
  teacherId: string,
  scope: AssignmentScope,
): Promise<IAssignment> {
  assertStaffScope(scope);
  await assertAssignmentAcademicContext(scope, data);
  validateLatePolicy(data);

  const assignment = await Assignment.create({
    ...data,
    schoolId: schoolIdFromScope(scope),
    teacherId,
    rubric: data.rubric,
    status: 'draft',
    version: 1,
  });
  return assignment.toObject() as unknown as IAssignment;
}

export async function listAssignments(
  scope: AssignmentScope,
  query: ListQuery,
): Promise<PaginatedResult<IAssignment>> {
  assertStaffScope(scope);
  const { page, limit, skip, sortField } = getPagination(query);
  const filter: Record<string, unknown> = {
    ...assignmentAccessFilter(scope),
  };
  if (query.subjectId) filter.subjectId = toOid(query.subjectId, 'subjectId');
  if (query.teacherId && (!isAssignmentActor(scope) || canManageAllAssignments(scope))) {
    filter.teacherId = toOid(query.teacherId, 'teacherId');
  }
  if (query.status) {
    if (!(ASSIGNMENT_STATUSES as readonly string[]).includes(query.status)) {
      throw new BadRequestError('Invalid assignment status');
    }
    filter.status = query.status;
  }
  if (query.classId) filter['assignedClasses.classId'] = toOid(query.classId, 'classId');
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
  scope: AssignmentScope,
): Promise<IAssignment | Record<string, unknown>> {
  if (isAssignmentActor(scope) && scope.role === 'student') {
    return getAssignmentForStudentByUser(id, scope);
  }

  assertStaffScope(scope);
  const assignment = await Assignment.findOne({
    _id: toOid(id, 'assignmentId'),
    ...assignmentAccessFilter(scope),
  })
    .populate('subjectId', 'name code')
    .populate('gradeId', 'name')
    .populate('topicIds', 'title type')
    .populate('teacherId', 'firstName lastName')
    .populate('assignedClasses.classId', 'name')
    .lean();
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment as unknown as IAssignment;
}

export async function updateAssignment(
  id: string,
  scope: AssignmentScope,
  data: UpdateAssignmentInput,
): Promise<IAssignment> {
  assertStaffScope(scope);
  const existing = await findAssignmentOrThrow(id, scope);
  validateLatePolicy(existing, data);

  // If totalMarks or rubric is changing, re-validate sum.
  if (data.rubric !== undefined || data.totalMarks !== undefined) {
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

    const submissionsExist = await AssignmentSubmission.exists({
      assignmentId: existing._id,
      schoolId: schoolObjectId(scope),
      isDeleted: false,
    });
    if (submissionsExist) {
      throw new BadRequestError('Cannot change total marks or rubric after submissions exist.');
    }
  }

  if (data.status === 'published') {
    validatePublishable({
      ...existing.toObject(),
      ...data,
      rubric: data.rubric
        ? data.rubric.map((c) => ({ ...c, _id: new mongoose.Types.ObjectId() }))
        : existing.rubric,
      totalMarks: data.totalMarks ?? existing.totalMarks,
    } as IAssignment);
  }

  const assignment = await Assignment.findOneAndUpdate(
    { _id: toOid(id, 'assignmentId'), ...assignmentAccessFilter(scope) },
    { $set: data, $inc: { version: 1 } },
    { returnDocument: 'after', runValidators: true },
  );
  if (!assignment) throw new NotFoundError('Assignment not found');
  return assignment.toObject() as unknown as IAssignment;
}

export async function deleteAssignment(id: string, scope: AssignmentScope): Promise<void> {
  assertStaffScope(scope);
  const result = await Assignment.findOneAndUpdate(
    { _id: toOid(id, 'assignmentId'), ...assignmentAccessFilter(scope) },
    { $set: { isDeleted: true } },
    { returnDocument: 'after' },
  );
  if (!result) throw new NotFoundError('Assignment not found');
}

// ─── Class assignment operations ────────────────────────────────────────────

export async function listClassAssignments(
  id: string,
  scope: AssignmentScope,
): Promise<IAssignment['assignedClasses']> {
  assertStaffScope(scope);
  const assignment = await findAssignmentOrThrow(id, scope);
  return assignment.assignedClasses;
}

export async function addClassAssignment(
  id: string,
  scope: AssignmentScope,
  teacherId: string,
  input: CreateClassAssignmentInput,
): Promise<IAssignment['assignedClasses']> {
  assertStaffScope(scope);
  const assignment = await findAssignmentOrThrow(id, scope);

  if (assignment.status !== 'published') {
    throw new BadRequestError('Only published assignments can be pushed to a class.');
  }

  await assertCanUseClass(scope, input.classId, assignment.subjectId, assignment.gradeId);

  const exists = assignment.assignedClasses.some(
    (a) => String(a.classId) === input.classId,
  );
  if (exists) {
    throw new BadRequestError('This class is already assigned to this assignment.');
  }

  assignment.assignedClasses.push({
    _id: new mongoose.Types.ObjectId(),
    classId: toOid(input.classId, 'classId'),
    releaseAt: input.releaseAt ? new Date(input.releaseAt) : null,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    assignedBy: toOid(teacherId, 'teacherId'),
    assignedAt: new Date(),
  });
  await assignment.save();
  return assignment.assignedClasses;
}

export async function removeClassAssignment(
  id: string,
  scope: AssignmentScope,
  classAssignmentId: string,
): Promise<IAssignment['assignedClasses']> {
  assertStaffScope(scope);
  const assignment = await findAssignmentOrThrow(id, scope);
  const classAssignment = assignment.assignedClasses.find(
    (a) => String(a._id) === classAssignmentId,
  );
  if (!classAssignment) {
    throw new NotFoundError('Class assignment not found.');
  }

  const submissionsExist = await AssignmentSubmission.exists({
    assignmentId: assignment._id,
    classId: classAssignment.classId,
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  });
  if (submissionsExist) {
    throw new BadRequestError('Cannot remove a class once submissions exist.');
  }

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
  const now = new Date();
  const student = await Student.findOne({
    _id: toOid(studentId, 'studentId'),
    schoolId: toOid(schoolId, 'schoolId'),
    isDeleted: false,
  }).select('classId').lean();
  if (!student) throw new NotFoundError('Student not found.');

  const classId = String(student.classId);
  const assignments = await Assignment.find({
    schoolId: toOid(schoolId, 'schoolId'),
    isDeleted: false,
    status: 'published',
    assignedClasses: {
      $elemMatch: {
        classId: toOid(classId, 'classId'),
        $or: [{ releaseAt: null }, { releaseAt: { $lte: now } }],
      },
    },
  })
    .populate('subjectId', 'name')
    .sort('-createdAt')
    .lean();

  const submissionMap = await AssignmentSubmission.find({
    schoolId: toOid(schoolId, 'schoolId'),
    studentId: toOid(studentId, 'studentId'),
    isDeleted: false,
    assignmentId: { $in: assignments.map((a) => a._id) },
  })
    .select('assignmentId status submittedAt totalMark')
    .lean()
    .then((subs) => new Map(subs.map((s) => [String(s.assignmentId), s])));

  return assignments.map((a) => {
    const classMeta = visibleClassAssignment(a.assignedClasses, classId, now);
    const sub = submissionMap.get(String(a._id));
    return {
      ...a,
      classAssignment: classMeta ?? null,
      submission: sub ?? null,
    };
  });
}

async function getAssignmentForStudentByUser(
  assignmentId: string,
  actor: AssignmentActor,
): Promise<Record<string, unknown>> {
  const student = await Student.findOne({
    userId: toOid(actor.id, 'userId'),
    schoolId: schoolObjectId(actor),
    isDeleted: false,
  }).select('_id classId').lean<{
    _id: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
  } | null>();
  if (!student) throw new NotFoundError('Student profile not found.');

  const now = new Date();
  const classId = String(student.classId);
  const assignment = await Assignment.findOne({
    _id: toOid(assignmentId, 'assignmentId'),
    schoolId: schoolObjectId(actor),
    isDeleted: false,
    status: 'published',
    assignedClasses: {
      $elemMatch: {
        classId: student.classId,
        $or: [{ releaseAt: null }, { releaseAt: { $lte: now } }],
      },
    },
  })
    .populate('subjectId', 'name code')
    .populate('gradeId', 'name')
    .populate('topicIds', 'title type')
    .populate('teacherId', 'firstName lastName')
    .populate('assignedClasses.classId', 'name')
    .lean();

  if (!assignment) throw new NotFoundError('Assignment not found');

  const submission = await AssignmentSubmission.findOne({
    assignmentId: assignment._id,
    studentId: student._id,
    schoolId: schoolObjectId(actor),
    isDeleted: false,
  }).select('_id status submittedAt totalMark').lean();

  const classAssignment = visibleClassAssignment(
    assignment.assignedClasses as unknown as IAssignment['assignedClasses'],
    classId,
    now,
  );

  return {
    ...(assignment as unknown as Record<string, unknown>),
    classAssignment: classAssignment ?? null,
    submission: submission as unknown as Record<string, unknown> | null,
  };
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  schoolId: string,
  input: SubmitAssignmentInput,
): Promise<IAssignmentSubmission> {
  const assignment = await Assignment.findOne({
    _id: toOid(assignmentId, 'assignmentId'),
    schoolId: toOid(schoolId, 'schoolId'),
    isDeleted: false,
  }).lean();
  if (!assignment) throw new NotFoundError('Assignment not found.');

  if (assignment.status !== 'published') {
    throw new BadRequestError('Assignment is not yet published.');
  }

  // Confirm the student's class is one this assignment targets, and capture
  // which class-assignment the submission belongs to.
  const student = await Student.findOne({
    _id: toOid(studentId, 'studentId'),
    schoolId: toOid(schoolId, 'schoolId'),
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

  const now = new Date();
  if (classAssignment.releaseAt && now < classAssignment.releaseAt) {
    throw new NotFoundError('Assignment not found');
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

  const acceptedFiles = assignment.submissionFormat === 'text' ? [] : input.files;
  const acceptedText = assignment.submissionFormat === 'file'
    ? undefined
    : input.textAnswer?.trim() || undefined;
  const dueAt = classAssignment.dueAt;
  const isLate = !!dueAt && now > dueAt;

  if (isLate && assignment.latePolicy === 'block') {
    throw new BadRequestError('Late submissions are blocked for this assignment.');
  }

  // Upsert: one submission per (assignment, student). Resubmissions reset
  // marking state — we don't keep partial marks across resubmits.
  const submission = await AssignmentSubmission.findOneAndUpdate(
    {
      assignmentId: toOid(assignmentId, 'assignmentId'),
      studentId: toOid(studentId, 'studentId'),
    },
    {
      $set: {
        schoolId: toOid(schoolId, 'schoolId'),
        classId: toOid(classId, 'classId'),
        assignmentVersion: assignment.version,
        files: acceptedFiles.map((f) => ({ ...f, uploadedAt: now })),
        textAnswer: acceptedText,
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
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
  );
  if (!submission) throw new Error('Submission upsert failed.');
  return submission;
}

// ─── Teacher-side: roster + marking ─────────────────────────────────────────

export async function listSubmissionsForAssignment(
  assignmentId: string,
  scope: AssignmentScope,
): Promise<IAssignmentSubmission[]> {
  assertStaffScope(scope);
  await findAssignmentOrThrow(assignmentId, scope);
  return AssignmentSubmission.find({
    assignmentId: toOid(assignmentId, 'assignmentId'),
    schoolId: schoolObjectId(scope),
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
  scope: AssignmentScope,
): Promise<IAssignmentSubmission> {
  assertStaffScope(scope);
  const sub = await AssignmentSubmission.findOne({
    _id: toOid(submissionId, 'submissionId'),
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  })
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' },
    })
    .populate('markedBy', 'firstName lastName')
    .lean();
  if (!sub) throw new NotFoundError('Submission not found.');
  await findAssignmentOrThrow(String(sub.assignmentId), scope);
  return sub as unknown as IAssignmentSubmission;
}

export async function markSubmission(
  submissionId: string,
  scope: AssignmentScope,
  teacherId: string,
  input: MarkSubmissionInput,
): Promise<IAssignmentSubmission> {
  assertStaffScope(scope);
  const submission = await AssignmentSubmission.findOne({
    _id: toOid(submissionId, 'submissionId'),
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  });
  if (!submission) throw new NotFoundError('Submission not found.');

  const assignment = await Assignment.findOne({
    _id: submission.assignmentId,
    ...assignmentAccessFilter(scope),
  });
  if (!assignment) throw new NotFoundError('Parent assignment not found.');
  if (assignment.status !== 'published') {
    throw new BadRequestError('Only published assignments can be marked.');
  }

  // Validate each rubric mark against the assignment's rubric — both that
  // the criterion exists and that awarded doesn't exceed its maxMarks.
  const criterionById = new Map(
    assignment.rubric.map((c) => [String(c._id), c]),
  );
  if (assignment.rubric.length === 0) {
    throw new BadRequestError('This assignment has no rubric to mark against.');
  }
  if (input.rubricMarks.length !== assignment.rubric.length) {
    throw new BadRequestError('Marks must be supplied for every rubric criterion.');
  }

  const seenCriteria = new Set<string>();
  let rawMark = 0;
  for (const mark of input.rubricMarks) {
    if (seenCriteria.has(mark.criterionId)) {
      throw new BadRequestError('Rubric criteria must not be marked more than once.');
    }
    seenCriteria.add(mark.criterionId);

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
    criterionId: toOid(m.criterionId, 'criterionId'),
    awarded: m.awarded,
    feedback: m.feedback,
  }));
  submission.totalMark = finalMark;
  submission.teacherFeedback = input.teacherFeedback;
  submission.markedAt = new Date();
  submission.markedBy = toOid(teacherId, 'teacherId');
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
