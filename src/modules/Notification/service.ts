import mongoose from 'mongoose';
import { Notification, NotificationPreference, INotification, INotificationPreference, INotificationData } from './model.js';
import { Student } from '../Student/model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateNotificationInput, BulkNotificationInput, UpdatePreferenceInput } from './validation.js';

interface ListQuery {
  page?: number;
  limit?: number;
  isRead?: string;
}

export class NotificationService {
  static async create(data: CreateNotificationInput): Promise<INotification> {
    const notification = await Notification.create({
      recipientId: data.recipientId,
      schoolId: data.schoolId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data as INotificationData | undefined,
    });

    return notification;
  }

  static async list(
    recipientId: string,
    query: ListQuery,
  ): Promise<{
    notifications: INotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      recipientId,
      isDeleted: false,
    };

    if (query.isRead === 'true') {
      filter.isRead = true;
    } else if (query.isRead === 'false') {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async markAsRead(id: string, recipientId: string): Promise<INotification> {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId, isDeleted: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  static async markAllAsRead(recipientId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipientId, isRead: false, isDeleted: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return result.modifiedCount;
  }

  static async bulkCreate(data: BulkNotificationInput): Promise<{ count: number }> {
    let userIds: string[] = [];

    if (data.targetType === 'school') {
      // Get all students in the school, then their guardianIds (parent user refs)
      const students = await Student.find({
        schoolId: data.targetId,
        isDeleted: false,
      }).select('userId');
      userIds = students.filter((s) => s.userId != null).map((s) => s.userId!.toString());
    } else if (data.targetType === 'grade') {
      const students = await Student.find({
        gradeId: data.targetId,
        isDeleted: false,
      }).select('userId');
      userIds = students.filter((s) => s.userId != null).map((s) => s.userId!.toString());
    } else if (data.targetType === 'class') {
      const students = await Student.find({
        classId: data.targetId,
        isDeleted: false,
      }).select('userId');
      userIds = students.filter((s) => s.userId != null).map((s) => s.userId!.toString());
    }

    if (userIds.length === 0) {
      return { count: 0 };
    }

    const notifications = userIds.map((userId) => ({
      recipientId: userId,
      schoolId: data.schoolId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data as INotificationData | undefined,
    }));

    const created = await Notification.insertMany(notifications);

    return { count: created.length };
  }

  static async getPreferences(userId: string, schoolId: string): Promise<INotificationPreference> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    let preferences = await NotificationPreference.findOne({
      userId,
      schoolId: schoolOid,
      isDeleted: false,
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({ userId, schoolId: schoolOid });
    }

    return preferences;
  }

  static async updatePreferences(
    userId: string,
    schoolId: string,
    data: UpdatePreferenceInput,
  ): Promise<INotificationPreference> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId, schoolId: schoolOid, isDeleted: false },
      { $set: { ...data, schoolId: schoolOid } },
      { new: true, upsert: true },
    );

    return preferences;
  }

  static async getUnreadCount(recipientId: string): Promise<number> {
    return Notification.countDocuments({
      recipientId,
      isRead: false,
      isDeleted: false,
    });
  }
}
