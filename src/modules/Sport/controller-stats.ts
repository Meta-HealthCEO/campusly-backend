import { Request, Response } from 'express';
import { StatsService } from './service-stats.js';
import { apiResponse } from '../../common/utils.js';

export class StatsController {
  // ─── Sport Configs ────────────────────────────────────────────────────────

  static async listSportConfigs(_req: Request, res: Response): Promise<void> {
    const configs = StatsService.getAllSportConfigs();
    res.json(apiResponse(true, configs, 'Sport configs retrieved successfully'));
  }

  static async getSportConfig(req: Request, res: Response): Promise<void> {
    const config = StatsService.getSportConfig(req.params.code as string);
    res.json(apiResponse(true, config, 'Sport config retrieved successfully'));
  }

  // ─── Match Stats ──────────────────────────────────────────────────────────

  static async recordMatchStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { fixtureId } = req.params;
    const stats = await StatsService.recordMatchStats(schoolId, fixtureId as string, req.body);
    res.status(201).json(apiResponse(true, stats, 'Match stats recorded successfully'));
  }

  static async getMatchStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { fixtureId } = req.params;
    const stats = await StatsService.getMatchStats(schoolId, fixtureId as string);
    res.json(apiResponse(true, stats, 'Match stats retrieved successfully'));
  }

  // ─── Player Stats & Cards ────────────────────────────────────────────────

  static async getPlayerCareerStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const stats = await StatsService.getPlayerCareerStats(
      schoolId,
      studentId as string,
      sportCode,
    );
    res.json(apiResponse(true, stats, 'Player career stats retrieved successfully'));
  }

  static async getPlayerCard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const card = await StatsService.getPlayerCard(schoolId, studentId as string, sportCode);
    res.json(apiResponse(true, card, 'Player card retrieved successfully'));
  }

  static async recalculatePlayerCard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string;

    if (!sportCode) {
      res.status(400).json(apiResponse(false, undefined, 'sportCode query parameter is required'));
      return;
    }

    const card = await StatsService.recalculatePlayerCard(
      schoolId,
      studentId as string,
      sportCode,
    );
    res.json(apiResponse(true, card, 'Player card recalculated successfully'));
  }

  // ─── Personal Bests ───────────────────────────────────────────────────────

  static async recordPersonalBest(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId } = req.params;
    const result = await StatsService.recordPersonalBest(
      schoolId,
      studentId as string,
      req.body,
    );
    res.status(201).json(apiResponse(true, result, 'Personal best recorded successfully'));
  }

  static async getPersonalBests(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId } = req.params;
    const sportCode = req.query.sportCode as string | undefined;

    const pbs = await StatsService.getPersonalBests(
      schoolId,
      studentId as string,
      sportCode,
    );
    res.json(apiResponse(true, pbs, 'Personal bests retrieved successfully'));
  }

  // ─── Player Card Listings ─────────────────────────────────────────────────

  static async listPlayerCards(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sportCode = req.query.sportCode as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await StatsService.getPlayerCards(schoolId, sportCode, page, limit);
    res.json(apiResponse(true, result, 'Player cards retrieved successfully'));
  }
}
