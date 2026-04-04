import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, aiGradingQueue } from './queues.js';
import { GradingJob } from '../modules/AITools/model.js';
import { AIUsageLog } from '../modules/AITools/model.js';
import { AIService } from '../services/ai.service.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

interface AIGradingJobData {
  jobId: string;
  teacherId: string;
  schoolId: string;
}

interface AIGradingResult {
  totalMark: number;
  maxMark: number;
  percentage: number;
  criteriaScores: Array<{
    criterion: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
}

export function createAIGradingWorker(): Worker {
  const worker = new Worker(
    'ai-grading',
    async (job: Job<AIGradingJobData>) => {
      logger.info(`[AIGradingJob] Processing job ${job.id} (grading job: ${job.data.jobId})`);

      const gradingJob = await GradingJob.findById(job.data.jobId);
      if (!gradingJob) {
        throw new Error(`GradingJob ${job.data.jobId} not found`);
      }

      gradingJob.status = 'grading';
      await gradingJob.save();

      const rubricText = gradingJob.rubric
        .map((r) => `- ${r.criterion} (max ${r.maxScore}): ${r.description}`)
        .join('\n');

      const maxMark = gradingJob.rubric.reduce((sum, r) => sum + r.maxScore, 0);

      const systemPrompt = `You are an expert teacher and assessor. Grade the following student submission against the provided rubric.
Be fair, constructive, and specific in your feedback. Return JSON with this exact structure:
{
  "totalMark": <number>,
  "maxMark": ${maxMark},
  "percentage": <number>,
  "criteriaScores": [
    {
      "criterion": "<criterion name>",
      "score": <number>,
      "maxScore": <number>,
      "feedback": "<specific feedback for this criterion>"
    }
  ],
  "overallFeedback": "<overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>"]
}`;

      const userPrompt = `Rubric:
${rubricText}

Student Submission:
${gradingJob.submissionText}

Grade this submission against each criterion. Be specific and constructive.`;

      const { data: aiResult, usage } = await AIService.generateJSONWithUsage<AIGradingResult>(systemPrompt, userPrompt);

      gradingJob.aiResult = aiResult;
      gradingJob.status = 'completed';
      await gradingJob.save();

      await AIUsageLog.create({
        schoolId: job.data.schoolId,
        teacherId: job.data.teacherId,
        type: 'grading',
        tokensUsed: {
          input: usage?.input_tokens ?? 0,
          output: usage?.output_tokens ?? 0,
        },
        aiModel: ANTHROPIC_MODEL,
      });

      logger.info(
        `[AIGradingJob] Completed grading job ${job.data.jobId}: ${aiResult.totalMark}/${aiResult.maxMark}`,
      );

      return { jobId: job.data.jobId, totalMark: aiResult.totalMark, maxMark: aiResult.maxMark };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    logger.info(`[AIGradingJob] Job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`[AIGradingJob] Job ${job?.id} failed: ${err.message}`);

    // Update grading job status on final failure
    if (job && job.attemptsMade >= (job.opts?.attempts ?? 3)) {
      try {
        await GradingJob.findByIdAndUpdate(job.data.jobId, { status: 'queued' });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  return worker;
}

export async function addAIGradingJob(data: AIGradingJobData): Promise<void> {
  await aiGradingQueue.add('grade-submission', data);
}
