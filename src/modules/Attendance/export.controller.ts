import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Attendance } from './model.js';
import { generateCSV, setCsvHeaders, type CSVColumn } from '../../common/csv-export.js';
import { renderRegisterPdf, renderHistoryGridPdf, type RegisterRow, type HistoryCell } from './pdf-export.js';
import { School } from '../School/model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';

interface PopulatedAttendance {
  date: Date;
  period: number;
  status: string;
  notes?: string;
  studentId?: {
    admissionNumber?: string;
    userId?: { firstName?: string; lastName?: string };
    gradeId?: { name?: string };
    classId?: { name?: string };
  };
}

function formatDate(d: Date): string {
  const dt = new Date(d);
  return dt.toISOString().split('T')[0] ?? '';
}

function studentNameOf(r: PopulatedAttendance): string {
  const u = r.studentId?.userId;
  return u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
}

export class AttendanceExportController {
  static async exportAttendance(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { dateFrom, dateTo, classId, format, period } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ success: false, error: 'dateFrom and dateTo are required' });
      return;
    }

    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      date: { $gte: new Date(dateFrom as string), $lte: new Date(dateTo as string) },
      isDeleted: false,
    };

    if (classId) filter.classId = new mongoose.Types.ObjectId(classId as string);
    if (typeof period === 'string' && period) {
      const p = Number(period);
      if (Number.isFinite(p)) filter.period = p;
    }

    const records = (await Attendance.find(filter)
      .populate({
        path: 'studentId',
        select: 'admissionNumber userId gradeId classId',
        populate: [
          { path: 'userId', select: 'firstName lastName' },
          { path: 'gradeId', select: 'name' },
          { path: 'classId', select: 'name' },
        ],
      })
      .sort({ date: 1, period: 1 })
      .lean()) as unknown as PopulatedAttendance[];

    if (format === 'pdf') {
      const buffer = await this.buildPdf({
        schoolId,
        classId: typeof classId === 'string' ? classId : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        period: typeof period === 'string' ? Number(period) : 1,
        records,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-${dateFrom}-to-${dateTo}.pdf"`);
      res.end(buffer);
      return;
    }

    const columns: CSVColumn<PopulatedAttendance>[] = [
      { header: 'Date', accessor: (r) => formatDate(r.date) },
      { header: 'Student Name', accessor: studentNameOf },
      { header: 'Admission No', accessor: (r) => r.studentId?.admissionNumber ?? '' },
      { header: 'Grade', accessor: (r) => {
        const g = r.studentId?.gradeId;
        return (g && typeof g === 'object' && 'name' in g) ? (g as { name: string }).name : '';
      }},
      { header: 'Class', accessor: (r) => {
        const c = r.studentId?.classId;
        return (c && typeof c === 'object' && 'name' in c) ? (c as { name: string }).name : '';
      }},
      { header: 'Period', accessor: (r) => r.period },
      { header: 'Status', accessor: (r) => r.status },
      { header: 'Notes', accessor: (r) => r.notes ?? '' },
    ];

    const csv = generateCSV(records, columns);
    setCsvHeaders(res, 'attendance.csv');
    res.send(csv);
  }

  private static async buildPdf(args: {
    schoolId: string;
    classId?: string;
    dateFrom: string;
    dateTo: string;
    period: number;
    records: PopulatedAttendance[];
  }): Promise<Buffer> {
    const school = await School.findById(args.schoolId).select('name').lean();
    const schoolName = school?.name ?? 'School';

    let classLabel = 'All classes';
    if (args.classId) {
      const cls = await Class.findById(args.classId).select('name gradeId').populate('gradeId', 'name').lean();
      if (cls) {
        const grade = cls.gradeId as unknown as { name?: string } | undefined;
        classLabel = `${grade?.name ?? ''} ${cls.name}`.trim() || cls.name;
      }
    }

    // Fetch full roster if a specific class was requested. Without it we keep
    // the existing record-driven behavior (used when classId is unset and the
    // export covers multiple classes).
    let roster: Array<{ admissionNumber: string; studentName: string; studentId: string }> = [];
    if (args.classId) {
      const students = await Student.find({
        classId: new mongoose.Types.ObjectId(args.classId),
        schoolId: new mongoose.Types.ObjectId(args.schoolId),
        isDeleted: false,
      })
        .select('admissionNumber userId')
        .populate({ path: 'userId', select: 'firstName lastName' })
        .lean();
      roster = students
        .map((s) => {
          const u = (s as { userId?: { firstName?: string; lastName?: string } }).userId;
          return {
            studentId: String((s as { _id: unknown })._id),
            admissionNumber: (s as { admissionNumber?: string }).admissionNumber ?? '',
            studentName: u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '',
          };
        })
        .sort((a, b) => a.studentName.localeCompare(b.studentName));
    }

    // Single-day register iff dateFrom === dateTo
    if (args.dateFrom === args.dateTo) {
      // Build a quick lookup by studentId (admission number is unreliable for the join).
      const byStudent = new Map<string, PopulatedAttendance>();
      for (const r of args.records) {
        const sid = (r.studentId as unknown as { _id?: unknown })?._id ?? r.studentId;
        if (sid) byStudent.set(String(sid), r);
      }
      const rows: RegisterRow[] = roster.length > 0
        ? roster.map((s) => {
            const r = byStudent.get(s.studentId);
            return {
              admissionNumber: s.admissionNumber,
              studentName: s.studentName,
              status: r?.status ?? '',                // empty when not marked yet
              notes: r?.notes ?? '',
            };
          })
        : args.records.map((r) => ({
            admissionNumber: r.studentId?.admissionNumber ?? '',
            studentName: studentNameOf(r),
            status: r.status,
            notes: r.notes ?? '',
          }));
      return renderRegisterPdf({
        schoolName,
        classLabel,
        date: args.dateFrom,
        period: args.period,
        rows,
      });
    }

    // History grid
    const dates: string[] = [];
    {
      const start = new Date(args.dateFrom);
      const end = new Date(args.dateTo);
      const cursor = new Date(start);
      while (cursor <= end) {
        dates.push(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Pivot records: { studentId -> { date -> status } }
    const studentMap = new Map<string, { admissionNumber: string; studentName: string }>();
    const cellMap = new Map<string, Map<string, HistoryCell>>();
    for (const r of args.records) {
      const sid = r.studentId?.admissionNumber ?? studentNameOf(r);
      if (!sid) continue;
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          admissionNumber: r.studentId?.admissionNumber ?? '',
          studentName: studentNameOf(r),
        });
      }
      const ds = formatDate(r.date);
      if (!cellMap.has(sid)) cellMap.set(sid, new Map());
      cellMap.get(sid)!.set(ds, {
        status: r.status as 'present' | 'absent' | 'late' | 'excused',
      });
    }
    const studentRows = roster.length > 0
      ? roster
      : Array.from(studentMap.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
    const cells: HistoryCell[][] = studentRows.map((row) => {
      const byDate = cellMap.get(row.admissionNumber || row.studentName) ?? new Map();
      return dates.map((d) => byDate.get(d) ?? { status: null });
    });

    return renderHistoryGridPdf({
      schoolName,
      classLabel,
      period: args.period,
      dates,
      rows: studentRows,
      cells,
    });
  }
}
