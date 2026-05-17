import mongoose from 'mongoose';
import { Homework } from '../Homework/model.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { Student } from '../Student/model.js';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
import { MasteryService } from './mastery.service.js';

export type RecommendationKind =
  | 'homework_due_soon'
  | 'test_coming_up'
  | 'weak_subject'
  | 'weak_topic';

export interface Recommendation {
  kind: RecommendationKind;
  title: string;
  subtitle: string;
  /** Where the student should go to act on it (front-end route). */
  actionHref: string;
  /** Optional CTA label override (otherwise default per kind). */
  actionLabel?: string;
  /** Higher = surfaced first. */
  priority: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Suggests what the student should work on next based on three signals:
 *   1. Homework due in the next 7 days that hasn't been submitted
 *   2. Tests / papers releasing or due in the next 14 days
 *   3. Subjects + topics where mastery is weak (< 60%)
 *
 * Ranked by urgency: overdue first, then due-soon, then weak topics.
 */
export class RecommendationsService {
  static async getRecommendations(userId: string, schoolId: string): Promise<Recommendation[]> {
    const student = await Student.findOne({
      userId,
      schoolId,
      isDeleted: false,
    })
      .select('_id classId')
      .lean();
    if (!student) return [];

    const studentRecordId = String(student._id);
    const classId = student.classId;

    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * MS_PER_DAY);
    const fourteenDays = new Date(now.getTime() + 14 * MS_PER_DAY);

    const [upcomingHomework, mySubmissions, upcomingPapers, mastery] = await Promise.all([
      classId
        ? Homework.find({
            schoolId,
            classId,
            isDeleted: false,
            status: 'assigned',
            dueDate: { $lte: sevenDays },
          })
            .populate('subjectId', 'name code')
            .sort({ dueDate: 1 })
            .lean()
        : [],

      HomeworkSubmission.find({
        schoolId,
        studentId: studentRecordId,
        isDeleted: false,
      })
        .select('homeworkId')
        .lean(),

      classId
        ? AssessmentPaper.find({
            schoolId,
            isDeleted: false,
            'assignments.classId': new mongoose.Types.ObjectId(String(classId)),
            'assignments.releaseAt': { $lte: fourteenDays },
          })
            .populate('subjectId', 'name code')
            .lean()
        : [],

      MasteryService.getMastery(userId, schoolId),
    ]);

    const submittedHomeworkIds = new Set(mySubmissions.map((s) => String(s.homeworkId)));

    const recs: Recommendation[] = [];

    // ─── Homework due soon ──────────────────────────────────────────────────
    for (const hw of upcomingHomework) {
      if (submittedHomeworkIds.has(String(hw._id))) continue;
      const due = hw.dueDate ? new Date(hw.dueDate) : null;
      if (!due) continue;
      const isOverdue = due.getTime() < now.getTime();
      const daysUntilDue = Math.round((due.getTime() - now.getTime()) / MS_PER_DAY);
      const subj = hw.subjectId as unknown as Record<string, unknown> | null;
      const subjectName = String(subj?.name ?? subj?.code ?? 'Unknown');
      recs.push({
        kind: 'homework_due_soon',
        title: hw.title,
        subtitle: isOverdue
          ? `${subjectName} · overdue`
          : daysUntilDue === 0
            ? `${subjectName} · due today`
            : `${subjectName} · due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
        actionHref: `/student/homework/${hw._id}`,
        actionLabel: 'Open homework',
        priority: isOverdue ? 100 : 80 - Math.min(daysUntilDue, 7) * 5,
      });
    }

    // ─── Tests coming up ───────────────────────────────────────────────────
    for (const paper of upcomingPapers) {
      const subj = paper.subjectId as unknown as Record<string, unknown> | null;
      const subjectName = String(subj?.name ?? subj?.code ?? 'Unknown');
      // Find the soonest release for this class.
      const myAssignment = paper.assignments?.find(
        (a) => String(a.classId) === String(classId),
      );
      const release = myAssignment?.releaseAt ? new Date(myAssignment.releaseAt) : null;
      if (!release) continue;
      const daysUntilRelease = Math.round((release.getTime() - now.getTime()) / MS_PER_DAY);
      const tense = daysUntilRelease <= 0 ? 'now available' : `in ${daysUntilRelease} day${daysUntilRelease === 1 ? '' : 's'}`;
      recs.push({
        kind: 'test_coming_up',
        title: paper.title,
        subtitle: `${subjectName} · ${tense}`,
        actionHref: `/student/ai-tutor?subjectId=${String(subj?._id ?? paper.subjectId)}&mode=exam_prep&context=${encodeURIComponent(paper.title)}`,
        actionLabel: 'Start exam prep with Buddy',
        priority: 60 - Math.min(daysUntilRelease, 14) * 2,
      });
    }

    // ─── Weak subjects + topics ────────────────────────────────────────────
    for (const subject of mastery) {
      if (subject.score == null || subject.score >= 60) continue;

      // Subject-level rec — only if no topic-level rec already covers it.
      const weakestTopics = subject.topics.filter((t) => t.score < 60).slice(0, 2);
      if (weakestTopics.length > 0) {
        for (const t of weakestTopics) {
          recs.push({
            kind: 'weak_topic',
            title: `Practice "${t.topic}"`,
            subtitle: `${subject.subjectName} · scoring ${Math.round(t.score)}% on ${t.attempts} attempt${t.attempts === 1 ? '' : 's'}`,
            actionHref: `/student/ai-tutor/practice?subjectId=${subject.subjectId}&topic=${encodeURIComponent(t.topic)}`,
            actionLabel: 'Practice now',
            priority: 50 + (60 - t.score),
          });
        }
      } else {
        recs.push({
          kind: 'weak_subject',
          title: `Brush up on ${subject.subjectName}`,
          subtitle: `Overall average ${Math.round(subject.score)}% · ${subject.signalCount} data point${subject.signalCount === 1 ? '' : 's'}`,
          actionHref: `/student/ai-tutor?subjectId=${subject.subjectId}&mode=exam_prep`,
          actionLabel: 'Get help from Buddy',
          priority: 40 + (60 - subject.score),
        });
      }
    }

    // Sort by priority descending and cap at 8.
    recs.sort((a, b) => b.priority - a.priority);
    return recs.slice(0, 8);
  }
}
