import mongoose from 'mongoose';
import { MessageThread, Message } from './model.js';
import type { IMessageThread, IMessage } from './model.js';
import { Student } from '../Student/model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { resolveUserInfo, verifyParentOwnsStudent, notify } from './helpers.js';
import type { CreateThreadInput, SendMessageInput } from './validation.js';

// ─── Service ───────────────────────────────────────────────────────────────

export class MessagingService {
  static async createThread(
    userId: string,
    userRole: string,
    schoolId: string,
    input: CreateThreadInput,
  ): Promise<{ thread: IMessageThread; message: IMessage }> {
    const { recipientId, studentId, subject, message: content } = input;

    // Verify student exists in this school
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false });
    if (!student) throw new NotFoundError('Student not found in this school');

    const sender = await resolveUserInfo(userId, schoolId);
    const recipient = await resolveUserInfo(recipientId, schoolId);

    if (userRole === 'teacher') {
      const { AcademicService } = await import('../Academic/service.js');
      const canAccess = await AcademicService.teacherCanAccessClass(
        userId,
        student.classId.toString(),
        schoolId,
      );
      if (!canAccess) {
        throw new ForbiddenError('You can only message parents for learners in your classes');
      }
    }

    // If sender is parent, verify they own this child
    if (sender.role === 'parent') {
      await verifyParentOwnsStudent(userId, studentId, schoolId);
    }
    // If recipient is parent, verify they own this child
    if (recipient.role === 'parent') {
      await verifyParentOwnsStudent(recipientId, studentId, schoolId);
    }

    // Ensure one is teacher, one is parent
    if (sender.role === recipient.role) {
      throw new BadRequestError('Threads must be between a teacher and a parent');
    }

    // Check for existing open thread between these two about this student
    const existing = await MessageThread.findOne({
      schoolId,
      studentId,
      'participants.userId': {
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(recipientId),
        ],
      },
      isClosed: false,
      isDeleted: false,
    });

    if (existing) {
      const msg = await MessagingService.sendMessage(
        userId, userRole, schoolId, { content }, String(existing._id),
      );
      return { thread: existing, message: msg };
    }

    // Create new thread
    const preview = content.slice(0, 100);
    const unreadCount = new Map<string, number>();
    unreadCount.set(recipientId, 1);
    unreadCount.set(userId, 0);

    const thread = await MessageThread.create({
      schoolId,
      studentId,
      participants: [
        { userId, role: sender.role, name: sender.name },
        { userId: recipientId, role: recipient.role, name: recipient.name },
      ],
      subject: subject ?? '',
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
      unreadCount,
    });

    const msg = await Message.create({
      threadId: thread._id,
      schoolId,
      senderId: userId,
      senderRole: sender.role,
      senderName: sender.name,
      content,
    });

    const tid = String(thread._id);
    await notify(recipientId, schoolId, 'New Message', `${sender.name} sent you a message`, tid);

    return { thread, message: msg };
  }

  static async sendMessage(
    userId: string,
    userRole: string,
    schoolId: string,
    input: SendMessageInput,
    threadId: string,
  ): Promise<IMessage> {
    const thread = await MessageThread.findOne({
      _id: threadId, schoolId, isDeleted: false,
    });
    if (!thread) throw new NotFoundError('Thread not found');

    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === userId,
    );
    if (!isParticipant) throw new ForbiddenError('You are not a participant in this thread');
    if (thread.isClosed) throw new BadRequestError('This thread has been closed');

    const sender = await resolveUserInfo(userId, schoolId);

    const msg = await Message.create({
      threadId,
      schoolId,
      senderId: userId,
      senderRole: sender.role,
      senderName: sender.name,
      content: input.content,
    });

    // Update thread metadata + increment unread for others
    const incUpdates: Record<string, number> = {};
    for (const p of thread.participants) {
      if (p.userId.toString() !== userId) {
        incUpdates[`unreadCount.${p.userId.toString()}`] = 1;
      }
    }

    await MessageThread.updateOne(
      { _id: threadId },
      {
        $set: { lastMessageAt: new Date(), lastMessagePreview: input.content.slice(0, 100) },
        $inc: incUpdates,
      },
    );

    // Notify other participants
    for (const p of thread.participants) {
      if (p.userId.toString() !== userId) {
        await notify(
          p.userId.toString(), schoolId,
          'New Message', `${sender.name} sent a message`, threadId,
        );
      }
    }

    return msg;
  }

  static async listThreads(
    userId: string,
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<{
    threads: IMessageThread[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit: lim } = paginationHelper(page, limit);
    const pg = Math.max(page ?? 1, 1);

    const filter = {
      schoolId,
      'participants.userId': new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    const [threads, total] = await Promise.all([
      MessageThread.find(filter)
        .populate('studentId', 'admissionNumber')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(lim),
      MessageThread.countDocuments(filter),
    ]);

    return { threads, total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) };
  }

  static async getThread(
    threadId: string,
    userId: string,
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<{ thread: IMessageThread; messages: IMessage[]; total: number }> {
    const thread = await MessageThread.findOne({
      _id: threadId, schoolId, isDeleted: false,
    }).populate('studentId', 'admissionNumber');

    if (!thread) throw new NotFoundError('Thread not found');

    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === userId,
    );
    if (!isParticipant) throw new ForbiddenError('You are not a participant in this thread');

    const { skip, limit: lim } = paginationHelper(page, limit);
    const [messages, total] = await Promise.all([
      Message.find({ threadId, isDeleted: false })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(lim),
      Message.countDocuments({ threadId, isDeleted: false }),
    ]);

    return { thread, messages, total };
  }

  static async markAsRead(
    threadId: string,
    userId: string,
    schoolId: string,
  ): Promise<void> {
    const thread = await MessageThread.findOne({
      _id: threadId, schoolId, isDeleted: false,
    });
    if (!thread) throw new NotFoundError('Thread not found');

    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === userId,
    );
    if (!isParticipant) throw new ForbiddenError('You are not a participant in this thread');

    const oid = new mongoose.Types.ObjectId(userId);

    await Message.updateMany(
      {
        threadId,
        isDeleted: false,
        senderId: { $ne: oid },
        'readBy.userId': { $ne: oid },
      },
      { $push: { readBy: { userId: oid, readAt: new Date() } } },
    );

    await MessageThread.updateOne(
      { _id: threadId },
      { $set: { [`unreadCount.${userId}`]: 0 } },
    );
  }

  static async closeThread(
    threadId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ): Promise<IMessageThread> {
    if (userRole !== 'teacher' && userRole !== 'school_admin') {
      throw new ForbiddenError('Only teachers can close threads');
    }

    const thread = await MessageThread.findOneAndUpdate(
      {
        _id: threadId,
        schoolId,
        'participants.userId': new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      },
      { $set: { isClosed: true } },
      { new: true },
    );

    if (!thread) throw new NotFoundError('Thread not found');
    return thread;
  }

  static async getUnreadCount(
    userId: string,
    schoolId: string,
  ): Promise<{ totalUnread: number }> {
    const threads = await MessageThread.find({
      schoolId,
      'participants.userId': new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    }).select('unreadCount');

    let totalUnread = 0;
    for (const t of threads) {
      totalUnread += t.unreadCount.get(userId) ?? 0;
    }

    return { totalUnread };
  }
}
