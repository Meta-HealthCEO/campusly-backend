import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { QuestionService } from '../services/index.js';

export class QuestionController {
  static async listQuestions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const gradeLevel = req.query.gradeLevel ? parseInt(String(req.query.gradeLevel), 10) : undefined;
    const topicId = req.query.topicId ? String(req.query.topicId) : undefined;
    const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;
    const cognitiveLevel = req.query.cognitiveLevel ? String(req.query.cognitiveLevel) : undefined;
    const questionType = req.query.questionType ? String(req.query.questionType) : undefined;
    const source = req.query.source ? String(req.query.source) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    const result = await QuestionService.listQuestions(
      schoolId,
      { subjectId, gradeLevel, topicId, difficulty, cognitiveLevel, questionType, source, search },
      page,
      limit,
    );
    res.json(apiResponse(true, result, 'Questions retrieved'));
  }

  static async createQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const question = await QuestionService.createQuestion({ ...req.body, schoolId }, user.id);
    res.status(201).json(apiResponse(true, question, 'Question created'));
  }

  static async getQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const question = await QuestionService.getQuestion(req.params.id as string, schoolId);
    res.json(apiResponse(true, question, 'Question retrieved'));
  }

  static async updateQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const question = await QuestionService.updateQuestion(req.params.id as string, req.body, schoolId);
    res.json(apiResponse(true, question, 'Question updated'));
  }

  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    await QuestionService.deleteQuestion(req.params.id as string, schoolId);
    res.json(apiResponse(true, null, 'Question deleted'));
  }

  static async importFromPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const frameworkId = (req.body.frameworkId as string) ?? '';
    const questions = await QuestionService.importFromPaper(req.params.paperId as string, user.id, schoolId, frameworkId);
    res.status(201).json(apiResponse(true, questions, `${questions.length} questions imported`));
  }
}
