import mongoose from 'mongoose';
import {
  SportTeam, ISportTeam,
  SportFixture, ISportFixture,
  Season, ISeason,
  PlayerAvailability, IPlayerAvailability,
  MatchResult, IMatchResult,
  SeasonStanding, ISeasonStanding,
  MvpVote, IMvpVote,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { getPopulated } from '../../types/populated.js';
import type {
  CreateTeamInput, UpdateTeamInput,
  CreateFixtureInput, UpdateFixtureInput,
  CreateSeasonInput, UpdateSeasonInput,
  CreatePlayerAvailabilityInput, UpdatePlayerAvailabilityInput,
  CreateMatchResultInput, UpdateMatchResultInput,
  CreateMvpVoteInput,
} from './validation.js';

interface ListTeamQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  sport?: string;
  isActive?: boolean;
}

interface ListFixtureQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  teamId?: string;
}

interface ListSeasonQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  sport?: string;
  isActive?: boolean;
}

export class SportService {
  // ─── Team CRUD ────────────────────────────────────────────────────────────

  static async createTeam(data: CreateTeamInput): Promise<ISportTeam> {
    const team = await SportTeam.create(data);
    return team;
  }

  static async listTeams(
    query: ListTeamQuery,
  ): Promise<{
    teams: ISportTeam[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.sport) {
      filter.sport = query.sport;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [teams, total] = await Promise.all([
      SportTeam.find(filter)
        .populate('coachId', 'firstName lastName email')
        .populate('playerIds')
        .sort(sortField)
        .skip(skip)
        .limit(limit),
      SportTeam.countDocuments(filter),
    ]);

    return {
      teams,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTeam(id: string): Promise<ISportTeam> {
    const team = await SportTeam.findOne({ _id: id, isDeleted: false })
      .populate('coachId', 'firstName lastName email')
      .populate('playerIds');

    if (!team) {
      throw new NotFoundError('Sport team not found');
    }

    return team;
  }

  static async updateTeam(id: string, data: UpdateTeamInput): Promise<ISportTeam> {
    const team = await SportTeam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('coachId', 'firstName lastName email')
      .populate('playerIds');

    if (!team) {
      throw new NotFoundError('Sport team not found');
    }

    return team;
  }

  static async deleteTeam(id: string): Promise<ISportTeam> {
    const team = await SportTeam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!team) {
      throw new NotFoundError('Sport team not found');
    }

    return team;
  }

  // ─── Fixture CRUD ────────────────────────────────────────────────────────

  static async createFixture(data: CreateFixtureInput): Promise<ISportFixture> {
    const fixture = await SportFixture.create(data);
    return fixture;
  }

  static async listFixtures(
    query: ListFixtureQuery,
  ): Promise<{
    fixtures: ISportFixture[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-date';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.teamId) {
      filter.teamId = query.teamId;
    }

    const [fixtures, total] = await Promise.all([
      SportFixture.find(filter)
        .populate('teamId', 'name sport')
        .sort(sortField)
        .skip(skip)
        .limit(limit),
      SportFixture.countDocuments(filter),
    ]);

    return {
      fixtures,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getFixture(id: string): Promise<ISportFixture> {
    const fixture = await SportFixture.findOne({ _id: id, isDeleted: false })
      .populate('teamId', 'name sport');

    if (!fixture) {
      throw new NotFoundError('Sport fixture not found');
    }

    return fixture;
  }

  static async updateFixture(id: string, data: UpdateFixtureInput): Promise<ISportFixture> {
    const fixture = await SportFixture.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('teamId', 'name sport');

    if (!fixture) {
      throw new NotFoundError('Sport fixture not found');
    }

    return fixture;
  }

  static async deleteFixture(id: string): Promise<ISportFixture> {
    const fixture = await SportFixture.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!fixture) {
      throw new NotFoundError('Sport fixture not found');
    }

    return fixture;
  }

  // ─── Season CRUD ──────────────────────────────────────────────────────────

  static async createSeason(data: CreateSeasonInput): Promise<ISeason> {
    const season = await Season.create(data);
    return season;
  }

  static async listSeasons(
    query: ListSeasonQuery,
  ): Promise<{
    seasons: ISeason[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-startDate';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.sport) {
      filter.sport = query.sport;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [seasons, total] = await Promise.all([
      Season.find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limit),
      Season.countDocuments(filter),
    ]);

    return {
      seasons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getSeason(id: string): Promise<ISeason> {
    const season = await Season.findOne({ _id: id, isDeleted: false });

    if (!season) {
      throw new NotFoundError('Season not found');
    }

    return season;
  }

  static async updateSeason(id: string, data: UpdateSeasonInput): Promise<ISeason> {
    const season = await Season.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!season) {
      throw new NotFoundError('Season not found');
    }

    return season;
  }

  static async deleteSeason(id: string): Promise<ISeason> {
    const season = await Season.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!season) {
      throw new NotFoundError('Season not found');
    }

    return season;
  }

  // ─── Player Availability ─────────────────────────────────────────────────

  static async createPlayerAvailability(data: CreatePlayerAvailabilityInput): Promise<IPlayerAvailability> {
    const existing = await PlayerAvailability.findOne({
      fixtureId: data.fixtureId,
      studentId: data.studentId,
      isDeleted: false,
    });

    if (existing) {
      const updated = await PlayerAvailability.findOneAndUpdate(
        { _id: existing._id },
        { $set: { status: data.status, parentConfirmed: data.parentConfirmed, notes: data.notes } },
        { new: true, runValidators: true },
      )
        .populate('studentId')
        .populate('fixtureId');
      return updated!;
    }

    const availability = await PlayerAvailability.create(data);
    return availability;
  }

  static async getFixtureAvailability(fixtureId: string): Promise<IPlayerAvailability[]> {
    const availability = await PlayerAvailability.find({ fixtureId, isDeleted: false })
      .populate('studentId')
      .populate('fixtureId');

    return availability;
  }

  // ─── Match Result ────────────────────────────────────────────────────────

  static async createMatchResult(data: CreateMatchResultInput): Promise<IMatchResult> {
    const existing = await MatchResult.findOne({ fixtureId: data.fixtureId, isDeleted: false });

    if (existing) {
      throw new BadRequestError('Match result already exists for this fixture');
    }

    const result = await MatchResult.create(data);
    return result;
  }

  static async getMatchResult(fixtureId: string): Promise<IMatchResult> {
    const result = await MatchResult.findOne({ fixtureId, isDeleted: false })
      .populate('scorers.studentId')
      .populate('manOfTheMatch')
      .populate('fixtureId');

    if (!result) {
      throw new NotFoundError('Match result not found');
    }

    return result;
  }

  static async updateMatchResult(fixtureId: string, data: UpdateMatchResultInput): Promise<IMatchResult> {
    const result = await MatchResult.findOneAndUpdate(
      { fixtureId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('scorers.studentId')
      .populate('manOfTheMatch')
      .populate('fixtureId');

    if (!result) {
      throw new NotFoundError('Match result not found');
    }

    return result;
  }

  // ─── Season Standings ────────────────────────────────────────────────────

  static async getSeasonStandings(seasonId: string): Promise<ISeasonStanding[]> {
    const standings = await SeasonStanding.find({ seasonId, isDeleted: false })
      .populate('teamId', 'name sport')
      .sort({ points: -1, goalsFor: -1 });

    return standings;
  }

  static async recalculateStandings(seasonId: string): Promise<ISeasonStanding[]> {
    const season = await Season.findOne({ _id: seasonId, isDeleted: false });

    if (!season) {
      throw new NotFoundError('Season not found');
    }

    // Get all fixtures for the season's sport and school within the date range
    const fixtures = await SportFixture.find({
      schoolId: season.schoolId,
      date: { $gte: season.startDate, $lte: season.endDate },
      isDeleted: false,
    });

    const fixtureIds = fixtures.map((f) => f._id);

    // Get all match results for those fixtures
    const results = await MatchResult.find({
      fixtureId: { $in: fixtureIds },
      isDeleted: false,
    }).populate('fixtureId');

    // Build standings map keyed by teamId string
    const standingsMap: Record<string, {
      teamId: mongoose.Types.ObjectId;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }> = {};

    for (const result of results) {
      const fixture = getPopulated<ISportFixture>(result.fixtureId);
      if (!fixture || !fixture.teamId) continue;

      const teamIdStr = fixture.teamId.toString();
      const teamIdObj = new mongoose.Types.ObjectId(teamIdStr);

      if (!standingsMap[teamIdStr]) {
        standingsMap[teamIdStr] = {
          teamId: teamIdObj,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }

      const entry = standingsMap[teamIdStr];
      entry.played += 1;

      // Determine team's score based on home/away
      const teamScore = fixture.isHome ? result.homeScore : result.awayScore;
      const opponentScore = fixture.isHome ? result.awayScore : result.homeScore;

      entry.goalsFor += teamScore;
      entry.goalsAgainst += opponentScore;

      if (teamScore > opponentScore) {
        entry.won += 1;
        entry.points += 3;
      } else if (teamScore === opponentScore) {
        entry.drawn += 1;
        entry.points += 1;
      } else {
        entry.lost += 1;
      }
    }

    // Upsert standings for each team
    const standingPromises = Object.values(standingsMap).map((entry) =>
      SeasonStanding.findOneAndUpdate(
        { seasonId, teamId: entry.teamId, isDeleted: false },
        {
          $set: {
            schoolId: season.schoolId,
            played: entry.played,
            won: entry.won,
            drawn: entry.drawn,
            lost: entry.lost,
            goalsFor: entry.goalsFor,
            goalsAgainst: entry.goalsAgainst,
            points: entry.points,
          },
        },
        { new: true, upsert: true, runValidators: true },
      ),
    );

    await Promise.all(standingPromises);

    // Return updated standings sorted by points
    return this.getSeasonStandings(seasonId);
  }

  // ─── MVP Voting ──────────────────────────────────────────────────────────

  static async castMvpVote(data: CreateMvpVoteInput): Promise<IMvpVote> {
    // Use the unique index on { fixtureId, voterId } to atomically prevent duplicates
    try {
      const vote = await MvpVote.create(data);
      return vote;
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr.code === 11000) {
        throw new BadRequestError('You have already voted for this fixture');
      }
      throw err;
    }
  }

  static async getMvpResults(fixtureId: string): Promise<{ studentId: string; votes: number }[]> {
    const results = await MvpVote.aggregate([
      { $match: { fixtureId: new mongoose.Types.ObjectId(fixtureId), isDeleted: false } },
      { $group: { _id: '$studentId', votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
      { $project: { _id: 0, studentId: '$_id', votes: 1 } },
    ]);

    return results;
  }
}
