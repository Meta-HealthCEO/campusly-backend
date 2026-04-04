import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';

interface GradeEnrollment {
  grade: string;
  gradeId: string;
  count: number;
  capacity: number;
}

interface YearOverYear {
  year: number;
  total: number;
}

interface EnrollmentSummary {
  totalStudents: number;
  byGrade: GradeEnrollment[];
  newEnrollments: number;
  departures: number;
  netChange: number;
  genderSplit: { male: number; female: number };
  yearOverYear: YearOverYear[];
}

export class SgbEnrollmentService {
  static async getEnrollmentSummary(schoolId: string, year: number): Promise<EnrollmentSummary> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    let totalStudents = 0;
    let byGrade: GradeEnrollment[] = [];
    let male = 0;
    let female = 0;
    let newEnrollments = 0;

    try {
      const StudentModel = mongoose.model('Student');

      // Total active students
      totalStudents = await StudentModel.countDocuments({
        schoolId: schoolOid,
        isDeleted: false,
      });

      // By grade
      const gradeAgg = await StudentModel.aggregate([
        { $match: { schoolId: schoolOid, isDeleted: false } },
        {
          $group: {
            _id: '$gradeId',
            count: { $sum: 1 },
          },
        },
      ]);

      // Try to get grade names
      let gradeNames: Record<string, string> = {};
      try {
        const GradeModel = mongoose.model('Grade');
        const grades = await GradeModel.find({ schoolId: schoolOid, isDeleted: false })
          .select('_id name')
          .lean() as unknown as Array<{ _id: mongoose.Types.ObjectId; name: string }>;
        gradeNames = Object.fromEntries(
          grades.map((g) => [g._id.toString(), g.name]),
        );
      } catch {
        // Grade model may not exist
      }

      byGrade = gradeAgg.map((g: { _id: mongoose.Types.ObjectId; count: number }) => ({
        grade: gradeNames[g._id?.toString()] ?? 'Unknown',
        gradeId: g._id?.toString() ?? '',
        count: g.count,
        capacity: 120, // Default capacity — would come from grade settings if available
      }));

      // Gender split
      const genderAgg = await StudentModel.aggregate([
        { $match: { schoolId: schoolOid, isDeleted: false } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]);

      for (const g of genderAgg) {
        if ((g._id as string) === 'male') male = g.count as number;
        else if ((g._id as string) === 'female') female = g.count as number;
      }

      // New enrollments this year
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      newEnrollments = await StudentModel.countDocuments({
        schoolId: schoolOid,
        isDeleted: false,
        createdAt: { $gte: yearStart, $lte: yearEnd },
      });
    } catch (err: unknown) {
      logger.warn({ err }, 'Student model not available for enrollment summary');
    }

    // Year over year (past 3 years)
    const yearOverYear: YearOverYear[] = [];
    try {
      const StudentModel = mongoose.model('Student');
      for (let y = year - 2; y <= year; y++) {
        const yEnd = new Date(y, 11, 31, 23, 59, 59);
        const count = await StudentModel.countDocuments({
          schoolId: schoolOid,
          isDeleted: false,
          createdAt: { $lte: yEnd },
        });
        yearOverYear.push({ year: y, total: count });
      }
    } catch {
      // Ignore
    }

    return {
      totalStudents,
      byGrade,
      newEnrollments,
      departures: 0,
      netChange: newEnrollments,
      genderSplit: { male, female },
      yearOverYear,
    };
  }
}
