import { SubstituteTeacher } from './model.js';
import { Timetable } from '../Academic/model.js';
import { LeaveRequest } from '../Leave/model.js';
import { User } from '../Auth/model.js';

export interface ConflictDetails {
  teacherConflicts: Array<{ type: 'already-assigned-as-sub' | 'is-on-leave'; detail: string }>;
  timetableConflicts: Array<{ day: string; period: number; className?: string; subjectName?: string }>;
}

export interface AvailableTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferred: boolean;
  reason?: string;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getPopulatedName(field: unknown): string | undefined {
  if (field && typeof field === 'object' && 'name' in field) {
    return String((field as { name: string }).name);
  }
  return undefined;
}

export class SubstituteConflictService {
  /** Detect conflicts for a proposed substitute assignment. */
  static async detectConflicts(
    schoolId: string,
    substituteTeacherId: string,
    date: Date,
    periods: number[],
    excludeId?: string,
  ): Promise<ConflictDetails> {
    const dayOfWeek = DAY_NAMES[date.getDay()];

    // 1. Already assigned as a substitute on the same date+periods
    const existingSubFilter: Record<string, unknown> = {
      schoolId,
      substituteTeacherId,
      date: { $gte: startOfDay(date), $lt: endOfDay(date) },
      status: { $nin: ['declined', 'cancelled'] },
      isDeleted: false,
    };
    if (excludeId) existingSubFilter._id = { $ne: excludeId };
    const existingSubs = await SubstituteTeacher.find(existingSubFilter).lean();

    const teacherConflicts: ConflictDetails['teacherConflicts'] = [];
    for (const sub of existingSubs) {
      const subPeriods = (sub.periods ?? []) as number[];
      const overlap = subPeriods.some((p) => periods.includes(p));
      if (overlap) {
        teacherConflicts.push({
          type: 'already-assigned-as-sub',
          detail: `Already assigned as substitute on ${date.toDateString()} for periods ${subPeriods.join(', ')}`,
        });
      }
    }

    // 2. Approved leave overlapping the date
    const leave = await LeaveRequest.findOne({
      schoolId,
      staffId: substituteTeacherId,
      status: 'approved',
      startDate: { $lte: endOfDay(date) },
      endDate: { $gte: startOfDay(date) },
      isDeleted: false,
    }).lean();
    if (leave) {
      teacherConflicts.push({
        type: 'is-on-leave',
        detail: `On approved ${leave.leaveType ?? ''} leave from ${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()}`,
      });
    }

    // 3. Timetable conflicts — already teaching during these periods
    const timetableSlots = await Timetable.find({
      schoolId,
      teacherId: substituteTeacherId,
      day: dayOfWeek,
      period: { $in: periods },
      isDeleted: false,
    })
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .lean();

    const timetableConflicts: ConflictDetails['timetableConflicts'] = timetableSlots.map((slot) => ({
      day: String(slot.day),
      period: slot.period as number,
      className: getPopulatedName(slot.classId),
      subjectName: getPopulatedName(slot.subjectId),
    }));

    return { teacherConflicts, timetableConflicts };
  }

  /** Find teachers available on a given date+periods. */
  static async findAvailableTeachers(
    schoolId: string,
    date: Date,
    periods: number[],
    excludeTeacherIds: string[] = [],
  ): Promise<AvailableTeacher[]> {
    const teachers = await User.find({
      schoolId,
      role: 'teacher',
      isActive: true,
      isDeleted: false,
      _id: { $nin: excludeTeacherIds },
    })
      .select('firstName lastName email')
      .lean();

    const available: AvailableTeacher[] = [];

    for (const teacher of teachers) {
      const conflicts = await this.detectConflicts(schoolId, String(teacher._id), date, periods);
      if (conflicts.teacherConflicts.length === 0 && conflicts.timetableConflicts.length === 0) {
        available.push({
          id: String(teacher._id),
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          preferred: false,
        });
      }
    }

    return available;
  }
}
