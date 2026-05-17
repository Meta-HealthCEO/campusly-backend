import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { NotFoundError } from '../../common/errors.js';
import { WellbeingService } from './service.js';
import { MoodDashboardService } from './service-dashboard.js';
import type {
  CreateSurveyInput, UpdateSurveyInput, SubmitResponseInput,
} from './validation.js';

async function findStudentIdForUser(userId: string, schoolId: string): Promise<string | null> {
  const { Student } = await import('../Student/model.js');
  const student = await Student.findOne({ userId, schoolId, isDeleted: false })
    .select('_id')
    .lean<{ _id: { toString(): string } } | null>();
  return student?._id.toString() ?? null;
}

export class WellbeingController {
  // ─── Surveys ───────────────────────────────────────────────────────────

  static async listSurveys(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const surveys = await WellbeingService.listSurveys(schoolId as string);
    res.json(apiResponse(true, surveys, 'Surveys retrieved'));
  }

  static async getSurvey(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const survey = await WellbeingService.getSurvey(
      req.params.id as string, schoolId as string,
    );
    res.json(apiResponse(true, survey, 'Survey retrieved'));
  }

  static async createSurvey(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateSurveyInput = req.body;
    const survey = await WellbeingService.createSurvey(
      user.schoolId as string, user.id, data,
    );
    res.status(201).json(apiResponse(true, survey, 'Survey created'));
  }

  static async updateSurvey(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateSurveyInput = req.body;
    const survey = await WellbeingService.updateSurvey(
      req.params.id as string, schoolId as string, data,
    );
    res.json(apiResponse(true, survey, 'Survey updated'));
  }

  static async deleteSurvey(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    await WellbeingService.deleteSurvey(
      req.params.id as string, schoolId as string,
    );
    res.json(apiResponse(true, undefined, 'Survey deleted'));
  }

  // ─── Student Response ──────────────────────────────────────────────────

  static async submitResponse(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: SubmitResponseInput = req.body;
    const studentId = await findStudentIdForUser(user.id, user.schoolId as string);
    if (!studentId) throw new NotFoundError('Student profile not found');
    await WellbeingService.submitResponse(
      req.params.id as string,
      user.schoolId as string,
      studentId,
      data,
    );
    res.status(201).json(apiResponse(true, undefined, 'Response submitted'));
  }

  /** Get active survey for student to complete */
  static async getActiveSurvey(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const active = await WellbeingService.getActiveSurveyForStudent(
      user.id,
      user.schoolId as string,
    );
    res.json(apiResponse(true, active ?? null, 'Active survey retrieved'));
  }

  // ─── Results ───────────────────────────────────────────────────────────

  static async getSurveyResults(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const results = await WellbeingService.getSurveyResults(
      req.params.id as string, schoolId as string,
    );
    res.json(apiResponse(true, results, 'Survey results retrieved'));
  }

  // ─── Mood Dashboard ────────────────────────────────────────────────────

  static async getMoodDashboard(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data = await MoodDashboardService.getDashboard({
      schoolId: schoolId as string,
      period: (req.query.period as 'week' | 'month' | 'term') ?? 'month',
      gradeFilter: req.query.gradeFilter ? Number(req.query.gradeFilter) : undefined,
    });
    res.json(apiResponse(true, data, 'Mood dashboard data retrieved'));
  }
}
