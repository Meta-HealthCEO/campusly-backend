import { Question } from '../model.assessment.js';
import { PaperModeration } from '../model.assessment.js';
import { CurriculumCoverage } from '../model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Attendance, Discipline, Merit } from '../../Attendance/model.js';
import { Mark } from '../../Academic/model.js';
import { BulkMessage } from '../../Communication/model.js';

interface DashboardData {
  questionCount: number;
  pendingModerations: number;
  coveragePercent: number;
  pendingMarkingCount: number;
  recentActivity: unknown[];
}

interface MarkingItem {
  id: string;
  type: 'homework';
  title: string;
  studentCount: number;
  dueDate: Date | undefined;
  priority: 'high' | 'medium' | 'low';
  homeworkId: string;
}

interface Student360Data {
  studentId: string;
  marks: unknown[];
  attendance: unknown[];
  discipline: unknown[];
  merits: unknown[];
  homeworkSubmissions: unknown[];
  communications: unknown[];
}

function calcPriority(dueDate: Date | undefined): 'high' | 'medium' | 'low' {
  if (!dueDate) return 'low';
  const diff = dueDate.getTime() - Date.now();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 1) return 'high';
  if (days < 3) return 'medium';
  return 'low';
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
      Question.countDocuments({ schoolId, teacherId, isDeleted: false }),
      PaperModeration.countDocuments({ schoolId, status: 'pending', isDeleted: false }),
      CurriculumCoverage.aggregate([
        { $match: { schoolId, teacherId } },
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
      Question.find({ schoolId, teacherId, isDeleted: false })
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
      pendingModerations,
      coveragePercent,
      pendingMarkingCount: pendingMarkingItems,
      recentActivity,
    };
  }

  static async getPendingMarking(
    teacherId: string,
    schoolId: string,
  ): Promise<MarkingItem[]> {
    const homeworks = await Homework.find({
      schoolId,
      teacherId,
      isDeleted: false,
    })
      .lean()
      .exec();

    const homeworkIds = homeworks.map((h) => h._id);

    const ungradedSubmissions = await HomeworkSubmission.aggregate([
      {
        $match: {
          homeworkId: { $in: homeworkIds },
          schoolId,
          isDeleted: false,
          mark: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$homeworkId',
          count: { $sum: 1 },
        },
      },
    ]);

    const homeworkMap = new Map(homeworks.map((h) => [String(h._id), h]));

    return ungradedSubmissions.map((item) => {
      const hw = homeworkMap.get(String(item._id));
      const dueDate = hw?.dueDate;
      return {
        id: String(item._id),
        type: 'homework' as const,
        title: hw?.title ?? 'Untitled',
        studentCount: item.count as number,
        dueDate,
        priority: calcPriority(dueDate),
        homeworkId: String(item._id),
      };
    });
  }

  static async getStudent360(
    studentId: string,
    schoolId: string,
  ): Promise<Student360Data> {
    const [marks, attendance, discipline, merits, homeworkSubmissions, communications] =
      await Promise.all([
        Mark.find({ studentId, schoolId }).sort({ createdAt: -1 }).limit(50).lean().exec(),
        Attendance.find({ studentId, schoolId }).sort({ date: -1 }).limit(60).lean().exec(),
        Discipline.find({ studentId, schoolId }).sort({ createdAt: -1 }).limit(20).lean().exec(),
        Merit.find({ studentId, schoolId }).sort({ createdAt: -1 }).limit(20).lean().exec(),
        HomeworkSubmission.find({ studentId, schoolId, isDeleted: false })
          .sort({ submittedAt: -1 })
          .limit(20)
          .lean()
          .exec(),
        BulkMessage.find({ schoolId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .exec(),
      ]);

    return {
      studentId,
      marks,
      attendance,
      discipline,
      merits,
      homeworkSubmissions,
      communications,
    };
  }
}
