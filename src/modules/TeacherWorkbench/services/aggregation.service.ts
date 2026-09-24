import mongoose from 'mongoose';
import { WorkbenchQuestion } from '../model.assessment.js';
import { PaperModeration } from '../model.assessment.js';
import { CurriculumCoverage } from '../model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Attendance } from '../../Attendance/model.js';
import { recentEntries } from '../../Behaviour/reads.js';
import { Mark } from '../../Academic/model.js';
import type { MarkingQueueItem } from './marking-queue.js';
import { homeworkQueueItems, paperQueueItemsFor, sortQueue } from './marking-queue.db.js';
import { BulkMessage } from '../../Communication/model.js';

interface DashboardData {
  questionCount: number;
  pendingModeration: number;
  coveragePercentage: number;
  markingItemsDue: number;
  recentActivity: unknown[];
}

interface Student360Data {
  studentId: string;
  studentName: string;
  className: string;
  academic: {
    termAverage: number;
    trend: 'improving' | 'declining' | 'stable';
    subjects: { name: string; mark: number; grade: string; classAvg: number }[];
    markHistory: { date: string; mark: number }[];
  };
  attendance: {
    rate: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    pattern: string | null;
  };
  behaviour: {
    netMeritScore: number;
    recentIncidents: { date: string; type: string; severity: string; description: string }[];
    recentMerits: { date: string; type: string; category: string; points: number; reason: string }[];
  };
  homework: {
    submissionRate: number;
    averageMark: number;
    lateCount: number;
    missingCount: number;
  };
  communication: {
    lastContactDate: string | null;
    messageCountThisTerm: number;
  };
}

export class AggregationService {
  static async getDashboard(
    teacherId: string,
    schoolId: string,
  ): Promise<DashboardData> {
    const [
      questionCount,
      pendingModerations,
      coverageAgg,
      pendingMarkingItems,
      recentActivity,
    ] = await Promise.all([
      WorkbenchQuestion.countDocuments({ schoolId, teacherId, isDeleted: false }),
      PaperModeration.countDocuments({ schoolId, status: 'pending', isDeleted: false }),
      CurriculumCoverage.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), teacherId: new mongoose.Types.ObjectId(teacherId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
      ]),
      HomeworkSubmission.countDocuments({
        schoolId,
        mark: { $exists: false },
        isDeleted: false,
      }),
      WorkbenchQuestion.find({ schoolId, teacherId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec(),
    ]);

    const coverageData = coverageAgg[0] as { total: number; completed: number } | undefined;
    const coveragePercent =
      coverageData && coverageData.total > 0
        ? Math.round((coverageData.completed / coverageData.total) * 100)
        : 0;

    return {
      questionCount,
      pendingModeration: pendingModerations,
      coveragePercentage: coveragePercent,
      markingItemsDue: pendingMarkingItems,
      recentActivity,
    };
  }

  static async getPendingMarking(teacherId: string, schoolId: string): Promise<MarkingQueueItem[]> {
    const now = new Date();
    const [homework, papers] = await Promise.all([
      homeworkQueueItems(teacherId, schoolId, now),
      paperQueueItemsFor(teacherId, schoolId, now),
    ]);
    return sortQueue([...homework, ...papers]);
  }

  static async getStudent360(
    studentId: string,
    schoolId: string,
  ): Promise<Student360Data> {
    const termStart = new Date();
    termStart.setMonth(termStart.getMonth() - 3);

    const [marks, attendanceRecords, discipline, merits, homeworkSubmissions, communications, totalHomeworks] =
      await Promise.all([
        Mark.find({ studentId, schoolId }).sort({ createdAt: -1 }).limit(50).lean().exec(),
        Attendance.find({ studentId, schoolId }).sort({ date: -1 }).limit(60).lean().exec(),
        recentEntries(studentId, schoolId, { kinds: ['incident'], limit: 20 }),
        recentEntries(studentId, schoolId, { kinds: ['merit', 'demerit'], limit: 20 }),
        HomeworkSubmission.find({ studentId, schoolId, isDeleted: false })
          .sort({ submittedAt: -1 })
          .limit(50)
          .lean()
          .exec(),
        BulkMessage.find({ schoolId, createdAt: { $gte: termStart } })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .exec(),
        Homework.countDocuments({ schoolId, isDeleted: false }),
      ]);

    // Academic aggregates
    const percentages = marks.map((m) => m.percentage ?? 0);
    const termAverage = percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0;

    const last5 = percentages.slice(0, 5);
    const prev5 = percentages.slice(5, 10);
    const last5Avg = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : 0;
    const prev5Avg = prev5.length > 0 ? prev5.reduce((a, b) => a + b, 0) / prev5.length : last5Avg;
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (last5Avg - prev5Avg > 3) trend = 'improving';
    else if (prev5Avg - last5Avg > 3) trend = 'declining';

    const markHistory = marks.slice(0, 20).map((m) => ({
      date: (m.createdAt as Date).toISOString(),
      mark: m.percentage ?? 0,
    }));

    // Attendance aggregates
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;
    const late = attendanceRecords.filter((a) => a.status === 'late').length;
    const excused = attendanceRecords.filter((a) => a.status === 'excused').length;
    const total = attendanceRecords.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Behaviour aggregates
    const netMeritScore = merits.reduce((sum, m) => sum + m.points, 0);

    // Homework aggregates
    const submittedCount = homeworkSubmissions.length;
    const submissionRate = totalHomeworks > 0 ? Math.round((submittedCount / totalHomeworks) * 100) : 0;
    const markedSubmissions = homeworkSubmissions.filter((s) => s.mark !== undefined && s.mark !== null);
    const averageMark = markedSubmissions.length > 0
      ? Math.round(markedSubmissions.reduce((sum, s) => sum + (s.mark as number), 0) / markedSubmissions.length)
      : 0;
    const lateCount = homeworkSubmissions.filter((s) => s.isLate).length;
    const missingCount = Math.max(0, totalHomeworks - submittedCount);

    // Communication aggregates
    const lastMsg = communications[0];
    const lastContactDate = lastMsg ? (lastMsg.createdAt as Date).toISOString() : null;
    const messageCountThisTerm = communications.length;

    return {
      studentId,
      studentName: '',
      className: '',
      academic: {
        termAverage,
        trend,
        subjects: [],
        markHistory,
      },
      attendance: {
        rate,
        present,
        absent,
        late,
        excused,
        pattern: null,
      },
      behaviour: {
        netMeritScore,
        recentIncidents: discipline.map((d) => ({
          date: new Date(d.occurredAt).toISOString(),
          type: d.category,
          severity: d.severity ?? '',
          description: d.note ?? '',
        })),
        recentMerits: merits.map((m) => ({
          date: new Date(m.occurredAt).toISOString(),
          type: m.kind,
          category: m.category,
          points: Math.abs(m.points),
          reason: m.note ?? '',
        })),
      },
      homework: {
        submissionRate,
        averageMark,
        lateCount,
        missingCount,
      },
      communication: {
        lastContactDate,
        messageCountThisTerm,
      },
    };
  }
}
