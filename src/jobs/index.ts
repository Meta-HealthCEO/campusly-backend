import { Worker } from 'bullmq';
import { redisConnection } from './queues.js';

export {
  paymentReminderQueue,
  attendanceAlertQueue,
  lowBalanceAlertQueue,
  reportGenerationQueue,
  notificationDispatchQueue,
  redisConnection,
} from './queues.js';

export { schedulePaymentReminders } from './payment-reminder.job.js';
export { addAttendanceAlertJob } from './attendance-alert.job.js';
export { scheduleLowBalanceAlerts } from './low-balance-alert.job.js';
export { addNotificationDispatchJob } from './notification-dispatch.job.js';
export { addReportGenerationJob } from './report-generation.job.js';

export async function setupWorkers(): Promise<Worker[]> {
  const workers: Worker[] = [];

  try {
    // Test Redis connectivity before starting workers
    const { Redis } = await import('ioredis');
    const testConnection = new Redis({
      host: redisConnection.host,
      port: redisConnection.port,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });

    await testConnection.ping();
    await testConnection.quit();

    console.log('[Jobs] Redis is available, starting workers...');

    const { createPaymentReminderWorker } = await import('./payment-reminder.job.js');
    const { createAttendanceAlertWorker } = await import('./attendance-alert.job.js');
    const { createLowBalanceAlertWorker } = await import('./low-balance-alert.job.js');
    const { createNotificationDispatchWorker } = await import('./notification-dispatch.job.js');
    const { createReportGenerationWorker } = await import('./report-generation.job.js');

    workers.push(createPaymentReminderWorker());
    workers.push(createAttendanceAlertWorker());
    workers.push(createLowBalanceAlertWorker());
    workers.push(createNotificationDispatchWorker());
    workers.push(createReportGenerationWorker());

    console.log(`[Jobs] ${workers.length} workers started successfully`);

    // Schedule repeatable jobs
    const { schedulePaymentReminders } = await import('./payment-reminder.job.js');
    const { scheduleLowBalanceAlerts } = await import('./low-balance-alert.job.js');

    await schedulePaymentReminders();
    await scheduleLowBalanceAlerts();

    console.log('[Jobs] Repeatable jobs scheduled');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Jobs] Redis not available, workers not started: ${message}`);
    console.warn('[Jobs] The application will run without background job processing');
  }

  return workers;
}
