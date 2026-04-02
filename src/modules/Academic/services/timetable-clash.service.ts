import { Timetable } from '../model.js';
import { BadRequestError } from '../../../common/errors.js';
import type { PopulatedUser } from '../../../types/populated.js';
import { getPopulated } from '../../../types/populated.js';

interface PopulatedClass {
  _id: string;
  name: string;
  gradeId?: string;
}

interface PopulatedSubject {
  _id: string;
  name: string;
  code: string;
}

interface ConflictingEntry {
  className: string;
  subject: string;
  classId: string;
}

export interface TimetableClash {
  type: 'teacher' | 'class';
  teacherName?: string;
  teacherId?: string;
  className?: string;
  classId?: string;
  day: string;
  period: number;
  conflictingEntries: ConflictingEntry[];
}

export class TimetableClashService {
  /**
   * Detect all timetable clashes for a school:
   * 1. Teacher double-booked (same teacher, same day+period, different classes)
   * 2. Class double-booked (same class, same day+period, different subjects)
   */
  static async detectClashes(schoolId: string): Promise<TimetableClash[]> {
    const entries = await Timetable.find({ schoolId, isDeleted: false })
      .populate('classId', 'name gradeId')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .lean();

    const clashes: TimetableClash[] = [];

    // Group by teacher + day + period
    const teacherMap = new Map<string, typeof entries>();
    for (const entry of entries) {
      const key = `${String(entry.teacherId?._id ?? entry.teacherId)}-${entry.day}-${entry.period}`;
      const group = teacherMap.get(key) ?? [];
      group.push(entry);
      teacherMap.set(key, group);
    }

    for (const [, group] of teacherMap) {
      if (group.length < 2) continue;
      const first = group[0];
      const teacher = getPopulated<PopulatedUser | undefined>(first.teacherId);
      const teacherName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : 'Unknown Teacher';

      clashes.push({
        type: 'teacher',
        teacherName,
        teacherId: String(first.teacherId?._id ?? first.teacherId),
        day: first.day,
        period: first.period,
        conflictingEntries: group.map((e) => {
          const cls = getPopulated<PopulatedClass | undefined>(e.classId);
          const sub = getPopulated<PopulatedSubject | undefined>(e.subjectId);
          return {
            className: cls?.name ?? 'Unknown Class',
            subject: sub?.name ?? 'Unknown Subject',
            classId: String(e.classId?._id ?? e.classId),
          };
        }),
      });
    }

    // Group by class + day + period
    const classMap = new Map<string, typeof entries>();
    for (const entry of entries) {
      const key = `${String(entry.classId?._id ?? entry.classId)}-${entry.day}-${entry.period}`;
      const group = classMap.get(key) ?? [];
      group.push(entry);
      classMap.set(key, group);
    }

    for (const [, group] of classMap) {
      if (group.length < 2) continue;
      const first = group[0];
      const cls = getPopulated<PopulatedClass | undefined>(first.classId);

      clashes.push({
        type: 'class',
        className: cls?.name ?? 'Unknown Class',
        classId: String(first.classId?._id ?? first.classId),
        day: first.day,
        period: first.period,
        conflictingEntries: group.map((e) => {
          const sub = getPopulated<PopulatedSubject | undefined>(e.subjectId);
          const teacher = getPopulated<PopulatedUser | undefined>(e.teacherId);
          return {
            className: cls?.name ?? 'Unknown Class',
            subject: sub?.name ?? 'Unknown Subject',
            classId: String(e.classId?._id ?? e.classId),
          };
        }),
      });
    }

    return clashes;
  }

  /**
   * Validate that a new/updated timetable entry does not clash.
   * Throws BadRequestError if a clash is found.
   */
  static async validateNoClash(
    schoolId: string,
    teacherId: string,
    classId: string,
    day: string,
    period: number,
    excludeId?: string,
  ): Promise<void> {
    const baseFilter: Record<string, unknown> = {
      schoolId,
      day,
      period,
      isDeleted: false,
    };

    if (excludeId) {
      baseFilter._id = { $ne: excludeId };
    }

    // Check teacher clash
    const teacherClash = await Timetable.findOne({
      ...baseFilter,
      teacherId,
    })
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .lean();

    if (teacherClash) {
      const cls = getPopulated<PopulatedClass | undefined>(teacherClash.classId);
      const sub = getPopulated<PopulatedSubject | undefined>(teacherClash.subjectId);
      throw new BadRequestError(
        `Teacher is already assigned to ${cls?.name ?? 'another class'} for ${sub?.name ?? 'a subject'} on ${day} period ${period}`,
      );
    }

    // Check class clash
    const classClash = await Timetable.findOne({
      ...baseFilter,
      classId,
    })
      .populate('subjectId', 'name')
      .lean();

    if (classClash) {
      const sub = getPopulated<PopulatedSubject | undefined>(classClash.subjectId);
      throw new BadRequestError(
        `This class already has ${sub?.name ?? 'a subject'} scheduled on ${day} period ${period}`,
      );
    }
  }
}
