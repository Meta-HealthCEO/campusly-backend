import mongoose from 'mongoose';
import { CounselorSession } from './model.js';
import { AuditLog } from '../Audit/model.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateSessionInput, UpdateSessionInput } from './validation.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';

// Extended user type — includes JWT permission flags set by authenticate middleware
interface PastoralUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}

export class SessionService {
  static async createSession(user: PastoralUser, data: CreateSessionInput) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const counselorOid = new mongoose.Types.ObjectId(user.id);

    const session = await CounselorSession.create({
      studentId: new mongoose.Types.ObjectId(data.studentId),
      counselorId: counselorOid,
      schoolId: schoolOid,
      referralId: data.referralId ? new mongoose.Types.ObjectId(data.referralId) : undefined,
      sessionDate: new Date(data.sessionDate),
      sessionType: data.sessionType,
      duration: data.duration,
      summary: data.summary,
      followUpActions: data.followUpActions ?? '',
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      confidentialityLevel: data.confidentialityLevel,
      parentNotified: data.parentNotified ?? false,
    });

    // Audit log for sensitive record creation
    await AuditLog.create({
      schoolId: schoolOid,
      userId: counselorOid,
      action: 'create',
      entity: 'CounselorSession',
      entityId: String(session._id),
      details: {
        studentId: data.studentId,
        sessionType: data.sessionType,
        confidentialityLevel: data.confidentialityLevel,
      },
    }).catch(() => {
      // Audit log failure should not block session creation
    });

    return session.toObject();
  }

  static async listSessions(
    user: PastoralUser,
    filters: {
      studentId?: string;
      referralId?: string;
      sessionType?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const query: Record<string, unknown> = { schoolId: schoolOid, isDeleted: false };

    const isCounselor = user.role === 'teacher' && user.isCounselor;
    const isPrincipal =
      (user.role === 'school_admin' && user.isSchoolPrincipal) ||
      user.role === 'super_admin';

    if (isCounselor) {
      // Counselors see only their own sessions
      query.counselorId = new mongoose.Types.ObjectId(user.id);
    } else if (isPrincipal) {
      // Principal sees all except restricted-level sessions
      query.confidentialityLevel = { $ne: 'restricted' };
    }

    if (filters.studentId) query.studentId = new mongoose.Types.ObjectId(filters.studentId);
    if (filters.referralId) query.referralId = new mongoose.Types.ObjectId(filters.referralId);
    if (filters.sessionType) query.sessionType = filters.sessionType;

    if (filters.from ?? filters.to) {
      const dateRange: Record<string, Date> = {};
      if (filters.from) dateRange.$gte = new Date(filters.from);
      if (filters.to) dateRange.$lte = new Date(filters.to);
      query.sessionDate = dateRange;
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [sessions, total] = await Promise.all([
      CounselorSession.find(query)
        .sort({ sessionDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName grade')
        .populate('counselorId', 'firstName lastName')
        .lean(),
      CounselorSession.countDocuments(query),
    ]);
    return { sessions, total, page: filters.page ?? 1, limit };
  }

  static async updateSession(
    id: string,
    schoolId: string,
    counselorId: string,
    data: UpdateSessionInput,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const counselorOid = new mongoose.Types.ObjectId(counselorId);

    const existing = await CounselorSession.findOne({
      _id: oid,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Session not found');

    // Only the owning counselor can update
    if (!existing.counselorId.equals(counselorOid)) {
      throw new ForbiddenError('Only the owning counselor can update this session');
    }

    const update: Record<string, unknown> = {};
    if (data.sessionDate !== undefined) update.sessionDate = new Date(data.sessionDate);
    if (data.sessionType !== undefined) update.sessionType = data.sessionType;
    if (data.duration !== undefined) update.duration = data.duration;
    if (data.summary !== undefined) update.summary = data.summary;
    if (data.followUpActions !== undefined) update.followUpActions = data.followUpActions;
    if (data.followUpDate !== undefined) update.followUpDate = new Date(data.followUpDate);
    if (data.confidentialityLevel !== undefined) {
      update.confidentialityLevel = data.confidentialityLevel;
    }
    if (data.parentNotified !== undefined) update.parentNotified = data.parentNotified;

    const session = await CounselorSession.findOneAndUpdate(
      { _id: oid, schoolId: schoolOid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('studentId', 'firstName lastName grade')
      .populate('counselorId', 'firstName lastName')
      .lean();
    if (!session) throw new NotFoundError('Session not found');
    return session;
  }
}
