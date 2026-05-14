import mongoose from 'mongoose';
import { logger } from '../common/logger.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';
import { PushService } from './push.service.js';
import { DeviceRegistration } from '../modules/Communication/delivery-model.js';
import { NotificationPreference } from '../modules/Notification/model.js';

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

/**
 * Build the FCM `data` payload for a push notification.
 *
 * Always includes `payload` (JSON-serialised `data`) for backwards compatibility.
 * When `data` contains mobile-routing fields (`deepLink`, `category`,
 * `notificationId`) they are promoted to top-level keys so the mobile app can
 * read them without parsing `payload`.
 *
 * FCM requires all data values to be strings, so optional fields are only
 * included in the returned object when they are present in the source data.
 */
export function buildPushExtra(data: unknown): Record<string, string> | undefined {
  if (data === undefined || data === null) return undefined;

  const d = data as Record<string, unknown>;
  const extra: Record<string, string> = { payload: JSON.stringify(data) };

  if (typeof d.deepLink === 'string') extra.deepLink = d.deepLink;
  if (typeof d.category === 'string') extra.category = d.category;
  if (typeof d.notificationId === 'string') extra.notificationId = d.notificationId;

  return extra;
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

        // Category gating — skip push if user has disabled this category
        const category = (notification.data as { category?: string } | undefined)?.category;
        if (category) {
          type CategoryKey = 'homework' | 'grades' | 'attendance' | 'billing' | 'announcements';
          const KNOWN_CATEGORIES: CategoryKey[] = [
            'homework', 'grades', 'attendance', 'billing', 'announcements',
          ];
          if ((KNOWN_CATEGORIES as string[]).includes(category)) {
            const prefQuery: { userId: mongoose.Types.ObjectId; schoolId?: mongoose.Types.ObjectId } = {
              userId: new mongoose.Types.ObjectId(userId),
            };
            if (notification.schoolId) {
              prefQuery.schoolId = new mongoose.Types.ObjectId(notification.schoolId);
            }
            const pref = await NotificationPreference.findOne(prefQuery).lean();
            if (pref?.categories?.[category as CategoryKey] === false) {
              logger.info({ userId, category }, 'NotificationDispatch: Push skipped — category disabled by user');
              break;
            }
          }
        }

        const bodyText = notification.message.replace(/<[^>]+>/g, '');
        await PushService.sendPushBatch(
          tokens,
          notification.title,
          bodyText,
          buildPushExtra(notification.data),
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
