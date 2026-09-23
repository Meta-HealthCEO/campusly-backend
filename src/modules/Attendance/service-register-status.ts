import mongoose from 'mongoose';
import { Attendance } from './model.js';
import { Timetable } from '../Academic/model.js';
import type { DayOfWeek } from '../Academic/model.js';
import { BadRequestError } from '../../common/errors.js';

export interface RegisterStatusItem {
  timetableId: string;
  classId: string;
  className: string;
  subjectName: string;
  period: number;
  startTime: string;
  endTime: string;
  room: string | null;
  recorded: boolean;
  recordedCount: number;
}

const WEEKDAYS: Array<DayOfWeek | null> = [
  null, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', null,
];

interface NamedRef {
  _id: mongoose.Types.ObjectId;
  name?: string;
}

function refId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) return String((value as NamedRef)._id);
  return String(value);
}

function refName(value: unknown): string {
  if (value && typeof value === 'object' && 'name' in value) return (value as NamedRef).name ?? '';
  return '';
}

export class RegisterStatusService {
  /**
   * The teacher's timetable periods for one school day, each flagged with
   * whether its register has been taken (any attendance recorded for that
   * class + period + date). Weekends have no periods.
   */
  static async getForTeacher(
    schoolId: string,
    teacherId: string,
    date: string,
  ): Promise<RegisterStatusItem[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestError('date must be YYYY-MM-DD');
    }
    const day = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(day.getTime())) throw new BadRequestError('Invalid date');

    const weekday = WEEKDAYS[day.getUTCDay()];
    if (!weekday) return [];

    const soid = new mongoose.Types.ObjectId(schoolId);
    const entries = await Timetable.find({
      schoolId: soid,
      teacherId: new mongoose.Types.ObjectId(teacherId),
      day: weekday,
      isDeleted: false,
    })
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .sort({ period: 1 })
      .lean();
    if (entries.length === 0) return [];

    const classIds = [...new Set(entries.map((e) => refId(e.classId)))];
    const counts = await Attendance.aggregate<{ _id: { classId: mongoose.Types.ObjectId; period: number }; count: number }>([
      {
        $match: {
          schoolId: soid,
          classId: { $in: classIds.map((id) => new mongoose.Types.ObjectId(id)) },
          date: day,
          isDeleted: { $ne: true },
        },
      },
      { $group: { _id: { classId: '$classId', period: '$period' }, count: { $sum: 1 } } },
    ]);
    const countByKey = new Map(counts.map((c) => [`${String(c._id.classId)}:${c._id.period}`, c.count]));

    return entries.map((entry) => {
      const classId = refId(entry.classId);
      const recordedCount = countByKey.get(`${classId}:${entry.period}`) ?? 0;
      return {
        timetableId: String(entry._id),
        classId,
        className: refName(entry.classId),
        subjectName: refName(entry.subjectId),
        period: entry.period,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room ?? null,
        recorded: recordedCount > 0,
        recordedCount,
      };
    });
  }
}
