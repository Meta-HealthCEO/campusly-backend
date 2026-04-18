import { logger } from '../common/logger.js';
import { Worker } from 'bullmq';
import { redisConnection } from './queues.js';

export {
  paymentReminderQueue,
  attendanceAlertQueue,
  lowBalanceAlertQueue,
  reportGenerationQueue,
  notificationDispatchQueue,
  collectionsEscalationQueue,
  lateFeeCalculatorQueue,
  libraryOverdueQueue,
  bulkMessageQueue,
  lostFoundArchiveQueue,
  aiGradingQueue,
  redisConnection,
} from './queues.js';

export { schedulePaymentReminders } from './payment-reminder.job.js';
export { addAttendanceAlertJob } from './attendance-alert.job.js';
export { scheduleLowBalanceAlerts } from './low-balance-alert.job.js';
export { addNotificationDispatchJob } from './notification-dispatch.job.js';
export { addReportGenerationJob } from './report-generation.job.js';
export { scheduleCollectionsEscalation } from './collections-escalation.job.js';
export { scheduleLateFeeCalculation } from './late-fee-calculator.job.js';
export { scheduleLibraryOverdueCheck } from './library-overdue.job.js';
export { scheduleLostFoundArchive } from './lost-found-archive.job.js';
export { addAIGradingJob } from './ai-grading.job.js';

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

    logger.info('[Jobs] Redis is available, starting workers...');

    const { createPaymentReminderWorker } = await import('./payment-reminder.job.js');
    const { createAttendanceAlertWorker } = await import('./attendance-alert.job.js');
    const { createLowBalanceAlertWorker } = await import('./low-balance-alert.job.js');
    const { createNotificationDispatchWorker } = await import('./notification-dispatch.job.js');
    const { createReportGenerationWorker } = await import('./report-generation.job.js');
    const { createCollectionsEscalationWorker } = await import('./collections-escalation.job.js');
    const { createLateFeeCalculatorWorker } = await import('./late-fee-calculator.job.js');

    workers.push(createPaymentReminderWorker());
    workers.push(createAttendanceAlertWorker());
    workers.push(createLowBalanceAlertWorker());
    workers.push(createNotificationDispatchWorker());
    workers.push(createReportGenerationWorker());
    workers.push(createCollectionsEscalationWorker());
    workers.push(createLateFeeCalculatorWorker());

    const { createLibraryOverdueWorker } = await import('./library-overdue.job.js');
    workers.push(createLibraryOverdueWorker());

    const { createLostFoundArchiveWorker } = await import('./lost-found-archive.job.js');
    workers.push(createLostFoundArchiveWorker());

    const { createAIGradingWorker } = await import('./ai-grading.job.js');
    workers.push(createAIGradingWorker());

    const { createLessonNotesWorker } = await import('./lesson-notes.job.js');
    workers.push(createLessonNotesWorker());

    logger.info(`[Jobs] ${workers.length} workers started successfully`);

    // Schedule repeatable jobs
    const { schedulePaymentReminders } = await import('./payment-reminder.job.js');
    const { scheduleLowBalanceAlerts } = await import('./low-balance-alert.job.js');

    await schedulePaymentReminders();
    await scheduleLowBalanceAlerts();

    const { scheduleCollectionsEscalation } = await import('./collections-escalation.job.js');
    const { scheduleLateFeeCalculation } = await import('./late-fee-calculator.job.js');
    await scheduleCollectionsEscalation();
    await scheduleLateFeeCalculation();

    const { scheduleLibraryOverdueCheck } = await import('./library-overdue.job.js');
    await scheduleLibraryOverdueCheck();

    const { scheduleLostFoundArchive } = await import('./lost-found-archive.job.js');
    await scheduleLostFoundArchive();

    logger.info('[Jobs] Repeatable jobs scheduled');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('⚠️  CRITICAL: Redis unavailable — ALL background jobs are DISABLED');
    logger.error('⚠️  Late fees, reminders, escalations, and AI grading will NOT run');
    logger.warn(`[Jobs] Redis not available, workers not started: ${message}`);
  }

  return workers;
}
