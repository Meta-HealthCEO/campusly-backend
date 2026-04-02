import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── News Article ──────────────────────────────────────────────────────────

export type ArticleCategory =
  | 'sports'
  | 'academic'
  | 'cultural'
  | 'events'
  | 'achievements'
  | 'general';

export type ArticleSourceType = 'manual' | 'ai_generated';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface INewsArticle extends Document {
  schoolId: Types.ObjectId;
  title: string;
  content: string;
  excerpt: string;
  category: ArticleCategory;
  coverImage?: string;
  authorId: Types.ObjectId;
  authorName: string;
  sourceType: ArticleSourceType;
  sourceData?: Record<string, unknown>;
  status: ArticleStatus;
  publishedAt?: Date;
  tags: string[];
  featured: boolean;
  viewCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const newsArticleSchema = new Schema<INewsArticle>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
      default: '',
    },
    category: {
      type: String,
      enum: ['sports', 'academic', 'cultural', 'events', 'achievements', 'general'],
      required: true,
    },
    coverImage: {
      type: String,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['manual', 'ai_generated'],
      default: 'manual',
    },
    sourceData: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

newsArticleSchema.index({ schoolId: 1, status: 1, publishedAt: -1 });
newsArticleSchema.index({ schoolId: 1, category: 1 });

export const NewsArticle = mongoose.model<INewsArticle>('NewsArticle', newsArticleSchema);
