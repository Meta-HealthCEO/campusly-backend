import mongoose from 'mongoose';
import {
  MessageTemplate,
  type IMessageTemplate,
  BulkMessage,
  type IBulkMessage,
  MessageLog,
} from './model.js';
import { DeviceRegistration } from './delivery-model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { User } from '../Auth/model.js';
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';
import { PushService } from '../../services/push.service.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { logger } from '../../common/logger.js';

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

    // Create message log stubs for each recipient
    const logDocs = uniqueIds.map((userId) => ({
      bulkMessageId: bulkMessage._id,
      recipientId: new mongoose.Types.ObjectId(userId),
      channel,
      status: 'queued' as const,
    }));

    const insertedLogs = logDocs.length > 0
      ? await MessageLog.insertMany(logDocs)
      : [];

    // Fetch user records so we have email / phone for each recipient
    const userRecords = await User.find({
      _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isDeleted: false,
    }).select('_id email phone').lean();

    const userMap = new Map(userRecords.map((u) => [u._id.toString(), u]));

    // For push channel: fetch all device tokens for these users
    let deviceTokenMap = new Map<string, string[]>();
    if (channel === 'push' || channel === 'all') {
      const devices = await DeviceRegistration.find({
        userId: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
        isActive: true,
      }).select('userId deviceToken').lean();
      for (const d of devices) {
        const uid = d.userId.toString();
        const existing = deviceTokenMap.get(uid) ?? [];
        existing.push(d.deviceToken);
        deviceTokenMap.set(uid, existing);
      }
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const log of insertedLogs) {
      const userId = log.recipientId.toString();
      const userRecord = userMap.get(userId);

      let ok = false;
      let providerId: string | undefined;
      let errorMsg: string | undefined;

      try {
        if (channel === 'email' || channel === 'all') {
          if (!userRecord?.email) {
            throw new Error('Recipient has no email address');
          }
          const result = await EmailService.sendEmail(
            userRecord.email,
            data.subject,
            data.body,
          );
          if (!result.success) {
            throw new Error('EmailService returned failure');
          }
          providerId = result.messageId;
          ok = true;
        } else if (channel === 'sms') {
          if (!userRecord?.phone) {
            throw new Error('Recipient has no phone number');
          }
          const result = await SmsService.sendSms(userRecord.phone, data.body);
          if (!result.success) {
            throw new Error('SmsService returned failure');
          }
          providerId = result.messageId;
          ok = true;
        } else if (channel === 'push') {
          const tokens = deviceTokenMap.get(userId) ?? [];
          if (tokens.length === 0) {
            throw new Error('Recipient has no registered device tokens');
          }
          const result = await PushService.sendPushBatch(tokens, data.subject, data.body);
          if (!result.success && (result.failedTokens?.length ?? 0) >= tokens.length) {
            throw new Error('All push tokens failed');
          }
          providerId = result.messageId;
          ok = true;
        } else if (channel === 'whatsapp') {
          // WhatsApp adapter not yet integrated — log and mark failed
          logger.warn({ userId, channel }, 'WhatsApp delivery not configured; skipping recipient');
          throw new Error('WhatsApp delivery is not yet configured');
        } else {
          throw new Error(`Unknown channel: ${channel}`);
        }
      } catch (err: unknown) {
        errorMsg = err instanceof Error ? err.message : 'Unknown delivery error';
        logger.warn({ userId, channel, err: errorMsg }, 'Bulk message delivery failed for recipient');
      }

      await MessageLog.findByIdAndUpdate(log._id, {
        $set: {
          status: ok ? 'sent' : 'failed',
          sentAt: ok ? new Date() : undefined,
          error: errorMsg,
        },
      });

      if (ok) sentCount++; else failedCount++;
    }

    // Determine overall status
    let finalStatus: IBulkMessage['status'];
    if (sentCount > 0 && failedCount === 0) {
      finalStatus = 'sent';
    } else if (sentCount > 0 && failedCount > 0) {
      finalStatus = 'partial';
    } else {
      finalStatus = 'failed';
    }

    bulkMessage.status = finalStatus;
    bulkMessage.delivered = sentCount;
    bulkMessage.failed = failedCount;
    await bulkMessage.save();

    return bulkMessage;
  }

  // ─── Message History ──────────────────────────────────────────────────────

  static async listMessages(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter = { schoolId, isDeleted: false };

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
      throw new NotFoundError('Scheduled date must be in the future');
    }

    const uniqueIds = await resolveRecipientIds(data.schoolId, data.recipients);

    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId,
      templateId: data.templateId,
      subject: data.subject,
      body: data.body,
      channel: data.channel ?? 'all',
      sentBy,
      recipients: data.recipients,
      totalRecipients: uniqueIds.length,
      status: 'scheduled',
      scheduledFor: scheduledDate,
    });

    return bulkMessage.save();
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

    // Calculate average time to read (from sentAt)
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
