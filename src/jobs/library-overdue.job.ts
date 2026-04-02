import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, libraryOverdueQueue } from './queues.js';

export function createLibraryOverdueWorker(): Worker {
  const worker = new Worker(
    'library-overdue',
    async (_job: Job) => {
      const { LibraryService } = await import('../modules/Library/service.js');
      const count = await LibraryService.markOverdueLoans();
      return { markedOverdue: count };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[Library Overdue] Job ${job?.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Library Overdue] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function scheduleLibraryOverdueCheck(): Promise<void> {
  await libraryOverdueQueue.add(
    'library-overdue-check',
    {},
    {
      repeat: { pattern: '0 8 * * *' }, // Daily at 8am
    },
  );
  logger.info('[Library Overdue] Daily overdue check scheduled');
}
