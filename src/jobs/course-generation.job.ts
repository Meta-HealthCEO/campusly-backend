import { Worker, Job } from 'bullmq';
import { logger } from '../common/logger.js';
import { redisConnection, courseGenerationQueue } from './queues.js';

export interface CourseGenerationJobData {
  courseId: string;
  schoolId: string;
  /** Write just this item (a retry); otherwise every pending item. */
  lessonId?: string;
}

/** How long to wait for Redis before writing the unit in this process instead. */
const QUEUE_TIMEOUT_MS = 3000;

async function run(data: CourseGenerationJobData): Promise<void> {
  const { runCourseGeneration } = await import('../modules/Course/service-course-generation.js');
  await runCourseGeneration(data.courseId, data.schoolId, data.lessonId);
}

export function createCourseGenerationWorker(): Worker {
  const worker = new Worker(
    'course-generation',
    async (job: Job<CourseGenerationJobData>) => {
      logger.info(`[CourseGeneration] start courseId=${job.data.courseId}${job.data.lessonId ? ` lessonId=${job.data.lessonId}` : ''}`);
      await run(job.data);
      logger.info(`[CourseGeneration] complete courseId=${job.data.courseId}`);
    },
    // Each job already writes three items at a time.
    { connection: redisConnection, concurrency: 1, autorun: true },
  );
  worker.on('failed', (job, err) => {
    logger.error(`[CourseGeneration] job ${job?.id} failed: ${err.message}`);
  });
  return worker;
}

/**
 * Queues the writing of a unit's items. When Redis can't take the job, the
 * unit is written in this process instead, so a teacher never waits on a
 * queue that isn't there. A run that finds nothing pending does nothing, so a
 * late queue add after the fallback can't write an item twice.
 */
export async function enqueueCourseGeneration(data: CourseGenerationJobData): Promise<void> {
  try {
    await Promise.race([
      courseGenerationQueue.add('write-items', data, { attempts: 1, removeOnComplete: { age: 86400 }, removeOnFail: { age: 86400 } }),
      new Promise((_, reject) => { setTimeout(() => reject(new Error('queue timeout')), QUEUE_TIMEOUT_MS); }),
    ]);
  } catch (err: unknown) {
    logger.warn({ err }, '[CourseGeneration] queue unavailable; writing the unit in-process');
    void run(data).catch((runErr: unknown) => {
      logger.error({ err: runErr }, '[CourseGeneration] in-process run failed');
    });
  }
}
