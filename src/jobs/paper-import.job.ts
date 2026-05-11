import { Worker, Job } from 'bullmq';
import { logger } from '../common/logger.js';
import { redisConnection, paperImportQueue } from './queues.js';
import { PaperImportJob } from '../modules/PaperImport/model.js';
import { runConversion } from '../modules/PaperImport/service-worker.js';

interface PaperImportJobData {
  jobId: string;
  teacherId: string;
  schoolId: string;
}

export function createPaperImportWorker(): Worker {
  const concurrency = Number(process.env.PAPER_IMPORT_WORKER_CONCURRENCY ?? 2);
  const worker = new Worker(
    'paper-import',
    async (job: Job<PaperImportJobData>) => {
      logger.info(`[PaperImport] start jobId=${job.data.jobId}`);
      const dbJob = await PaperImportJob.findOne({
        _id: job.data.jobId,
        schoolId: job.data.schoolId,
        isDeleted: false,
      });
      if (!dbJob) throw new Error(`PaperImportJob ${job.data.jobId} not found`);
      await runConversion(dbJob);
      logger.info(`[PaperImport] complete jobId=${job.data.jobId}`);
    },
    { connection: redisConnection, concurrency, autorun: true },
  );

  worker.on('failed', async (bullJob, err) => {
    logger.error(`[PaperImport] job ${bullJob?.id} failed: ${err.message}`);
    if (bullJob && bullJob.attemptsMade >= (bullJob.opts?.attempts ?? 3)) {
      try {
        await PaperImportJob.findOneAndUpdate(
          { _id: bullJob.data.jobId, schoolId: bullJob.data.schoolId, isDeleted: false },
          { $set: { status: 'failed', error: { code: 'worker_failure', message: err.message } } },
        );
      } catch (cleanupErr: unknown) {
        logger.error(`[PaperImport] cleanup failed: ${(cleanupErr as Error).message}`);
      }
    }
  });

  return worker;
}

export async function enqueuePaperImportJob(data: PaperImportJobData): Promise<void> {
  await paperImportQueue.add('convert', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 86400 },
  });
}
