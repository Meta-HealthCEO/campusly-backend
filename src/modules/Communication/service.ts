import mongoose from 'mongoose';
import {
  MessageTemplate,
  IMessageTemplate,
  BulkMessage,
  IBulkMessage,
  MessageLog,
  IMessageLog,
} from './model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

interface ListQuery {
  page?: number;
  limit?: number;
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

export class CommunicationModuleService {
  // ─── Template CRUD ────────────────────────────────────────────────────────

  static async createTemplate(data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    const template = new MessageTemplate(data);
    return template.save();
  }

  static async listTemplates(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter = { schoolId, isDeleted: false };

    const [data, total] = await Promise.all([
      MessageTemplate.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      MessageTemplate.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTemplateById(id: string): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOne({ _id: id, isDeleted: false });
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  static async updateTemplate(id: string, data: Partial<IMessageTemplate>): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  static async deleteTemplate(id: string): Promise<IMessageTemplate> {
    const template = await MessageTemplate.findOneAndUpdate(
      { _id: id, isDeleted: false },
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
    const schoolObjId = new mongoose.Types.ObjectId(data.schoolId);

    // Resolve recipients
    let recipientUserIds: mongoose.Types.ObjectId[] = [];

    if (data.recipients.type === 'school') {
      const parents = await Parent.find({ schoolId: schoolObjId, isDeleted: false }).select('userId').lean();
      recipientUserIds = parents.map((p) => p.userId);
    } else if (data.recipients.type === 'grade') {
      const students = await Student.find({
        schoolId: schoolObjId,
        gradeId: { $in: data.recipients.targetIds },
        enrollmentStatus: 'active',
        isDeleted: false,
      }).select('guardianIds').lean();
      const guardianIds = students.flatMap((s) => s.guardianIds);
      const parents = await Parent.find({ _id: { $in: guardianIds }, isDeleted: false }).select('userId').lean();
      recipientUserIds = parents.map((p) => p.userId);
    } else if (data.recipients.type === 'class') {
      const students = await Student.find({
        schoolId: schoolObjId,
        classId: { $in: data.recipients.targetIds },
        enrollmentStatus: 'active',
        isDeleted: false,
      }).select('guardianIds').lean();
      const guardianIds = students.flatMap((s) => s.guardianIds);
      const parents = await Parent.find({ _id: { $in: guardianIds }, isDeleted: false }).select('userId').lean();
      recipientUserIds = parents.map((p) => p.userId);
    } else if (data.recipients.type === 'custom') {
      recipientUserIds = (data.recipients.targetIds ?? []).map((id) => new mongoose.Types.ObjectId(id));
    }

    // Deduplicate
    const uniqueIds = [...new Set(recipientUserIds.map((id) => id.toString()))];

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

  static async getMessageById(id: string): Promise<IBulkMessage> {
    const message = await BulkMessage.findOne({ _id: id, isDeleted: false })
      .populate('sentBy', 'firstName lastName email')
      .populate('templateId', 'name');
    if (!message) throw new NotFoundError('Message not found');
    return message;
  }

  // ─── Delivery Stats ───────────────────────────────────────────────────────

  static async getDeliveryStats(bulkMessageId: string) {
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

  static async getMessageLogs(bulkMessageId: string, query: ListQuery) {
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
