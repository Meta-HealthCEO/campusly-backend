import mongoose from 'mongoose';
import { DigestPreference } from './model.js';
import type { UpdatePreferencesInput } from './validation.js';
import { Student } from '../Student/model.js';
import { Timetable } from '../Academic/model.js';
import { Assessment } from '../Academic/model.js';
import { Mark } from '../Academic/model.js';
import { Homework } from '../Homework/model.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { Attendance, Discipline, Merit } from '../Attendance/model.js';
import { Wallet, WalletTransaction } from '../Wallet/model.js';
import { Event } from '../Event/model.js';
import { BadRequestError } from '../../common/errors.js';

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function weekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: monday, end: sunday };
}

function nextWeekRange(): { start: Date; end: Date } {
  const { end: thisWeekEnd } = weekRange();
  const nextEnd = new Date(thisWeekEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: thisWeekEnd, end: nextEnd };
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getDayName(): string {
  return DAYS[new Date().getDay()];
}

async function resolveStudent(schoolId: string, studentId: string) {
  const student = await Student.findOne({
    _id: studentId,
    schoolId,
    isDeleted: false,
  }).populate('userId', 'firstName lastName').lean();
  if (!student) throw new BadRequestError('Student not found');
  return student;
}

// ─── Service ───────────────────────────────────────────────────────────────

export class DigestService {
  static async getPreferences(userId: string, schoolId: string) {
    let prefs = await DigestPreference.findOne({
      parentId: userId,
      schoolId,
      isDeleted: false,
    }).lean();

    if (!prefs) {
      prefs = await DigestPreference.create({ parentId: userId, schoolId });
      prefs = prefs.toObject();
    }

    return prefs;
  }

  static async updatePreferences(userId: string, schoolId: string, data: UpdatePreferencesInput) {
    const prefs = await DigestPreference.findOneAndUpdate(
      { parentId: userId, schoolId, isDeleted: false },
      { $set: data },
      { new: true, upsert: true, runValidators: true },
    );
    return prefs;
  }

  static async generateMorningDigest(schoolId: string, studentId: string) {
    const student = await resolveStudent(schoolId, studentId);
    const userObj = student.userId as unknown as { firstName?: string; lastName?: string };
    const studentName = `${userObj?.firstName ?? ''} ${userObj?.lastName ?? ''}`.trim();
    const today = getDayName();
    const { start: todayStart, end: todayEnd } = todayRange();
    const { start: weekStart, end: weekEnd } = weekRange();

    // 1. Timetable for today
    const timetable = await Timetable.find({
      classId: student.classId,
      schoolId,
      day: today,
      isDeleted: false,
    }).populate('subjectId', 'name').sort({ period: 1 }).lean();

    // 2. Homework due today
    const homeworkDue = await Homework.find({
      classId: student.classId,
      schoolId,
      dueDate: { $gte: todayStart, $lt: todayEnd },
      isDeleted: false,
    }).populate('subjectId', 'name').lean();

    // 3. Upcoming assessments this week
    const upcomingAssessments = await Assessment.find({
      classId: student.classId,
      schoolId,
      date: { $gte: todayStart, $lte: weekEnd },
      isDeleted: false,
    }).populate('subjectId', 'name').lean();

    // 4. Upcoming events
    const events = await Event.find({
      schoolId,
      date: { $gte: todayStart, $lte: weekEnd },
      isDeleted: false,
    }).sort({ date: 1 }).limit(5).lean();

    // 5. Wallet balance
    const wallet = await Wallet.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      schoolId,
      isDeleted: false,
    }).lean();

    return {
      studentName,
      date: todayStart.toISOString().slice(0, 10),
      timetable: timetable.map((t) => ({
        period: t.period,
        startTime: t.startTime,
        endTime: t.endTime,
        subject: (t.subjectId as unknown as { name?: string })?.name ?? 'Unknown',
        room: t.room ?? '',
      })),
      homeworkDue: homeworkDue.map((h) => ({
        title: h.title,
        subject: (h.subjectId as unknown as { name?: string })?.name ?? 'Unknown',
        totalMarks: h.totalMarks,
      })),
      upcomingAssessments: upcomingAssessments.map((a) => ({
        name: a.name,
        subject: (a.subjectId as unknown as { name?: string })?.name ?? 'Unknown',
        type: a.type,
        date: a.date,
        totalMarks: a.totalMarks,
      })),
      events: events.map((e) => ({
        title: e.title,
        date: e.date,
        startTime: e.startTime,
        venue: e.venue ?? '',
      })),
      walletBalance: wallet?.balance ?? 0,
    };
  }

  static async generateEveningDigest(schoolId: string, studentId: string) {
    const student = await resolveStudent(schoolId, studentId);
    const userObj = student.userId as unknown as { firstName?: string; lastName?: string };
    const studentName = `${userObj?.firstName ?? ''} ${userObj?.lastName ?? ''}`.trim();
    const { start: todayStart, end: todayEnd } = todayRange();
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    // 1. Today's attendance
    const attendance = await Attendance.find({
      studentId: studentObjId,
      schoolId,
      date: { $gte: todayStart, $lt: todayEnd },
      isDeleted: false,
    }).lean();

    // 2. Homework assigned today
    const homeworkAssigned = await Homework.find({
      classId: student.classId,
      schoolId,
      createdAt: { $gte: todayStart, $lt: todayEnd },
      isDeleted: false,
    }).populate('subjectId', 'name').lean();

    // 3. Discipline/merit incidents today
    const disciplineToday = await Discipline.find({
      studentId: studentObjId,
      schoolId,
      createdAt: { $gte: todayStart, $lt: todayEnd },
      isDeleted: false,
    }).lean();

    const meritsToday = await Merit.find({
      studentId: studentObjId,
      schoolId,
      createdAt: { $gte: todayStart, $lt: todayEnd },
      isDeleted: false,
    }).lean();

    // 4. Tuck shop spending today
    const wallet = await Wallet.findOne({
      studentId: studentObjId,
      schoolId,
      isDeleted: false,
    }).lean();

    let tuckshopSpending = 0;
    if (wallet) {
      const transactions = await WalletTransaction.find({
        walletId: wallet._id,
        type: 'purchase',
        createdAt: { $gte: todayStart, $lt: todayEnd },
        isDeleted: false,
      }).lean();
      tuckshopSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    return {
      studentName,
      date: todayStart.toISOString().slice(0, 10),
      attendance: attendance.map((a) => ({
        period: a.period,
        status: a.status,
        notes: a.notes ?? '',
      })),
      homeworkAssigned: homeworkAssigned.map((h) => ({
        title: h.title,
        subject: (h.subjectId as unknown as { name?: string })?.name ?? 'Unknown',
        dueDate: h.dueDate,
        totalMarks: h.totalMarks,
      })),
      incidents: [
        ...disciplineToday.map((d) => ({
          type: 'discipline' as const,
          category: d.type,
          severity: d.severity,
          description: d.description,
        })),
        ...meritsToday.map((m) => ({
          type: m.type as 'merit' | 'demerit',
          category: m.category,
          points: m.points,
          reason: m.reason,
        })),
      ],
      tuckshopSpending,
    };
  }

  static async generateWeeklyDigest(schoolId: string, studentId: string) {
    const student = await resolveStudent(schoolId, studentId);
    const userObj = student.userId as unknown as { firstName?: string; lastName?: string };
    const studentName = `${userObj?.firstName ?? ''} ${userObj?.lastName ?? ''}`.trim();
    const { start: weekStart, end: weekEnd } = weekRange();
    const { start: nextStart, end: nextEnd } = nextWeekRange();
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    // 1. Attendance summary for the week
    const weekAttendance = await Attendance.find({
      studentId: studentObjId,
      schoolId,
      date: { $gte: weekStart, $lt: weekEnd },
      isDeleted: false,
    }).lean();

    const attendanceSummary = {
      present: weekAttendance.filter((a) => a.status === 'present').length,
      absent: weekAttendance.filter((a) => a.status === 'absent').length,
      late: weekAttendance.filter((a) => a.status === 'late').length,
      excused: weekAttendance.filter((a) => a.status === 'excused').length,
    };

    // 2. Homework completion rate
    const weekHomework = await Homework.find({
      classId: student.classId,
      schoolId,
      dueDate: { $gte: weekStart, $lt: weekEnd },
      isDeleted: false,
    }).lean();

    const homeworkIds = weekHomework.map((h) => h._id);
    const submissions = await HomeworkSubmission.find({
      homeworkId: { $in: homeworkIds },
      studentId: studentObjId,
      isDeleted: false,
    }).lean();

    const homeworkCompletion = {
      total: weekHomework.length,
      submitted: submissions.length,
      rate: weekHomework.length > 0 ? Math.round((submissions.length / weekHomework.length) * 100) : 100,
    };

    // 3. Marks received this week
    const weekMarks = await Mark.find({
      studentId: studentObjId,
      schoolId,
      createdAt: { $gte: weekStart, $lt: weekEnd },
      isDeleted: false,
    }).populate('assessmentId', 'name subjectId').lean();

    // 4. Next week's assessments
    const nextWeekAssessments = await Assessment.find({
      classId: student.classId,
      schoolId,
      date: { $gte: nextStart, $lt: nextEnd },
      isDeleted: false,
    }).populate('subjectId', 'name').lean();

    return {
      studentName,
      weekOf: weekStart.toISOString().slice(0, 10),
      attendanceSummary,
      homeworkCompletion,
      marksReceived: weekMarks.map((m) => ({
        mark: m.mark,
        total: m.total,
        percentage: m.percentage,
        assessment: (m.assessmentId as unknown as { name?: string })?.name ?? 'Unknown',
      })),
      nextWeekAssessments: nextWeekAssessments.map((a) => ({
        name: a.name,
        subject: (a.subjectId as unknown as { name?: string })?.name ?? 'Unknown',
        type: a.type,
        date: a.date,
        totalMarks: a.totalMarks,
      })),
    };
  }
}
