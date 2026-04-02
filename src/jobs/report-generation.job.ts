import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, reportGenerationQueue } from './queues.js';
import { ReportService } from '../modules/Report/service.js';

interface ReportGenerationJobData {
  studentId: string;
  term: number;
  academicYear: number;
}

export function createReportGenerationWorker(): Worker {
  const worker = new Worker(
    'report-generation',
    async (job: Job<ReportGenerationJobData>) => {
      const { studentId, term, academicYear } = job.data;
      logger.info(`[ReportGenerationJob] Generating report for student ${studentId}, term ${term}, year ${academicYear}`);

      const reportCard = await ReportService.getStudentReportCard(studentId, term, academicYear);

      logger.info(`[ReportGenerationJob] Report card generated for student ${studentId}, term ${term}, year ${academicYear}`);

      return {
        studentId,
        term,
        academicYear,
        status: 'generated',
        generatedAt: new Date().toISOString(),
        marks: reportCard.marks,
      };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[ReportGenerationJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[ReportGenerationJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function addReportGenerationJob(data: ReportGenerationJobData): Promise<void> {
  await reportGenerationQueue.add('report-generation', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  logger.info(`[ReportGenerationJob] Job queued for student ${data.studentId}, term ${data.term}`);
}
