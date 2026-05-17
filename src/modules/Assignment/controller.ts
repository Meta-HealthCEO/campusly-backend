import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import {
  createAssignment,
  listAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  listClassAssignments,
  addClassAssignment,
  removeClassAssignment,
  listAssignmentsForStudent,
  submitAssignment,
  listSubmissionsForAssignment,
  getSubmissionById,
  markSubmission,
} from './service.js';
import { generateAssignmentDraft } from './service-ai-generate.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  createClassAssignmentSchema,
  submitAssignmentSchema,
  markSubmissionSchema,
  generateAssignmentSchema,
} from './validation.js';
import type { AssignmentActor } from './service-access.js';

function requireActor(req: Request, res: Response): AssignmentActor | null {
  const user = getUser(req);
  if (!user.schoolId) {
    res.status(400).json({ success: false, error: 'User must be assigned to a school' });
    return null;
  }
  return { ...user, schoolId: user.schoolId };
}

function requireSchoolId(req: Request, res: Response): string | null {
  const actor = requireActor(req, res);
  return actor?.schoolId ?? null;
}

// ─── Assignment CRUD ────────────────────────────────────────────────────────

export async function postCreateAssignment(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const parsed = createAssignmentSchema.parse(req.body);
  const assignment = await createAssignment(parsed, actor.id, actor);
  res.status(201).json(apiResponse(true, assignment, 'Assignment created'));
}

export async function getListAssignments(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;

  const query = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sort: req.query.sort as string | undefined,
    search: req.query.search as string | undefined,
    classId: req.query.classId as string | undefined,
    subjectId: req.query.subjectId as string | undefined,
    teacherId: req.query.teacherId as string | undefined,
    status: req.query.status as string | undefined,
  };

  const result = await listAssignments(actor, query);
  res.json(apiResponse(true, result));
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const assignment = await getAssignmentById(req.params.id as string, actor);
  res.json(apiResponse(true, assignment));
}

export async function putUpdateAssignment(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const parsed = updateAssignmentSchema.parse(req.body);
  const assignment = await updateAssignment(req.params.id as string, actor, parsed);
  res.json(apiResponse(true, assignment, 'Assignment updated'));
}

export async function deleteAssignmentHandler(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  await deleteAssignment(req.params.id as string, actor);
  res.status(204).end();
}

// ─── Class assignment ───────────────────────────────────────────────────────

export async function getClassAssignments(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const list = await listClassAssignments(req.params.id as string, actor);
  res.json(apiResponse(true, list));
}

export async function postClassAssignment(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const parsed = createClassAssignmentSchema.parse(req.body);
  const list = await addClassAssignment(
    req.params.id as string,
    actor,
    actor.id,
    parsed,
  );
  res.status(201).json(apiResponse(true, list, 'Assignment pushed to class'));
}

export async function deleteClassAssignment(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const list = await removeClassAssignment(
    req.params.id as string,
    actor,
    req.params.classAssignmentId as string,
  );
  res.json(apiResponse(true, list, 'Assignment removed from class'));
}

// ─── Student-side ───────────────────────────────────────────────────────────

export async function getStudentAssignments(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  // Resolve userId → studentId.
  const { Student } = await import('../Student/model.js');
  const student = await Student.findOne({
    userId: user.id,
    schoolId,
    isDeleted: false,
  }).select('_id').lean();
  if (!student) {
    res.status(404).json(apiResponse(false, undefined, undefined, 'Student profile not found'));
    return;
  }
  const list = await listAssignmentsForStudent(student._id.toString(), schoolId);
  res.json(apiResponse(true, list));
}

export async function postSubmitAssignment(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const { Student } = await import('../Student/model.js');
  const student = await Student.findOne({
    userId: user.id,
    schoolId,
    isDeleted: false,
  }).select('_id').lean();
  if (!student) {
    res.status(404).json(apiResponse(false, undefined, undefined, 'Student profile not found'));
    return;
  }
  const parsed = submitAssignmentSchema.parse(req.body);
  const submission = await submitAssignment(
    req.params.id as string,
    student._id.toString(),
    schoolId,
    parsed,
  );
  res.status(201).json(apiResponse(true, submission, 'Assignment submitted'));
}

// ─── Submissions (teacher) ──────────────────────────────────────────────────

export async function getSubmissions(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const list = await listSubmissionsForAssignment(req.params.id as string, actor);
  res.json(apiResponse(true, list));
}

export async function getOneSubmission(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const sub = await getSubmissionById(req.params.submissionId as string, actor);
  res.json(apiResponse(true, sub));
}

export async function postMarkSubmission(req: Request, res: Response): Promise<void> {
  const actor = requireActor(req, res);
  if (!actor) return;
  const parsed = markSubmissionSchema.parse(req.body);
  const sub = await markSubmission(
    req.params.submissionId as string,
    actor,
    actor.id,
    parsed,
  );
  res.json(apiResponse(true, sub, 'Submission marked'));
}

// ─── AI generation ──────────────────────────────────────────────────────────

export async function postGenerateAssignment(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const parsed = generateAssignmentSchema.parse(req.body);
  const draft = await generateAssignmentDraft(parsed, schoolId);
  res.json(apiResponse(true, draft, 'Draft generated'));
}
