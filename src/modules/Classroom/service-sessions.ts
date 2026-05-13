import mongoose from 'mongoose';
import { User } from '../Auth/model.js';
import { Parent } from '../Parent/model.js';
import { Student } from '../Student/model.js';
import { AcademicService } from '../Academic/service.js';
import { VirtualSession, SessionAttendance } from './model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateSessionInput,
  UpdateSessionInput,
  EndSessionInput,
  CreatePollInput,
  RespondToPollInput,
} from './validation.js';

const ADMIN_ROLES = new Set(['super_admin', 'school_admin', 'principal']);
const HOST_ROLES = new Set(['super_admin', 'school_admin', 'principal', 'teacher']);

function asObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function idToString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === 'object') {
    const record = value as { _id?: unknown; id?: unknown };
    if (record._id) return idToString(record._id);
    if (record.id) return String(record.id);
  }
  return String(value);
}

function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

function isHostRole(role: string): boolean {
  return HOST_ROLES.has(role);
}

function assertObjectId(id: string, label: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`${label} is invalid`);
  }
}

async function getUserDisplayName(userId: string, fallbackRole: string): Promise<string> {
  const user = await User.findById(userId).select('firstName lastName email').lean();
  if (!user) return fallbackRole.charAt(0).toUpperCase() + fallbackRole.slice(1);
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || fallbackRole.charAt(0).toUpperCase() + fallbackRole.slice(1);
}

export class SessionService {
  static async getVisibleClassIds(
    schoolId: string,
    userId: string,
    role: string,
  ): Promise<string[] | null> {
    if (isAdminRole(role)) return null;

    const schoolObjectId = asObjectId(schoolId);
    const userObjectId = asObjectId(userId);

    if (role === 'teacher') {
      const load = await AcademicService.getTeacherTeachingLoad(userId, schoolId);
      const classIds = new Set<string>();
      if (load.homeroom?.class) classIds.add(idToString(load.homeroom.class));
      for (const entry of load.subjectClasses ?? []) {
        classIds.add(idToString(entry.class));
      }
      return [...classIds].filter(Boolean);
    }

    if (role === 'student') {
      const student = await Student.findOne({
        userId: userObjectId,
        schoolId: schoolObjectId,
        enrollmentStatus: 'active',
        isDeleted: false,
      })
        .select('classId')
        .lean();
      const classId = idToString(student?.classId);
      return classId ? [classId] : [];
    }

    if (role === 'parent') {
      const parent = await Parent.findOne({
        userId: userObjectId,
        schoolId: schoolObjectId,
        isDeleted: false,
      })
        .select('childrenIds')
        .lean();

      if (!parent?.childrenIds?.length) return [];

      const students = await Student.find({
        _id: { $in: parent.childrenIds },
        schoolId: schoolObjectId,
        enrollmentStatus: 'active',
        isDeleted: false,
      })
        .select('classId')
        .lean();

      return [...new Set(students.map((student) => idToString(student.classId)).filter(Boolean))];
    }

    return [];
  }

  static async assertCanAccessClass(
    schoolId: string,
    userId: string,
    role: string,
    classId: string,
  ): Promise<void> {
    assertObjectId(classId, 'classId');
    if (isAdminRole(role)) return;

    if (role === 'teacher') {
      const canAccess = await AcademicService.teacherCanAccessClass(userId, classId, schoolId);
      if (canAccess) return;
      throw new ForbiddenError('You do not have access to this class');
    }

    const visibleClassIds = await SessionService.getVisibleClassIds(schoolId, userId, role);
    if (visibleClassIds?.includes(classId)) return;
    throw new ForbiddenError('You do not have access to this class');
  }

  static async assertCanAccessSession(
    session: { classId?: unknown; teacherId?: unknown },
    schoolId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    if (isAdminRole(role)) return;

    const classId = idToString(session.classId);
    if (!classId) throw new ForbiddenError('You do not have access to this session');

    if (role === 'teacher') {
      const ownsSession = idToString(session.teacherId) === userId;
      const canAccessClass = await AcademicService.teacherCanAccessClass(userId, classId, schoolId);
      if (ownsSession || canAccessClass) return;
      throw new ForbiddenError('You do not have access to this session');
    }

    const visibleClassIds = await SessionService.getVisibleClassIds(schoolId, userId, role);
    if (visibleClassIds?.includes(classId)) return;
    throw new ForbiddenError('You do not have access to this session');
  }

  static assertCanManageSession(
    session: { teacherId?: unknown },
    userId: string,
    role: string,
  ): void {
    if (isAdminRole(role)) return;
    if (role === 'teacher' && idToString(session.teacherId) === userId) return;
    throw new ForbiddenError('Only the session host can manage this session');
  }

  static async createSession(
    schoolId: string,
    teacherId: string,
    role: string,
    data: CreateSessionInput,
  ) {
    const start = new Date(data.scheduledStart);
    const end = new Date(data.scheduledEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestError('scheduledStart and scheduledEnd must be valid dates');
    }
    if (end <= start) {
      throw new BadRequestError('scheduledEnd must be after scheduledStart');
    }

    await SessionService.assertCanAccessClass(schoolId, teacherId, role, data.classId);

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const session = await VirtualSession.create({
      schoolId: asObjectId(schoolId),
      title: data.title,
      description: data.description,
      subjectId: asObjectId(data.subjectId),
      classId: asObjectId(data.classId),
      gradeId: data.gradeId ? asObjectId(data.gradeId) : undefined,
      teacherId: asObjectId(teacherId),
      scheduledStart: start,
      scheduledEnd: end,
      isRecorded: data.isRecorded ?? true,
      roomId,
      settings: data.settings ?? {},
      recurringRule: data.recurringRule,
      timetablePeriodId: data.timetablePeriodId ? asObjectId(data.timetablePeriodId) : undefined,
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
    const soid = asObjectId(schoolId);
    const now = new Date();

    const query: Record<string, unknown> = {
      schoolId: soid,
      isDeleted: false,
      $or: [{ status: 'live' }, { status: 'scheduled', scheduledStart: { $gte: now } }],
    };

    if (filters.status) {
      delete query.$or;
      query.status = filters.status;
      if (filters.status === 'scheduled') query.scheduledStart = { $gte: now };
    }

    if (role === 'teacher') {
      query.teacherId = asObjectId(userId);
    } else {
      const visibleClassIds = await SessionService.getVisibleClassIds(schoolId, userId, role);
      if (visibleClassIds !== null) {
        query.classId = { $in: visibleClassIds.map((id) => asObjectId(id)) };
      }
    }

    if (filters.classId) {
      await SessionService.assertCanAccessClass(schoolId, userId, role, filters.classId);
      query.classId = asObjectId(filters.classId);
    }
    if (filters.subjectId) query.subjectId = asObjectId(filters.subjectId);

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [sessions, total] = await Promise.all([
      VirtualSession.find(query)
        .sort({ status: -1, scheduledStart: 1 })
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName')
        .lean(),
      VirtualSession.countDocuments(query),
    ]);

    return { sessions, total, page: filters.page ?? 1, limit };
  }

  static async getSession(id: string, schoolId: string, userId?: string, role?: string) {
    assertObjectId(id, 'sessionId');
    const session = await VirtualSession.findOne({
      _id: asObjectId(id),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
    })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName')
      .lean();
    if (!session) throw new NotFoundError('Session not found');
    if (userId && role) {
      await SessionService.assertCanAccessSession(session, schoolId, userId, role);
    }
    return session;
  }

  static async updateSession(
    id: string,
    schoolId: string,
    userId: string,
    role: string,
    data: UpdateSessionInput,
  ) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);

    const existing = await VirtualSession.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Session not found');
    SessionService.assertCanManageSession(existing, userId, role);
    if (existing.status !== 'scheduled') {
      throw new BadRequestError('Only scheduled sessions can be updated');
    }

    if (data.classId) {
      await SessionService.assertCanAccessClass(schoolId, userId, role, data.classId);
    }

    const nextStart = data.scheduledStart ? new Date(data.scheduledStart) : existing.scheduledStart;
    const nextEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : existing.scheduledEnd;
    if (nextEnd <= nextStart) {
      throw new BadRequestError('scheduledEnd must be after scheduledStart');
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.subjectId !== undefined) update.subjectId = asObjectId(data.subjectId);
    if (data.classId !== undefined) update.classId = asObjectId(data.classId);
    if (data.gradeId !== undefined) update.gradeId = asObjectId(data.gradeId);
    if (data.scheduledStart !== undefined) update.scheduledStart = nextStart;
    if (data.scheduledEnd !== undefined) update.scheduledEnd = nextEnd;
    if (data.isRecorded !== undefined) update.isRecorded = data.isRecorded;
    if (data.settings !== undefined) {
      for (const [key, value] of Object.entries(data.settings)) {
        update[`settings.${key}`] = value;
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

  static async cancelSession(id: string, schoolId: string, userId: string, role: string) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);
    const existing = await VirtualSession.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Session not found');
    SessionService.assertCanManageSession(existing, userId, role);
    if (!['scheduled', 'live'].includes(existing.status)) {
      throw new BadRequestError('Only scheduled or live sessions can be cancelled');
    }

    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { status: 'cancelled' } },
      { new: true },
    ).lean();
    return session;
  }

  static async startSession(id: string, schoolId: string, userId: string, role: string) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);
    const existing = await VirtualSession.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Session not found');
    SessionService.assertCanManageSession(existing, userId, role);
    if (existing.status !== 'scheduled') {
      throw new BadRequestError('Only scheduled sessions can be started');
    }

    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { status: 'live' } },
      { new: true },
    ).lean();
    return session;
  }

  static async endSession(id: string, schoolId: string, userId: string, role: string, data: EndSessionInput) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);
    const existing = await VirtualSession.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Session not found');
    SessionService.assertCanManageSession(existing, userId, role);
    if (existing.status !== 'live') {
      throw new BadRequestError('Only live sessions can be ended');
    }

    const update: Record<string, unknown> = { status: 'ended' };
    if (data.recordingUrl) update.recordingUrl = data.recordingUrl;

    const session = await VirtualSession.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    return session;
  }

  static async generateJoinToken(id: string, schoolId: string, userId: string, role: string) {
    const session = await VirtualSession.findOne({
      _id: asObjectId(id),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
      status: { $in: ['scheduled', 'live'] },
    })
      .populate('teacherId', 'firstName lastName')
      .lean();
    if (!session) throw new NotFoundError('Session not found or not joinable');

    await SessionService.assertCanAccessSession(session, schoolId, userId, role);

    const isHost =
      isAdminRole(role) || (role === 'teacher' && idToString(session.teacherId) === userId);
    if (!isHost && session.status !== 'live') {
      throw new BadRequestError('Session is not live yet');
    }

    const roomName = `session_${String(session._id)}`;
    const participantName = await getUserDisplayName(userId, role);

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
        isTeacher: isHost,
        livekitConfigured: false,
      };
    }

    const token = await generateRoomToken(roomName, userId, participantName, isHost);
    return {
      token,
      livekitUrl: getLiveKitUrl(),
      roomName,
      sessionId: session._id,
      participantName,
      isTeacher: isHost,
      livekitConfigured: true,
    };
  }

  static async getAttendance(sessionId: string, schoolId: string, userId: string, role: string) {
    const session = await VirtualSession.findOne({
      _id: asObjectId(sessionId),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!session) throw new NotFoundError('Session not found');
    SessionService.assertCanManageSession(session, userId, role);

    return SessionAttendance.find({
      sessionId: asObjectId(sessionId),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
    })
      .populate('studentId', 'firstName lastName')
      .sort({ joinedAt: 1 })
      .lean();
  }

  static async recordJoin(sessionId: string, schoolId: string, studentId: string) {
    const soid = asObjectId(schoolId);
    const sessOid = asObjectId(sessionId);
    const studOid = asObjectId(studentId);

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

  static async createPoll(
    sessionId: string,
    schoolId: string,
    userId: string,
    role: string,
    data: CreatePollInput,
  ) {
    const question = data.question.trim();
    const options = data.options.map((option) => option.trim()).filter(Boolean);
    if (!question || options.length < 2) {
      throw new BadRequestError('Polls require a question and at least two options');
    }

    const session = await VirtualSession.findOne({
      _id: asObjectId(sessionId),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
      status: 'live',
    }).lean();
    if (!session) throw new NotFoundError('Session not found or not live');
    SessionService.assertCanManageSession(session, userId, role);

    const updated = await VirtualSession.findOneAndUpdate(
      { _id: asObjectId(sessionId), schoolId: asObjectId(schoolId), isDeleted: false },
      { $push: { polls: { question, options, responses: [] } } },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundError('Session not found or not live');
    return updated.polls[updated.polls.length - 1];
  }

  static async respondToPoll(
    sessionId: string,
    pollId: string,
    schoolId: string,
    userId: string,
    role: string,
    data: RespondToPollInput,
  ) {
    const session = await VirtualSession.findOne({
      _id: asObjectId(sessionId),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
      status: 'live',
    }).lean();
    if (!session) throw new NotFoundError('Session not found or not live');
    await SessionService.assertCanAccessSession(session, schoolId, userId, role);

    const poll = session.polls.find((p) => p._id.toString() === pollId);
    if (!poll) throw new NotFoundError('Poll not found');
    if (data.answer < 0 || data.answer >= poll.options.length) {
      throw new BadRequestError('Invalid answer index');
    }

    const alreadyAnswered = poll.responses.some((response) => response.userId.toString() === userId);
    if (alreadyAnswered) throw new BadRequestError('Already responded to this poll');

    await VirtualSession.findOneAndUpdate(
      {
        _id: asObjectId(sessionId),
        schoolId: asObjectId(schoolId),
        'polls._id': asObjectId(pollId),
      },
      {
        $push: {
          'polls.$.responses': {
            userId: asObjectId(userId),
            answer: data.answer,
            answeredAt: new Date(),
          },
        },
      },
    );

    return { success: true };
  }
}
