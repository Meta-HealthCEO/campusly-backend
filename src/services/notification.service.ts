import { logger } from '../common/logger.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';

interface NotificationPayload {
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipientEmail?: string;
  recipientPhone?: string;
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
          logger.warn('[NotificationDispatch] Email notification skipped - no recipient email');
        }
        break;

      case 'sms':
        if (notification.recipientPhone) {
          await SmsService.sendSms(
            notification.recipientPhone,
            notification.message,
          );
        } else {
          logger.warn('[NotificationDispatch] SMS notification skipped - no recipient phone');
        }
        break;

      case 'push':
        // Push notification integration (e.g., Firebase Cloud Messaging)
        logger.info(`[NotificationDispatch] Push notification: ${notification.title}`);
        logger.info(`  Message: ${notification.message}`);
        break;

      case 'in_app':
        // In-app notifications are already stored in the database
        logger.info(`[NotificationDispatch] In-app notification stored: ${notification.title}`);
        break;

      default:
        logger.warn(`[NotificationDispatch] Unknown notification type: ${notification.type}`);
    }
  }
}
