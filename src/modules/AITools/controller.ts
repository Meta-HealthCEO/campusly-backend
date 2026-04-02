import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AIToolsService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class AIToolsController {
  static async generatePaper(req: Request, res: Response): Promise<void> {
    const paper = await AIToolsService.generatePaper(
      getUser(req).id,
      req.body.schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper generated successfully'));
  }

  static async getPapers(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { subject, grade, status, page, limit } = req.query;

    const result = await AIToolsService.getPapers(
      schoolId,
      {
        subject: subject as string | undefined,
        grade: grade ? parseInt(grade as string, 10) : undefined,
        status: status as string | undefined,
      },
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );

    res.json(apiResponse(true, result, 'Papers retrieved successfully'));
  }

  static async getPaperById(req: Request, res: Response): Promise<void> {
    const paper = await AIToolsService.getPaperById(req.params.id as string);
    res.json(apiResponse(true, paper, 'Paper retrieved successfully'));
  }

  static async updatePaper(req: Request, res: Response): Promise<void> {
    const paper = await AIToolsService.updatePaper(req.params.id as string, req.body);
    res.json(apiResponse(true, paper, 'Paper updated successfully'));
  }

  static async regenerateQuestion(req: Request, res: Response): Promise<void> {
    const { sectionIndex, questionIndex } = req.body;
    const paper = await AIToolsService.regenerateQuestion(
      req.params.id as string,
      sectionIndex,
      questionIndex,
      getUser(req).id,
    );
    res.json(apiResponse(true, paper, 'Question regenerated successfully'));
  }

  static async gradeSubmission(req: Request, res: Response): Promise<void> {
    const job = await AIToolsService.gradeSubmission(
      getUser(req).id,
      req.body.schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, job, 'Grading job queued successfully'));
  }

  static async bulkGrade(req: Request, res: Response): Promise<void> {
    const jobs = await AIToolsService.bulkGrade(
      getUser(req).id,
      req.body.schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, jobs, `${jobs.length} grading jobs queued`));
  }

  static async getGradingJob(req: Request, res: Response): Promise<void> {
    const job = await AIToolsService.getGradingJobById(req.params.jobId as string);
    res.json(apiResponse(true, job, 'Grading job retrieved successfully'));
  }

  static async reviewGrade(req: Request, res: Response): Promise<void> {
    const job = await AIToolsService.reviewGrade(req.params.jobId as string, req.body);
    res.json(apiResponse(true, job, 'Grade reviewed successfully'));
  }

  static async publishGrade(req: Request, res: Response): Promise<void> {
    const job = await AIToolsService.publishGrade(req.params.jobId as string);
    res.json(apiResponse(true, job, 'Grade published successfully'));
  }

  static async getUsage(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { startDate, endDate } = req.query;

    const stats = await AIToolsService.getUsageStats(schoolId, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json(apiResponse(true, stats, 'Usage stats retrieved successfully'));
  }
}
