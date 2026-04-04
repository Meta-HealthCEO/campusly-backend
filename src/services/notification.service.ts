import { logger } from '../common/logger.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';
import { PushService } from './push.service.js';
import { DeviceRegistration } from '../modules/Communication/delivery-model.js';

interface NotificationPayload {
  type: 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp';
  recipientEmail?: string;
  recipientPhone?: string;
  recipientUserId?: string;
  schoolId?: string;
  title: string;
  message: string;
  data?: unknown;
}

export class NotificationDispatchService {
  static async dispatch(notification: NotificationPayload): Promise<void> {
    switch (notification.type) {
      case 'email':
        if (notification.recipientEmail) {
          await EmailService.sendEmail(
            notification.recipientEmail,
            notification.title,
            notification.message,
          );
        } else {
          logger.warn('NotificationDispatch: Email skipped — no recipient email');
        }
        break;

      case 'sms':
        if (notification.recipientPhone) {
          await SmsService.sendSms(notification.recipientPhone, notification.message);
        } else {
          logger.warn('NotificationDispatch: SMS skipped — no recipient phone');
        }
        break;

      case 'push': {
        const userId = notification.recipientUserId;
        if (!userId) {
          logger.warn('NotificationDispatch: Push skipped — no recipientUserId');
          break;
        }
        const devices = await DeviceRegistration.find({ userId, isActive: true });
        if (devices.length === 0) {
          logger.info({ userId }, 'NotificationDispatch: No devices for push');
          break;
        }
        const tokens = devices.map((d) => d.deviceToken);
        const bodyText = notification.message.replace(/<[^>]+>/g, '');
        await PushService.sendPushBatch(
          tokens,
          notification.title,
          bodyText,
          notification.data ? { payload: JSON.stringify(notification.data) } : undefined,
        );
        break;
      }

      case 'in_app':
        logger.info({ title: notification.title }, 'NotificationDispatch: In-app notification stored');
        break;

      case 'whatsapp':
        if (notification.recipientPhone && notification.schoolId) {
          try {
            const { WhatsAppService } = await import('../modules/WhatsApp/service.js');
            await WhatsAppService.sendMessage(notification.schoolId, {
              recipientPhone: notification.recipientPhone,
              templateType: 'general_announcement',
              templateParams: { title: notification.title, message: notification.message },
            });
          } catch (err: unknown) {
            const reason = err instanceof Error ? err.message : 'Unknown error';
            logger.warn({ err: reason }, 'NotificationDispatch: WhatsApp failed');
          }
        } else {
          logger.warn('NotificationDispatch: WhatsApp skipped — no phone or schoolId');
        }
        break;

      default:
        logger.warn({ type: notification.type }, 'NotificationDispatch: Unknown type');
    }
  }
}
