import {
  Achievement,
  IAchievement,
  HousePoints,
  IHousePoints,
  HousePointLog,
  IHousePointLog,
} from './model.js';
import { Mark } from '../Academic/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import mongoose from 'mongoose';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

export class AchieverService {
  // ─── Achievement CRUD ───────────────────────────────────────────────────

  static async createAchievement(data: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = new Achievement(data);
    return achievement.save();
  }

  static async listAchievements(
    query: {
      page?: number;
      limit?: number;
      schoolId?: string;
      studentId?: string;
      type?: string;
      year?: number;
      term?: number;
    },
  ): Promise<PaginatedResult<IAchievement>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.type) filter.type = query.type;
    if (query.year) filter.year = query.year;
    if (query.term) filter.term = query.term;

    const [data, total] = await Promise.all([
      Achievement.find(filter)
        .populate('studentId')
        .populate('awardedBy', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Achievement.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getAchievement(id: string): Promise<IAchievement> {
    const achievement = await Achievement.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('awardedBy', 'firstName lastName email');
    if (!achievement) throw new NotFoundError('Achievement not found');
    return achievement;
  }

  static async updateAchievement(id: string, data: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = await Achievement.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('awardedBy', 'firstName lastName email');
    if (!achievement) throw new NotFoundError('Achievement not found');
    return achievement;
  }

  static async deleteAchievement(id: string): Promise<IAchievement> {
    const achievement = await Achievement.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!achievement) throw new NotFoundError('Achievement not found');
    return achievement;
  }

  // ─── Wall of Fame ─────────────────────────────────────────────────────

  static async getWallOfFame(
    schoolId: string,
    year: number,
    term?: number,
  ): Promise<Record<string, unknown[]>> {
    const matchStage: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      year,
      isDeleted: false,
    };
    if (term) matchStage.term = term;

    const types = ['academic', 'sport', 'cultural', 'behaviour'] as const;
    const result: Record<string, unknown[]> = {};

    for (const type of types) {
      const topAchievers = await Achievement.aggregate([
        { $match: { ...matchStage, type } },
        {
          $group: {
            _id: '$studentId',
            totalPoints: { $sum: '$points' },
            achievementCount: { $sum: 1 },
          },
        },
        { $sort: { totalPoints: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
      ]);

      result[type] = topAchievers;
    }

    return result;
  }

  // ─── Top Achievers from Marks ─────────────────────────────────────────

  static async getTopAchieversFromMarks(
    schoolId: string,
    term: number,
    academicYear: number,
  ): Promise<unknown[]> {
    const topStudents = await Mark.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      { $unwind: '$assessment' },
      {
        $match: {
          'assessment.term': term,
          'assessment.academicYear': academicYear,
          'assessment.isDeleted': false,
        },
      },
      {
        $group: {
          _id: '$studentId',
          averagePercentage: { $avg: '$percentage' },
          totalMarks: { $sum: 1 },
        },
      },
      { $sort: { averagePercentage: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
    ]);

    return topStudents;
  }

  // ─── HousePoints CRUD ─────────────────────────────────────────────────

  static async createHousePoints(data: Partial<IHousePoints>): Promise<IHousePoints> {
    const house = new HousePoints(data);
    return house.save();
  }

  static async listHousePoints(
    schoolId: string,
    year: number,
    term?: number,
  ): Promise<IHousePoints[]> {
    const filter: Record<string, unknown> = { schoolId, year, isDeleted: false };
    if (term) filter.term = term;

    return HousePoints.find(filter).sort('houseName').lean().exec();
  }

  static async updateHousePoints(id: string, data: Partial<IHousePoints>): Promise<IHousePoints> {
    const house = await HousePoints.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!house) throw new NotFoundError('House not found');
    return house;
  }

  static async getHouseLeaderboard(
    schoolId: string,
    year: number,
    term?: number,
  ): Promise<IHousePoints[]> {
    const filter: Record<string, unknown> = { schoolId, year, isDeleted: false };
    if (term) filter.term = term;

    return HousePoints.find(filter).sort({ totalPoints: -1 }).lean().exec();
  }

  // ─── HousePointLog ────────────────────────────────────────────────────

  static async addHousePointLog(
    data: { studentId: string; houseId: string; points: number; reason: string },
    awardedBy: string,
  ): Promise<IHousePointLog> {
    const house = await HousePoints.findOne({ _id: data.houseId, isDeleted: false });
    if (!house) throw new NotFoundError('House not found');

    const log = new HousePointLog({
      studentId: data.studentId,
      houseId: data.houseId,
      points: data.points,
      reason: data.reason,
      awardedBy,
    });

    await log.save();

    await HousePoints.findByIdAndUpdate(data.houseId, {
      $inc: { totalPoints: data.points },
    });

    return log;
  }

  static async getHousePointHistory(
    houseId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResult<IHousePointLog>> {
    const { page, limit, skip } = getPagination(query);

    const filter: Record<string, unknown> = { houseId, isDeleted: false };

    const [data, total] = await Promise.all([
      HousePointLog.find(filter)
        .populate('studentId')
        .populate('awardedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      HousePointLog.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
