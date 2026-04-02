import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Badge (earned) sub-document shape ──────────────────────────────────────

export interface IBadgeEarned {
  badgeId: string;
  name: string;
  icon: string;
  earnedAt: Date;
  category: string;
}

// ─── StudentLevel ───────────────────────────────────────────────────────────

export interface IStudentLevel extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  badges: IBadgeEarned[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const badgeEarnedSchema = new Schema<IBadgeEarned>(
  {
    badgeId: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    earnedAt: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
  },
  { _id: false },
);

const studentLevelSchema = new Schema<IStudentLevel>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
    },
    badges: {
      type: [badgeEarnedSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

studentLevelSchema.index({ schoolId: 1, studentId: 1 }, { unique: true });
studentLevelSchema.index({ schoolId: 1, level: -1, xp: -1 });

export const StudentLevel = mongoose.model<IStudentLevel>(
  'StudentLevel',
  studentLevelSchema,
);
