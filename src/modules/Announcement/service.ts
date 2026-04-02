import { Announcement, IAnnouncement } from './model.js';
import { NotFoundError } from '../../common/errors.js';
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

  static async getById(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOne({ _id: id, isDeleted: false })
      .populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async update(id: string, data: UpdateAnnouncementInput): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async delete(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async publish(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isPublished: true, publishedAt: new Date() } },
      { new: true },
    ).populate('authorId', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  }

  static async unpublish(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, isDeleted: false },
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
}
