import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Attendance } from './model.js';
import { generateCSV, setCsvHeaders, type CSVColumn } from '../../common/csv-export.js';

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

export class AttendanceExportController {
  static async exportAttendance(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { dateFrom, dateTo, classId } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ success: false, error: 'dateFrom and dateTo are required' });
      return;
    }

    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      date: { $gte: new Date(dateFrom as string), $lte: new Date(dateTo as string) },
      isDeleted: false,
    };

    if (classId) {
      filter.classId = new mongoose.Types.ObjectId(classId as string);
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

    const columns: CSVColumn<PopulatedAttendance>[] = [
      { header: 'Date', accessor: (r) => formatDate(r.date) },
      { header: 'Student Name', accessor: (r) => {
        const u = r.studentId?.userId;
        return u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
      }},
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
}
