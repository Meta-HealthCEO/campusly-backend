// src/common/audience.ts
//
// Who a post reaches: learners in some classes or grades and their parents
// (linked from either side: the parent lists the child, or the child lists
// the parent as a guardian), or everyone with a role. And the in-app
// notification that tells them.

import mongoose from 'mongoose';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { User } from '../modules/Auth/model.js';
import { Notification } from '../modules/Notification/model.js';
import { logger } from './logger.js';

type IdLike = string | mongoose.Types.ObjectId;
const oid = (id: IdLike) => new mongoose.Types.ObjectId(String(id));
const oids = (ids: IdLike[] = []) => ids.filter((id) => mongoose.Types.ObjectId.isValid(String(id))).map(oid);

/** A parent's children in this school, linked either way. */
export async function childrenOfParent(schoolId: IdLike, parentUserId: IdLike) {
  const parent = await Parent.findOne({ userId: oid(parentUserId), schoolId: oid(schoolId), isDeleted: false }).select('_id childrenIds').lean();
  if (!parent) return [];
  return Student.find({
    schoolId: oid(schoolId), isDeleted: false,
    $or: [{ _id: { $in: parent.childrenIds ?? [] } }, { guardianIds: parent._id }],
  }).select('_id userId classId gradeId').lean();
}

/** Distinct user ids of the learners in these classes/grades and/or their parents. */
export async function audienceUserIds(
  schoolId: IdLike,
  scope: { classIds?: IdLike[]; gradeIds?: IdLike[] },
  who: { learners: boolean; parents: boolean },
): Promise<string[]> {
  const or: Record<string, unknown>[] = [];
  if (scope.classIds?.length) or.push({ classId: { $in: oids(scope.classIds) } });
  if (scope.gradeIds?.length) or.push({ gradeId: { $in: oids(scope.gradeIds) } });
  if (or.length === 0) return [];
  const learners = await Student.find({ schoolId: oid(schoolId), isDeleted: false, $or: or }).select('_id userId guardianIds').lean();
  const ids = new Set<string>();
  if (who.learners) learners.forEach((l) => l.userId && ids.add(String(l.userId)));
  if (who.parents && learners.length > 0) {
    const parents = await Parent.find({
      schoolId: oid(schoolId), isDeleted: false,
      $or: [{ childrenIds: { $in: learners.map((l) => l._id) } }, { _id: { $in: learners.flatMap((l) => l.guardianIds ?? []) } }],
    }).select('userId').lean();
    parents.forEach((p) => p.userId && ids.add(String(p.userId)));
  }
  return [...ids];
}

/** Distinct user ids of everyone active in the school with one of these roles (older users may lack isActive: only an explicit false excludes). */
export async function roleUserIds(schoolId: IdLike, roles: string[]): Promise<string[]> {
  const users = await User.find({ schoolId: oid(schoolId), role: { $in: roles }, isDeleted: false, isActive: { $ne: false } }).select('_id').lean();
  return users.map((u) => String(u._id));
}

const NOTIFY_BATCH_SIZE = 1000;

/** One in-app notification per user, inserted in batches. Never fails the post that triggered it. */
export async function notifyUsers(
  schoolId: IdLike,
  userIds: string[],
  note: { title: string; message: string; data: Record<string, unknown> },
): Promise<void> {
  if (userIds.length === 0) return;
  try {
    for (let i = 0; i < userIds.length; i += NOTIFY_BATCH_SIZE) {
      const batch = userIds.slice(i, i + NOTIFY_BATCH_SIZE);
      await Notification.insertMany(batch.map((id) => ({
        recipientId: oid(id), schoolId: oid(schoolId), type: 'in_app', title: note.title, message: note.message, data: note.data,
      })), { ordered: false });
    }
  } catch (err: unknown) {
    logger.warn({ err, entity: note.data }, '[audience] notifications failed');
  }
}
