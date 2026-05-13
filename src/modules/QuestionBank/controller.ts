import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { QuestionsService } from './service-questions.js';
import { GenerationService } from './service-generation.js';
import { PapersService } from './service-papers.js';
import { PaperGenerationService } from './service-paper-generation.js';
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

  static async saveQuestionToBank(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const question = await QuestionsService.saveQuestionToBank(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.json(apiResponse(true, question, 'Question saved to bank'));
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
      user.role,
      req.body,
      user.isStandaloneTeacher === true,
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
      user.isStandaloneTeacher === true,
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
  //
  // Question CRUD on a paper, finalise, and PDF download handlers live in
  // `controller-papers.ts`. They use the new section-scoped paths
  // (POST /papers/:id/sections/:sectionIdx/questions etc.) and the
  // solo-principal-bypass finalise flow.

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
      user.role,
      req.body,
      user.isStandaloneTeacher === true,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper generated successfully'));
  }

  // PDF downloads live in `controller-papers.ts`. See getPaperPdf / getMemoPdf.
}
