import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { QuestionsService } from './service-questions.js';
import { GenerationService } from './service-generation.js';
import { PapersService } from './service-papers.js';
import type { QuestionQueryInput, PaperQueryInput } from './validation.js';

export class QuestionBankController {
  // ─── Questions CRUD ──────────────────────────────────────────────────────

  static async listQuestions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = req.query as unknown as QuestionQueryInput;
    const result = await QuestionsService.listQuestions(
      user.schoolId!,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const question = await QuestionsService.getQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, question));
  }

  static async createQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const question = await QuestionsService.createQuestion(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, question, 'Question created successfully'));
  }

  static async updateQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const question = await QuestionsService.updateQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, question, 'Question updated successfully'));
  }

  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await QuestionsService.deleteQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Question deleted successfully'));
  }

  // ─── Question Review ─────────────────────────────────────────────────────

  static async submitForReview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const question = await QuestionsService.submitForReview(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, question, 'Question submitted for review'));
  }

  static async reviewQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const question = await QuestionsService.reviewQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, question, 'Question reviewed successfully'));
  }

  // ─── AI Generation ───────────────────────────────────────────────────────

  static async generateQuestions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const questions = await GenerationService.generateQuestions(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, questions, 'Questions generated successfully'));
  }

  // ─── Papers CRUD ─────────────────────────────────────────────────────────

  static async listPapers(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = req.query as unknown as PaperQueryInput;
    const result = await PapersService.listPapers(
      user.schoolId!,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.getPaper(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, paper));
  }

  static async createPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.createPaper(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper created successfully'));
  }

  static async updatePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.updatePaper(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, paper, 'Paper updated successfully'));
  }

  static async deletePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await PapersService.deletePaper(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Paper deleted successfully'));
  }

  // ─── Paper Operations ────────────────────────────────────────────────────

  static async addQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.addQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, paper, 'Question added to paper'));
  }

  static async removeQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sectionIndex = parseInt(req.params.sectionIndex as string, 10);
    const questionIndex = parseInt(req.params.questionIndex as string, 10);
    const paper = await PapersService.removeQuestion(
      req.params.id as string,
      user.schoolId!,
      user.id,
      sectionIndex,
      questionIndex,
    );
    res.json(apiResponse(true, paper, 'Question removed from paper'));
  }

  static async finalisePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.finalisePaper(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, paper, 'Paper finalised successfully'));
  }

  static async clonePaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const paper = await PapersService.clonePaper(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper cloned successfully'));
  }

  static async checkCompliance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const report = await PapersService.checkCompliance(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, report));
  }
}
