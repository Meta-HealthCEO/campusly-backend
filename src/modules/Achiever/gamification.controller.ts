import type { Request } from 'express';
import { Response } from 'express';
import { GamificationService } from './gamification.service.js';
import { apiResponse } from '../../common/utils.js';

export class GamificationController {
  static async getStudentLevel(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = (req.query.studentId as string) ?? req.params.studentId;

    if (!studentId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId is required'));
      return;
    }

    const level = await GamificationService.getStudentLevel(schoolId, studentId);
    res.json(apiResponse(true, level, 'Student level retrieved'));
  }

  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;

    const leaderboard = await GamificationService.getLeaderboard(schoolId, {
      gradeId: req.query.gradeId as string | undefined,
      classId: req.query.classId as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });

    res.json(apiResponse(true, leaderboard, 'Leaderboard retrieved'));
  }

  static async getBadgeDefinitions(_req: Request, res: Response): Promise<void> {
    const badges = GamificationService.getBadgeDefinitions();
    res.json(apiResponse(true, badges, 'Badge definitions retrieved'));
  }

  static async getStudentBadges(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;

    const badges = await GamificationService.getStudentBadges(schoolId, studentId);
    res.json(apiResponse(true, badges, 'Student badges retrieved'));
  }

  static async checkBadges(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.body.studentId as string;

    if (!studentId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId is required'));
      return;
    }

    const awarded = await GamificationService.checkAndAwardBadges(schoolId, studentId);
    res.json(apiResponse(true, { awarded }, 'Badge check completed'));
  }

  static async awardXP(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId, xp, reason } = req.body;

    if (!studentId || !xp) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId and xp are required'));
      return;
    }

    const level = await GamificationService.awardXP(
      schoolId,
      studentId,
      Number(xp),
      reason ?? 'Manual award',
    );

    res.json(apiResponse(true, level, 'XP awarded'));
  }
}
