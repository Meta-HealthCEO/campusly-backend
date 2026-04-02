import { StudentLevel, IStudentLevel } from './model-gamification.js';
import { Achievement } from './model.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { NotFoundError } from '../../common/errors.js';
import {
  BADGE_DEFINITIONS,
  getLevelForXP,
  getBadgeById,
} from './achiever-badges.js';
import mongoose from 'mongoose';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isConsecutiveDay(prev: Date, current: Date): boolean {
  const next = new Date(prev);
  next.setDate(next.getDate() + 1);
  return isSameDay(next, current);
}

// ─── Service ────────────────────────────────────────────────────────────────

export class GamificationService {
  /** Get or create a StudentLevel record. */
  static async getStudentLevel(
    schoolId: string,
    studentId: string,
  ): Promise<IStudentLevel> {
    const existing = await StudentLevel.findOne({
      schoolId,
      studentId,
      isDeleted: false,
    })
      .populate('studentId')
      .lean();

    if (existing) return existing;

    const created = await StudentLevel.findOneAndUpdate(
      { schoolId, studentId },
      {
        $setOnInsert: {
          schoolId,
          studentId,
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          badges: [],
          isDeleted: false,
        },
      },
      { upsert: true, new: true },
    )
      .populate('studentId')
      .lean();

    if (!created) throw new NotFoundError('Failed to create student level');
    return created;
  }

  /** Award XP to a student — recalculates level and updates streak. */
  static async awardXP(
    schoolId: string,
    studentId: string,
    xpAmount: number,
    _reason: string,
  ): Promise<IStudentLevel> {
    const record = await StudentLevel.findOne({
      schoolId,
      studentId,
      isDeleted: false,
    });

    const now = new Date();
    let doc = record;

    if (!doc) {
      doc = new StudentLevel({
        schoolId,
        studentId,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
    }

    // Update XP
    doc.xp += xpAmount;
    doc.level = getLevelForXP(doc.xp);

    // Update streak
    if (doc.lastActivityDate) {
      if (isConsecutiveDay(doc.lastActivityDate, now)) {
        doc.currentStreak += 1;
      } else if (!isSameDay(doc.lastActivityDate, now)) {
        doc.currentStreak = 1;
      }
    } else {
      doc.currentStreak = 1;
    }

    if (doc.currentStreak > doc.longestStreak) {
      doc.longestStreak = doc.currentStreak;
    }

    doc.lastActivityDate = now;
    await doc.save();
    return doc.toObject();
  }

  /** Award a badge if not already earned. Also adds the badge XP reward. */
  static async awardBadge(
    schoolId: string,
    studentId: string,
    badgeId: string,
  ): Promise<{ awarded: boolean; studentLevel: IStudentLevel }> {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new NotFoundError('Badge definition not found');

    let doc = await StudentLevel.findOne({
      schoolId,
      studentId,
      isDeleted: false,
    });

    if (!doc) {
      doc = new StudentLevel({
        schoolId,
        studentId,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
    }

    // Check if badge already earned
    const alreadyEarned = doc.badges.some((b) => b.badgeId === badgeId);
    if (alreadyEarned) {
      return { awarded: false, studentLevel: doc.toObject() };
    }

    // Award badge + XP
    doc.badges.push({
      badgeId: badge.id,
      name: badge.name,
      icon: badge.icon,
      earnedAt: new Date(),
      category: badge.category,
    });

    doc.xp += badge.xpReward;
    doc.level = getLevelForXP(doc.xp);
    await doc.save();

    return { awarded: true, studentLevel: doc.toObject() };
  }

  /** Check all badge criteria and award any newly qualified badges. */
  static async checkAndAwardBadges(
    schoolId: string,
    studentId: string,
  ): Promise<string[]> {
    const awarded: string[] = [];

    // Get current level data
    let doc = await StudentLevel.findOne({
      schoolId,
      studentId,
      isDeleted: false,
    });
    if (!doc) {
      doc = new StudentLevel({
        schoolId,
        studentId,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
      await doc.save();
    }

    const earnedIds = new Set(doc.badges.map((b) => b.badgeId));

    // Check: first_merit — at least 1 achievement with type 'behaviour'
    if (!earnedIds.has('first_merit')) {
      const count = await Achievement.countDocuments({
        schoolId,
        studentId,
        type: 'behaviour',
        isDeleted: false,
      });
      if (count >= 1) {
        const result = await GamificationService.awardBadge(schoolId, studentId, 'first_merit');
        if (result.awarded) awarded.push('first_merit');
      }
    }

    // Check: homework_hero — 10 on-time submissions
    if (!earnedIds.has('homework_hero')) {
      const count = await HomeworkSubmission.countDocuments({
        studentId: new mongoose.Types.ObjectId(studentId),
        isLate: false,
        isDeleted: false,
      });
      if (count >= 10) {
        const result = await GamificationService.awardBadge(schoolId, studentId, 'homework_hero');
        if (result.awarded) awarded.push('homework_hero');
      }
    }

    // Check: streak_7
    if (!earnedIds.has('streak_7') && doc.longestStreak >= 7) {
      const result = await GamificationService.awardBadge(schoolId, studentId, 'streak_7');
      if (result.awarded) awarded.push('streak_7');
    }

    // Check: streak_30
    if (!earnedIds.has('streak_30') && doc.longestStreak >= 30) {
      const result = await GamificationService.awardBadge(schoolId, studentId, 'streak_30');
      if (result.awarded) awarded.push('streak_30');
    }

    return awarded;
  }

  /** Get leaderboard — top students by XP. */
  static async getLeaderboard(
    schoolId: string,
    options: { gradeId?: string; classId?: string; limit?: number },
  ): Promise<IStudentLevel[]> {
    const limit = Math.min(options.limit ?? 10, 50);

    const matchStage: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      { $sort: { xp: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: false } },
    ];

    // Filter by classId if provided
    if (options.classId) {
      pipeline.push({
        $match: {
          'student.classId': new mongoose.Types.ObjectId(options.classId),
        },
      });
    }

    // Filter by gradeId if provided
    if (options.gradeId) {
      pipeline.push({
        $match: {
          'student.gradeId': new mongoose.Types.ObjectId(options.gradeId),
        },
      });
    }

    // Lookup the student's user to get names
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'studentUser',
        },
      },
      { $unwind: { path: '$studentUser', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          schoolId: 1,
          studentId: 1,
          xp: 1,
          level: 1,
          currentStreak: 1,
          longestStreak: 1,
          badges: 1,
          'student._id': 1,
          'student.classId': 1,
          'student.gradeId': 1,
          'studentUser.firstName': 1,
          'studentUser.lastName': 1,
        },
      },
    );

    return StudentLevel.aggregate(pipeline);
  }

  /** Return all badge definitions. */
  static getBadgeDefinitions(): typeof BADGE_DEFINITIONS {
    return BADGE_DEFINITIONS;
  }

  /** Return earned badges for a student. */
  static async getStudentBadges(
    schoolId: string,
    studentId: string,
  ): Promise<IStudentLevel['badges']> {
    const doc = await StudentLevel.findOne({
      schoolId,
      studentId,
      isDeleted: false,
    }).lean();

    return doc?.badges ?? [];
  }
}
