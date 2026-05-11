import mongoose from 'mongoose';
import { ContentResource } from '../ContentLibrary/model.js';
import { PaperImportJob, type JobStatus } from './model.js';
import { purgeJobFiles } from './service-storage.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';

interface ListFilters {
  status?: JobStatus;
  limit?: number;
  offset?: number;
}

export class PaperImportJobsService {
  static async list(schoolId: string, teacherId: string, filters: ListFilters) {
    const query: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
      isDeleted: false,
    };
    if (filters.status) query.status = filters.status;
    const limit = filters.limit ?? 25;
    const offset = filters.offset ?? 0;
    const [rows, total] = await Promise.all([
      PaperImportJob.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      PaperImportJob.countDocuments(query),
    ]);
    return { items: rows, total };
  }

  static async get(jobId: string, schoolId: string, teacherId: string) {
    const job = await PaperImportJob.findOne({
      _id: jobId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
      isDeleted: false,
    }).lean();
    if (!job) throw new NotFoundError('Job not found');
    return job;
  }

  static async countRunningForTeacher(schoolId: string, teacherId: string): Promise<number> {
    return PaperImportJob.countDocuments({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
      status: { $in: ['pending', 'running'] },
      isDeleted: false,
    });
  }

  static async cancel(jobId: string, schoolId: string, teacherId: string) {
    const job = await PaperImportJob.findOneAndUpdate(
      {
        _id: jobId,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        teacherId: new mongoose.Types.ObjectId(teacherId),
        status: { $in: ['pending', 'running'] },
        isDeleted: false,
      },
      { $set: { status: 'cancelled' } },
      { new: true },
    );
    if (!job) throw new NotFoundError('Job not found or not cancellable');
    return job;
  }

  static async softDelete(jobId: string, schoolId: string, teacherId: string) {
    const job = await PaperImportJob.findOne({
      _id: jobId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
      isDeleted: false,
    });
    if (!job) throw new NotFoundError('Job not found');
    if (job.status === 'running' || job.status === 'pending') {
      throw new ForbiddenError('Cancel the job before deleting it');
    }
    job.isDeleted = true;
    await job.save();
    purgeJobFiles(String(job._id));
    await ContentResource.updateMany(
      { 'sourceImport.jobId': job._id },
      { $unset: { sourceImport: 1 } },
    );
  }
}
