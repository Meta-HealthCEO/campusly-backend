// controller-papers.ts
//
// Task 9 — controller handlers for the per-paper question CRUD, memo, and
// finalise/PDF endpoints. Lives alongside `controller.ts` (which is at
// the 350-line cap) so both files stay maintainable.
//
// All handlers run behind `authenticate` (mounted at app-level) and
// `authorize(...)` (per-route). schoolId is required — short-circuit
// 400 if absent, matching the existing controller style.

import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import {
  addQuestionToPaper,
  updatePaperQuestion,
  regeneratePaperQuestion,
  deletePaperQuestion,
  updatePaperMemo,
} from './service-paper-questions.js';
import {
  finalisePaper,
  getPaperPdfBuffer,
  getMemoPdfBuffer,
  getPaperMemo,
} from './service-papers-pdf-finalise.js';
import {
  addQuestionToPaperSchema,
  updatePaperQuestionSchema,
  updateMemoSchema,
  createPaperAssignmentSchema,
} from './validation.js';
import {
  listAssignments,
  addAssignment,
  removeAssignment,
} from './service-paper-assignments.js';
import { getPaperMarkingRoster } from './service-paper-marking-workspace.js';
import { savePaperQuestionToBank } from './service-paper-question-bank.js';

function requireSchoolId(req: Request, res: Response): string | null {
  const user = getUser(req);
  if (!user.schoolId) {
    res.status(400).json({ success: false, error: 'User must be assigned to a school' });
    return null;
  }
  return user.schoolId;
}

// ─── Question CRUD on a Paper Section ────────────────────────────────────────

export async function postAddQuestionToPaper(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const sectionIdx = Number(req.params.sectionIdx);
  if (!Number.isInteger(sectionIdx) || sectionIdx < 0) {
    res.status(400).json({ success: false, error: 'Invalid sectionIdx' });
    return;
  }
  const parsed = addQuestionToPaperSchema.parse(req.body);
  const paper = await addQuestionToPaper(
    req.params.id as string,
    schoolId,
    sectionIdx,
    parsed,
    user.id,
    user.role,
  );
  res.status(201).json(apiResponse(true, paper, 'Question added to paper'));
}

export async function putUpdatePaperQuestion(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const sectionIdx = Number(req.params.sectionIdx);
  const position = Number(req.params.position);
  if (
    !Number.isInteger(sectionIdx) || sectionIdx < 0
    || !Number.isInteger(position) || position < 0
  ) {
    res.status(400).json({ success: false, error: 'Invalid sectionIdx or position' });
    return;
  }
  const parsed = updatePaperQuestionSchema.parse(req.body);
  const paper = await updatePaperQuestion(
    req.params.id as string,
    schoolId,
    sectionIdx,
    position,
    parsed,
    user.id,
    user.role,
  );
  res.json(apiResponse(true, paper, 'Question updated'));
}

export async function postRegeneratePaperQuestion(
  req: Request,
  res: Response,
): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const sectionIdx = Number(req.params.sectionIdx);
  const position = Number(req.params.position);
  if (
    !Number.isInteger(sectionIdx) || sectionIdx < 0
    || !Number.isInteger(position) || position < 0
  ) {
    res.status(400).json({ success: false, error: 'Invalid sectionIdx or position' });
    return;
  }
  const paper = await regeneratePaperQuestion(
    req.params.id as string,
    schoolId,
    sectionIdx,
    position,
    user.id,
    user.role,
  );
  res.json(apiResponse(true, paper, 'Question regenerated'));
}

export async function deleteRemovePaperQuestion(
  req: Request,
  res: Response,
): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const sectionIdx = Number(req.params.sectionIdx);
  const position = Number(req.params.position);
  if (
    !Number.isInteger(sectionIdx) || sectionIdx < 0
    || !Number.isInteger(position) || position < 0
  ) {
    res.status(400).json({ success: false, error: 'Invalid sectionIdx or position' });
    return;
  }
  await deletePaperQuestion(
    req.params.id as string,
    schoolId,
    sectionIdx,
    position,
    user.id,
    user.role,
  );
  res.status(204).end();
}

// ─── Memo ────────────────────────────────────────────────────────────────────

export async function putUpdateMemo(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const parsed = updateMemoSchema.parse(req.body);
  await updatePaperMemo(
    req.params.id as string,
    schoolId,
    parsed,
    user.id,
    user.role,
  );
  res.status(204).end();
}

export async function getPaperMemoHandler(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const memo = await getPaperMemo(
    req.params.id as string,
    schoolId,
    user.id,
    user.role,
  );
  res.json(apiResponse(true, memo));
}

// ─── Finalise + PDF ──────────────────────────────────────────────────────────

export async function postFinalisePaper(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const paper = await finalisePaper(
    req.params.id as string,
    schoolId,
    user.id,
    user.role,
    Boolean(user.isSchoolPrincipal),
  );
  res.json(apiResponse(true, paper, 'Paper finalised successfully'));
}

export async function getPaperPdf(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const buffer = await getPaperPdfBuffer(
    req.params.id as string,
    schoolId,
    user.id,
    user.role,
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="paper-${req.params.id}.pdf"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

export async function getMemoPdf(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const buffer = await getMemoPdfBuffer(
    req.params.id as string,
    schoolId,
    user.id,
    user.role,
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="memo-${req.params.id}.pdf"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

// ─── Paper Assignments to Class ──────────────────────────────────────────────

export async function getPaperAssignments(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const assignments = await listAssignments(req.params.id as string, schoolId);
  res.json(apiResponse(true, assignments));
}

export async function postPaperAssignment(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const parsed = createPaperAssignmentSchema.parse(req.body);
  const assignments = await addAssignment(
    req.params.id as string,
    schoolId,
    user.id,
    parsed,
  );
  res.status(201).json(apiResponse(true, assignments, 'Paper assigned to class'));
}

export async function deletePaperAssignment(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const assignments = await removeAssignment(
    req.params.id as string,
    schoolId,
    req.params.assignmentId as string,
  );
  res.json(apiResponse(true, assignments, 'Assignment removed'));
}

// ─── Per-Paper Marking Workspace ─────────────────────────────────────────────

export async function getMarkingRoster(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const roster = await getPaperMarkingRoster(req.params.id as string, schoolId);
  res.json(apiResponse(true, roster));
}

// ─── Save a paper question to the curated Question Bank ─────────────────────

export async function postSavePaperQuestionToBank(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const sectionIdx = Number(req.params.sectionIdx);
  const position = Number(req.params.position);
  if (
    !Number.isInteger(sectionIdx) || sectionIdx < 0
    || !Number.isInteger(position) || position < 0
  ) {
    res.status(400).json({ success: false, error: 'Invalid sectionIdx or position' });
    return;
  }
  const result = await savePaperQuestionToBank(
    req.params.id as string,
    schoolId,
    sectionIdx,
    position,
    user.id,
  );
  res.json(apiResponse(true, result, result.alreadyApproved
    ? 'Question already in bank' : 'Question saved to bank'));
}
