import mongoose from 'mongoose';
import { Student } from '../../Student/model.js';
import { Mark, Assessment } from '../../Academic/model.js';
import { Attendance, Discipline, Merit } from '../../Attendance/model.js';
import { Achievement } from '../../Achiever/model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Invoice } from '../../Fee/model.js';
import { Wallet } from '../../Wallet/model.js';
import { BookLoan } from '../../Library/model.js';
import { PlayerCard } from '../../Sport/model-stats.js';

export class Student360Service {
  /**
   * Aggregate a 360-degree view of a student across all modules.
   * Uses Promise.allSettled so one failing module doesn't break the whole response.
   */
  static async getStudent360(schoolId: string, studentId: string) {
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch student profile first — required for the response
    const student = await Student.findOne({
      _id: studentObjId,
      schoolId: schoolObjId,
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName email')
      .populate('gradeId', 'name')
      .populate('classId', 'name')
      .lean();

    if (!student) return null;

    const results = await Promise.allSettled([
      Student360Service.getAcademic(schoolObjId, studentObjId),
      Student360Service.getAttendance(schoolObjId, studentObjId, startOfYear),
      Student360Service.getHomework(schoolObjId, studentObjId),
      Student360Service.getAchievements(schoolObjId, studentObjId),
      Student360Service.getFees(schoolObjId, studentObjId),
      Student360Service.getWallet(studentObjId),
      Student360Service.getLibrary(schoolObjId, studentObjId),
      Student360Service.getSports(schoolObjId, studentObjId),
      Student360Service.getBehaviour(schoolObjId, studentObjId),
    ]);

    const val = <T>(idx: number, fallback: T): T => {
      const r = results[idx];
      return r.status === 'fulfilled' ? (r.value as T) : fallback;
    };

    const user = student.userId as unknown as { firstName?: string; lastName?: string };
    const grade = student.gradeId as unknown as { name?: string };
    const cls = student.classId as unknown as { name?: string };

    return {
      student: {
        id: student._id.toString(),
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        admissionNumber: student.admissionNumber,
        gradeName: grade?.name ?? '',
        className: cls?.name ?? '',
      },
      academic: val(0, { subjects: [], termAverage: 0 }),
      attendance: val(1, { present: 0, absent: 0, late: 0, excused: 0, percentage: 0 }),
      homework: val(2, { pending: 0, completed: 0, averageMark: 0 }),
      achievements: val(3, { recent: [], totalMerits: 0, totalDemerits: 0 }),
      fees: val(4, { outstanding: 0 }),
      wallet: val(5, { balance: 0 }),
      library: val(6, { borrowed: 0, overdue: 0 }),
      sports: val(7, { cards: [] }),
      behaviour: val(8, { recentIncidents: [] }),
    };
  }

  // ─── Sub-queries ───────────────────────────────────────────────────────────

  private static async getAcademic(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentTerm = now.getMonth() < 3 ? 1 : now.getMonth() < 6 ? 2 : now.getMonth() < 9 ? 3 : 4;

    const assessments = await Assessment.find({
      schoolId: schoolObjId,
      term: currentTerm,
      academicYear: currentYear,
      isDeleted: false,
    }).populate('subjectId', 'name code').lean();

    const assessmentIds = assessments.map((a) => a._id);
    const marks = await Mark.find({
      studentId: studentObjId,
      assessmentId: { $in: assessmentIds },
      isDeleted: false,
    }).lean();

    // Group marks by subject
    const subjectMap = new Map<string, { name: string; totalMark: number; totalPossible: number; count: number }>();
    for (const mark of marks) {
      const assessment = assessments.find((a) => a._id.toString() === mark.assessmentId.toString());
      if (!assessment) continue;
      const sub = assessment.subjectId as unknown as { _id: mongoose.Types.ObjectId; name: string };
      const subId = sub._id.toString();
      if (!subjectMap.has(subId)) {
        subjectMap.set(subId, { name: sub.name ?? 'Unknown', totalMark: 0, totalPossible: 0, count: 0 });
      }
      const entry = subjectMap.get(subId)!;
      entry.totalMark += mark.mark;
      entry.totalPossible += mark.total;
      entry.count += 1;
    }

    const subjects = Array.from(subjectMap.entries()).map(([, data]) => ({
      name: data.name,
      mark: data.totalMark,
      total: data.totalPossible,
      percentage: data.totalPossible > 0 ? Math.round((data.totalMark / data.totalPossible) * 10000) / 100 : 0,
    }));

    const termAverage = subjects.length > 0
      ? Math.round(subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length * 100) / 100
      : 0;

    return { subjects, termAverage };
  }

  private static async getAttendance(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
    startOfYear: Date,
  ) {
    const stats = await Attendance.aggregate([
      {
        $match: {
          studentId: studentObjId,
          schoolId: schoolObjId,
          date: { $gte: startOfYear },
          isDeleted: false,
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const map = Object.fromEntries(stats.map((s: { _id: string; count: number }) => [s._id, s.count]));
    const present = (map['present'] ?? 0) as number;
    const absent = (map['absent'] ?? 0) as number;
    const late = (map['late'] ?? 0) as number;
    const excused = (map['excused'] ?? 0) as number;
    const total = present + absent + late + excused;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 10000) / 100 : 0;

    return { present, absent, late, excused, percentage };
  }

  private static async getHomework(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const [submissions, pendingHomework] = await Promise.all([
      HomeworkSubmission.find({ studentId: studentObjId, schoolId: schoolObjId, isDeleted: false }).lean(),
      Homework.find({ schoolId: schoolObjId, status: 'assigned', isDeleted: false }).lean(),
    ]);

    const submittedIds = new Set(submissions.map((s) => s.homeworkId.toString()));
    const pending = pendingHomework.filter((h) => !submittedIds.has(h._id.toString())).length;
    const completed = submissions.length;
    const graded = submissions.filter((s) => s.mark != null);
    const averageMark = graded.length > 0
      ? Math.round(graded.reduce((sum, s) => sum + (s.mark ?? 0), 0) / graded.length * 100) / 100
      : 0;

    return { pending, completed, averageMark };
  }

  private static async getAchievements(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const [recentAchievements, meritStats] = await Promise.all([
      Achievement.find({ studentId: studentObjId, schoolId: schoolObjId, isDeleted: false })
        .sort({ awardedAt: -1 })
        .limit(5)
        .lean(),
      Merit.aggregate([
        { $match: { studentId: studentObjId, schoolId: schoolObjId, isDeleted: false } },
        { $group: { _id: '$type', totalPoints: { $sum: '$points' } } },
      ]),
    ]);

    const meritData = meritStats.find((m: { _id: string }) => m._id === 'merit');
    const demeritData = meritStats.find((m: { _id: string }) => m._id === 'demerit');

    return {
      recent: recentAchievements.map((a) => ({
        title: a.title,
        type: a.type,
        date: a.awardedAt.toISOString(),
        points: a.points,
      })),
      totalMerits: (meritData?.totalPoints ?? 0) as number,
      totalDemerits: (demeritData?.totalPoints ?? 0) as number,
    };
  }

  private static async getFees(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const invoices = await Invoice.find({
      studentId: studentObjId,
      schoolId: schoolObjId,
      isDeleted: false,
      status: { $in: ['pending', 'partial', 'overdue'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const outstanding = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    const lastPaid = await Invoice.findOne({
      studentId: studentObjId,
      schoolId: schoolObjId,
      isDeleted: false,
      paidAmount: { $gt: 0 },
    })
      .sort({ updatedAt: -1 })
      .select('updatedAt')
      .lean();

    return {
      outstanding,
      lastPaymentDate: lastPaid?.updatedAt?.toISOString(),
    };
  }

  private static async getWallet(studentObjId: mongoose.Types.ObjectId) {
    const wallet = await Wallet.findOne({ studentId: studentObjId, isDeleted: false })
      .select('balance')
      .lean();
    return { balance: wallet?.balance ?? 0 };
  }

  private static async getLibrary(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const loans = await BookLoan.find({
      studentId: studentObjId,
      schoolId: schoolObjId,
      status: { $in: ['issued', 'overdue'] },
      isDeleted: false,
    }).lean();

    return {
      borrowed: loans.length,
      overdue: loans.filter((l) => l.status === 'overdue').length,
    };
  }

  private static async getSports(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const cards = await PlayerCard.find({
      studentId: studentObjId,
      schoolId: schoolObjId,
      isDeleted: false,
    })
      .select('sportCode overallRating tier')
      .lean();

    return {
      cards: cards.map((c) => ({
        sportCode: c.sportCode,
        overallRating: c.overallRating,
        tier: c.tier,
      })),
    };
  }

  private static async getBehaviour(
    schoolObjId: mongoose.Types.ObjectId,
    studentObjId: mongoose.Types.ObjectId,
  ) {
    const incidents = await Discipline.find({
      studentId: studentObjId,
      schoolId: schoolObjId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return {
      recentIncidents: incidents.map((i) => ({
        type: i.type,
        description: i.description,
        date: i.createdAt.toISOString(),
        severity: i.severity,
      })),
    };
  }
}
