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
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';
import { PushService } from '../../services/push.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { logger } from '../../common/logger.js';
import { communicationQueue } from '../../jobs/queues.js';

interface ListQuery {
  page?: number;
  limit?: number;
  channel?: string;
  category?: string;
  search?: string;
  isActive?: boolean;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────

async function resolveRecipientIds(
  schoolId: string,
  recipients: { type: string; targetIds?: string[] },
): Promise<string[]> {
  const schoolObjId = new mongoose.Types.ObjectId(schoolId);
  let userIds: mongoose.Types.ObjectId[] = [];

  if (recipients.type === 'school') {
    const activeStudents = await Student.find({
      schoolId: schoolObjId, enrollmentStatus: 'active', isDeleted: false,
    }).select('guardianIds').lean();
    const guardianIds = activeStudents.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardianIds }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'grade') {
    const students = await Student.find({
      schoolId: schoolObjId, gradeId: { $in: recipients.targetIds }, enrollmentStatus: 'active', isDeleted: false,
    }).select('guardianIds').lean();
    const guardianIds = students.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardianIds }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'class') {
    const students = await Student.find({
      schoolId: schoolObjId, classId: { $in: recipients.targetIds }, enrollmentStatus: 'active', isDeleted: false,
    }).select('guardianIds').lean();
    const guardianIds = students.flatMap((s) => s.guardianIds);
    const parents = await Parent.find({ _id: { $in: guardianIds }, isDeleted: false }).select('userId').lean();
    userIds = parents.map((p) => p.userId);
  } else if (recipients.type === 'custom') {
    userIds = (recipients.targetIds ?? []).map((id) => new mongoose.Types.ObjectId(id));
  }

  return [...new Set(userIds.map((id) => id.toString()))];
}

// ─── Per-Recipient Dispatch ───────────────────────────────────────────────────

export async function dispatchSingleLog(
  log: IMessageLog,
  meta: { subject: string; body: string },
): Promise<void> {
  const userRecord = await User.findOne({
    _id: log.recipientId,
    isDeleted: false,
  }).select('_id email phone').lean();

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
      const devices = await DeviceRegistration.find({
        userId: log.recipientId,
        isActive: true,
      }).select('deviceToken').lean();
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
    logger.warn({ recipientId: log.recipientId.toString(), channel, err: errorMsg }, '[Comm] Delivery failed for recipient');
  }

  if (ok) {
    await MessageLog.findByIdAndUpdate(log._id, {
      $set: { status: 'sent', sentAt: new Date(), error: undefined },
    });
  } else {
    const retryCount = log.retryCount ?? 0;
    if (retryCount < 3) {
      const delays = [60_000, 300_000, 1_800_000];
      await communicationQueue.add(
        'retry-delivery',
        { logId: log._id.toString() },
        { delay: delays[retryCount] },
      );
      await MessageLog.findByIdAndUpdate(log._id, {
        $set: { status: 'retrying', error: errorMsg },
      });
    } else {
      await MessageLog.findByIdAndUpdate(log._id, {
        $set: { status: 'failed', error: errorMsg },
      });
    }
  }
}

// ─── Execute Bulk Message ─────────────────────────────────────────────────────

export async function executeBulkMessage(bulkId: string): Promise<void> {
  const bulk = await BulkMessage.findById(bulkId);
  if (!bulk || bulk.isDeleted) {
    logger.warn({ bulkId }, '[Comm] executeBulkMessage: bulk message not found or deleted');
    return;
  }

  bulk.status = 'sending';
  await bulk.save();

  const logs = await MessageLog.find({ bulkMessageId: bulk._id, isDeleted: false });

  const meta = { subject: bulk.subject, body: bulk.body };
  for (const log of logs) {
    await dispatchSingleLog(log, meta);
  }

  // Re-count from DB to get accurate sent/failed totals
  const [sentCount, failedCount] = await Promise.all([
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: { $in: ['sent', 'delivered'] } }),
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: 'failed' }),
  ]);

  let finalStatus: IBulkMessage['status'];
  if (sentCount > 0 && failedCount === 0) {
    finalStatus = 'sent';
  } else if (sentCount > 0) {
    finalStatus = 'partial';
  } else {
    finalStatus = 'failed';
  }

  bulk.status = finalStatus;
  bulk.delivered = sentCount;
  bulk.failed = failedCount;
  bulk.sentAt = new Date();
  await bulk.save();
}

export class CommunicationModuleService {
  // ─── Template CRUD ────────────────────────────────────────────────────────

  static async createTemplate(data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    const template = new MessageTemplate(data);
    return template.save();
  }

  static async listTemplates(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.channel) filter.channel = query.channel;
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { body: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      MessageTemplate.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      MessageTemplate.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTemplateById(id: string, schoolId: string): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOne({ _id: id, schoolId, isDeleted: false });
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  static async updateTemplate(id: string, schoolId: string, data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  static async deleteTemplate(id: string, schoolId: string, createdBy?: string): Promise<IMessageTemplate> {
    const filter: Record<string, unknown> = { _id: id, schoolId, isDeleted: false };
    if (createdBy) filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    const template = await MessageTemplate.findOneAndUpdate(
      filter,
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  // ─── Bulk Message ─────────────────────────────────────────────────────────

  static async sendBulkMessage(
    data: {
      schoolId: string;
      templateId?: string;
      subject: string;
      body: string;
      channel?: string;
      recipients: { type: string; targetIds?: string[] };
    },
    sentBy: string,
  ): Promise<IBulkMessage> {
    const uniqueIds = await resolveRecipientIds(data.schoolId, data.recipients);
    const channel = data.channel ?? 'all';

    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId,
      templateId: data.templateId,
      subject: data.subject,
      body: data.body,
      channel,
      sentBy,
      recipients: data.recipients,
      totalRecipients: uniqueIds.length,
      status: 'sending',
      sentAt: new Date(),
    });
    await bulkMessage.save();

    const logDocs = uniqueIds.map((userId) => ({
      bulkMessageId: bulkMessage._id,
      recipientId: new mongoose.Types.ObjectId(userId),
      channel,
      status: 'queued' as const,
      retryCount: 0,
    }));

    await MessageLog.insertMany(logDocs);
    await executeBulkMessage(bulkMessage._id.toString());

    return BulkMessage.findById(bulkMessage._id) as Promise<IBulkMessage>;
  }

  // ─── Message History ──────────────────────────────────────────────────────

  static async listMessages(schoolId: string, query: ListQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      BulkMessage.find(filter)
        .populate('sentBy', 'firstName lastName email')
        .populate('templateId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      BulkMessage.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getMessageById(id: string, schoolId: string): Promise<IBulkMessage> {
    const message = await BulkMessage.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('sentBy', 'firstName lastName email')
      .populate('templateId', 'name');
    if (!message) throw new NotFoundError('Message not found');
    return message;
  }

  // ─── Scheduling ────────────────────────────────────────────────────────────

  static async scheduleMessage(
    data: {
      schoolId: string;
      templateId?: string;
      subject: string;
      body: string;
      channel?: string;
      recipients: { type: string; targetIds?: string[] };
      scheduledFor: string;
    },
    sentBy: string,
  ): Promise<IBulkMessage> {
    const scheduledDate = new Date(data.scheduledFor);
    if (scheduledDate <= new Date()) {
      throw new BadRequestError('Scheduled date must be in the future');
    }

    const uniqueIds = await resolveRecipientIds(data.schoolId, data.recipients);
    const channel = data.channel ?? 'all';
    const delay = scheduledDate.getTime() - Date.now();

    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId,
      templateId: data.templateId,
      subject: data.subject,
      body: data.body,
      channel,
      sentBy,
      recipients: data.recipients,
      totalRecipients: uniqueIds.length,
      status: 'scheduled',
      scheduledFor: scheduledDate,
    });
    await bulkMessage.save();

    // Freeze recipient list at scheduling time
    const logDocs = uniqueIds.map((userId) => ({
      bulkMessageId: bulkMessage._id,
      recipientId: new mongoose.Types.ObjectId(userId),
      channel,
      status: 'queued' as const,
      retryCount: 0,
    }));
    if (logDocs.length > 0) {
      await MessageLog.insertMany(logDocs);
    }

    await communicationQueue.add(
      'send-scheduled',
      { bulkId: bulkMessage._id.toString() },
      { delay },
    );

    return bulkMessage;
  }

  static async cancelScheduledMessage(
    id: string,
    schoolId: string,
    userId: string,
  ): Promise<IBulkMessage> {
    const bulk = await BulkMessage.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!bulk) throw new NotFoundError('Scheduled message not found');
    if (bulk.status !== 'scheduled') {
      throw new BadRequestError('Only scheduled messages can be cancelled');
    }
    if (bulk.sentBy.toString() !== userId) {
      throw new BadRequestError('Only the teacher who scheduled it can cancel');
    }

    bulk.status = 'cancelled';
    bulk.isDeleted = true;
    await bulk.save();

    await MessageLog.updateMany(
      { bulkMessageId: bulk._id },
      { $set: { isDeleted: true } },
    );

    // The BullMQ delayed job will no-op on wake-up because status is no longer 'scheduled'
    logger.info({ bulkId: id }, '[Comm] Scheduled message cancelled — BullMQ job will no-op on wake-up');

    return bulk.toObject() as IBulkMessage;
  }

  // ─── Read Receipts ────────────────────────────────────────────────────────

  static async markMessageRead(schoolId: string, userId: string, messageId: string): Promise<IBulkMessage> {
    const message = await BulkMessage.findOne({ _id: messageId, schoolId, isDeleted: false });
    if (!message) throw new NotFoundError('Message not found');

    const userObjId = new mongoose.Types.ObjectId(userId);
    const alreadyRead = message.readBy.some((r) => r.userId.equals(userObjId));
    if (alreadyRead) return message;

    const updated = await BulkMessage.findOneAndUpdate(
      { _id: messageId, schoolId, isDeleted: false },
      { $push: { readBy: { userId: userObjId, readAt: new Date() } } },
      { new: true },
    );
    if (!updated) throw new NotFoundError('Message not found');
    return updated;
  }

  static async getReadReceipts(schoolId: string, messageId: string) {
    const message = await BulkMessage.findOne({
      _id: messageId, schoolId, isDeleted: false,
    }).populate('readBy.userId', 'firstName lastName email').lean();

    if (!message) throw new NotFoundError('Message not found');
    return message.readBy;
  }

  static async getReadReceiptStats(schoolId: string, messageId: string) {
    const message = await BulkMessage.findOne({
      _id: messageId, schoolId, isDeleted: false,
    }).lean();

    if (!message) throw new NotFoundError('Message not found');

    const totalRecipients = message.totalRecipients;
    const readCount = message.readBy.length;
    const readPercentage = totalRecipients > 0
      ? Math.round((readCount / totalRecipients) * 100)
      : 0;

    let avgTimeToReadMs = 0;
    if (message.sentAt && readCount > 0) {
      const sentTime = new Date(message.sentAt).getTime();
      const totalReadTime = message.readBy.reduce((sum, r) => {
        return sum + (new Date(r.readAt).getTime() - sentTime);
      }, 0);
      avgTimeToReadMs = totalReadTime / readCount;
    }

    return {
      totalRecipients,
      readCount,
      readPercentage,
      avgTimeToReadMinutes: Math.round(avgTimeToReadMs / 60000),
    };
  }

  // ─── Delivery Stats ───────────────────────────────────────────────────────

  static async getDeliveryStats(bulkMessageId: string, schoolId: string) {
    const message = await BulkMessage.findOne({
      _id: bulkMessageId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!message) throw new NotFoundError('Bulk message not found');

    const stats = await MessageLog.aggregate([
      { $match: { bulkMessageId: new mongoose.Types.ObjectId(bulkMessageId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return stats;
  }

  static async getMessageLogs(bulkMessageId: string, schoolId: string, query: ListQuery) {
    const message = await BulkMessage.findOne({
      _id: bulkMessageId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!message) throw new NotFoundError('Bulk message not found');

    const { page, limit, skip } = getPagination(query);
    const filter = { bulkMessageId: new mongoose.Types.ObjectId(bulkMessageId) };

    const [data, total] = await Promise.all([
      MessageLog.find(filter)
        .populate('recipientId', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageLog.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
