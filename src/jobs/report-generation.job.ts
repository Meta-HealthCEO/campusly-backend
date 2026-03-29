import { Worker, Job } from 'bullmq';
import { redisConnection, reportGenerationQueue } from './queues.js';

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
      console.log(`[ReportGenerationJob] Generating report for student ${studentId}, term ${term}, year ${academicYear}`);

      // Stub: In production, this would:
      // 1. Query marks for the student, term, and academic year
      // 2. Aggregate results by subject
      // 3. Generate a PDF report card
      // 4. Store the report and notify the parent

      // Simulate processing time
      console.log(`[ReportGenerationJob] Fetching marks for student ${studentId}...`);
      console.log(`[ReportGenerationJob] Aggregating results for term ${term}, year ${academicYear}...`);
      console.log(`[ReportGenerationJob] Report card generated successfully (stub)`);

      return {
        studentId,
        term,
        academicYear,
        status: 'generated',
        generatedAt: new Date().toISOString(),
      };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[ReportGenerationJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[ReportGenerationJob] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function addReportGenerationJob(data: ReportGenerationJobData): Promise<void> {
  await reportGenerationQueue.add('report-generation', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  console.log(`[ReportGenerationJob] Job queued for student ${data.studentId}, term ${data.term}`);
}
