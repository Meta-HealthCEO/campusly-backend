import mongoose from 'mongoose';
import { Student } from '../Student/model.js';
import { Invoice, Payment } from '../Fee/model.js';
import { Attendance } from '../Attendance/model.js';
import { Mark, Assessment, Subject, Class, Grade } from '../Academic/model.js';
import { TuckShopOrder } from '../TuckShop/model.js';

export class ReportService {
  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  static async getDashboardStats(schoolId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    const [
      totalStudents,
      revenueResult,
      collectionResult,
      attendanceResult,
      outstandingResult,
    ] = await Promise.all([
      // Total active students
      Student.countDocuments({
        schoolId: schoolObjectId,
        enrollmentStatus: 'active',
        isDeleted: false,
      }),

      // Total revenue this month
      Payment.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),

      // Fee collection rate
      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$paidAmount' },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),

      // Attendance rate this month
      Attendance.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
            },
          },
        },
      ]),

      // Outstanding fees
      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            status: { $nin: ['paid', 'cancelled'] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            outstanding: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
          },
        },
      ]),
    ]);

    const totalRevenueThisMonth = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const feeCollectionRate =
      collectionResult.length > 0 && collectionResult[0].totalAmount > 0
        ? Math.round((collectionResult[0].totalPaid / collectionResult[0].totalAmount) * 10000) / 100
        : 0;

    const attendanceRate =
      attendanceResult.length > 0 && attendanceResult[0].total > 0
        ? Math.round((attendanceResult[0].present / attendanceResult[0].total) * 10000) / 100
        : 0;

    const outstandingFees = outstandingResult.length > 0 ? outstandingResult[0].outstanding : 0;

    return {
      totalStudents,
      totalRevenueThisMonth,
      feeCollectionRate,
      attendanceRate,
      outstandingFees,
    };
  }

  // ─── Revenue Report ─────────────────────────────────────────────────────────

  static async getRevenueReport(schoolId: string, startDate?: string, endDate?: string) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.createdAt = dateFilter;
    }

    const results = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
        },
      },
    ]);

    return results;
  }

  // ─── Attendance Report ──────────────────────────────────────────────────────

  static async getAttendanceReport(
    schoolId: string,
    startDate?: string,
    endDate?: string,
    gradeId?: string,
    classId?: string,
  ) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.date = dateFilter;
    }

    if (classId) {
      match.classId = new mongoose.Types.ObjectId(classId);
    }

    const results = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return results;
  }

  // ─── Academic Performance Report ────────────────────────────────────────────

  static async getAcademicPerformanceReport(
    schoolId: string,
    term?: number,
    academicYear?: number,
  ) {
    const assessmentMatch: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (term) assessmentMatch.term = term;
    if (academicYear) assessmentMatch.academicYear = academicYear;

    const results = await Mark.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      { $unwind: '$assessment' },
      {
        $match: {
          'assessment.schoolId': new mongoose.Types.ObjectId(schoolId),
          'assessment.isDeleted': false,
          ...(term ? { 'assessment.term': term } : {}),
          ...(academicYear ? { 'assessment.academicYear': academicYear } : {}),
        },
      },
      {
        $group: {
          _id: '$assessment.subjectId',
          averagePercentage: { $avg: '$percentage' },
          totalMarks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          subjectName: '$subject.name',
          subjectCode: '$subject.code',
          averagePercentage: { $round: ['$averagePercentage', 2] },
          totalMarks: 1,
        },
      },
      {
        $sort: { subjectName: 1 },
      },
    ]);

    return results;
  }

  // ─── Student Report Card ────────────────────────────────────────────────────

  static async getStudentReportCard(studentId: string, term: number, academicYear: number) {
    const marks = await Mark.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      isDeleted: false,
    })
      .populate({
        path: 'assessmentId',
        match: { term, academicYear, isDeleted: false },
        populate: { path: 'subjectId' },
      })
      .lean();

    // Filter out marks where assessment didn't match (populate returns null)
    const filteredMarks = marks.filter((m) => m.assessmentId !== null);

    return {
      studentId,
      term,
      academicYear,
      marks: filteredMarks,
    };
  }

  // ─── Debtors Report ─────────────────────────────────────────────────────────

  static async getDebtorsReport(schoolId: string) {
    const now = new Date();

    const invoices = await Invoice.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: { $nin: ['paid', 'cancelled'] },
      isDeleted: false,
    })
      .populate('studentId')
      .lean();

    const debtors = invoices.map((invoice) => {
      const outstanding = invoice.totalAmount - invoice.paidAmount;
      const dueDate = new Date(invoice.dueDate);
      const ageDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

      let bucket: '0-30' | '31-60' | '61-90' | '90+';
      if (ageDays <= 30) {
        bucket = '0-30';
      } else if (ageDays <= 60) {
        bucket = '31-60';
      } else if (ageDays <= 90) {
        bucket = '61-90';
      } else {
        bucket = '90+';
      }

      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstanding,
        ageDays,
        bucket,
      };
    });

    return debtors;
  }

  // ─── Tuck Shop Sales Report ─────────────────────────────────────────────────

  static async getTuckShopSalesReport(
    schoolId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string,
  ) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.createdAt = dateFilter;
    }

    let groupId: Record<string, unknown>;

    switch (period) {
      case 'daily':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case 'weekly':
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        };
        break;
      case 'monthly':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
    }

    const results = await TuckShopOrder.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);

    return results;
  }
}
