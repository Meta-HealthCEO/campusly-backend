// src/modules/Notification/learner-notices.ts
//
// In-app notices to learners about new and marked work (spec §6). They reach
// everyone in a group — their own group or a group they joined — and never
// throw: a notice that fails must not undo the teacher's action.
import mongoose from 'mongoose';
import { Notification } from './model.js';
import { Student } from '../Student/model.js';
import { audienceUserIds, notifyUsers } from '../../common/audience.js';
import { logger } from '../../common/logger.js';

type IdLike = string | mongoose.Types.ObjectId;

export interface LearnerNotice {
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  /** Where the web app opens it (NotificationItem follows data.link). */
  link: string;
}

const SAST_DAY = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'long', timeZone: 'Africa/Johannesburg' });

/** "1 October" — the day in South Africa. */
export function dueLabel(date: Date): string {
  return SAST_DAY.format(date);
}

const dataOf = (n: LearnerNotice) => ({ entityType: n.entityType, entityId: n.entityId, link: n.link });

export async function notifyClassLearners(schoolId: IdLike, classIds: IdLike[], notice: LearnerNotice): Promise<void> {
  if (classIds.length === 0) return;
  try {
    const learners = await audienceUserIds(schoolId, { classIds }, { learners: true, parents: false });
    await notifyUsers(schoolId, learners, { title: notice.title, message: notice.message, data: dataOf(notice) });
  } catch (err: unknown) {
    logger.warn({ err, entityType: notice.entityType, entityId: notice.entityId }, '[learner-notices] class notice failed');
  }
}

export async function notifyLearnerOnce(schoolId: IdLike, studentId: IdLike, notice: LearnerNotice): Promise<void> {
  try {
    const school = new mongoose.Types.ObjectId(String(schoolId));
    const student = await Student.findOne({ _id: studentId, schoolId: school, isDeleted: false }).select('userId').lean();
    if (!student?.userId) return;
    const told = await Notification.exists({
      recipientId: student.userId, schoolId: school, isDeleted: false,
      'data.entityType': notice.entityType, 'data.entityId': notice.entityId,
    });
    if (told) return;
    await notifyUsers(school, [String(student.userId)], { title: notice.title, message: notice.message, data: dataOf(notice) });
  } catch (err: unknown) {
    logger.warn({ err, entityType: notice.entityType, entityId: notice.entityId }, '[learner-notices] learner notice failed');
  }
}
