import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';
import { QuestionsService } from './service-questions.js';
import { GenerationService } from './service-generation.js';
import { PapersService } from './service-papers.js';
import { PaperGenerationService } from './service-paper-generation.js';
import { PdfService } from './service-pdf.js';
import { AssessmentPaper } from './model.js';
import mongoose from 'mongoose';
import type { QuestionQueryInput, PaperQueryInput } from './validation.js';

export class QuestionBankController {
  // ─── Questions CRUD ──────────────────────────────────────────────────────

  static async listQuestions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const filters = req.query as unknown as QuestionQueryInput;
    const result = await QuestionsService.listQuestions(
      schoolId,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.getQuestion(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.json(apiResponse(true, question));
  }

  static async createQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.createQuestion(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, question, 'Question created successfully'));
  }

  static async updateQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.updateQuestion(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, question, 'Question updated successfully'));
  }

  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const result = await QuestionsService.deleteQuestion(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Question deleted successfully'));
  }

  // ─── Question Review ─────────────────────────────────────────────────────

  static async submitForReview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.submitForReview(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.json(apiResponse(true, question, 'Question submitted for review'));
  }

  static async reviewQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.reviewQuestion(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, question, 'Question reviewed successfully'));
  }

  // ─── AI Generation ───────────────────────────────────────────────────────

  static async generateQuestions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const questions = await GenerationService.generateQuestions(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, questions, 'Questions generated successfully'));
  }

  static async extractFromPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const questions = await GenerationService.extractFromPaper(
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, questions, 'Questions extracted from paper'));
  }

  // ─── Papers CRUD ─────────────────────────────────────────────────────────

  static async listPapers(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const filters = req.query as unknown as PaperQueryInput;
    const result = await PapersService.listPapers(
      schoolId,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.getPaper(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, paper));
  }

  static async createPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.createPaper(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper created successfully'));
  }

  static async updatePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.updatePaper(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
      req.body,
    );
    res.json(apiResponse(true, paper, 'Paper updated successfully'));
  }

  static async deletePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const result = await PapersService.deletePaper(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Paper deleted successfully'));
  }

  // ─── Paper Operations ────────────────────────────────────────────────────

  static async addQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.addQuestion(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
      req.body,
    );
    res.json(apiResponse(true, paper, 'Question added to paper'));
  }

  static async removeQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const sectionIndex = parseInt(req.params.sectionIndex as string, 10);
    const questionIndex = parseInt(req.params.questionIndex as string, 10);
    const paper = await PapersService.removeQuestion(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
      sectionIndex,
      questionIndex,
    );
    res.json(apiResponse(true, paper, 'Question removed from paper'));
  }

  static async finalisePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.finalisePaper(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, paper, 'Paper finalised successfully'));
  }

  static async clonePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PapersService.clonePaper(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper cloned successfully'));
  }

  static async checkCompliance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const report = await PapersService.checkCompliance(
      req.params.id as string,
      schoolId,
    );
    res.json(apiResponse(true, report));
  }

  // ─── AI Paper Generation ──────────────────────────────────────────────────

  static async generatePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await PaperGenerationService.generatePaper(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper generated successfully'));
  }

  // ─── PDF Downloads ────────────────────────────────────────────────────────

  static async downloadPaperPdf(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    await verifyPdfAccess(req.params.id as string, schoolId, user.id, user.role);

    const buffer = await PdfService.generatePaperPdf(
      req.params.id as string,
      schoolId,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="paper-${req.params.id}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  static async downloadMemoPdf(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    await verifyPdfAccess(req.params.id as string, schoolId, user.id, user.role);

    const buffer = await PdfService.generateMemoPdf(
      req.params.id as string,
      schoolId,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="memo-${req.params.id}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const PDF_ALLOWED_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'];

async function verifyPdfAccess(
  paperId: string,
  schoolId: string,
  userId: string,
  userRole: string,
): Promise<void> {
  const oid = new mongoose.Types.ObjectId(paperId);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const paper = await AssessmentPaper.findOne({
    _id: oid,
    schoolId: soid,
    isDeleted: false,
  }).lean();

  if (!paper) {
    const { NotFoundError } = await import('../../common/errors.js');
    throw new NotFoundError('Assessment paper not found');
  }

  // For finalised papers, only creator + HOD + admin can download
  if (paper.status === 'finalised') {
    const isCreator = paper.createdBy.toString() === userId;
    const isPrivileged = PDF_ALLOWED_ROLES.includes(userRole);
    if (!isCreator && !isPrivileged) {
      throw new ForbiddenError('Only the creator, HOD, or admin can download finalised papers');
    }
  }
}
