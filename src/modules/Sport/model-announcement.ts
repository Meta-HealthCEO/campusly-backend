import mongoose, { Schema, Document, Types } from 'mongoose';

export const ANNOUNCEMENT_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export interface ITeamAnnouncement extends Document {
  schoolId: Types.ObjectId;
  teamId: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  pinned: boolean;
  publishedAt: Date;
  expiresAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<ITeamAnnouncement>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'SportTeam', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ANNOUNCEMENT_PRIORITIES,
      default: 'normal',
    },
    pinned: { type: Boolean, default: false },
    publishedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

announcementSchema.index({ schoolId: 1, teamId: 1, publishedAt: -1 });
announcementSchema.index({ schoolId: 1, pinned: -1, publishedAt: -1 });

export const TeamAnnouncement = mongoose.model<ITeamAnnouncement>(
  'TeamAnnouncement',
  announcementSchema,
);
