import type { Request, Response } from 'express';
import { Student } from './model.js';
import { generateCSV, setCsvHeaders, type CSVColumn } from '../../common/csv-export.js';

interface PopulatedStudent {
  admissionNumber: string;
  enrollmentStatus: string;
  userId?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  gradeId?: { name?: string };
  classId?: { name?: string };
  guardianIds?: Array<{
    userId?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  }>;
}

export class StudentExportController {
  static async exportStudents(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;

    const students = (await Student.find({ schoolId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone')
      .populate('gradeId', 'name')
      .populate('classId', 'name')
      .populate({
        path: 'guardianIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .sort({ admissionNumber: 1 })
      .lean()) as unknown as PopulatedStudent[];

    const columns: CSVColumn<PopulatedStudent>[] = [
      { header: 'Admission Number', accessor: (r) => r.admissionNumber },
      { header: 'First Name', accessor: (r) => r.userId?.firstName ?? '' },
      { header: 'Last Name', accessor: (r) => r.userId?.lastName ?? '' },
      { header: 'Grade', accessor: (r) => {
        const g = r.gradeId;
        return (g && typeof g === 'object' && 'name' in g) ? (g as { name: string }).name : '';
      }},
      { header: 'Class', accessor: (r) => {
        const c = r.classId;
        return (c && typeof c === 'object' && 'name' in c) ? (c as { name: string }).name : '';
      }},
      { header: 'Status', accessor: (r) => r.enrollmentStatus },
      { header: 'Parent Email', accessor: (r) => {
        const guardian = r.guardianIds?.[0];
        return guardian?.userId?.email ?? '';
      }},
      { header: 'Parent Phone', accessor: (r) => {
        const guardian = r.guardianIds?.[0];
        return guardian?.userId?.phone ?? '';
      }},
    ];

    const csv = generateCSV(students, columns);
    setCsvHeaders(res, 'students.csv');
    res.send(csv);
  }
}
