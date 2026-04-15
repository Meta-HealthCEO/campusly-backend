import { SubstituteTeacher, ISubstituteTeacher } from './model.js';
import { TimetableConfig, IPeriodsPerDay } from '../TimetableBuilder/model.js';
import { User } from '../Auth/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { SubstituteConflictService } from './service-substitute-conflicts.js';
import { NotificationService } from '../Notification/service.js';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
type ConfigDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

function getPeriodsForFullDay(config: { periodsPerDay?: IPeriodsPerDay } | null, date: Date): number[] {
  const dayName = DAY_NAMES[date.getDay()];
  if (dayName === 'saturday' || dayName === 'sunday') return [];
  const key = dayName as ConfigDayKey;
  const max = config?.periodsPerDay?.[key] ?? 7;
  const periods: number[] = [];
  for (let i = 1; i <= max; i++) periods.push(i);
  return periods;
}

interface SubstituteCreatePayload {
  originalTeacherId: string;
  substituteTeacherId: string;
  schoolId: string;
  date: string;
  periods: number[];
  reason?: string;
  reasonCategory: 'sick' | 'training' | 'personal' | 'family' | 'emergency' | 'other';
  classIds: string[];
  isFullDay: boolean;
  leaveRequestId?: string;
}

export class SubstituteService {
  static async createSubstitute(data: SubstituteCreatePayload): Promise<ISubstituteTeacher> {
    const [original, substitute] = await Promise.all([
      User.findOne({ _id: data.originalTeacherId, schoolId: data.schoolId }),
      User.findOne({ _id: data.substituteTeacherId, schoolId: data.schoolId }),
    ]);
    if (!original) throw new BadRequestError('Original teacher does not belong to this school');
    if (!substitute) throw new BadRequestError('Substitute teacher does not belong to this school');

    const date = new Date(data.date);

    // Resolve periods if isFullDay
    let periods = data.periods;
    if (data.isFullDay && periods.length === 0) {
      const config = await TimetableConfig.findOne({ schoolId: data.schoolId, isDeleted: false }).lean();
      periods = getPeriodsForFullDay(config, date);
      if (periods.length === 0) {
        throw new BadRequestError('Cannot create a full-day substitution on a non-school day');
      }
    }

    // Conflict detection
    const conflicts = await SubstituteConflictService.detectConflicts(
      data.schoolId,
      data.substituteTeacherId,
      date,
      periods,
    );

    if (conflicts.teacherConflicts.length > 0 || conflicts.timetableConflicts.length > 0) {
      const teacherMsgs = conflicts.teacherConflicts.map((c) => c.detail);
      const ttMsgs = conflicts.timetableConflicts.map(
        (c) => `Already teaching ${c.subjectName ?? 'class'}${c.className ? ` (${c.className})` : ''} period ${c.period} on ${c.day}`,
      );
      throw new BadRequestError(
        `Substitute conflict: ${[...teacherMsgs, ...ttMsgs].join('; ')}`,
      );
    }

    const sub = new SubstituteTeacher({
      originalTeacherId: data.originalTeacherId,
      substituteTeacherId: data.substituteTeacherId,
      schoolId: data.schoolId,
      date,
      periods,
      reason: data.reason,
      reasonCategory: data.reasonCategory,
      classIds: data.classIds,
      isFullDay: data.isFullDay,
      leaveRequestId: data.leaveRequestId,
      status: 'pending',
    });
    return sub.save();
  }

  static async listSubstitutes(
    schoolId: string,
    filters: { date?: string; originalTeacherId?: string; status?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.date) filter.date = new Date(filters.date);
    if (filters.originalTeacherId) filter.originalTeacherId = filters.originalTeacherId;
    if (filters.status) filter.status = filters.status;

    const [data, total] = await Promise.all([
      SubstituteTeacher.find(filter)
        .populate('originalTeacherId', 'firstName lastName email')
        .populate('substituteTeacherId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .populate('classIds', 'name')
        .sort('-date')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      SubstituteTeacher.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getSubstituteById(id: string, schoolId: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('classIds', 'name')
      .lean();
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }

  static async updateSubstitute(id: string, schoolId: string, data: Partial<ISubstituteTeacher>): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email');
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }

  static async deleteSubstitute(id: string, schoolId: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }

  static async approveSubstitute(id: string, schoolId: string, approverId: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false, status: 'pending' },
      { $set: { status: 'approved', approvedAt: new Date(), approvedBy: approverId } },
      { new: true },
    )
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email');
    if (!sub) throw new NotFoundError('Substitute not found or not pending');

    try {
      const originalTeacher = sub.originalTeacherId as unknown as { firstName: string; lastName: string };
      const subTeacherField = sub.substituteTeacherId as unknown as { _id?: unknown } | string;
      const recipientId =
        typeof subTeacherField === 'object' && subTeacherField !== null && '_id' in subTeacherField
          ? String(subTeacherField._id)
          : String(subTeacherField);
      const dateStr = new Date(sub.date).toDateString();
      await NotificationService.create({
        recipientId,
        schoolId,
        type: 'in_app',
        title: 'Substitute Assignment Confirmed',
        message: `You've been assigned to cover ${originalTeacher.firstName} ${originalTeacher.lastName}'s classes on ${dateStr}`,
        data: { entityId: String(sub._id), entityType: 'substitute', url: '/teacher/substitutes' },
      });
    } catch (err: unknown) {
      console.error('Failed to send substitute notification', err);
    }

    return sub;
  }

  static async declineSubstitute(id: string, schoolId: string, reason: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false, status: 'pending' },
      { $set: { status: 'declined', declinedAt: new Date(), declineReason: reason } },
      { new: true },
    )
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email');
    if (!sub) throw new NotFoundError('Substitute not found or not pending');
    return sub;
  }

  static async listTeacherHistory(teacherId: string, schoolId: string) {
    const filter = {
      schoolId,
      isDeleted: false,
      $or: [{ originalTeacherId: teacherId }, { substituteTeacherId: teacherId }],
    };

    const records = await SubstituteTeacher.find(filter)
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('classIds', 'name')
      .sort('-date')
      .lean();

    const asOriginal = records.filter((r) => {
      const id = (r.originalTeacherId as unknown as { _id?: unknown })?._id ?? r.originalTeacherId;
      return String(id) === String(teacherId);
    });
    const asSubstitute = records.filter((r) => {
      const id = (r.substituteTeacherId as unknown as { _id?: unknown })?._id ?? r.substituteTeacherId;
      return String(id) === String(teacherId);
    });

    const counts = {
      totalAsOriginal: asOriginal.length,
      totalAsSubstitute: asSubstitute.length,
      approved: records.filter((r) => r.status === 'approved').length,
      pending: records.filter((r) => r.status === 'pending').length,
      declined: records.filter((r) => r.status === 'declined').length,
    };

    return { asOriginal, asSubstitute, counts };
  }

  static async suggestAvailableTeachers(
    schoolId: string,
    date: Date,
    periods: number[],
    originalTeacherId: string,
  ) {
    return SubstituteConflictService.findAvailableTeachers(schoolId, date, periods, [originalTeacherId]);
  }
}
