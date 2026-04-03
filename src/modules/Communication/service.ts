import mongoose from 'mongoose';
import {
  MessageTemplate,
  type IMessageTemplate,
  BulkMessage,
  type IBulkMessage,
  MessageLog,
} from './model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

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

  static async deleteTemplate(id: string, schoolId: string): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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

    const bulkMessage = new BulkMessage({
      schoolId: data.schoolId,
      templateId: data.templateId,
      subject: data.subject,
      body: data.body,
      channel: data.channel ?? 'all',
      sentBy,
      recipients: data.recipients,
      totalRecipients: uniqueIds.length,
      status: 'queued',
      sentAt: new Date(),
    });
    await bulkMessage.save();

    // Create message logs for each recipient
    const logs = uniqueIds.map((userId) => ({
      bulkMessageId: bulkMessage._id,
      recipientId: new mongoose.Types.ObjectId(userId),
      channel: data.channel ?? 'all',
      status: 'queued' as const,
    }));

    if (logs.length > 0) {
      await MessageLog.insertMany(logs);
    }

    // In production, you'd add a BullMQ job here to process the sending
    // For now, mark as sent
    bulkMessage.status = 'sent';
    bulkMessage.delivered = uniqueIds.length;
    await bulkMessage.save();

    await MessageLog.updateMany(
      { bulkMessageId: bulkMessage._id },
      { $set: { status: 'sent', sentAt: new Date() } },
    );

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
