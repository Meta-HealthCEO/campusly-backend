import { Request, Response } from 'express';
import { SportService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class SportController {
  // ─── Teams ────────────────────────────────────────────────────────────────

  static async createTeam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const team = await SportService.createTeam({ ...req.body, schoolId });
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
    const schoolId = req.user!.schoolId!;
    const team = await SportService.getTeam(req.params.id as string, schoolId);
    res.json(apiResponse(true, team, 'Sport team retrieved successfully'));
  }

  static async updateTeam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const team = await SportService.updateTeam(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, team, 'Sport team updated successfully'));
  }

  static async deleteTeam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SportService.deleteTeam(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Sport team deleted successfully'));
  }

  // ─── Fixtures ─────────────────────────────────────────────────────────────

  static async createFixture(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const fixture = await SportService.createFixture({ ...req.body, schoolId });
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
    const schoolId = req.user!.schoolId!;
    const fixture = await SportService.getFixture(req.params.id as string, schoolId);
    res.json(apiResponse(true, fixture, 'Sport fixture retrieved successfully'));
  }

  static async updateFixture(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const fixture = await SportService.updateFixture(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, fixture, 'Sport fixture updated successfully'));
  }

  static async deleteFixture(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SportService.deleteFixture(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Sport fixture deleted successfully'));
  }

  // ─── Seasons ────────────────────────────────────────────────────────────

  static async createSeason(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const season = await SportService.createSeason({ ...req.body, schoolId });
    res.status(201).json(apiResponse(true, season, 'Season created successfully'));
  }

  static async listSeasons(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      sport: req.query.sport as string | undefined,
    };

    const result = await SportService.listSeasons(query);
    res.json(apiResponse(true, result, 'Seasons retrieved successfully'));
  }

  static async getSeason(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const season = await SportService.getSeason(req.params.id as string, schoolId);
    res.json(apiResponse(true, season, 'Season retrieved successfully'));
  }

  static async updateSeason(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const season = await SportService.updateSeason(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, season, 'Season updated successfully'));
  }

  static async deleteSeason(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SportService.deleteSeason(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Season deleted successfully'));
  }

  // ─── Player Availability ────────────────────────────────────────────────

  static async createPlayerAvailability(req: Request, res: Response): Promise<void> {
    const data = { ...req.body, fixtureId: req.params.fixtureId };
    const availability = await SportService.createPlayerAvailability(data);
    res.status(201).json(apiResponse(true, availability, 'Player availability recorded successfully'));
  }

  static async getFixtureAvailability(req: Request, res: Response): Promise<void> {
    const availability = await SportService.getFixtureAvailability(req.params.fixtureId as string);
    res.json(apiResponse(true, availability, 'Fixture availability retrieved successfully'));
  }

  // ─── Match Result ───────────────────────────────────────────────────────

  static async createMatchResult(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const data = { ...req.body, fixtureId: req.params.fixtureId, schoolId };
    const result = await SportService.createMatchResult(data, schoolId);
    res.status(201).json(apiResponse(true, result, 'Match result created successfully'));
  }

  static async getMatchResult(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SportService.getMatchResult(req.params.fixtureId as string, schoolId);
    res.json(apiResponse(true, result, 'Match result retrieved successfully'));
  }

  static async updateMatchResult(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SportService.updateMatchResult(req.params.fixtureId as string, schoolId, req.body);
    res.json(apiResponse(true, result, 'Match result updated successfully'));
  }

  // ─── Season Standings ───────────────────────────────────────────────────

  static async getSeasonStandings(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const recalculate = req.query.recalculate === 'true';
    let standings;

    if (recalculate) {
      standings = await SportService.recalculateStandings(req.params.seasonId as string);
    } else {
      standings = await SportService.getSeasonStandings(req.params.seasonId as string, schoolId);
    }

    res.json(apiResponse(true, standings, 'Season standings retrieved successfully'));
  }

  // ─── MVP Voting ─────────────────────────────────────────────────────────

  static async castMvpVote(req: Request, res: Response): Promise<void> {
    const data = { ...req.body, fixtureId: req.params.fixtureId, voterId: req.user?.id };
    const vote = await SportService.castMvpVote(data);
    res.status(201).json(apiResponse(true, vote, 'MVP vote cast successfully'));
  }

  static async getMvpResults(req: Request, res: Response): Promise<void> {
    const results = await SportService.getMvpResults(req.params.fixtureId as string);
    res.json(apiResponse(true, results, 'MVP results retrieved successfully'));
  }
}
