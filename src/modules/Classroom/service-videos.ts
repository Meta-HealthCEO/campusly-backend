import mongoose from 'mongoose';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { VideoLesson, VideoProgress } from './model.js';
import { SessionService } from './service-sessions.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateVideoInput,
  UpdateVideoInput,
  UpdateProgressInput,
} from './validation.js';

const ADMIN_ROLES = new Set(['super_admin', 'school_admin', 'principal']);

function asObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function idToString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === 'object') {
    const record = value as { _id?: unknown; id?: unknown };
    if (record._id) return idToString(record._id);
    if (record.id) return String(record.id);
  }
  return String(value);
}

function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class VideoService {
  static async assertCanAccessVideo(
    video: { classId?: unknown; teacherId?: unknown; isPublished?: unknown },
    schoolId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    if (isAdminRole(role)) return;

    if (role === 'teacher') {
      if (idToString(video.teacherId) === userId) return;
      const classId = idToString(video.classId);
      if (video.isPublished && classId) {
        await SessionService.assertCanAccessClass(schoolId, userId, role, classId);
        return;
      }
      throw new ForbiddenError('You do not have access to this video');
    }

    if ((role === 'student' || role === 'parent') && video.isPublished) {
      const classId = idToString(video.classId);
      if (!classId) throw new ForbiddenError('You do not have access to this video');
      await SessionService.assertCanAccessClass(schoolId, userId, role, classId);
      return;
    }

    throw new ForbiddenError('You do not have access to this video');
  }

  static assertCanManageVideo(video: { teacherId?: unknown }, userId: string, role: string): void {
    if (isAdminRole(role)) return;
    if (role === 'teacher' && idToString(video.teacherId) === userId) return;
    throw new ForbiddenError('Only the video owner can manage this video');
  }

  static async createVideo(
    schoolId: string,
    teacherId: string,
    role: string,
    data: CreateVideoInput,
  ) {
    if (data.classId) {
      await SessionService.assertCanAccessClass(schoolId, teacherId, role, data.classId);
    }

    const video = await VideoLesson.create({
      schoolId: asObjectId(schoolId),
      title: data.title,
      description: data.description,
      subjectId: data.subjectId ? asObjectId(data.subjectId) : undefined,
      gradeId: data.gradeId ? asObjectId(data.gradeId) : undefined,
      classId: data.classId ? asObjectId(data.classId) : undefined,
      teacherId: asObjectId(teacherId),
      videoUrl: data.videoUrl,
      videoType: data.videoType,
      thumbnailUrl: data.thumbnailUrl,
      durationSeconds: data.durationSeconds,
      isPublished: data.isPublished ?? false,
      tags: data.tags ?? [],
      sessionId: data.sessionId ? asObjectId(data.sessionId) : undefined,
    });
    return video.toObject();
  }

  static async listVideos(
    schoolId: string,
    userId: string,
    role: string,
    filters: {
      subjectId?: string;
      gradeId?: string;
      classId?: string;
      videoType?: string;
      search?: string;
      published?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const soid = asObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };

    if (role === 'teacher') {
      query.teacherId = asObjectId(userId);
    } else if (!isAdminRole(role)) {
      const visibleClassIds = await SessionService.getVisibleClassIds(schoolId, userId, role);
      query.isPublished = true;
      query.classId = { $in: (visibleClassIds ?? []).map((id) => asObjectId(id)) };
    }

    if (filters.classId) {
      await SessionService.assertCanAccessClass(schoolId, userId, role, filters.classId);
      query.classId = asObjectId(filters.classId);
    }

    if (filters.subjectId) query.subjectId = asObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = asObjectId(filters.gradeId);
    if (filters.videoType) query.videoType = filters.videoType;
    if (filters.published !== undefined && (role === 'teacher' || isAdminRole(role))) {
      query.isPublished = filters.published;
    }
    if (filters.search?.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [videos, total] = await Promise.all([
      VideoLesson.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'firstName lastName')
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name')
        .populate('classId', 'name')
        .lean(),
      VideoLesson.countDocuments(query),
    ]);

    return { videos, total, page: filters.page ?? 1, limit };
  }

  static async getVideo(id: string, schoolId: string, userId: string, role: string) {
    const video = await VideoLesson.findOne({
      _id: asObjectId(id),
      schoolId: asObjectId(schoolId),
      isDeleted: false,
    })
      .populate('teacherId', 'firstName lastName')
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('classId', 'name')
      .lean();
    if (!video) throw new NotFoundError('Video not found');

    await VideoService.assertCanAccessVideo(video, schoolId, userId, role);

    await VideoLesson.findOneAndUpdate(
      { _id: asObjectId(id), schoolId: asObjectId(schoolId) },
      { $inc: { viewCount: 1 } },
    );

    return video;
  }

  static async updateVideo(
    id: string,
    schoolId: string,
    userId: string,
    role: string,
    data: UpdateVideoInput,
  ) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);

    const existing = await VideoLesson.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Video not found');
    VideoService.assertCanManageVideo(existing, userId, role);

    if (data.classId) {
      await SessionService.assertCanAccessClass(schoolId, userId, role, data.classId);
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.subjectId !== undefined) update.subjectId = asObjectId(data.subjectId);
    if (data.gradeId !== undefined) update.gradeId = asObjectId(data.gradeId);
    if (data.classId !== undefined) update.classId = asObjectId(data.classId);
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

  static async deleteVideo(id: string, schoolId: string, userId: string, role: string) {
    const soid = asObjectId(schoolId);
    const oid = asObjectId(id);
    const video = await VideoLesson.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!video) throw new NotFoundError('Video not found');
    VideoService.assertCanManageVideo(video, userId, role);

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
    await VideoService.getVideo(videoId, schoolId, studentId, 'student');

    const soid = asObjectId(schoolId);
    const vidOid = asObjectId(videoId);
    const studOid = asObjectId(studentId);

    if (data.totalSeconds <= 0) throw new BadRequestError('totalSeconds must be greater than 0');

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

  static async getWatchHistory(
    studentId: string,
    schoolId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const schoolObjectId = asObjectId(schoolId);
    const requestedObjectId = asObjectId(studentId);
    const student = await Student.findOne({
      $or: [{ _id: requestedObjectId }, { userId: requestedObjectId }],
      schoolId: schoolObjectId,
      isDeleted: false,
    })
      .select('_id userId classId')
      .lean();

    if (requesterRole === 'student' && requesterId !== idToString(student?.userId ?? studentId)) {
      throw new ForbiddenError('You can only view your own watch history');
    }

    if (requesterRole === 'parent') {
      const parent = await Parent.findOne({
        userId: asObjectId(requesterId),
        schoolId: schoolObjectId,
        childrenIds: student?._id,
        isDeleted: false,
      }).lean();
      if (!parent) throw new ForbiddenError('You can only view your children watch history');
    }

    if (requesterRole === 'teacher') {
      if (!student) throw new NotFoundError('Student not found');
      await SessionService.assertCanAccessClass(
        schoolId,
        requesterId,
        requesterRole,
        idToString(student.classId),
      );
    }

    if (!student && requesterRole !== 'student') throw new NotFoundError('Student not found');
    const progressUserId = idToString(student?.userId ?? studentId);

    return VideoProgress.find({
      studentId: asObjectId(progressUserId),
      schoolId: schoolObjectId,
      isDeleted: false,
    })
      .populate('videoId', 'title thumbnailUrl durationSeconds videoType')
      .sort({ lastWatchedAt: -1 })
      .lean();
  }
}
