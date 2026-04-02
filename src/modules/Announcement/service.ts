import mongoose from 'mongoose';
import { Announcement, IAnnouncement } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from './validation.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId: string;
}

export class AnnouncementService {
  static async create(data: CreateAnnouncementInput, authorId: string): Promise<IAnnouncement> {
    const announcement = await Announcement.create({
      ...data,
      authorId,
    });

    return announcement;
  }

  static async list(
    query: ListQuery,
  ): Promise<{
    announcements: IAnnouncement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      isDeleted: false,
      schoolId: query.schoolId,
    };

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('authorId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(filter),
    ]);

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string, schoolId: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async update(id: string, schoolId: string, data: UpdateAnnouncementInput): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async delete(id: string, schoolId: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async publish(id: string, schoolId: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isPublished: true, publishedAt: new Date() } },
      { new: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async unpublish(id: string, schoolId: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isPublished: false } },
      { new: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async getActive(
    schoolId: string,
    userRole: string,
    query: { page?: number; limit?: number },
  ): Promise<{
    announcements: IAnnouncement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const now = new Date();

    // Map user role to target audiences they can see
    const audienceFilter: string[] = ['all'];

    if (userRole === 'teacher') {
      audienceFilter.push('teachers');
    } else if (userRole === 'parent') {
      audienceFilter.push('parents');
    } else if (userRole === 'student') {
      audienceFilter.push('students');
    } else if (userRole === 'super_admin' || userRole === 'school_admin') {
      // Admins can see all announcements
      audienceFilter.push('teachers', 'parents', 'students', 'grade', 'class');
    }

    const filter: Record<string, unknown> = {
      schoolId,
      isPublished: true,
      isDeleted: false,
      targetAudience: { $in: audienceFilter },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    };

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('authorId', 'firstName lastName email')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Scheduled Publish ─────────────────────────────────────────────────

  static async schedulePublish(
    announcementId: string,
    schoolId: string,
    publishAt: string,
  ): Promise<IAnnouncement> {
    const scheduledDate = new Date(publishAt);
    if (scheduledDate <= new Date()) {
      throw new BadRequestError('Scheduled publish date must be in the future');
    }

    const announcement = await Announcement.findOneAndUpdate(
      { _id: announcementId, schoolId, isDeleted: false },
      { $set: { scheduledPublishDate: scheduledDate } },
      { new: true, runValidators: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  // ─── Read Tracking ─────────────────────────────────────────────────────

  static async markAnnouncementRead(
    userId: string,
    announcementId: string,
  ): Promise<IAnnouncement> {
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Check if already read
    const existing = await Announcement.findOne({
      _id: announcementId,
      isDeleted: false,
      'readBy.userId': userObjId,
    });
    if (existing) return existing;

    const announcement = await Announcement.findOneAndUpdate(
      { _id: announcementId, isDeleted: false },
      { $push: { readBy: { userId: userObjId, readAt: new Date() } } },
      { new: true },
    );

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async getReadAnalytics(schoolId: string, announcementId: string) {
    const announcement = await Announcement.findOne({
      _id: announcementId,
      schoolId,
      isDeleted: false,
    })
      .populate('readBy.userId', 'firstName lastName email role')
      .lean();

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    const readBy = announcement.readBy ?? [];
    const readCount = readBy.length;

    // Estimate audience size based on target
    // For now just return read count since total audience requires
    // resolving all matching users, which is expensive
    const roleBreakdown: Record<string, number> = {};
    for (const r of readBy) {
      const user = r.userId as unknown as { role?: string };
      const role = user?.role ?? 'unknown';
      roleBreakdown[role] = (roleBreakdown[role] ?? 0) + 1;
    }

    return {
      readCount,
      targetAudience: announcement.targetAudience,
      roleBreakdown,
      readers: readBy.map((r) => ({
        user: r.userId,
        readAt: r.readAt,
      })),
    };
  }
}
