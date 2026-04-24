import mongoose from 'mongoose';
import { GradingJob, IGradingJob } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { aiGradingQueue } from '../../jobs/queues.js';
import { publishMarkToGradebook } from '../Academic/service-gradebook-publish.js';
import { RubricTemplate, type IRubricTemplate } from './model-rubric-templates.js';

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
  data: {
    finalMark?: number;
    teacherNotes: string;
    criteriaScores?: Array<{ criterion: string; score: number; maxScore: number; feedback?: string }>;
  },
): Promise<IGradingJob> {
  const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

  if (!job) throw new NotFoundError('Grading job not found');
  if (job.status !== 'completed') {
    throw new BadRequestError('Can only review completed grading jobs');
  }
  if (!job.aiResult) {
    throw new BadRequestError('Cannot review a job before AI grading completes');
  }

  let resolvedMark: number;
  if (data.criteriaScores && data.criteriaScores.length > 0) {
    for (const c of data.criteriaScores) {
      if (c.score < 0 || c.score > c.maxScore) {
        throw new BadRequestError(
          `Score for "${c.criterion}" must be between 0 and ${c.maxScore}`,
        );
      }
    }
    resolvedMark = data.criteriaScores.reduce((s, c) => s + c.score, 0);
  } else if (data.finalMark !== undefined) {
    if (data.finalMark < 0 || data.finalMark > job.aiResult.maxMark) {
      throw new BadRequestError(`Final mark must be between 0 and ${job.aiResult.maxMark}`);
    }
    resolvedMark = data.finalMark;
  } else {
    throw new BadRequestError('Either finalMark or criteriaScores must be provided');
  }

  job.teacherOverride = {
    finalMark: resolvedMark,
    teacherNotes: data.teacherNotes,
    criteriaScores: data.criteriaScores,
  } as IGradingJob['teacherOverride'];
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
  if (filters.status) {
    const statuses = filters.status.split(',').map((s) => s.trim()).filter(Boolean);
    query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

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

// ─── Rubric Templates ─────────────────────────────────────────────────────────

export async function listRubricTemplates(
  schoolId: string,
  teacherId: string,
): Promise<IRubricTemplate[]> {
  const schoolOid = new mongoose.Types.ObjectId(schoolId);
  const teacherOid = new mongoose.Types.ObjectId(teacherId);
  return RubricTemplate.find({
    schoolId: schoolOid,
    $or: [{ teacherId: teacherOid }, { isShared: true }],
    isDeleted: false,
  }).sort({ name: 1 }).lean() as unknown as Promise<IRubricTemplate[]>;
}

export async function createRubricTemplate(
  schoolId: string,
  teacherId: string,
  data: {
    name: string;
    description?: string;
    criteria: Array<{ criterion: string; maxScore: number; description: string }>;
    isShared?: boolean;
  },
): Promise<IRubricTemplate> {
  const tpl = await RubricTemplate.create({
    ...data,
    schoolId: new mongoose.Types.ObjectId(schoolId),
    teacherId: new mongoose.Types.ObjectId(teacherId),
    isShared: data.isShared ?? false,
  });
  return tpl.toObject() as IRubricTemplate;
}

export async function deleteRubricTemplate(
  id: string,
  schoolId: string,
  teacherId: string,
): Promise<void> {
  const tpl = await RubricTemplate.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    teacherId: new mongoose.Types.ObjectId(teacherId),
    isDeleted: false,
  });
  if (!tpl) throw new NotFoundError('Rubric template not found');
  tpl.isDeleted = true;
  await tpl.save();
}
