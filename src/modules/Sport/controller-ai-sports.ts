import { Request, Response } from 'express';
import { AISportsService } from './service-ai-sports.js';
import { apiResponse } from '../../common/utils.js';
import type { TalentFlagStatus, AIReportType } from './model-ai-sports.js';

export class AISportsController {
  static async generatePlayerAnalysis(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const report = await AISportsService.generatePlayerAnalysis(schoolId, studentId as string, sportCode, userId);
    res.status(201).json(apiResponse(true, report, 'Player analysis generated successfully'));
  }

  static async generateDevelopmentPlan(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const report = await AISportsService.generateDevelopmentPlan(schoolId, studentId as string, sportCode, userId);
    res.status(201).json(apiResponse(true, report, 'Development plan generated successfully'));
  }

  static async generateScoutingReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const report = await AISportsService.generateScoutingReport(schoolId, studentId as string, sportCode, userId);
    res.status(201).json(apiResponse(true, report, 'Scouting report generated successfully'));
  }

  static async generateParentReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const report = await AISportsService.generateParentReport(schoolId, studentId as string, sportCode, userId);
    res.status(201).json(apiResponse(true, report, 'Parent report generated successfully'));
  }

  static async generateMatchReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { fixtureId } = req.params;

    const report = await AISportsService.generateMatchReport(schoolId, fixtureId as string, userId);
    res.status(201).json(apiResponse(true, report, 'Match report generated successfully'));
  }

  static async generateTeamAnalysis(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { teamId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const report = await AISportsService.generateTeamAnalysis(schoolId, teamId as string, sportCode, userId);
    res.status(201).json(apiResponse(true, report, 'Team analysis generated successfully'));
  }

  static async identifyTalent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const flags = await AISportsService.identifyTalent(schoolId, sportCode, userId);
    res.status(201).json(apiResponse(true, flags, 'Talent identification completed'));
  }

  static async listTalentFlags(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sportCode = req.query.sportCode as string | undefined;
    const status = req.query.status as TalentFlagStatus | undefined;

    const flags = await AISportsService.listTalentFlags(schoolId, sportCode, status);
    res.json(apiResponse(true, flags, 'Talent flags retrieved successfully'));
  }

  static async reviewTalentFlag(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.id!;
    const { id } = req.params;
    const { status } = req.body as { status: 'confirmed' | 'dismissed' };

    if (!status || !['confirmed', 'dismissed'].includes(status)) {
      res.status(400).json(apiResponse(false, undefined, 'status must be "confirmed" or "dismissed"'));
      return;
    }

    const flag = await AISportsService.reviewTalentFlag(id as string, schoolId, userId, status);
    res.json(apiResponse(true, flag, 'Talent flag reviewed successfully'));
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;

    const report = await AISportsService.getReport(id as string, schoolId);
    res.json(apiResponse(true, report, 'Report retrieved successfully'));
  }

  static async listReports(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.query.studentId as string | undefined;
    const sportCode = req.query.sportCode as string | undefined;
    const reportType = req.query.reportType as AIReportType | undefined;

    const reports = await AISportsService.listReports(schoolId, studentId, sportCode, reportType);
    res.json(apiResponse(true, reports, 'Reports retrieved successfully'));
  }
}
