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

export const paymentReminderQueue = new Queue('payment-reminder', {
  connection: redisConnection,
});

export const attendanceAlertQueue = new Queue('attendance-alert', {
  connection: redisConnection,
});

export const lowBalanceAlertQueue = new Queue('low-balance-alert', {
  connection: redisConnection,
});

export const reportGenerationQueue = new Queue('report-generation', {
  connection: redisConnection,
});

export const notificationDispatchQueue = new Queue('notification-dispatch', {
  connection: redisConnection,
});
