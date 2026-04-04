import { logger } from '../common/logger.js';
import { Parent } from '../modules/Parent/model.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';
import { PushService } from './push.service.js';
import { DeliveryLog } from '../modules/Communication/delivery-model.js';
import { DeviceRegistration } from '../modules/Communication/delivery-model.js';
import { config } from '../config/env.js';
import { randomUUID } from 'crypto';

interface RoutableUser {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  _id?: string;
}

type Channel = 'email' | 'sms' | 'whatsapp' | 'push';

async function logDelivery(opts: {
  schoolId?: string;
  batchId: string;
  channel: Channel;
  recipientUserId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  bodyPreview?: string;
  status: 'sent' | 'failed';
  providerMessageId?: string;
  errorMessage?: string;
  cost?: number;
}): Promise<void> {
  try {
    await DeliveryLog.create({
      schoolId: opts.schoolId,
      batchId: opts.batchId,
      channel: opts.channel,
      recipientUserId: opts.recipientUserId,
      recipientName: opts.recipientName,
      recipientEmail: opts.recipientEmail,
      recipientPhone: opts.recipientPhone,
      subject: opts.subject,
      bodyPreview: opts.bodyPreview?.substring(0, 200),
      status: opts.status,
      providerMessageId: opts.providerMessageId,
      errorMessage: opts.errorMessage,
      cost: opts.cost ?? 0,
      sentAt: opts.status === 'sent' ? new Date() : undefined,
      failedAt: opts.status === 'failed' ? new Date() : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ err: msg }, 'Failed to write delivery log');
  }
}

export class CommunicationService {
  /**
   * Send a message to a single parent based on their communication preference.
   */
  static async sendToParent(
    parentId: string,
    title: string,
    message: string,
    data?: unknown,
  ): Promise<void> {
    const parent = await Parent.findById(parentId).populate('userId');
    if (!parent) {
      logger.warn({ parentId }, 'CommunicationService: Parent not found');
      return;
    }

    const user = parent.userId as unknown as RoutableUser;
    const batchId = `auto-${randomUUID()}`;
    const schoolId = parent.schoolId?.toString();

    await CommunicationService.routeMessage(
      user, parent.communicationPreference, title, message, batchId, schoolId, data,
    );
  }

  /**
   * Send a message to multiple parents based on their individual preferences.
   */
  static async sendBulk(parentIds: string[], title: string, message: string): Promise<void> {
    const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId');
    const batchId = `bulk-${randomUUID()}`;

    for (const parent of parents) {
      const user = parent.userId as unknown as RoutableUser;
      const schoolId = parent.schoolId?.toString();
      await CommunicationService.routeMessage(
        user, parent.communicationPreference, title, message, batchId, schoolId,
      );
    }
  }

  /**
   * Send a message to all parents of students in a specific class.
   */
  static async sendToClass(classId: string, title: string, message: string): Promise<void> {
    const { Student } = await import('../modules/Student/model.js');
    const students = await Student.find({
      classId, enrollmentStatus: 'active', isDeleted: false,
    });
    const parentIds = [...new Set(
      students.flatMap((s) => s.guardianIds.map((id) => id.toString())),
    )];
    if (parentIds.length > 0) await CommunicationService.sendBulk(parentIds, title, message);
  }

  /**
   * Send a message to all parents of students in a specific grade.
   */
  static async sendToGrade(gradeId: string, title: string, message: string): Promise<void> {
    const { Student } = await import('../modules/Student/model.js');
    const students = await Student.find({
      gradeId, enrollmentStatus: 'active', isDeleted: false,
    });
    const parentIds = [...new Set(
      students.flatMap((s) => s.guardianIds.map((id) => id.toString())),
    )];
    if (parentIds.length > 0) await CommunicationService.sendBulk(parentIds, title, message);
  }

  /**
   * Send a message to all parents in a school.
   */
  static async sendToSchool(schoolId: string, title: string, message: string): Promise<void> {
    const parents = await Parent.find({ schoolId, isDeleted: false });
    const parentIds = parents.map((p) => p._id.toString());
    if (parentIds.length > 0) await CommunicationService.sendBulk(parentIds, title, message);
  }

  // ─── Template methods ───────────────────────────────────────────────────────

  static absenceTemplate(studentName: string, date: string): { title: string; message: string } {
    return {
      title: `${config.app.name} - Absence Alert`,
      message: `<h2>Student Absence Alert</h2><p><strong>${studentName}</strong> was marked absent on <strong>${date}</strong>.</p><p>If planned, please contact the school.</p>`,
    };
  }

  static feeReminderTemplate(studentName: string, amount: number, dueDate: string): { title: string; message: string } {
    return {
      title: `${config.app.name} - Fee Reminder`,
      message: `<h2>Fee Payment Reminder</h2><p>A fee is due for <strong>${studentName}</strong>.</p><ul><li><strong>Amount:</strong> R${(amount / 100).toFixed(2)}</li><li><strong>Due:</strong> ${dueDate}</li></ul>`,
    };
  }

  static gradeNotificationTemplate(studentName: string, subject: string, percentage: number): { title: string; message: string } {
    return {
      title: `${config.app.name} - Grade Notification`,
      message: `<h2>Grade Notification</h2><p>A new grade for <strong>${studentName}</strong>.</p><ul><li><strong>Subject:</strong> ${subject}</li><li><strong>Percentage:</strong> ${percentage}%</li></ul>`,
    };
  }

  // ─── Private routing helper ─────────────────────────────────────────────────

  private static async routeMessage(
    user: RoutableUser,
    preference: 'email' | 'sms' | 'whatsapp' | 'push',
    title: string,
    message: string,
    batchId: string,
    schoolId?: string,
    data?: unknown,
  ): Promise<void> {
    const recipientName = `${user.firstName} ${user.lastName}`;
    const baseLogOpts = {
      schoolId,
      batchId,
      recipientUserId: user._id,
      recipientName,
      recipientEmail: user.email,
      recipientPhone: user.phone,
      subject: title,
      bodyPreview: message,
    };

    try {
      switch (preference) {
        case 'email': {
          const result = await EmailService.sendEmail(user.email, title, message);
          await logDelivery({ ...baseLogOpts, channel: 'email', status: 'sent', providerMessageId: result.messageId });
          break;
        }
        case 'sms': {
          const phone = user.phone ?? user.email;
          const result = await SmsService.sendSms(phone, message.replace(/<[^>]+>/g, ''));
          await logDelivery({ ...baseLogOpts, channel: 'sms', status: 'sent', providerMessageId: result.messageId, cost: 0.30 });
          break;
        }
        case 'whatsapp': {
          logger.info({ phone: user.phone, title }, 'WhatsApp message (use dedicated WhatsApp module)');
          await logDelivery({ ...baseLogOpts, channel: 'whatsapp', status: 'sent', cost: 0.15 });
          break;
        }
        case 'push': {
          if (!user._id) break;
          const devices = await DeviceRegistration.find({ userId: user._id, isActive: true });
          for (const device of devices) {
            const result = await PushService.sendPush({ token: device.deviceToken, title, body: message.replace(/<[^>]+>/g, ''), data: data ? { payload: JSON.stringify(data) } : undefined });
            await logDelivery({ ...baseLogOpts, channel: 'push', status: 'sent', providerMessageId: result.messageId });
          }
          if (devices.length === 0) {
            logger.info({ recipientName }, 'No registered devices for push notification');
          }
          break;
        }
        default:
          logger.warn({ preference }, 'Unknown communication preference');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err: errMsg, preference, recipientName }, 'Message delivery failed');
      await logDelivery({ ...baseLogOpts, channel: preference, status: 'failed', errorMessage: errMsg });
    }
  }
}
