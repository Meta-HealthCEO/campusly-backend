import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, notificationDispatchQueue } from './queues.js';
import { NotificationDispatchService } from '../services/notification.service.js';
import { User } from '../modules/Auth/model.js';

interface NotificationDispatchJobData {
  notificationId: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipientId: string;
  title: string;
  message: string;
  data?: unknown;
}

export function createNotificationDispatchWorker(): Worker {
  const worker = new Worker(
    'notification-dispatch',
    async (job: Job<NotificationDispatchJobData>) => {
      const { type, recipientId, title, message, data } = job.data;
      logger.info(`[NotificationDispatchJob] Dispatching ${type} notification to user ${recipientId}`);

      // Look up recipient contact details
      const user = await User.findById(recipientId).select('email phone');

      await NotificationDispatchService.dispatch({
        type,
        recipientEmail: user?.email,
        recipientPhone: user?.phone,
        title,
        message,
        data,
      });

      logger.info(`[NotificationDispatchJob] Dispatched ${type} notification: ${title}`);
      return { dispatched: true, type };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[NotificationDispatchJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[NotificationDispatchJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function addNotificationDispatchJob(data: NotificationDispatchJobData): Promise<void> {
  await notificationDispatchQueue.add('notification-dispatch', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
  });
}
