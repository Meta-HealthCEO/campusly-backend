import { Request, Response } from 'express';
import { SportService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class SportController {
  // ─── Teams ────────────────────────────────────────────────────────────────

  static async createTeam(req: Request, res: Response): Promise<void> {
    const team = await SportService.createTeam(req.body);
    res.status(201).json(apiResponse(true, team, 'Sport team created successfully'));
  }

  static async listTeams(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      sport: req.query.sport as string | undefined,
    };

    const result = await SportService.listTeams(query);
    res.json(apiResponse(true, result, 'Sport teams retrieved successfully'));
  }

  static async getTeam(req: Request, res: Response): Promise<void> {
    const team = await SportService.getTeam(req.params.id as string);
    res.json(apiResponse(true, team, 'Sport team retrieved successfully'));
  }

  static async updateTeam(req: Request, res: Response): Promise<void> {
    const team = await SportService.updateTeam(req.params.id as string, req.body);
    res.json(apiResponse(true, team, 'Sport team updated successfully'));
  }

  static async deleteTeam(req: Request, res: Response): Promise<void> {
    await SportService.deleteTeam(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Sport team deleted successfully'));
  }

  // ─── Fixtures ─────────────────────────────────────────────────────────────

  static async createFixture(req: Request, res: Response): Promise<void> {
    const fixture = await SportService.createFixture(req.body);
    res.status(201).json(apiResponse(true, fixture, 'Sport fixture created successfully'));
  }

  static async listFixtures(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      teamId: req.query.teamId as string | undefined,
    };

    const result = await SportService.listFixtures(query);
    res.json(apiResponse(true, result, 'Sport fixtures retrieved successfully'));
  }

  static async getFixture(req: Request, res: Response): Promise<void> {
    const fixture = await SportService.getFixture(req.params.id as string);
    res.json(apiResponse(true, fixture, 'Sport fixture retrieved successfully'));
  }

  static async updateFixture(req: Request, res: Response): Promise<void> {
    const fixture = await SportService.updateFixture(req.params.id as string, req.body);
    res.json(apiResponse(true, fixture, 'Sport fixture updated successfully'));
  }

  static async deleteFixture(req: Request, res: Response): Promise<void> {
    await SportService.deleteFixture(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Sport fixture deleted successfully'));
  }
}
