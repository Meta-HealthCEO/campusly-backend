import mongoose from 'mongoose';
import {
  MessageTemplate,
  type IMessageTemplate,
  BulkMessage,
  type IBulkMessage,
  MessageLog,
  type IMessageLog,
} from './model.js';
import { DeviceRegistration } from './delivery-model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { User } from '../Auth/model.js';
import { Class, Timetable } from '../Academic/model.js';
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';
import { PushService } from '../../services/push.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { logger } from '../../common/logger.js';
import { communicationQueue } from '../../jobs/queues.js';
import { MessageStatsService } from './message-stats-service.js';

export { MessageStatsService };

interface ListQuery {
  page?: number;
  limit?: number;
  channel?: string;
  category?: string;
  search?: string;
  isActive?: boolean;
  status?: string;
}

interface ViewerScope {
  userId: string;
  role: string;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  return { page, limit, skip: (page - 1) * limit };
}

async function getTeacherClassIds(schoolId: string, teacherId: string): Promise<string[]> {
  const [homeroomClassIds, subjectClassIds] = await Promise.all([
    Class.distinct('_id', { schoolId, teacherId, isDeleted: false }),
    Timetable.distinct('classId', { schoolId, teacherId, isDeleted: false }),
  ]);
  return [...new Set([...homeroomClassIds, ...subjectClassIds].map((id) => id.toString()))];
}

async function getTeacherParentUserIds(schoolId: string, teacherId: string): Promise<Set<string>> {
  const classIds = await getTeacherClassIds(schoolId, teacherId);
  if (classIds.length === 0) return new Set();

  const students = await Student.find({
    schoolId,
    classId: { $in: classIds },
    enrollmentStatus: 'active',
    isDeleted: false,
  }).select('guardianIds').lean();

  const guardianIds = [
    ...new Set(students.flatMap((student) => student.guardianIds.map((id) => id.toString()))),
  ];
  if (guardianIds.length === 0) return new Set();

  const parents = await Parent.find({
    _id: { $in: guardianIds },
    schoolId,
    isDeleted: false,
  }).select('userId').lean();

  return new Set(parents.map((parent) => parent.userId.toString()));
}

async function assertTeacherCanTargetRecipients(
  schoolId: string,
  teacherId: string,
  recipients: { type: string; targetIds?: string[] },
) {
  const targetIds = recipients.targetIds ?? [];
  if (recipients.type === 'school' || recipients.type === 'grade') {
    throw new ForbiddenError('Teachers can only message parents linked to their own classes');
  }

  if (recipients.type === 'class') {
    const classIds = new Set(await getTeacherClassIds(schoolId, teacherId));
    const unauthorized = targetIds.some((id) => !classIds.has(id));
    if (targetIds.length === 0 || unauthorized) {
      throw new ForbiddenError('You can only message classes you teach');
    }
    return;
  }

  if (recipients.type === 'custom') {
    const allowedParentUserIds = await getTeacherParentUserIds(schoolId, teacherId);
    const unauthorized = targetIds.some((id) => !allowedParentUserIds.has(id));
    if (targetIds.length === 0 || unauthorized) {
      throw new ForbiddenError('You can only message parents linked to learners in your classes');
    }
    return;
  }

  throw new BadRequestError('Unsupported recipient target');
}

// ─── Recipient Resolution ────────────────────────────────────────────────────

async function resolveRecipientIds(
  schoolId: string,
  recipients: { type: string; targetIds?: string[] },
): Promise<string[]> {
  const schoolObjId = new mongoose.Types.ObjectId(schoolId);
  let userIds: mongoose.Types.ObjectId[] = [];

  if (recipients.type === 'school') {
    const students = await Student.find({ schoolId: schoolObjId, enrollmentStatus: 'active', isDeleted: false }).select('guardianIds').lean();
    const guardians = students.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardians }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'grade') {
    const students = await Student.find({ schoolId: schoolObjId, gradeId: { $in: recipients.targetIds }, enrollmentStatus: 'active', isDeleted: false }).select('guardianIds').lean();
    const guardians = students.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardians }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'class') {
    const students = await Student.find({ schoolId: schoolObjId, classId: { $in: recipients.targetIds }, enrollmentStatus: 'active', isDeleted: false }).select('guardianIds').lean();
    const guardians = students.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardians }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'custom') {
    const targetUserIds = (recipients.targetIds ?? []).map((id) => new mongoose.Types.ObjectId(id));
    const parents = await Parent.find({
      schoolId: schoolObjId,
      userId: { $in: targetUserIds },
      isDeleted: false,
    }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  }

  return [...new Set(userIds.map((id) => id.toString()))];
}

// ─── Per-Recipient Dispatch ───────────────────────────────────────────────────

export async function dispatchSingleLog(
  log: IMessageLog,
  meta: { subject: string; body: string },
): Promise<void> {
  const userRecord = await User.findOne({ _id: log.recipientId, isDeleted: false }).select('_id email phone').lean();
  const channel = log.channel;
  let ok = false;
  let errorMsg: string | undefined;

  try {
    if (channel === 'email' || channel === 'all') {
      if (!userRecord?.email) throw new Error('Recipient has no email address');
      const result = await EmailService.sendEmail(userRecord.email, meta.subject, meta.body);
      if (!result.success) throw new Error('EmailService returned failure');
      ok = true;
    } else if (channel === 'sms') {
      if (!userRecord?.phone) throw new Error('Recipient has no phone number');
      const result = await SmsService.sendSms(userRecord.phone, meta.body);
      if (!result.success) throw new Error('SmsService returned failure');
      ok = true;
    } else if (channel === 'push') {
      const devices = await DeviceRegistration.find({ userId: log.recipientId, isActive: true }).select('deviceToken').lean();
      const tokens = devices.map((d) => d.deviceToken);
      if (tokens.length === 0) throw new Error('Recipient has no registered device tokens');
      const result = await PushService.sendPushBatch(tokens, meta.subject, meta.body);
      if (!result.success && (result.failedTokens?.length ?? 0) >= tokens.length) {
        throw new Error('All push tokens failed');
      }
      ok = true;
    } else if (channel === 'whatsapp') {
      logger.warn({ recipientId: log.recipientId.toString(), channel }, '[Comm] WhatsApp not configured; skipping');
      throw new Error('WhatsApp delivery is not yet configured');
    } else {
      throw new Error(`Unknown channel: ${channel}`);
    }
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Unknown delivery error';
    logger.warn({ recipientId: log.recipientId.toString(), channel, err: errorMsg }, '[Comm] Delivery failed');
  }

  if (ok) {
    await MessageLog.findByIdAndUpdate(log._id, { $set: { status: 'sent', sentAt: new Date(), error: undefined } });
    return;
  }

  const retryCount = log.retryCount ?? 0;
  if (retryCount < 3) {
    const delays = [60_000, 300_000, 1_800_000];
    await communicationQueue.add('retry-delivery', { logId: log._id.toString() }, { delay: delays[retryCount] });
    await MessageLog.findByIdAndUpdate(log._id, { $set: { status: 'retrying', error: errorMsg } });
  } else {
    await MessageLog.findByIdAndUpdate(log._id, { $set: { status: 'failed', error: errorMsg } });
  }
}

// ─── Execute Bulk Message ─────────────────────────────────────────────────────

export async function executeBulkMessage(bulkId: string): Promise<void> {
  const bulk = await BulkMessage.findById(bulkId);
  if (!bulk || bulk.isDeleted) {
    logger.warn({ bulkId }, '[Comm] executeBulkMessage: not found or deleted');
    return;
  }
  bulk.status = 'sending';
  await bulk.save();

  const logs = await MessageLog.find({ bulkMessageId: bulk._id, isDeleted: false });
  const meta = { subject: bulk.subject, body: bulk.body };
  for (const log of logs) {
    await dispatchSingleLog(log, meta);
  }

  const [sentCount, failedCount] = await Promise.all([
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: { $in: ['sent', 'delivered'] } }),
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: 'failed' }),
  ]);

  bulk.status = sentCount > 0 && failedCount === 0 ? 'sent' : sentCount > 0 ? 'partial' : 'failed';
  bulk.delivered = sentCount;
  bulk.failed = failedCount;
  bulk.sentAt = new Date();
  await bulk.save();
}

// ─── Communication Module Service ────────────────────────────────────────────

export class CommunicationModuleService {
  // ─── Templates ─────────────────────────────────────────────────────────────

  static async createTemplate(data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    return new MessageTemplate(data).save();
  }

  static async listTemplates(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.channel) filter.channel = query.channel;
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { body: { $regex: escaped, $options: 'i' } }];
    }
    const [data, total] = await Promise.all([
      MessageTemplate.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      MessageTemplate.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTemplateById(id: string, schoolId: string): Promise<IMessageTemplate> {
    const t = await MessageTemplate.findOne({ _id: id, schoolId, isDeleted: false });
    if (!t) throw new NotFoundError('Template not found');
    return t;
  }

  static async updateTemplate(id: string, schoolId: string, data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    const t = await MessageTemplate.findOneAndUpdate({ _id: id, schoolId, isDeleted: false }, { $set: data }, { new: true, runValidators: true });
    if (!t) throw new NotFoundError('Template not found');
    return t;
  }

  static async deleteTemplate(id: string, schoolId: string, createdBy?: string): Promise<IMessageTemplate> {
    const filter: Record<string, unknown> = { _id: id, schoolId, isDeleted: false };
    if (createdBy) filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    const t = await MessageTemplate.findOneAndUpdate(filter, { $set: { isDeleted: true } }, { new: true });
    if (!t) throw new NotFoundError('Template not found');
    return t;
  }

  // ─── Bulk Messages ──────────────────────────────────────────────────────────

  static async sendBulkMessage(
    data: { schoolId: string; templateId?: string; subject: string; body: string; channel?: string; recipients: { type: string; targetIds?: string[] } },
    sentBy: string,
    actorRole = 'school_admin',
  ): Promise<IBulkMessage> {
    if (actorRole === 'teacher') {
      await assertTeacherCanTargetRecipients(data.schoolId, sentBy, data.recipients);
    }
    const uniqueIds = await resolveRecipientIds(data.schoolId, data.recipients);
    if (uniqueIds.length === 0) {
      throw new BadRequestError('No valid parent recipients found');
    }
    const channel = data.channel ?? 'all';
    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId, templateId: data.templateId, subject: data.subject, body: data.body,
      channel, sentBy, recipients: data.recipients, totalRecipients: uniqueIds.length, status: 'sending', sentAt: new Date(),
    });
    await bulkMessage.save();
    const logDocs = uniqueIds.map((userId) => ({ bulkMessageId: bulkMessage._id, recipientId: new mongoose.Types.ObjectId(userId), channel, status: 'queued' as const, retryCount: 0 }));
    await MessageLog.insertMany(logDocs);
    await executeBulkMessage(bulkMessage._id.toString());
    return BulkMessage.findById(bulkMessage._id) as Promise<IBulkMessage>;
  }

  static async listMessages(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;
    const [data, total] = await Promise.all([
      BulkMessage.find(filter).populate('sentBy', 'firstName lastName email').populate('templateId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
      BulkMessage.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async listMessagesForViewer(schoolId: string, query: ListQuery, viewer: ViewerScope) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;
    if (viewer.role === 'teacher') filter.sentBy = new mongoose.Types.ObjectId(viewer.userId);
    const [data, total] = await Promise.all([
      BulkMessage.find(filter).populate('sentBy', 'firstName lastName email').populate('templateId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
      BulkMessage.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getMessageById(id: string, schoolId: string): Promise<IBulkMessage> {
    const m = await BulkMessage.findOne({ _id: id, schoolId, isDeleted: false }).populate('sentBy', 'firstName lastName email').populate('templateId', 'name');
    if (!m) throw new NotFoundError('Message not found');
    return m;
  }

  // ─── Scheduling ────────────────────────────────────────────────────────────

  static async scheduleMessage(
    data: { schoolId: string; templateId?: string; subject: string; body: string; channel?: string; recipients: { type: string; targetIds?: string[] }; scheduledFor: string },
    sentBy: string,
    actorRole = 'school_admin',
  ): Promise<IBulkMessage> {
    const scheduledDate = new Date(data.scheduledFor);
    if (scheduledDate <= new Date()) throw new BadRequestError('Scheduled date must be in the future');
    if (actorRole === 'teacher') {
      await assertTeacherCanTargetRecipients(data.schoolId, sentBy, data.recipients);
    }
    const uniqueIds = await resolveRecipientIds(data.schoolId, data.recipients);
    if (uniqueIds.length === 0) {
      throw new BadRequestError('No valid parent recipients found');
    }
    const channel = data.channel ?? 'all';
    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId, templateId: data.templateId, subject: data.subject, body: data.body,
      channel, sentBy, recipients: data.recipients, totalRecipients: uniqueIds.length,
      status: 'scheduled', scheduledFor: scheduledDate,
    });
    await bulkMessage.save();
    const logDocs = uniqueIds.map((userId) => ({ bulkMessageId: bulkMessage._id, recipientId: new mongoose.Types.ObjectId(userId), channel, status: 'queued' as const, retryCount: 0 }));
    if (logDocs.length > 0) await MessageLog.insertMany(logDocs);
    await communicationQueue.add('send-scheduled', { bulkId: bulkMessage._id.toString() }, { delay: scheduledDate.getTime() - Date.now() });
    return bulkMessage;
  }

  static async cancelScheduledMessage(id: string, schoolId: string, userId: string): Promise<IBulkMessage> {
    const bulk = await BulkMessage.findOne({ _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false });
    if (!bulk) throw new NotFoundError('Scheduled message not found');
    if (bulk.status !== 'scheduled') throw new BadRequestError('Only scheduled messages can be cancelled');
    if (bulk.sentBy.toString() !== userId) throw new BadRequestError('Only the teacher who scheduled it can cancel');
    bulk.status = 'cancelled';
    bulk.isDeleted = true;
    await bulk.save();
    await MessageLog.updateMany({ bulkMessageId: bulk._id }, { $set: { isDeleted: true } });
    logger.info({ bulkId: id }, '[Comm] Scheduled message cancelled — BullMQ job will no-op on wake-up');
    return bulk.toObject() as IBulkMessage;
  }

  // ─── Delegate to MessageStatsService ──────────────────────────────────────

  static markMessageRead = MessageStatsService.markMessageRead.bind(MessageStatsService);
  static getReadReceipts = MessageStatsService.getReadReceipts.bind(MessageStatsService);
  static getReadReceiptStats = MessageStatsService.getReadReceiptStats.bind(MessageStatsService);
  static getDeliveryStats = MessageStatsService.getDeliveryStats.bind(MessageStatsService);
  static getMessageLogs = MessageStatsService.getMessageLogs.bind(MessageStatsService);
}
