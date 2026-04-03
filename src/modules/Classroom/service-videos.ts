import mongoose from 'mongoose';
import { VideoLesson, VideoProgress } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateVideoInput,
  UpdateVideoInput,
  UpdateProgressInput,
} from './validation.js';

// ─── Videos ───────────────────────────────────────────────────────────────────

export class VideoService {
  static async createVideo(schoolId: string, teacherId: string, data: CreateVideoInput) {
    const video = await VideoLesson.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      title: data.title,
      description: data.description,
      subjectId: data.subjectId ? new mongoose.Types.ObjectId(data.subjectId) : undefined,
      gradeId: data.gradeId ? new mongoose.Types.ObjectId(data.gradeId) : undefined,
      classId: data.classId ? new mongoose.Types.ObjectId(data.classId) : undefined,
      teacherId: new mongoose.Types.ObjectId(teacherId),
      videoUrl: data.videoUrl,
      videoType: data.videoType,
      thumbnailUrl: data.thumbnailUrl,
      durationSeconds: data.durationSeconds,
      isPublished: data.isPublished ?? false,
      tags: data.tags ?? [],
      sessionId: data.sessionId ? new mongoose.Types.ObjectId(data.sessionId) : undefined,
    });
    return video.toObject();
  }

  static async listVideos(
    schoolId: string,
    filters: {
      subjectId?: string;
      gradeId?: string;
      classId?: string;
      published?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };

    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    if (filters.classId) query.classId = new mongoose.Types.ObjectId(filters.classId);
    if (filters.published !== undefined) query.isPublished = filters.published;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [videos, total] = await Promise.all([
      VideoLesson.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'firstName lastName')
        .populate('subjectId', 'name')
        .lean(),
      VideoLesson.countDocuments(query),
    ]);

    return { videos, total, page: filters.page ?? 1, limit };
  }

  static async getVideo(id: string, schoolId: string) {
    const video = await VideoLesson.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('teacherId', 'firstName lastName')
      .populate('subjectId', 'name')
      .lean();
    if (!video) throw new NotFoundError('Video not found');

    // Increment view count
    await VideoLesson.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
      { $inc: { viewCount: 1 } },
    );

    return video;
  }

  static async updateVideo(id: string, schoolId: string, data: UpdateVideoInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.subjectId !== undefined) update.subjectId = new mongoose.Types.ObjectId(data.subjectId);
    if (data.gradeId !== undefined) update.gradeId = new mongoose.Types.ObjectId(data.gradeId);
    if (data.classId !== undefined) update.classId = new mongoose.Types.ObjectId(data.classId);
    if (data.videoUrl !== undefined) update.videoUrl = data.videoUrl;
    if (data.videoType !== undefined) update.videoType = data.videoType;
    if (data.thumbnailUrl !== undefined) update.thumbnailUrl = data.thumbnailUrl;
    if (data.durationSeconds !== undefined) update.durationSeconds = data.durationSeconds;
    if (data.isPublished !== undefined) update.isPublished = data.isPublished;
    if (data.tags !== undefined) update.tags = data.tags;

    const video = await VideoLesson.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    if (!video) throw new NotFoundError('Video not found');
    return video;
  }

  static async deleteVideo(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const video = await VideoLesson.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!video) throw new NotFoundError('Video not found');
    await VideoLesson.findOneAndUpdate(
      { _id: oid, schoolId: soid },
      { $set: { isDeleted: true } },
    );
  }

  static async updateProgress(
    videoId: string,
    studentId: string,
    schoolId: string,
    data: UpdateProgressInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const vidOid = new mongoose.Types.ObjectId(videoId);
    const studOid = new mongoose.Types.ObjectId(studentId);

    const progressPercent = Math.min(
      100,
      Math.round((data.watchedSeconds / data.totalSeconds) * 100),
    );
    const isCompleted = progressPercent >= 90;

    const progress = await VideoProgress.findOneAndUpdate(
      { videoId: vidOid, studentId: studOid, isDeleted: false },
      {
        $set: {
          schoolId: soid,
          watchedSeconds: data.watchedSeconds,
          totalSeconds: data.totalSeconds,
          progressPercent,
          isCompleted,
          lastWatchedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    ).lean();

    return progress;
  }

  static async getWatchHistory(studentId: string, schoolId: string) {
    return VideoProgress.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('videoId', 'title thumbnailUrl durationSeconds videoType')
      .sort({ lastWatchedAt: -1 })
      .lean();
  }
}
