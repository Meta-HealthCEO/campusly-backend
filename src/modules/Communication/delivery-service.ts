import mongoose from 'mongoose';
import { CommunicationConfig } from './delivery-model.js';
import { DeliveryLog } from './delivery-model.js';
import { DeviceRegistration } from './delivery-model.js';
import { MessageTemplate } from './model.js';
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';
import { PushService } from '../../services/push.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { logger } from '../../common/logger.js';

interface PaginationQuery {
  page?: number;
  limit?: number;
}

function getPagination(query: PaginationQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  return { page, limit, skip: (page - 1) * limit };
}

function maskApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  return '***configured***';
}

export class DeliveryService {
  // ─── Channel Config ──────────────────────────────────────────────────────

  static async getConfig(schoolId: string) {
    let cfg = await CommunicationConfig.findOne({ schoolId, isDeleted: false }).lean();
    if (!cfg) {
      cfg = await CommunicationConfig.create({ schoolId });
      cfg = cfg.toObject();
    }
    // Mask sensitive fields
    const masked = JSON.parse(JSON.stringify(cfg)) as Record<string, unknown>;
    const channels = masked.channels as Record<string, Record<string, unknown>>;
    for (const ch of Object.values(channels)) {
      ch.apiKey = maskApiKey(ch.apiKey as string | undefined);
      ch.authToken = maskApiKey(ch.authToken as string | undefined);
      ch.serviceAccountKey = maskApiKey(ch.serviceAccountKey as string | undefined);
      ch.apiKeyConfigured = Boolean(ch.apiKey);
    }
    return masked;
  }

  static async updateConfig(schoolId: string, channels: Record<string, unknown>) {
    const updateSet: Record<string, unknown> = {};
    const channelData = channels as Record<string, Record<string, unknown>>;

    for (const [channelName, channelCfg] of Object.entries(channelData)) {
      if (!channelCfg) continue;
      for (const [field, value] of Object.entries(channelCfg)) {
        updateSet[`channels.${channelName}.${field}`] = value;
      }
    }

    const updated = await CommunicationConfig.findOneAndUpdate(
      { schoolId, isDeleted: false },
      { $set: updateSet },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return updated;
  }

  static async testChannel(
    schoolId: string,
    channel: string,
    opts: { recipientEmail?: string; recipientPhone?: string; recipientDeviceToken?: string },
  ) {
    const testSubject = 'Campusly — Test Message';
    const testBody = '<p>This is a test message from Campusly to verify your channel configuration.</p>';
    const textBody = 'This is a test message from Campusly to verify your channel configuration.';

    switch (channel) {
      case 'email': {
        if (!opts.recipientEmail) throw new BadRequestError('recipientEmail required for email test');
        const result = await EmailService.sendEmail(opts.recipientEmail, testSubject, testBody);
        return { messageId: result.messageId, status: 'sent' };
      }
      case 'sms': {
        if (!opts.recipientPhone) throw new BadRequestError('recipientPhone required for SMS test');
        const result = await SmsService.sendSms(opts.recipientPhone, textBody);
        return { messageId: result.messageId, status: 'sent' };
      }
      case 'push': {
        if (!opts.recipientDeviceToken) throw new BadRequestError('recipientDeviceToken required for push test');
        const result = await PushService.sendPush({
          token: opts.recipientDeviceToken,
          title: testSubject,
          body: textBody,
        });
        return { messageId: result.messageId, status: 'sent' };
      }
      case 'whatsapp':
        logger.info({ schoolId, phone: opts.recipientPhone }, 'WhatsApp test — use WhatsApp module');
        return { messageId: `wa-test-${Date.now()}`, status: 'sent' };
      default:
        throw new BadRequestError(`Unknown channel: ${channel}`);
    }
  }

  // ─── Template Preview ────────────────────────────────────────────────────

  static async previewTemplate(templateId: string, schoolId: string, variables: Record<string, string>) {
    const template = await MessageTemplate.findOne({ _id: templateId, schoolId, isDeleted: false });
    if (!template) throw new NotFoundError('Template not found');

    const interpolate = (text: string): string =>
      text.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) => variables[key] ?? `{{${key}}}`);

    return {
      subject: template.subject ? interpolate(template.subject) : undefined,
      body: interpolate(template.body),
      htmlBody: template.htmlBody ? interpolate(template.htmlBody) : undefined,
    };
  }

  // ─── Delivery Log ────────────────────────────────────────────────────────

  static async getDeliveryLogs(
    schoolId: string,
    filters: {
      batchId?: string;
      channel?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      recipientSearch?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { page, limit, skip } = getPagination(filters);
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (filters.batchId) match.batchId = filters.batchId;
    if (filters.channel) match.channel = filters.channel;
    if (filters.status) match.status = filters.status;
    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      match.createdAt = dateFilter;
    }
    if (filters.recipientSearch) {
      const escaped = filters.recipientSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.$or = [
        { recipientName: { $regex: escaped, $options: 'i' } },
        { recipientEmail: { $regex: escaped, $options: 'i' } },
        { recipientPhone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      DeliveryLog.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DeliveryLog.countDocuments(match),
    ]);

    return { logs: data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Delivery Stats ──────────────────────────────────────────────────────

  static async getDeliveryStats(
    schoolId: string,
    filters: { startDate?: string; endDate?: string; channel?: string },
  ) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    match.createdAt = { $gte: startDate, $lte: endDate };
    if (filters.channel) match.channel = filters.channel;

    const [statusAgg, channelAgg, dailyAgg, costAgg] = await Promise.all([
      DeliveryLog.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      DeliveryLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$channel',
            sent: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
            cost: { $sum: '$cost' },
          },
        },
      ]),
      DeliveryLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sent: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      DeliveryLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$cost' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of statusAgg) statusMap[s._id as string] = s.count as number;

    const totalSent = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const delivered = statusMap['delivered'] ?? 0;
    const failed = statusMap['failed'] ?? 0;
    const bounced = statusMap['bounced'] ?? 0;
    const opened = statusMap['opened'] ?? 0;

    return {
      totalSent,
      delivered,
      failed,
      bounced,
      opened,
      deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 10000) / 100 : 0,
      openRate: totalSent > 0 ? Math.round((opened / totalSent) * 10000) / 100 : 0,
      byChannel: channelAgg.map((c) => ({ channel: c._id, ...c, _id: undefined })),
      byDay: dailyAgg.map((d) => ({ date: d._id, ...d, _id: undefined })),
      totalCost: channelAgg.reduce((sum, c) => sum + ((c.cost as number) ?? 0), 0),
      costByMonth: costAgg.map((c) => ({ month: c._id, total: c.total })),
    };
  }

  // ─── Device Registration ─────────────────────────────────────────────────

  static async registerDevice(
    userId: string,
    schoolId: string,
    data: { deviceToken: string; platform: string; deviceName?: string },
  ) {
    const device = await DeviceRegistration.findOneAndUpdate(
      { userId, deviceToken: data.deviceToken },
      {
        $set: {
          schoolId,
          platform: data.platform,
          deviceName: data.deviceName,
          isActive: true,
          lastUsedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    return device;
  }

  static async unregisterDevice(userId: string, deviceToken: string) {
    const device = await DeviceRegistration.findOneAndUpdate(
      { userId, deviceToken },
      { $set: { isActive: false } },
      { new: true },
    );
    if (!device) throw new NotFoundError('Device not found');
    return device;
  }

  // ─── Retry ────────────────────────────────────────────────────────────────

  static async retryDelivery(logId: string, schoolId: string) {
    const log = await DeliveryLog.findOne({
      _id: logId,
      schoolId,
      status: 'failed',
      isDeleted: false,
    });
    if (!log) throw new NotFoundError('Delivery log not found or not in failed state');
    if (log.retryCount >= log.maxRetries) {
      throw new BadRequestError('Maximum retry attempts reached');
    }

    log.retryCount += 1;
    log.status = 'queued';
    await log.save();

    // Re-dispatch based on channel
    try {
      switch (log.channel) {
        case 'email':
          if (log.recipientEmail && log.subject) {
            await EmailService.sendEmail(log.recipientEmail, log.subject, log.bodyPreview ?? '');
          }
          break;
        case 'sms':
          if (log.recipientPhone) {
            await SmsService.sendSms(log.recipientPhone, log.bodyPreview ?? '');
          }
          break;
        case 'push':
          if (log.recipientDeviceToken) {
            await PushService.sendPush({
              token: log.recipientDeviceToken,
              title: log.subject ?? 'Notification',
              body: log.bodyPreview ?? '',
            });
          }
          break;
      }
      log.status = 'sent';
      log.sentAt = new Date();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      log.status = 'failed';
      log.errorMessage = errMsg;
      log.failedAt = new Date();
    }

    await log.save();
    return log;
  }
}
