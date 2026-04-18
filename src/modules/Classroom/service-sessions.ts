import mongoose from 'mongoose';
import { VirtualSession, SessionAttendance } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateSessionInput,
  UpdateSessionInput,
  EndSessionInput,
  CreatePollInput,
  RespondToPollInput,
} from './validation.js';

// ─── Sessions ────────────────────────────────────────────────────────────────

export class SessionService {
  static async createSession(schoolId: string, teacherId: string, data: CreateSessionInput) {
    const start = new Date(data.scheduledStart);
    const end = new Date(data.scheduledEnd);
    if (end <= start) {
      throw new BadRequestError('scheduledEnd must be after scheduledStart');
    }

    // TODO: integrate LiveKit API to create a room and get a real roomId
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const session = await VirtualSession.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      title: data.title,
      description: data.description,
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      classId: new mongoose.Types.ObjectId(data.classId),
      gradeId: data.gradeId ? new mongoose.Types.ObjectId(data.gradeId) : undefined,
      teacherId: new mongoose.Types.ObjectId(teacherId),
      scheduledStart: start,
      scheduledEnd: end,
      isRecorded: data.isRecorded ?? true,
      roomId,
      settings: data.settings ?? {},
      recurringRule: data.recurringRule,
      timetablePeriodId: data.timetablePeriodId
        ? new mongoose.Types.ObjectId(data.timetablePeriodId)
        : undefined,
    });
    return session.toObject();
  }

  static async listUpcoming(
    schoolId: string,
    userId: string,
    role: string,
    filters: {
      status?: string;
      classId?: string;
      subjectId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const now = new Date();

    const query: Record<string, unknown> = {
      schoolId: soid,
      isDeleted: false,
      status: { $in: ['scheduled', 'live'] },
      scheduledStart: { $gte: now },
    };

    if (role === 'teacher') {
      query.teacherId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'student' || role === 'parent') {
      if (filters.classId) {
        query.classId = new mongoose.Types.ObjectId(filters.classId);
      }
    }

    if (filters.status) query.status = filters.status;
    if (filters.classId) query.classId = new mongoose.Types.ObjectId(filters.classId);
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [sessions, total] = await Promise.all([
      VirtualSession.find(query)
        .sort({ scheduledStart: 1 })
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name')
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName')
        .lean(),
      VirtualSession.countDocuments(query),
    ]);

    return { sessions, total, page: filters.page ?? 1, limit };
  }

  static async getSession(id: string, schoolId: string) {
    const session = await VirtualSession.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName')
      .lean();
    if (!session) throw new NotFoundError('Session not found');
    return session;
  }

  static async updateSession(id: string, schoolId: string, data: UpdateSessionInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await VirtualSession.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Session not found');
    if (existing.status !== 'scheduled') {
      throw new BadRequestError('Only scheduled sessions can be updated');
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.subjectId !== undefined) update.subjectId = new mongoose.Types.ObjectId(data.subjectId);
    if (data.classId !== undefined) update.classId = new mongoose.Types.ObjectId(data.classId);
    if (data.gradeId !== undefined) update.gradeId = new mongoose.Types.ObjectId(data.gradeId);
    if (data.scheduledStart !== undefined) update.scheduledStart = new Date(data.scheduledStart);
    if (data.scheduledEnd !== undefined) update.scheduledEnd = new Date(data.scheduledEnd);
    if (data.isRecorded !== undefined) update.isRecorded = data.isRecorded;
    if (data.settings !== undefined) {
      for (const [k, v] of Object.entries(data.settings)) {
        update[`settings.${k}`] = v;
      }
    }
    if (data.recurringRule !== undefined) update.recurringRule = data.recurringRule;

    const updated = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundError('Session not found');
    return updated;
  }

  static async cancelSession(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false, status: { $in: ['scheduled', 'live'] } },
      { $set: { status: 'cancelled' } },
      { new: true },
    ).lean();
    if (!session) throw new NotFoundError('Session not found or cannot be cancelled');
    return session;
  }

  static async startSession(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false, status: 'scheduled' },
      { $set: { status: 'live' } },
      { new: true },
    ).lean();
    if (!session) throw new NotFoundError('Session not found or not in scheduled state');
    return session;
  }

  static async endSession(id: string, schoolId: string, data: EndSessionInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const update: Record<string, unknown> = { status: 'ended' };
    if (data.recordingUrl) update.recordingUrl = data.recordingUrl;

    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false, status: 'live' },
      { $set: update },
      { new: true },
    ).lean();
    if (!session) throw new NotFoundError('Session not found or not live');
    return session;
  }

  static async generateJoinToken(id: string, schoolId: string, userId: string) {
    const session = await VirtualSession.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      status: { $in: ['scheduled', 'live'] },
    })
      .populate('teacherId', 'firstName lastName')
      .lean();
    if (!session) throw new NotFoundError('Session not found or not joinable');

    const isTeacher = session.teacherId && typeof session.teacherId === 'object'
      ? String((session.teacherId as { _id: unknown })._id) === userId
      : String(session.teacherId) === userId;

    const roomName = `session_${String(session._id)}`;

    let participantName: string;
    if (isTeacher && session.teacherId && typeof session.teacherId === 'object') {
      const teacher = session.teacherId as { firstName?: string; lastName?: string };
      participantName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || 'Teacher';
    } else {
      participantName = `Student ${userId.slice(-4)}`;
    }

    const { isLiveKitConfigured, generateRoomToken, getLiveKitUrl } = await import(
      '../../services/livekit.service.js'
    );

    if (!isLiveKitConfigured()) {
      return {
        token: '',
        livekitUrl: '',
        roomName,
        sessionId: session._id,
        participantName,
        isTeacher,
        livekitConfigured: false,
      };
    }

    const token = await generateRoomToken(roomName, userId, participantName, isTeacher);
    return {
      token,
      livekitUrl: getLiveKitUrl(),
      roomName,
      sessionId: session._id,
      participantName,
      isTeacher,
      livekitConfigured: true,
    };
  }

  static async getAttendance(sessionId: string, schoolId: string) {
    return SessionAttendance.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('studentId', 'firstName lastName')
      .sort({ joinedAt: 1 })
      .lean();
  }

  static async recordJoin(sessionId: string, schoolId: string, studentId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const sessOid = new mongoose.Types.ObjectId(sessionId);
    const studOid = new mongoose.Types.ObjectId(studentId);

    const existing = await SessionAttendance.findOne({
      sessionId: sessOid,
      studentId: studOid,
      isDeleted: false,
    }).lean();

    if (existing) {
      await SessionAttendance.findOneAndUpdate(
        { sessionId: sessOid, studentId: studOid },
        { $inc: { rejoinCount: 1 } },
      );
    } else {
      await SessionAttendance.create({
        sessionId: sessOid,
        schoolId: soid,
        studentId: studOid,
        joinedAt: new Date(),
      });
    }
  }

  static async createPoll(sessionId: string, schoolId: string, data: CreatePollInput) {
    const session = await VirtualSession.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sessionId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
        status: 'live',
      },
      {
        $push: {
          polls: { question: data.question, options: data.options, responses: [] },
        },
      },
      { new: true },
    ).lean();
    if (!session) throw new NotFoundError('Session not found or not live');
    return session.polls[session.polls.length - 1];
  }

  static async respondToPoll(
    sessionId: string,
    pollId: string,
    schoolId: string,
    userId: string,
    data: RespondToPollInput,
  ) {
    const session = await VirtualSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!session) throw new NotFoundError('Session not found');

    const poll = session.polls.find((p) => p._id.toString() === pollId);
    if (!poll) throw new NotFoundError('Poll not found');
    if (data.answer < 0 || data.answer >= poll.options.length) {
      throw new BadRequestError('Invalid answer index');
    }

    const alreadyAnswered = poll.responses.some((r) => r.userId.toString() === userId);
    if (alreadyAnswered) throw new BadRequestError('Already responded to this poll');

    await VirtualSession.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sessionId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        'polls._id': new mongoose.Types.ObjectId(pollId),
      },
      {
        $push: {
          'polls.$.responses': {
            userId: new mongoose.Types.ObjectId(userId),
            answer: data.answer,
            answeredAt: new Date(),
          },
        },
      },
    );

    return { success: true };
  }
}
