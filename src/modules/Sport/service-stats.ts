import mongoose from 'mongoose';
import { MatchStats, PlayerCard, PersonalBest } from './model-stats.js';
import type { IMatchStats, IPlayerCard, IPersonalBest } from './model-stats.js';
import { SportFixture } from './model.js';
import { SPORT_CONFIGS } from './sport-configs.js';
import type { SportCodeConfig } from './sport-configs.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { calculateAttributes, calculateOverall, getTier } from './rating-calculators.js';
import { BenchmarkService } from './service-benchmark.js';
import type { RecordMatchStatsInput, RecordPersonalBestInput } from './validation-stats.js';

// ─── Stats Service ───────────────────────────────────────────────────────────

export class StatsService {
  // ─── Match Stats ──────────────────────────────────────────────────────────

  static async recordMatchStats(
    schoolId: string,
    fixtureId: string,
    data: RecordMatchStatsInput,
  ): Promise<IMatchStats> {
    const fixture = await SportFixture.findOne({
      _id: fixtureId,
      schoolId,
      isDeleted: false,
    });

    if (!fixture) {
      throw new NotFoundError('Fixture not found');
    }

    const stats = await MatchStats.findOneAndUpdate(
      { fixtureId },
      {
        $set: {
          schoolId,
          fixtureId,
          teamId: data.teamId,
          sportCode: data.sportCode,
          playerStats: data.playerStats,
          teamStats: data.teamStats ?? {},
          scorecard: data.scorecard ?? {},
          isDeleted: false,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    return stats;
  }

  static async getMatchStats(schoolId: string, fixtureId: string): Promise<IMatchStats> {
    const stats = await MatchStats.findOne({
      fixtureId,
      schoolId,
      isDeleted: false,
    })
      .populate('playerStats.studentId', 'firstName lastName')
      .populate('teamId', 'name sport')
      .populate('fixtureId', 'opponent date venue');

    if (!stats) {
      throw new NotFoundError('Match stats not found');
    }

    return stats;
  }

  // ─── Player Career Stats ──────────────────────────────────────────────────

  static async getPlayerCareerStats(
    schoolId: string,
    studentId: string,
    sportCode: string,
  ): Promise<{ appearances: number; aggregated: Record<string, number>; matches: IMatchStats[] }> {
    const matches = await MatchStats.find({
      schoolId,
      sportCode,
      'playerStats.studentId': new mongoose.Types.ObjectId(studentId),
      isDeleted: false,
    })
      .populate('fixtureId', 'opponent date venue result')
      .sort({ createdAt: -1 });

    const aggregated: Record<string, number> = {};

    for (const match of matches) {
      const playerStat = match.playerStats.find(
        (ps) => ps.studentId.toString() === studentId,
      );
      if (!playerStat) continue;

      const stats = playerStat.stats as Record<string, unknown>;
      for (const [key, val] of Object.entries(stats)) {
        if (typeof val === 'number') {
          aggregated[key] = (aggregated[key] ?? 0) + val;
        }
      }
    }

    return { appearances: matches.length, aggregated, matches };
  }

  // ─── Player Card ──────────────────────────────────────────────────────────

  static async recalculatePlayerCard(
    schoolId: string,
    studentId: string,
    sportCode: string,
  ): Promise<IPlayerCard> {
    const config = SPORT_CONFIGS[sportCode];
    if (!config) {
      throw new BadRequestError(`Unknown sport code: ${sportCode}`);
    }

    const career = await this.getPlayerCareerStats(schoolId, studentId, sportCode);
    const snapshot = await BenchmarkService.snapshotForPlayer(studentId, schoolId, sportCode);
    const attributes = calculateAttributes(
      config, career.aggregated, career.appearances, snapshot.scores,
    );
    const overall = calculateOverall(attributes);
    const formTrend = await this.calculateFormTrend(schoolId, studentId, sportCode);
    const position = await this.getMostCommonPosition(schoolId, studentId, sportCode);

    const keyStats = new Map<string, number>();
    for (const [key, val] of Object.entries(career.aggregated)) {
      keyStats.set(key, val);
    }

    const pbs = await PersonalBest.find({
      schoolId, studentId, sportCode, isDeleted: false,
    }).sort({ event: 1 });

    const personalBests = new Map<string, unknown>();
    for (const pb of pbs) {
      personalBests.set(pb.event, { value: pb.value, unit: pb.unit, date: pb.date });
    }

    const attrMap = new Map<string, number>();
    for (const [key, val] of Object.entries(attributes)) {
      attrMap.set(key, val);
    }

    const card = await PlayerCard.findOneAndUpdate(
      { schoolId, studentId, sportCode },
      {
        $set: {
          overallRating: overall,
          attributes: attrMap,
          tier: getTier(overall),
          position,
          appearances: career.appearances,
          keyStats,
          personalBests,
          formTrend,
          isDeleted: false,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    return card;
  }

  static async getPlayerCard(
    schoolId: string,
    studentId: string,
    sportCode: string,
  ): Promise<IPlayerCard> {
    const cardRaw = await PlayerCard.findOne({
      schoolId, studentId, sportCode, isDeleted: false,
    })
      .populate({
        path: 'studentId',
        select: 'admissionNumber userId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .lean();

    if (!cardRaw) {
      throw new NotFoundError('Player card not found');
    }

    const sid = cardRaw.studentId as unknown as {
      admissionNumber?: string;
      userId?: { firstName?: string; lastName?: string } | null;
    } | null;
    const u = sid?.userId;
    let studentName = 'Unknown Player';
    if (u && (u.firstName || u.lastName)) {
      studentName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    } else if (sid?.admissionNumber) {
      const m = sid.admissionNumber.match(/^[A-Z]+-\d+\s+(.+)$/);
      studentName = m ? m[1] : sid.admissionNumber;
    }

    return { ...cardRaw, studentName } as unknown as IPlayerCard;
  }

  static async getPlayerCards(
    schoolId: string,
    sportCode?: string,
    page?: number,
    limit?: number,
    studentId?: string,
  ): Promise<{
    cards: IPlayerCard[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit: lim } = paginationHelper(page, limit);
    const pg = Math.max(page ?? 1, 1);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (sportCode) filter.sportCode = sportCode;
    if (studentId) filter.studentId = studentId;

    const [cardsRaw, total] = await Promise.all([
      PlayerCard.find(filter)
        .populate({
          path: 'studentId',
          select: 'admissionNumber userId',
          populate: { path: 'userId', select: 'firstName lastName' },
        })
        .sort({ overallRating: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      PlayerCard.countDocuments(filter),
    ]);

    // Project a flat studentName field so the frontend can render it cleanly.
    const cards = cardsRaw.map((c) => {
      const sid = c.studentId as unknown as {
        _id?: unknown;
        admissionNumber?: string;
        userId?: { firstName?: string; lastName?: string } | null;
      } | null;
      const u = sid?.userId;
      let studentName = 'Unknown Player';
      if (u && (u.firstName || u.lastName)) {
        studentName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
      } else if (sid?.admissionNumber) {
        // Roster-only students (no userId) — admission number may carry a name.
        // Strip the leading code (e.g. "SC-1001 Liam Naidoo" → "Liam Naidoo").
        const m = sid.admissionNumber.match(/^[A-Z]+-\d+\s+(.+)$/);
        studentName = m ? m[1] : sid.admissionNumber;
      }
      return { ...c, studentName } as unknown as IPlayerCard;
    });

    return { cards, total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) };
  }

  // ─── Personal Bests ───────────────────────────────────────────────────────

  static async recordPersonalBest(
    schoolId: string,
    studentId: string,
    data: RecordPersonalBestInput,
  ): Promise<{ personalBest: IPersonalBest; isNewRecord: boolean }> {
    const existing = await PersonalBest.findOne({
      schoolId, studentId, sportCode: data.sportCode, event: data.event, isDeleted: false,
    }).sort({ value: 1 });

    const isTimedEvent = data.unit === 'seconds';
    let isNewRecord = false;
    let previousBest: number | undefined;

    if (existing) {
      previousBest = existing.value;
      isNewRecord = isTimedEvent
        ? data.value < existing.value
        : data.value > existing.value;
    } else {
      isNewRecord = true;
    }

    const pb = await PersonalBest.create({
      schoolId,
      studentId,
      sportCode: data.sportCode,
      event: data.event,
      value: data.value,
      unit: data.unit,
      date: new Date(data.date),
      fixtureId: data.fixtureId,
      previousBest,
    });

    return { personalBest: pb, isNewRecord };
  }

  static async getPersonalBests(
    schoolId: string,
    studentId: string,
    sportCode?: string,
  ): Promise<IPersonalBest[]> {
    const filter: Record<string, unknown> = { schoolId, studentId, isDeleted: false };
    if (sportCode) filter.sportCode = sportCode;
    return PersonalBest.find(filter).sort({ event: 1, date: -1 });
  }

  // ─── Sport Config ─────────────────────────────────────────────────────────

  static getSportConfig(sportCode: string): SportCodeConfig {
    const config = SPORT_CONFIGS[sportCode];
    if (!config) {
      throw new NotFoundError(`Sport config not found for code: ${sportCode}`);
    }
    return config;
  }

  static getAllSportConfigs(): Record<string, SportCodeConfig> {
    return SPORT_CONFIGS;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private static async calculateFormTrend(
    schoolId: string,
    studentId: string,
    sportCode: string,
  ): Promise<'up' | 'down' | 'stable'> {
    const recentMatches = await MatchStats.find({
      schoolId,
      sportCode,
      'playerStats.studentId': new mongoose.Types.ObjectId(studentId),
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    if (recentMatches.length < 4) return 'stable';

    const getAvgRating = (matches: typeof recentMatches): number => {
      let sum = 0;
      let count = 0;
      for (const m of matches) {
        const ps = m.playerStats.find((p) => p.studentId.toString() === studentId);
        if (ps?.rating != null) {
          sum += ps.rating;
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    };

    const recent3 = recentMatches.slice(0, 3);
    const previous3 = recentMatches.slice(3, 6);
    const recentAvg = getAvgRating(recent3);
    const previousAvg = getAvgRating(previous3);

    if (recentAvg > previousAvg + 5) return 'up';
    if (recentAvg < previousAvg - 5) return 'down';
    return 'stable';
  }

  private static async getMostCommonPosition(
    schoolId: string,
    studentId: string,
    sportCode: string,
  ): Promise<string> {
    const results = await MatchStats.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          sportCode,
          isDeleted: false,
        },
      },
      { $unwind: '$playerStats' },
      {
        $match: {
          'playerStats.studentId': new mongoose.Types.ObjectId(studentId),
          'playerStats.position': { $nin: [null, ''] },
        },
      },
      { $group: { _id: '$playerStats.position', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return results.length > 0 ? (results[0]._id as string) : '';
  }
}
