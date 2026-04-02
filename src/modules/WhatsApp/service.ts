import mongoose from 'mongoose';
import { WhatsAppConfig, WhatsAppMessage, WhatsAppOptIn } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import { TwilioWhatsAppService } from './services/twilio.service.js';
import { WhatsAppBroadcastService } from './services/broadcast.service.js';
import type { ConfigInput, SendMessageInput, BroadcastInput } from './validation.js';

// ─── Config ─────────────────────────────────────────────────────────────────

export class WhatsAppService {
  static async getConfig(schoolId: string) {
    const config = await WhatsAppConfig.findOne({
      schoolId,
      isDeleted: false,
    }).lean();
    if (!config) {
      throw new NotFoundError('WhatsApp configuration not found');
    }
    return config;
  }

  static async upsertConfig(schoolId: string, data: ConfigInput) {
    return WhatsAppConfig.findOneAndUpdate(
      { schoolId },
      {
        $set: {
          provider: data.provider,
          credentials: data.credentials,
          enabled: data.enabled,
          isDeleted: false,
        },
      },
      { upsert: true, new: true },
    );
  }

  // ─── Send Single Message ────────────────────────────────────────────────────

  static async sendMessage(schoolId: string, input: SendMessageInput) {
    const config = await WhatsAppConfig.findOne({
      schoolId,
      isDeleted: false,
      enabled: true,
    }).lean();
    if (!config) {
      throw new BadRequestError('WhatsApp is not configured or enabled for this school');
    }

    // POPIA: check opt-in by phone number
    const optIn = await WhatsAppOptIn.findOne({
      schoolId,
      phoneNumber: input.recipientPhone,
      optedIn: true,
      isDeleted: false,
    }).lean();
    if (!optIn) {
      throw new BadRequestError(
        'Recipient has not opted in to WhatsApp messages (POPIA compliance)',
      );
    }

    // Create message record
    const message = await WhatsAppMessage.create({
      schoolId,
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      parentId: optIn.parentId,
      templateType: input.templateType,
      templateParams: input.templateParams,
      status: 'queued',
    });

    // Resolve template SID from config
    const templateSid = config.templateIds?.get(input.templateType) ?? input.templateType;

    try {
      const result = await TwilioWhatsAppService.sendTemplateMessage(
        config.credentials,
        input.recipientPhone,
        templateSid,
        input.templateParams,
      );

      message.status = 'sent';
      message.externalId = result.sid;
      message.sentAt = new Date();
      await message.save();
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Unknown error';
      message.status = 'failed';
      message.failureReason = reason;
      await message.save();
      logger.error(`[WhatsApp] Failed to send message: ${reason}`);
    }

    return message;
  }

  // ─── Broadcast ──────────────────────────────────────────────────────────────

  static async broadcast(schoolId: string, input: BroadcastInput) {
    const config = await WhatsAppConfig.findOne({
      schoolId,
      isDeleted: false,
      enabled: true,
    }).lean();
    if (!config) {
      throw new BadRequestError('WhatsApp is not configured or enabled for this school');
    }

    // Resolve recipient parents based on group
    const parentUserIds = await WhatsAppBroadcastService.resolveRecipientGroup(
      schoolId, input.recipientGroup, input.gradeId, input.classId,
    );

    // Get opt-in records for these parents
    const optIns = await WhatsAppOptIn.find({
      schoolId,
      parentId: { $in: parentUserIds },
      optedIn: true,
      isDeleted: false,
    }).lean();

    const optInMap = new Map(optIns.map((o) => [o.parentId.toString(), o]));
    let queued = 0;
    let skippedOptOut = 0;

    const templateSid = config.templateIds?.get(input.templateType) ?? input.templateType;

    // Create message records for each opted-in parent
    const messageDocs = [];
    for (const userId of parentUserIds) {
      const optIn = optInMap.get(userId.toString());
      if (!optIn) {
        skippedOptOut++;
        continue;
      }

      messageDocs.push({
        schoolId,
        recipientPhone: optIn.phoneNumber,
        parentId: optIn.parentId,
        templateType: input.templateType,
        templateParams: input.templateParams,
        status: 'queued' as const,
      });
      queued++;
    }

    if (messageDocs.length > 0) {
      const messages = await WhatsAppMessage.insertMany(messageDocs);

      // Process messages asynchronously (fire-and-forget)
      void WhatsAppBroadcastService.processMessageBatch(config.credentials, messages, templateSid);
    }

    return { queued, skippedOptOut };
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────

  static async handleWebhook(data: Record<string, string>) {
    const messageSid = data.MessageSid ?? data.SmsSid;
    const messageStatus = data.MessageStatus ?? data.SmsStatus;

    if (!messageSid) {
      logger.warn('[WhatsApp] Webhook received without MessageSid');
      return { success: false };
    }

    const message = await WhatsAppMessage.findOne({ externalId: messageSid });
    if (!message) {
      logger.warn(`[WhatsApp] Webhook for unknown message SID: ${messageSid}`);
      return { success: false };
    }

    const now = new Date();
    switch (messageStatus) {
      case 'delivered':
        message.status = 'delivered';
        message.deliveredAt = now;
        break;
      case 'read':
        message.status = 'read';
        message.readAt = now;
        break;
      case 'failed':
      case 'undelivered':
        message.status = 'failed';
        message.failureReason = data.ErrorMessage ?? `Status: ${messageStatus}`;
        break;
      case 'sent':
        if (message.status === 'queued') {
          message.status = 'sent';
          message.sentAt = now;
        }
        break;
      default:
        logger.info(`[WhatsApp] Unhandled webhook status: ${messageStatus}`);
    }

    await message.save();
    return { success: true };
  }

  // ─── Delivery Reports ─────────────────────────────────────────────────────

  static async getDeliveryReport(
    schoolId: string,
    filters?: { status?: string; templateType?: string },
    page?: number,
    limit?: number,
  ) {
    const { skip, limit: pLimit } = paginationHelper(page, limit);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters?.status) filter.status = filters.status;
    if (filters?.templateType) filter.templateType = filters.templateType;

    const [messages, total] = await Promise.all([
      WhatsAppMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pLimit)
        .lean(),
      WhatsAppMessage.countDocuments(filter),
    ]);

    return { messages, total, page: page ?? 1, limit: pLimit };
  }

  static async getDeliveryStats(schoolId: string) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const result = await WhatsAppMessage.aggregate([
      { $match: { schoolId: schoolOid, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats: Record<string, number> = {
      queued: 0, sent: 0, delivered: 0, read: 0, failed: 0,
    };
    for (const row of result) {
      stats[row._id as string] = row.count;
    }

    return stats;
  }

  // ─── Opt-In / Opt-Out (POPIA) ─────────────────────────────────────────────

  static async optIn(
    userId: string,
    schoolId: string,
    phone: string,
    language: string,
  ) {
    return WhatsAppOptIn.findOneAndUpdate(
      { parentId: userId, schoolId },
      {
        $set: {
          phoneNumber: phone,
          optedIn: true,
          optInDate: new Date(),
          preferredLanguage: language,
          isDeleted: false,
        },
        $unset: { optOutDate: 1 },
      },
      { upsert: true, new: true },
    );
  }

  static async optOut(userId: string, schoolId: string) {
    const record = await WhatsAppOptIn.findOneAndUpdate(
      { parentId: userId, schoolId, isDeleted: false },
      {
        $set: {
          optedIn: false,
          optOutDate: new Date(),
        },
      },
      { new: true },
    );
    if (!record) {
      throw new NotFoundError('No opt-in record found');
    }
    return record;
  }

  static async getOptInStatus(userId: string, schoolId: string) {
    const record = await WhatsAppOptIn.findOne({
      parentId: userId,
      schoolId,
      isDeleted: false,
    }).lean();
    return { optedIn: record?.optedIn ?? false, record };
  }

}
