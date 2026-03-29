import mongoose from 'mongoose';
import { Student } from '../Student/model.js';
import { Invoice, Payment } from '../Fee/model.js';
import { Attendance, Discipline, Merit } from '../Attendance/model.js';
import { Mark, Assessment, Subject, Class, Grade } from '../Academic/model.js';
import { TuckShopOrder } from '../TuckShop/model.js';
import { Homework, HomeworkSubmission } from '../Homework/model.js';
import { Event } from '../Event/model.js';
import { Wallet } from '../Wallet/model.js';

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

  // ─── Comprehensive Dashboard ───────────────────────────────────────��──────

  static async getComprehensiveDashboard(schoolId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const [
      totalStudents,
      revenueResult,
      collectionResult,
      attendanceResult,
      tuckShopToday,
      upcomingEvents,
      overdueHomework,
    ] = await Promise.all([
      Student.countDocuments({ schoolId: schoolObjId, enrollmentStatus: 'active', isDeleted: false }),

      Payment.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      Invoice.aggregate([
        { $match: { schoolId: schoolObjId, isDeleted: false } },
        { $group: { _id: null, totalPaid: { $sum: '$paidAmount' }, totalAmount: { $sum: '$totalAmount' } } },
      ]),

      Attendance.aggregate([
        { $match: { schoolId: schoolObjId, date: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
      ]),

      TuckShopOrder.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: today, $lt: tomorrow }, isDeleted: false } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      ]),

      Event.countDocuments({ schoolId: schoolObjId, date: { $gte: today }, isDeleted: false }),

      Homework.countDocuments({ schoolId: schoolObjId, dueDate: { $lt: today }, status: 'assigned', isDeleted: false }),
    ]);

    const totalRevenueThisMonth = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const collectionRate = collectionResult.length > 0 && collectionResult[0].totalAmount > 0
      ? Math.round((collectionResult[0].totalPaid / collectionResult[0].totalAmount) * 10000) / 100 : 0;
    const attendanceRate = attendanceResult.length > 0 && attendanceResult[0].total > 0
      ? Math.round((attendanceResult[0].present / attendanceResult[0].total) * 10000) / 100 : 0;

    return {
      totalStudents,
      totalRevenueThisMonth,
      collectionRate,
      attendanceRate,
      tuckShopSalesToday: tuckShopToday.length > 0 ? tuckShopToday[0].totalSales : 0,
      tuckShopOrdersToday: tuckShopToday.length > 0 ? tuckShopToday[0].orderCount : 0,
      upcomingEvents,
      overdueHomeworkCount: overdueHomework,
    };
  }

  // ─── Full Student Report ──────────────────────────────────────────────────

  static async getStudentFullReport(studentId: string) {
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [student, marks, attendanceStats, behaviourStats, walletInfo, homeworkStats] = await Promise.all([
      Student.findOne({ _id: studentObjId, isDeleted: false })
        .populate('userId', 'firstName lastName email')
        .populate('gradeId', 'name')
        .populate('classId', 'name')
        .lean(),

      Mark.find({ studentId: studentObjId, isDeleted: false })
        .populate({ path: 'assessmentId', match: { isDeleted: false }, populate: { path: 'subjectId', select: 'name code' } })
        .lean(),

      Attendance.aggregate([
        { $match: { studentId: studentObjId, date: { $gte: startOfYear }, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Merit.aggregate([
        { $match: { studentId: studentObjId, isDeleted: false } },
        { $group: { _id: '$type', totalPoints: { $sum: '$points' }, count: { $sum: 1 } } },
      ]),

      Wallet.findOne({ studentId: studentObjId, isDeleted: false }).select('balance').lean(),

      HomeworkSubmission.aggregate([
        { $match: { studentId: studentObjId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: 1 }, graded: { $sum: { $cond: [{ $ne: ['$mark', null] }, 1, 0] } } } },
      ]),
    ]);

    const filteredMarks = marks.filter((m) => m.assessmentId !== null);
    const attendanceMap = Object.fromEntries(attendanceStats.map((a) => [a._id, a.count]));
    const totalAttendance = attendanceStats.reduce((sum, a) => sum + a.count, 0);
    const presentCount = (attendanceMap['present'] ?? 0) + (attendanceMap['late'] ?? 0);

    const meritData = behaviourStats.find((b) => b._id === 'merit');
    const demeritData = behaviourStats.find((b) => b._id === 'demerit');
    const hwStats = homeworkStats.length > 0 ? homeworkStats[0] : { total: 0, graded: 0 };

    return {
      student,
      grades: filteredMarks,
      attendance: {
        present: attendanceMap['present'] ?? 0,
        absent: attendanceMap['absent'] ?? 0,
        late: attendanceMap['late'] ?? 0,
        excused: attendanceMap['excused'] ?? 0,
        total: totalAttendance,
        attendanceRate: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 10000) / 100 : 0,
      },
      behaviour: {
        meritPoints: meritData?.totalPoints ?? 0,
        meritCount: meritData?.count ?? 0,
        demeritPoints: demeritData?.totalPoints ?? 0,
        demeritCount: demeritData?.count ?? 0,
        netPoints: (meritData?.totalPoints ?? 0) - (demeritData?.totalPoints ?? 0),
      },
      wallet: { balance: walletInfo?.balance ?? 0 },
      homework: {
        totalSubmissions: hwStats.total,
        graded: hwStats.graded,
      },
    };
  }

  // ─── Class Performance ────────────────────────────────────────────────────

  static async getClassPerformance(classId: string) {
    const classObjId = new mongoose.Types.ObjectId(classId);

    const students = await Student.find({ classId: classObjId, enrollmentStatus: 'active', isDeleted: false })
      .populate('userId', 'firstName lastName')
      .lean();

    const assessments = await Assessment.find({ classId: classObjId, isDeleted: false })
      .populate('subjectId', 'name code')
      .lean();

    const marks = await Mark.find({
      assessmentId: { $in: assessments.map((a) => a._id) },
      isDeleted: false,
    }).lean();

    // Subject averages
    const subjectAverages: Record<string, { name: string; total: number; count: number }> = {};
    for (const mark of marks) {
      const assessment = assessments.find((a) => a._id.toString() === mark.assessmentId.toString());
      if (!assessment) continue;
      const subjectId = assessment.subjectId._id?.toString() ?? assessment.subjectId.toString();
      if (!subjectAverages[subjectId]) {
        subjectAverages[subjectId] = { name: (assessment.subjectId as any).name ?? '', total: 0, count: 0 };
      }
      subjectAverages[subjectId].total += mark.percentage;
      subjectAverages[subjectId].count += 1;
    }

    const subjects = Object.entries(subjectAverages).map(([id, data]) => ({
      subjectId: id,
      subjectName: data.name,
      averagePercentage: Math.round((data.total / data.count) * 100) / 100,
      totalMarks: data.count,
    }));

    return {
      classId,
      totalStudents: students.length,
      totalAssessments: assessments.length,
      subjects,
    };
  }

  // ─── Monthly Financial Summary ────────────────────────────────────────────

  static async getMonthlyFinancialSummary(schoolId: string, year?: number, month?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonth = month ?? new Date().getMonth() + 1;
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const [payments, invoices, tuckShopSales] = await Promise.all([
      Payment.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      Invoice.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            count: { $sum: 1 },
          },
        },
      ]),

      TuckShopOrder.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalPayments = payments.reduce((sum, p) => sum + p.total, 0);

    return {
      year: targetYear,
      month: targetMonth,
      payments: {
        total: totalPayments,
        byMethod: payments.map((p) => ({ method: p._id, total: p.total, count: p.count })),
      },
      invoices: {
        totalInvoiced: invoices[0]?.totalInvoiced ?? 0,
        totalPaid: invoices[0]?.totalPaid ?? 0,
        count: invoices[0]?.count ?? 0,
      },
      tuckShop: {
        total: tuckShopSales[0]?.total ?? 0,
        count: tuckShopSales[0]?.count ?? 0,
      },
    };
  }

  // ─── Financial Debtors Ageing Report ──────────────────────────────────────

  static async getDebtorsAgeingReport(schoolId: string) {
    const now = new Date();
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const invoices = await Invoice.find({
      schoolId: schoolObjId,
      status: { $nin: ['paid', 'cancelled'] },
      isDeleted: false,
    }).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName' },
    }).lean();

    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const debtors = invoices.map((inv) => {
      const outstanding = inv.totalAmount - inv.paidAmount;
      const ageDays = Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
      const bucket = ageDays <= 30 ? '0-30' : ageDays <= 60 ? '31-60' : ageDays <= 90 ? '61-90' : '90+';
      buckets[bucket] += outstanding;

      return {
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        student: inv.studentId,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        outstanding,
        ageDays,
        bucket,
      };
    });

    return {
      totalOutstanding: debtors.reduce((sum, d) => sum + d.outstanding, 0),
      buckets,
      debtors,
    };
  }

  // ─── Subject Performance Across Grades ────────────────────────────────────

  static async getSubjectPerformance(schoolId: string, term?: number, academicYear?: number) {
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const matchStage: Record<string, unknown> = {
      'assessment.schoolId': schoolObjId,
      'assessment.isDeleted': false,
    };
    if (term) matchStage['assessment.term'] = term;
    if (academicYear) matchStage['assessment.academicYear'] = academicYear;

    const results = await Mark.aggregate([
      { $match: { isDeleted: false } },
      { $lookup: { from: 'assessments', localField: 'assessmentId', foreignField: '_id', as: 'assessment' } },
      { $unwind: '$assessment' },
      { $match: matchStage },
      { $lookup: { from: 'subjects', localField: 'assessment.subjectId', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $lookup: { from: 'classes', localField: 'assessment.classId', foreignField: '_id', as: 'class' } },
      { $unwind: '$class' },
      { $lookup: { from: 'grades', localField: 'class.gradeId', foreignField: '_id', as: 'grade' } },
      { $unwind: '$grade' },
      {
        $group: {
          _id: { subjectId: '$subject._id', gradeName: '$grade.name' },
          subjectName: { $first: '$subject.name' },
          subjectCode: { $first: '$subject.code' },
          averagePercentage: { $avg: '$percentage' },
          totalMarks: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          subjectId: '$_id.subjectId',
          gradeName: '$_id.gradeName',
          subjectName: 1,
          subjectCode: 1,
          averagePercentage: { $round: ['$averagePercentage', 2] },
          totalMarks: 1,
        },
      },
      { $sort: { subjectName: 1, gradeName: 1 } },
    ]);

    return results;
  }
}
