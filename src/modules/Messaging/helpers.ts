import mongoose from 'mongoose';
import { Parent } from '../Parent/model.js';
import { Student } from '../Student/model.js';
import { Notification } from '../Notification/model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';

export interface UserInfo {
  name: string;
  role: 'teacher' | 'parent';
}

export async function resolveUserInfo(userId: string, schoolId: string): Promise<UserInfo> {
  const User = mongoose.model('User');
  const user = await User.findOne({ _id: userId }).select('firstName lastName role');
  if (!user) throw new NotFoundError('User not found');

  const raw = user as unknown as { firstName?: string; lastName?: string; role: string };
  if (raw.role !== 'teacher' && raw.role !== 'parent' && raw.role !== 'school_admin') {
    throw new BadRequestError('User must be a teacher or parent');
  }

  // Verify same school for parents
  if (raw.role === 'parent') {
    const parent = await Parent.findOne({ userId, schoolId, isDeleted: false });
    if (!parent) throw new NotFoundError('Parent not found in this school');
  }

  const name = `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() || 'Unknown';
  const role: 'teacher' | 'parent' = raw.role === 'parent' ? 'parent' : 'teacher';
  return { name, role };
}

export async function verifyParentOwnsStudent(
  parentUserId: string,
  studentId: string,
  schoolId: string,
): Promise<void> {
  const parent = await Parent.findOne({ userId: parentUserId, schoolId, isDeleted: false });
  if (!parent) throw new NotFoundError('Parent record not found');

  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false });
  if (!student) throw new NotFoundError('Student not found');

  const owns = parent.childrenIds.some((cid) => cid.toString() === studentId);
  if (!owns) throw new ForbiddenError('You can only message about your own children');
}

export async function notify(
  recipientUserId: string,
  schoolId: string,
  title: string,
  message: string,
  threadId: string,
): Promise<void> {
  try {
    await Notification.create({
      recipientId: recipientUserId,
      schoolId,
      type: 'in_app',
      title,
      message,
      data: { entityId: threadId, entityType: 'message_thread' },
    });
  } catch {
    // Non-critical — don't fail the main operation
  }
}
