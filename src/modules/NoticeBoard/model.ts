import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Notice Board Post ─────────────────────────────────────────────────────

export type PostScope = 'class' | 'grade' | 'school';

export interface IAttachment {
  url: string;
  name: string;
  type: string;
}

export interface INoticeBoardPost extends Document {
  schoolId: Types.ObjectId;
  scope: PostScope;
  scopeId: string;
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  pinned: boolean;
  attachments: IAttachment[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noticeBoardPostSchema = new Schema<INoticeBoardPost>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    scope: {
      type: String,
      enum: ['class', 'grade', 'school'],
      required: true,
    },
    scopeId: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        _id: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

noticeBoardPostSchema.index({ schoolId: 1, scope: 1, scopeId: 1, pinned: -1, createdAt: -1 });
noticeBoardPostSchema.index({ authorId: 1, schoolId: 1 });

export const NoticeBoardPost = mongoose.model<INoticeBoardPost>('NoticeBoardPost', noticeBoardPostSchema);
