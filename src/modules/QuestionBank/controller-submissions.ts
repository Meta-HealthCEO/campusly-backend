// src/modules/QuestionBank/controller-submissions.ts
//
// HTTP handlers for student paper-take + teacher submission review.

import type { Request, Response } from 'express';
import { z } from 'zod/v4';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { BadRequestError } from '../../common/errors.js';
import {
  resolveStudentContext,
  listAssignedPapersForStudent,
  getStudentPaperView,
  startSubmission,
  saveSubmissionAnswers,
  submitSubmission,
} from './service-submissions-student.js';
import {
  listSubmissionsForPaper,
  getSubmissionDetail,
} from './service-submissions-teacher.js';

const submissionAnswerSchema = z.object({
  questionNumber: z.string().min(1).max(20),
  answer: z.string().max(20000).default(''),
  selectedOption: z.string().max(20).nullable().optional(),
}).strict();

const saveAnswersSchema = z.object({
  answers: z.array(submissionAnswerSchema).max(200),
}).strict();

function requireSchool(req: Request, res: Response): string | null {
  const user = getUser(req);
  if (!user.schoolId) {
    res.status(400).json({ success: false, error: 'User must be assigned to a school' });
    return null;
  }
  return user.schoolId;
}

// ─── Student-facing ──────────────────────────────────────────────────────────

export async function getStudentAssignedPapers(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const ctx = await resolveStudentContext(user.id, schoolId);
  const papers = await listAssignedPapersForStudent(ctx);
  res.json(apiResponse(true, papers));
}

export async function getStudentPaperViewHandler(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const ctx = await resolveStudentContext(user.id, schoolId);
  const paper = await getStudentPaperView(req.params.paperId as string, ctx);
  res.json(apiResponse(true, paper));
}

export async function postStartSubmission(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const ctx = await resolveStudentContext(user.id, schoolId);
  const result = await startSubmission(req.params.paperId as string, ctx);
  res.status(201).json(apiResponse(true, result));
}

export async function putSaveSubmission(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const ctx = await resolveStudentContext(user.id, schoolId);
  const parsed = saveAnswersSchema.parse(req.body);
  const result = await saveSubmissionAnswers(
    req.params.submissionId as string,
    ctx,
    {
      answers: parsed.answers.map((a) => ({
        questionNumber: a.questionNumber,
        answer: a.answer,
        selectedOption: a.selectedOption ?? null,
      })),
    },
  );
  res.json(apiResponse(true, result));
}

export async function postSubmitSubmission(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const user = getUser(req);
  const ctx = await resolveStudentContext(user.id, schoolId);

  // The "teacher" we credit for the marking record is the paper's
  // createdBy. Loading that here keeps the audit chain accurate.
  const paperId = await loadPaperIdForSubmission(req.params.submissionId as string, schoolId);
  const teacherId = await loadPaperCreator(paperId, schoolId);

  const result = await submitSubmission(req.params.submissionId as string, teacherId, ctx);
  res.json(apiResponse(true, result));
}

async function loadPaperIdForSubmission(submissionId: string, schoolId: string): Promise<string> {
  const { PaperSubmission } = await import('./model-submissions.js');
  const sub = await PaperSubmission.findOne({
    _id: submissionId,
    schoolId,
    isDeleted: false,
  }).select('paperId').lean();
  if (!sub) throw new BadRequestError('Submission not found');
  return String(sub.paperId);
}

async function loadPaperCreator(paperId: string, schoolId: string): Promise<string> {
  const { AssessmentPaper } = await import('./model.js');
  const paper = await AssessmentPaper.findOne({
    _id: paperId, schoolId, isDeleted: false,
  }).select('createdBy').lean();
  if (!paper) throw new BadRequestError('Paper not found');
  return String(paper.createdBy);
}

// ─── Teacher-facing ──────────────────────────────────────────────────────────

export async function getPaperSubmissions(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const subs = await listSubmissionsForPaper(req.params.id as string, schoolId);
  res.json(apiResponse(true, subs));
}

export async function getSubmissionHandler(req: Request, res: Response): Promise<void> {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return;
  const sub = await getSubmissionDetail(req.params.submissionId as string, schoolId);
  res.json(apiResponse(true, sub));
}
