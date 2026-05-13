import mongoose from 'mongoose';
import { BulkMessage, MessageLog } from './model.js';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

interface ListQuery {
  page?: number;
  limit?: number;
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

function messageFilter(messageId: string, schoolId: string, viewer?: ViewerScope) {
  const filter: Record<string, unknown> = {
    _id: messageId,
    schoolId,
    isDeleted: false,
  };
  if (viewer?.role === 'teacher') {
    filter.sentBy = new mongoose.Types.ObjectId(viewer.userId);
  }
  return filter;
}

export class MessageStatsService {
  static async markMessageRead(schoolId: string, userId: string, messageId: string) {
    const message = await BulkMessage.findOne({ _id: messageId, schoolId, isDeleted: false });
    if (!message) throw new NotFoundError('Message not found');

    const userObjId = new mongoose.Types.ObjectId(userId);
    const recipientLog = await MessageLog.findOne({
      bulkMessageId: message._id,
      recipientId: userObjId,
      isDeleted: false,
    });
    if (!recipientLog) {
      throw new ForbiddenError('You can only mark messages sent to you as read');
    }

    const alreadyRead = message.readBy.some((r) => r.userId.equals(userObjId));
    if (alreadyRead) return message;

    const updated = await BulkMessage.findOneAndUpdate(
      { _id: messageId, schoolId, isDeleted: false },
      { $push: { readBy: { userId: userObjId, readAt: new Date() } } },
      { new: true },
    );
    if (!updated) throw new NotFoundError('Message not found');
    await MessageLog.updateOne(
      { _id: recipientLog._id },
      { $set: { status: 'read', readAt: new Date() } },
    );
    return updated;
  }

  static async getReadReceipts(schoolId: string, messageId: string, viewer?: ViewerScope) {
    const message = await BulkMessage.findOne(messageFilter(messageId, schoolId, viewer))
      .populate('readBy.userId', 'firstName lastName email')
      .lean();
    if (!message) throw new NotFoundError('Message not found');
    return message.readBy;
  }

  static async getReadReceiptStats(schoolId: string, messageId: string, viewer?: ViewerScope) {
    const message = await BulkMessage.findOne(messageFilter(messageId, schoolId, viewer)).lean();
    if (!message) throw new NotFoundError('Message not found');

    const totalRecipients = message.totalRecipients;
    const readCount = message.readBy.length;
    const readPercentage = totalRecipients > 0
      ? Math.round((readCount / totalRecipients) * 100) : 0;

    let avgTimeToReadMs = 0;
    if (message.sentAt && readCount > 0) {
      const sentTime = new Date(message.sentAt).getTime();
      avgTimeToReadMs = message.readBy.reduce((sum, r) =>
        sum + (new Date(r.readAt).getTime() - sentTime), 0) / readCount;
    }

    return {
      totalRecipients,
      readCount,
      readPercentage,
      avgTimeToReadMinutes: Math.round(avgTimeToReadMs / 60000),
    };
  }

  static async getDeliveryStats(bulkMessageId: string, schoolId: string) {
    const message = await BulkMessage.findOne({
      _id: bulkMessageId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!message) throw new NotFoundError('Bulk message not found');

    return MessageLog.aggregate([
      { $match: { bulkMessageId: new mongoose.Types.ObjectId(bulkMessageId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);
  }

  static async getMessageLogs(
    bulkMessageId: string,
    schoolId: string,
    query: ListQuery,
    viewer?: ViewerScope,
  ) {
    const message = await BulkMessage.findOne(messageFilter(bulkMessageId, schoolId, viewer)).lean();
    if (!message) throw new NotFoundError('Bulk message not found');

    const { page, limit, skip } = getPagination(query);
    const filter = { bulkMessageId: new mongoose.Types.ObjectId(bulkMessageId), isDeleted: false };

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
