import { Request, Response } from 'express';
import { AchieverService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class AchieverController {
  // ─── Achievement ──────────────────────────────────────────────────────

  static async createAchievement(req: Request, res: Response): Promise<void> {
    const achievement = await AchieverService.createAchievement(req.body);
    res.status(201).json(apiResponse(true, achievement, 'Achievement created successfully'));
  }

  static async listAchievements(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      studentId: req.query.studentId as string | undefined,
      type: req.query.type as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      term: req.query.term ? Number(req.query.term) : undefined,
    };

    const result = await AchieverService.listAchievements(query);
    res.json(apiResponse(true, result, 'Achievements retrieved successfully'));
  }

  static async getAchievement(req: Request, res: Response): Promise<void> {
    const achievement = await AchieverService.getAchievement(req.params.id as string);
    res.json(apiResponse(true, achievement, 'Achievement retrieved successfully'));
  }

  static async updateAchievement(req: Request, res: Response): Promise<void> {
    const achievement = await AchieverService.updateAchievement(req.params.id as string, req.body);
    res.json(apiResponse(true, achievement, 'Achievement updated successfully'));
  }

  static async deleteAchievement(req: Request, res: Response): Promise<void> {
    await AchieverService.deleteAchievement(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Achievement deleted successfully'));
  }

  // ─── Wall of Fame ─────────────────────────────────────────────────────

  static async getWallOfFame(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const term = req.query.term ? Number(req.query.term) : undefined;

    const result = await AchieverService.getWallOfFame(schoolId, year, term);
    res.json(apiResponse(true, result, 'Wall of fame retrieved successfully'));
  }

  // ─── Top Achievers from Marks ─────────────────────────────────────────

  static async getTopAchieversFromMarks(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const term = req.query.term ? Number(req.query.term) : undefined;
    const academicYear = req.query.academicYear ? Number(req.query.academicYear) : undefined;

    if (!term || !academicYear) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'Term and academic year are required'));
      return;
    }

    const result = await AchieverService.getTopAchieversFromMarks(schoolId, term, academicYear);
    res.json(apiResponse(true, result, 'Top achievers from marks retrieved successfully'));
  }

  // ─── HousePoints ─────────────────────────────────────────────────────

  static async createHousePoints(req: Request, res: Response): Promise<void> {
    const house = await AchieverService.createHousePoints(req.body);
    res.status(201).json(apiResponse(true, house, 'House created successfully'));
  }

  static async listHousePoints(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const term = req.query.term ? Number(req.query.term) : undefined;

    const result = await AchieverService.listHousePoints(schoolId, year, term);
    res.json(apiResponse(true, result, 'Houses retrieved successfully'));
  }

  static async updateHousePoints(req: Request, res: Response): Promise<void> {
    const house = await AchieverService.updateHousePoints(req.params.id as string, req.body);
    res.json(apiResponse(true, house, 'House updated successfully'));
  }

  static async getHouseLeaderboard(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const term = req.query.term ? Number(req.query.term) : undefined;

    const result = await AchieverService.getHouseLeaderboard(schoolId, year, term);
    res.json(apiResponse(true, result, 'House leaderboard retrieved successfully'));
  }

  // ─── HousePointLog ────────────────────────────────────────────────────

  static async addHousePointLog(req: Request, res: Response): Promise<void> {
    const awardedBy = req.user!.id;
    const log = await AchieverService.addHousePointLog(req.body, awardedBy);
    res.status(201).json(apiResponse(true, log, 'House points awarded successfully'));
  }

  static async getHousePointHistory(req: Request, res: Response): Promise<void> {
    const houseId = req.params.houseId as string;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await AchieverService.getHousePointHistory(houseId, query);
    res.json(apiResponse(true, result, 'House point history retrieved successfully'));
  }
}
