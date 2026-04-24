import { GradingJob, IGradingJob, AIUsageLog } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { aiGradingQueue } from '../../jobs/queues.js';
import { publishMarkToGradebook } from '../Academic/service-gradebook-publish.js';

interface GradingFilters {
  assignmentId?: string;
  studentId?: string;
  status?: string;
}

export async function gradeSubmission(
  teacherId: string,
  schoolId: string,
  data: {
    assignmentId: string;
    studentId: string;
    submissionText: string;
    rubric: Array<{ criterion: string; maxScore: number; description: string }>;
  },
): Promise<IGradingJob> {
  const job = await GradingJob.create({
    schoolId,
    teacherId,
    assignmentId: data.assignmentId,
    studentId: data.studentId,
    submissionText: data.submissionText,
    rubric: data.rubric,
    status: 'queued',
  });

  await aiGradingQueue.add('grade-submission', {
    jobId: String(job._id),
    teacherId,
    schoolId,
  });

  return job;
}

export async function bulkGrade(
  teacherId: string,
  schoolId: string,
  data: {
    assignmentId: string;
    submissions: Array<{ studentId: string; submissionText: string }>;
    rubric: Array<{ criterion: string; maxScore: number; description: string }>;
  },
): Promise<IGradingJob[]> {
  const jobs: IGradingJob[] = [];

  for (const submission of data.submissions) {
    const job = await GradingJob.create({
      schoolId,
      teacherId,
      assignmentId: data.assignmentId,
      studentId: submission.studentId,
      submissionText: submission.submissionText,
      rubric: data.rubric,
      status: 'queued',
    });

    await aiGradingQueue.add('grade-submission', {
      jobId: String(job._id),
      teacherId,
      schoolId,
    });

    jobs.push(job);
  }

  return jobs;
}

export async function reviewGrade(
  jobId: string,
  schoolId: string,
  teacherOverride: { finalMark: number; teacherNotes: string },
): Promise<IGradingJob> {
  const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

  if (!job) throw new NotFoundError('Grading job not found');
  if (job.status !== 'completed') {
    throw new BadRequestError('Can only review completed grading jobs');
  }
  if (!job.aiResult) {
    throw new BadRequestError('Cannot review a job before AI grading completes');
  }
  if (teacherOverride.finalMark < 0 || teacherOverride.finalMark > job.aiResult.maxMark) {
    throw new BadRequestError(
      `Final mark must be between 0 and ${job.aiResult.maxMark}`,
    );
  }

  job.teacherOverride = teacherOverride;
  job.status = 'reviewed';
  await job.save();

  return job;
}

export async function publishGrade(
  jobId: string,
  schoolId: string,
  assessmentId: string,
  comment?: string,
): Promise<IGradingJob> {
  const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

  if (!job) throw new NotFoundError('Grading job not found');
  if (job.status !== 'completed' && job.status !== 'reviewed') {
    throw new BadRequestError('Can only publish completed or reviewed grading jobs');
  }

  const resolvedMark =
    job.teacherOverride?.finalMark ??
    job.aiResult?.totalMark ??
    0;

  await publishMarkToGradebook({
    schoolId,
    assessmentId,
    studentId: job.studentId.toString(),
    mark: resolvedMark,
    comment: comment ?? job.teacherOverride?.teacherNotes,
  });

  job.status = 'published';
  await job.save();
  return job;
}

export async function retryGrade(jobId: string, schoolId: string): Promise<IGradingJob> {
  const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

  if (!job) throw new NotFoundError('Grading job not found');
  if (
    job.status === 'completed' ||
    job.status === 'reviewed' ||
    job.status === 'published'
  ) {
    throw new BadRequestError('Only queued or grading jobs can be retried');
  }

  job.status = 'queued';
  job.aiResult = undefined;
  await job.save();

  await aiGradingQueue.add('grade-submission', { jobId: job._id.toString() });
  return job;
}

export async function getGradingJobs(
  schoolId: string,
  filters: GradingFilters,
  page?: number,
  limit?: number,
): Promise<{ jobs: IGradingJob[]; total: number }> {
  const { skip, limit: take } = paginationHelper(page, limit);

  const query: Record<string, unknown> = { schoolId, isDeleted: false };

  if (filters.assignmentId) query.assignmentId = filters.assignmentId;
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.status) query.status = filters.status;

  const [jobs, total] = await Promise.all([
    GradingJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('teacherId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName'),
    GradingJob.countDocuments(query),
  ]);

  return { jobs, total };
}

export async function getGradingJobById(
  id: string,
  schoolId: string,
): Promise<IGradingJob> {
  const job = await GradingJob.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('teacherId', 'firstName lastName email')
    .populate('studentId', 'firstName lastName');

  if (!job) throw new NotFoundError('Grading job not found');
  return job;
}
