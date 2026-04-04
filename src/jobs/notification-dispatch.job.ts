import { logger } from '../common/logger.js';
import { Worker, type Job } from 'bullmq';
import { redisConnection, notificationDispatchQueue } from './queues.js';
import { NotificationDispatchService } from '../services/notification.service.js';
import { User } from '../modules/Auth/model.js';
import { DeliveryLog } from '../modules/Communication/delivery-model.js';
import { randomUUID } from 'crypto';

interface NotificationDispatchJobData {
  notificationId: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipientId: string;
  schoolId?: string;
  title: string;
  message: string;
  data?: unknown;
}

export function createNotificationDispatchWorker(): Worker {
  const worker = new Worker(
    'notification-dispatch',
    async (job: Job<NotificationDispatchJobData>) => {
      const { type, recipientId, schoolId, title, message, data } = job.data;
      logger.info({ type, recipientId, attempt: job.attemptsMade + 1 }, 'Dispatching notification');

      const user = await User.findById(recipientId).select('email phone firstName lastName');
      const batchId = `dispatch-${randomUUID()}`;

      try {
        await NotificationDispatchService.dispatch({
          type,
          recipientEmail: user?.email,
          recipientPhone: user?.phone,
          recipientUserId: recipientId,
          schoolId,
          title,
          message,
          data,
        });

        // Log successful delivery
        if (schoolId && type !== 'in_app') {
          await DeliveryLog.create({
            schoolId,
            batchId,
            channel: type,
            recipientUserId: recipientId,
            recipientName: user ? `${user.firstName} ${user.lastName}` : undefined,
            recipientEmail: user?.email,
            recipientPhone: user?.phone,
            subject: title,
            bodyPreview: message.substring(0, 200),
            status: 'sent',
            sentAt: new Date(),
            retryCount: job.attemptsMade,
          });
        }

        logger.info({ type, title }, 'Notification dispatched successfully');
        return { dispatched: true, type };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';

        // Log failed delivery
        if (schoolId && type !== 'in_app') {
          await DeliveryLog.create({
            schoolId,
            batchId,
            channel: type,
            recipientUserId: recipientId,
            recipientName: user ? `${user.firstName} ${user.lastName}` : undefined,
            recipientEmail: user?.email,
            recipientPhone: user?.phone,
            subject: title,
            bodyPreview: message.substring(0, 200),
            status: 'failed',
            errorMessage: errMsg,
            failedAt: new Date(),
            retryCount: job.attemptsMade,
          });
        }

        throw err; // Let BullMQ handle retry
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'NotificationDispatch job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message, attempts: job?.attemptsMade }, 'NotificationDispatch job failed');
  });

  return worker;
}

export async function addNotificationDispatchJob(data: NotificationDispatchJobData): Promise<void> {
  await notificationDispatchQueue.add('notification-dispatch', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60_000 }, // 1min, 5min, 15min
  });
}
