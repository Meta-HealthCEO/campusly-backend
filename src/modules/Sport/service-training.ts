import { Types } from 'mongoose';
import {
  TrainingSession,
  TrainingAttendance,
  DrillTemplate,
  type ITrainingSession,
  type ITrainingAttendance,
  type IDrillTemplate,
} from './model-training.js';
import { SportTeam } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import type {
  CreateTrainingSessionInput,
  UpdateTrainingSessionInput,
  RecordAttendanceInput,
  CreateDrillTemplateInput,
  UpdateDrillTemplateInput,
} from './validation-training.js';

interface ListFilters {
  schoolId: string;
  teamId?: string;
  studentId?: string;
  from?: string;
  to?: string;
  status?: string;
}

export class TrainingService {
  static async createSession(
    input: CreateTrainingSessionInput,
    schoolId: string,
  ): Promise<ITrainingSession> {
    const team = await SportTeam.findOne({
      _id: input.teamId,
      schoolId,
      isDeleted: false,
    });
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const session = await TrainingSession.create({
      ...input,
      schoolId,
      date: new Date(input.date),
    });
    return session;
  }

  static async listSessions(filters: ListFilters): Promise<ITrainingSession[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.studentId) {
      const teams = await SportTeam.find({
        schoolId: filters.schoolId,
        playerIds: filters.studentId,
        isDeleted: false,
      }).select('_id').lean();
      const teamIds = teams.map((t) => t._id);
      query.teamId = { $in: teamIds };
    }
    if (filters.status) query.status = filters.status;
    if (filters.from || filters.to) {
      const dateQuery: Record<string, Date> = {};
      if (filters.from) dateQuery.$gte = new Date(filters.from);
      if (filters.to) dateQuery.$lte = new Date(filters.to);
      query.date = dateQuery;
    }
    return TrainingSession.find(query)
      .sort({ date: -1 })
      .populate('teamId', 'name sport')
      .lean();
  }

  static async getSession(
    id: string,
    schoolId: string,
  ): Promise<ITrainingSession> {
    const session = await TrainingSession.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    })
      .populate('teamId', 'name sport')
      .populate('drillIds');
    if (!session) {
      throw new NotFoundError('Training session not found');
    }
    return session;
  }

  static async updateSession(
    id: string,
    schoolId: string,
    input: UpdateTrainingSessionInput,
  ): Promise<ITrainingSession> {
    const update: Record<string, unknown> = { ...input };
    if (input.date) update.date = new Date(input.date);

    const session = await TrainingSession.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: update },
      { new: true },
    ).populate('teamId', 'name sport');

    if (!session) {
      throw new NotFoundError('Training session not found');
    }
    return session;
  }

  static async deleteSession(id: string, schoolId: string): Promise<void> {
    const result = await TrainingSession.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) {
      throw new NotFoundError('Training session not found');
    }
    await TrainingAttendance.updateMany(
      { sessionId: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
  }

  static async recordAttendance(
    sessionId: string,
    schoolId: string,
    input: RecordAttendanceInput,
  ): Promise<ITrainingAttendance[]> {
    const session = await TrainingSession.findOne({
      _id: sessionId,
      schoolId,
      isDeleted: false,
    });
    if (!session) {
      throw new NotFoundError('Training session not found');
    }

    const sessionObjectId = new Types.ObjectId(sessionId);
    const schoolObjectId = new Types.ObjectId(schoolId);

    await Promise.all(
      input.attendance.map((record) =>
        TrainingAttendance.findOneAndUpdate(
          { sessionId: sessionObjectId, studentId: record.studentId },
          {
            $set: {
              schoolId: schoolObjectId,
              status: record.status,
              notes: record.notes,
              rating: record.rating,
              isDeleted: false,
            },
          },
          { upsert: true, new: true },
        ),
      ),
    );

    return TrainingAttendance.find({
      sessionId: sessionObjectId,
      schoolId: schoolObjectId,
      isDeleted: false,
    })
      .populate('studentId')
      .lean();
  }

  static async getAttendance(
    sessionId: string,
    schoolId: string,
  ): Promise<ITrainingAttendance[]> {
    const session = await TrainingSession.findOne({
      _id: sessionId,
      schoolId,
      isDeleted: false,
    });
    if (!session) {
      throw new NotFoundError('Training session not found');
    }
    return TrainingAttendance.find({
      sessionId,
      schoolId,
      isDeleted: false,
    })
      .populate('studentId')
      .lean();
  }

  static async getPlayerAttendanceSummary(
    studentId: string,
    schoolId: string,
    from?: string,
    to?: string,
  ): Promise<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    injured: number;
    attendanceRate: number;
  }> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestError('Invalid studentId');
    }
    const match: Record<string, unknown> = {
      schoolId: new Types.ObjectId(schoolId),
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    };
    const records = await TrainingAttendance.find(match).lean();
    let filtered = records;
    if (from || to) {
      const sessionIds = records.map((r) => r.sessionId);
      const sessionQuery: Record<string, unknown> = {
        _id: { $in: sessionIds },
        isDeleted: false,
      };
      if (from || to) {
        const dateQuery: Record<string, Date> = {};
        if (from) dateQuery.$gte = new Date(from);
        if (to) dateQuery.$lte = new Date(to);
        sessionQuery.date = dateQuery;
      }
      const sessions = await TrainingSession.find(sessionQuery).select('_id').lean();
      const sessionIdSet = new Set(sessions.map((s) => s._id.toString()));
      filtered = records.filter((r) => sessionIdSet.has(r.sessionId.toString()));
    }

    const summary = {
      total: filtered.length,
      present: filtered.filter((r) => r.status === 'present').length,
      absent: filtered.filter((r) => r.status === 'absent').length,
      late: filtered.filter((r) => r.status === 'late').length,
      excused: filtered.filter((r) => r.status === 'excused').length,
      injured: filtered.filter((r) => r.status === 'injured').length,
      attendanceRate: 0,
    };
    summary.attendanceRate = summary.total
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0;
    return summary;
  }

  // ─── Drill Templates ──────────────────────────────────────────────────────

  static async createDrill(
    input: CreateDrillTemplateInput,
    schoolId: string,
  ): Promise<IDrillTemplate> {
    return DrillTemplate.create({ ...input, schoolId });
  }

  static async listDrills(
    schoolId: string,
    sport?: string,
  ): Promise<IDrillTemplate[]> {
    const query: Record<string, unknown> = { schoolId, isDeleted: false };
    if (sport) query.sport = sport;
    return DrillTemplate.find(query).sort({ createdAt: -1 }).lean();
  }

  static async updateDrill(
    id: string,
    schoolId: string,
    input: UpdateDrillTemplateInput,
  ): Promise<IDrillTemplate> {
    const drill = await DrillTemplate.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: input },
      { new: true },
    );
    if (!drill) throw new NotFoundError('Drill template not found');
    return drill;
  }

  static async deleteDrill(id: string, schoolId: string): Promise<void> {
    const result = await DrillTemplate.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Drill template not found');
  }
}
