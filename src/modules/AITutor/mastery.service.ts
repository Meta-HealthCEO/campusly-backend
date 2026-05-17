import mongoose from 'mongoose';
import { PracticeAttempt } from './model.js';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { Subject } from '../Academic/model.js';
import { paginationHelper } from '../../common/utils.js';

/**
 * Per-subject mastery snapshot. Combines three signals — practice attempts,
 * homework submissions, and assessment marks — into a single 0–100 score.
 * Per-topic breakdown is sourced from practice attempts only because
 * homework records don't carry topic-level tags yet.
 */
export interface SubjectMastery {
  subjectId: string;
  subjectName: string;
  /** Weighted % across all signals. Null if no data. */
  score: number | null;
  /** Number of data points that fed into the score (practice + homework + marks). */
  signalCount: number;
  signals: {
    practice: { count: number; avg: number | null };
    homework: { count: number; avg: number | null };
    marks: { count: number; avg: number | null };
  };
  topics: TopicMastery[];
}

export interface TopicMastery {
  topic: string;
  /** % average from practice attempts on this topic. */
  score: number;
  attempts: number;
}

interface PracticeHistoryItem {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  grade: number;
  score: number;
  totalMarks: number;
  percentage: number;
  completedAt: Date | null;
  createdAt: Date;
}

export class MasteryService {
  // ─── Practice History ────────────────────────────────────────────────────

  static async listPracticeHistory(
    userId: string,
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<{ attempts: PracticeHistoryItem[]; total: number }> {
    const { skip, limit: lim } = paginationHelper(page, limit);

    const filter = { schoolId, studentId: userId, isDeleted: false };
    const [docs, total] = await Promise.all([
      PracticeAttempt.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate('subjectId', 'name code')
        .lean(),
      PracticeAttempt.countDocuments(filter),
    ]);

    const attempts: PracticeHistoryItem[] = docs.map((d) => {
      const subj = d.subjectId as unknown as Record<string, unknown> | null;
      const subjectId = String(subj?._id ?? d.subjectId);
      const subjectName = String(subj?.name ?? subj?.code ?? 'Unknown');
      const percentage = d.totalMarks > 0 ? Math.round((d.score / d.totalMarks) * 100) : 0;
      return {
        id: String(d._id),
        subjectId,
        subjectName,
        topic: d.topic,
        grade: d.grade,
        score: d.score,
        totalMarks: d.totalMarks,
        percentage,
        completedAt: d.completedAt ?? null,
        createdAt: d.createdAt,
      };
    });

    return { attempts, total };
  }

  // ─── Mastery ─────────────────────────────────────────────────────────────

  static async getMastery(userId: string, schoolId: string): Promise<SubjectMastery[]> {
    const studentRecordId = await this.resolveStudentRecordId(userId, schoolId);

    // Pull all three signals in parallel.
    const [practiceAttempts, hwSubmissions, marks] = await Promise.all([
      PracticeAttempt.find({
        schoolId,
        studentId: userId,
        isDeleted: false,
        completedAt: { $ne: null },
      })
        .populate('subjectId', 'name code')
        .lean(),

      studentRecordId
        ? HomeworkSubmission.find({
            schoolId,
            studentId: studentRecordId,
            isDeleted: false,
            mark: { $ne: null, $exists: true },
          })
            .populate({ path: 'homeworkId', select: 'subjectId', populate: { path: 'subjectId', select: 'name code' } })
            .lean()
        : Promise.resolve([]),

      studentRecordId
        ? Mark.find({
            schoolId,
            studentId: studentRecordId,
            isDeleted: false,
          })
            .populate({
              path: 'assessmentId',
              select: 'subjectId',
              populate: { path: 'subjectId', select: 'name code' },
            })
            .lean()
        : Promise.resolve([]),
    ]);

    type Bucket = {
      subjectName: string;
      practice: number[];
      homework: number[];
      marks: number[];
      topics: Map<string, number[]>;
    };
    const bySubject = new Map<string, Bucket>();

    function ensure(subjectId: string, subjectName: string): Bucket {
      let b = bySubject.get(subjectId);
      if (!b) {
        b = {
          subjectName,
          practice: [],
          homework: [],
          marks: [],
          topics: new Map(),
        };
        bySubject.set(subjectId, b);
      }
      if (subjectName && !b.subjectName) b.subjectName = subjectName;
      return b;
    }

    // Practice
    for (const p of practiceAttempts) {
      if (p.totalMarks <= 0) continue;
      const pct = (p.score / p.totalMarks) * 100;
      const subj = p.subjectId as unknown as Record<string, unknown> | null;
      const subjectId = String(subj?._id ?? p.subjectId);
      const subjectName = String(subj?.name ?? subj?.code ?? '');
      const bucket = ensure(subjectId, subjectName);
      bucket.practice.push(pct);
      const topic = p.topic?.trim();
      if (topic) {
        const t = bucket.topics.get(topic) ?? [];
        t.push(pct);
        bucket.topics.set(topic, t);
      }
    }

    // Homework
    for (const sub of hwSubmissions) {
      const mark = sub.mark;
      if (typeof mark !== 'number' || sub.maxMarks <= 0) continue;
      const pct = (mark / sub.maxMarks) * 100;
      const hw = sub.homeworkId as unknown as Record<string, unknown> | null;
      const subjectRef = hw?.subjectId as Record<string, unknown> | string | undefined;
      let subjectId = '';
      let subjectName = '';
      if (typeof subjectRef === 'string') {
        subjectId = subjectRef;
      } else if (subjectRef && typeof subjectRef === 'object') {
        subjectId = String(subjectRef._id ?? '');
        subjectName = String(subjectRef.name ?? subjectRef.code ?? '');
      }
      if (!subjectId) continue;
      ensure(subjectId, subjectName).homework.push(pct);
    }

    // Marks
    for (const m of marks) {
      if (m.percentage == null) continue;
      const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
      const subj = assessment?.subjectId as Record<string, unknown> | string | undefined;
      let subjectId = '';
      let subjectName = '';
      if (typeof subj === 'string') {
        subjectId = subj;
      } else if (subj && typeof subj === 'object') {
        subjectId = String(subj._id ?? '');
        subjectName = String(subj.name ?? subj.code ?? '');
      }
      if (!subjectId) continue;
      ensure(subjectId, subjectName).marks.push(Number(m.percentage));
    }

    // Backfill missing subject names from the Subject collection in one query.
    const missingIds = [...bySubject.entries()]
      .filter(([, b]) => !b.subjectName)
      .map(([id]) => id);
    if (missingIds.length > 0) {
      const objectIds = missingIds
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      const subjects = await Subject.find({ _id: { $in: objectIds }, schoolId, isDeleted: false })
        .select('name code')
        .lean();
      for (const s of subjects) {
        const b = bySubject.get(String(s._id));
        if (b) b.subjectName = s.name ?? s.code ?? '';
      }
    }

    const out: SubjectMastery[] = [];
    for (const [subjectId, b] of bySubject) {
      const practiceAvg = avg(b.practice);
      const homeworkAvg = avg(b.homework);
      const marksAvg = avg(b.marks);

      const weightedScore = computeWeightedScore(practiceAvg, homeworkAvg, marksAvg);

      const topics: TopicMastery[] = [];
      for (const [topic, scores] of b.topics) {
        topics.push({
          topic,
          score: Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
          attempts: scores.length,
        });
      }
      topics.sort((a, c) => a.score - c.score); // weakest first

      out.push({
        subjectId,
        subjectName: b.subjectName || 'Unknown',
        score: weightedScore,
        signalCount: b.practice.length + b.homework.length + b.marks.length,
        signals: {
          practice: { count: b.practice.length, avg: practiceAvg },
          homework: { count: b.homework.length, avg: homeworkAvg },
          marks: { count: b.marks.length, avg: marksAvg },
        },
        topics,
      });
    }

    out.sort((a, c) => (a.score ?? 100) - (c.score ?? 100)); // weakest subject first
    return out;
  }

  private static async resolveStudentRecordId(
    userId: string,
    schoolId: string,
  ): Promise<string | null> {
    const student = await Student.findOne({ userId, schoolId, isDeleted: false })
      .select('_id')
      .lean();
    return student?._id.toString() ?? null;
  }
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10;
}

/**
 * Weight teacher-graded marks more heavily than student-generated practice,
 * since marks are externally validated. Tunable; see implementation notes.
 */
function computeWeightedScore(
  practice: number | null,
  homework: number | null,
  marks: number | null,
): number | null {
  const inputs: Array<{ value: number; weight: number }> = [];
  if (practice !== null) inputs.push({ value: practice, weight: 1 });
  if (homework !== null) inputs.push({ value: homework, weight: 2 });
  if (marks !== null) inputs.push({ value: marks, weight: 3 });
  if (inputs.length === 0) return null;
  const total = inputs.reduce((s, i) => s + i.value * i.weight, 0);
  const weight = inputs.reduce((s, i) => s + i.weight, 0);
  return Math.round((total / weight) * 10) / 10;
}
