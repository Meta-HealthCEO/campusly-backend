import { Queue } from 'bullmq';
import { config } from '../config/env.js';

function parseRedisUrl(url: string): { host: string; port: number } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port, 10) || 6379,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

export const redisConnection = parseRedisUrl(config.redis.url);

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 5000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

export const paymentReminderQueue = new Queue('payment-reminder', {
  connection: redisConnection,
  defaultJobOptions,
});

export const attendanceAlertQueue = new Queue('attendance-alert', {
  connection: redisConnection,
  defaultJobOptions,
});

export const lowBalanceAlertQueue = new Queue('low-balance-alert', {
  connection: redisConnection,
  defaultJobOptions,
});

export const reportGenerationQueue = new Queue('report-generation', {
  connection: redisConnection,
  defaultJobOptions,
});

export const notificationDispatchQueue = new Queue('notification-dispatch', {
  connection: redisConnection,
  defaultJobOptions,
});

export const collectionsEscalationQueue = new Queue('collections-escalation', {
  connection: redisConnection,
  defaultJobOptions,
});

export const lateFeeCalculatorQueue = new Queue('late-fee-calculator', {
  connection: redisConnection,
  defaultJobOptions,
});

export const transportBoardingQueue = new Queue('transport-boarding', {
  connection: redisConnection,
  defaultJobOptions,
});

export const libraryOverdueQueue = new Queue('library-overdue', {
  connection: redisConnection,
  defaultJobOptions,

});

export const bulkMessageQueue = new Queue('bulk-message', {
  connection: redisConnection,
  defaultJobOptions,
});

export const lostFoundArchiveQueue = new Queue('lost-found-archive', {
  connection: redisConnection,
  defaultJobOptions,
});

export const aiGradingQueue = new Queue('ai-grading', {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 3,
  },
});

export const lessonNotesQueue = new Queue('lesson-notes', {
  connection: redisConnection,
  defaultJobOptions,
});

export const communicationQueue = new Queue('communication-send', {
  connection: redisConnection,
  defaultJobOptions,
});

export const paperImportQueue = new Queue('paper-import', {
  connection: redisConnection,
});
