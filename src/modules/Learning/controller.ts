import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LearningService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class LearningController {
  // ─── Quizzes ─────────────────────────────────────────────────────────

  static async createQuiz(req: Request, res: Response): Promise<void> {
    const quiz = await LearningService.createQuiz(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, quiz, 'Quiz created successfully'));
  }

  static async getQuiz(req: Request, res: Response): Promise<void> {
    const quiz = await LearningService.getQuiz(req.params.id as string);
    res.json(apiResponse(true, quiz, 'Quiz retrieved successfully'));
  }

  static async listQuizzes(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await LearningService.listQuizzes(query);
    res.json(apiResponse(true, result, 'Quizzes retrieved successfully'));
  }

  static async updateQuiz(req: Request, res: Response): Promise<void> {
    const quiz = await LearningService.updateQuiz(req.params.id as string, req.body);
    res.json(apiResponse(true, quiz, 'Quiz updated successfully'));
  }

  static async publishQuiz(req: Request, res: Response): Promise<void> {
    const quiz = await LearningService.publishQuiz(req.params.id as string, req.body.status);
    res.json(apiResponse(true, quiz, `Quiz ${req.body.status} successfully`));
  }

  static async deleteQuiz(req: Request, res: Response): Promise<void> {
    await LearningService.deleteQuiz(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Quiz deleted successfully'));
  }

  // ─── Quiz Attempts ───────────────────────────────────────────────────

  static async submitQuizAttempt(req: Request, res: Response): Promise<void> {
    const attempt = await LearningService.submitQuizAttempt(
      req.params.id as string,
      getUser(req).id,
      req.body.answers,
      req.body.startedAt,
    );
    res.status(201).json(apiResponse(true, attempt, 'Quiz attempt submitted and graded'));
  }

  static async getQuizResults(req: Request, res: Response): Promise<void> {
    const results = await LearningService.getQuizResults(req.params.id as string);
    res.json(apiResponse(true, results, 'Quiz results retrieved'));
  }

  // ─── Study Materials ─────────────────────────────────────────────────

  static async uploadStudyMaterial(req: Request, res: Response): Promise<void> {
    const material = await LearningService.uploadStudyMaterial(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, material, 'Study material uploaded successfully'));
  }

  static async getStudyMaterials(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      term: req.query.term ? Number(req.query.term) : undefined,
      topic: req.query.topic as string | undefined,
      type: req.query.type as string | undefined,
    };
    const result = await LearningService.getStudyMaterials(query);
    res.json(apiResponse(true, result, 'Study materials retrieved'));
  }

  static async getStudyMaterial(req: Request, res: Response): Promise<void> {
    const material = await LearningService.getStudyMaterial(req.params.id as string);
    res.json(apiResponse(true, material, 'Study material retrieved'));
  }

  static async updateStudyMaterial(req: Request, res: Response): Promise<void> {
    const material = await LearningService.updateStudyMaterial(
      req.params.id as string,
      req.body,
    );
    res.json(apiResponse(true, material, 'Study material updated'));
  }

  static async deleteStudyMaterial(req: Request, res: Response): Promise<void> {
    await LearningService.deleteStudyMaterial(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Study material deleted'));
  }

  static async downloadStudyMaterial(req: Request, res: Response): Promise<void> {
    const material = await LearningService.incrementDownloads(req.params.id as string);
    res.json(apiResponse(true, material, 'Download recorded'));
  }

  // ─── Rubrics ─────────────────────────────────────────────────────────

  static async createRubric(req: Request, res: Response): Promise<void> {
    const rubric = await LearningService.createRubric(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, rubric, 'Rubric created successfully'));
  }

  static async getRubric(req: Request, res: Response): Promise<void> {
    const rubric = await LearningService.getRubric(req.params.id as string);
    res.json(apiResponse(true, rubric, 'Rubric retrieved'));
  }

  static async listRubrics(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      subjectId: req.query.subjectId as string | undefined,
      teacherId: req.query.teacherId as string | undefined,
    };
    const result = await LearningService.listRubrics(query);
    res.json(apiResponse(true, result, 'Rubrics retrieved'));
  }

  static async updateRubric(req: Request, res: Response): Promise<void> {
    const rubric = await LearningService.updateRubric(req.params.id as string, req.body);
    res.json(apiResponse(true, rubric, 'Rubric updated'));
  }

  static async deleteRubric(req: Request, res: Response): Promise<void> {
    await LearningService.deleteRubric(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Rubric deleted'));
  }

  // ─── Assignment Submissions ──────────────────────────────────────────

  static async submitDraft(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.submitDraft(
      req.params.homeworkId as string,
      getUser(req).id,
      getUser(req).schoolId ?? '',
      req.body.files,
    );
    res.status(201).json(apiResponse(true, submission, 'Draft saved'));
  }

  static async submitFinal(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.submitFinal(
      req.params.homeworkId as string,
      getUser(req).id,
      getUser(req).schoolId ?? '',
      req.body.files,
      false,
    );
    res.status(201).json(apiResponse(true, submission, 'Assignment submitted'));
  }

  static async gradeWithRubric(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.gradeWithRubric(
      req.params.id as string,
      getUser(req).id,
      {
        comments: req.body.comments,
        rubricScores: req.body.rubricScores,
        audioFeedbackUrl: req.body.audioFeedbackUrl,
      },
      req.body.mark,
    );
    res.json(apiResponse(true, submission, 'Submission graded'));
  }

  static async enablePeerReview(req: Request, res: Response): Promise<void> {
    await LearningService.enablePeerReview(req.params.homeworkId as string);
    res.json(apiResponse(true, undefined, 'Peer review enabled'));
  }

  static async submitPeerReview(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.submitPeerReview(
      req.params.id as string,
      getUser(req).id,
      req.body.rating,
      req.body.comments,
    );
    res.json(apiResponse(true, submission, 'Peer review submitted'));
  }

  static async requestRevision(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.requestRevision(req.params.id as string);
    res.json(apiResponse(true, submission, 'Revision requested'));
  }

  static async getSubmission(req: Request, res: Response): Promise<void> {
    const submission = await LearningService.getSubmission(req.params.id as string);
    res.json(apiResponse(true, submission, 'Submission retrieved'));
  }

  static async getSubmissionsForHomework(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
    };
    const result = await LearningService.getSubmissionsForHomework(
      req.params.homeworkId as string,
      query,
    );
    res.json(apiResponse(true, result, 'Submissions retrieved'));
  }

  // ─── Student Progress ────────────────────────────────────────────────

  static async getStudentProgress(req: Request, res: Response): Promise<void> {
    const progress = await LearningService.getStudentProgress(
      req.params.studentId as string,
      req.query.subjectId as string | undefined,
    );
    res.json(apiResponse(true, progress, 'Student progress retrieved'));
  }

  static async calculateMastery(req: Request, res: Response): Promise<void> {
    const { studentId, subjectId } = req.params;
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId ?? '';
    const term = Number(req.query.term) || 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const progress = await LearningService.calculateMasteryLevel(
      studentId as string,
      subjectId as string,
      schoolId,
      term,
      year,
    );
    res.json(apiResponse(true, progress, 'Mastery level calculated'));
  }

  static async flagStrugglingStudents(req: Request, res: Response): Promise<void> {
    const struggling = await LearningService.flagStrugglingStudents(req.params.classId as string);
    res.json(apiResponse(true, struggling, 'Struggling students identified'));
  }

  static async getAssignmentAnalytics(req: Request, res: Response): Promise<void> {
    const analytics = await LearningService.getAssignmentAnalytics(
      req.params.homeworkId as string,
    );
    res.json(apiResponse(true, analytics, 'Assignment analytics retrieved'));
  }
}
