import { SportTeam, ISportTeam, SportFixture, ISportFixture } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateTeamInput, UpdateTeamInput, CreateFixtureInput, UpdateFixtureInput } from './validation.js';

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
}
