import mongoose, { Schema, Document, Types } from 'mongoose';

export type TargetAudience = 'all' | 'teachers' | 'parents' | 'students' | 'grade' | 'class';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  schoolId: Types.ObjectId;
  authorId: Types.ObjectId;
  targetAudience: TargetAudience;
  targetId?: Types.ObjectId;
  attachments: string[];
  priority: AnnouncementPriority;
  publishedAt?: Date;
  expiresAt?: Date;
  isPublished: boolean;
  pinned: boolean;
  scheduledPublishDate?: Date;
  readBy: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'teachers', 'parents', 'students', 'grade', 'class'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    attachments: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    scheduledPublishDate: {
      type: Date,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

announcementSchema.index({ schoolId: 1, isPublished: 1, publishedAt: -1 });
announcementSchema.index({ schoolId: 1, targetAudience: 1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
