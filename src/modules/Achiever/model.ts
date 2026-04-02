import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Achievement ────────────────────────────────────────────────────────────

export type AchievementType = 'academic' | 'sport' | 'cultural' | 'behaviour';

export interface IAchievement extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: AchievementType;
  title: string;
  description?: string;
  term: number;
  year: number;
  category?: string;
  points: number;
  awardedBy: Types.ObjectId;
  awardedAt: Date;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    type: {
      type: String,
      enum: ['academic', 'sport', 'cultural', 'behaviour'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    term: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

achievementSchema.index({ schoolId: 1, isDeleted: 1 });
achievementSchema.index({ schoolId: 1, type: 1 });
achievementSchema.index({ studentId: 1, year: 1 });

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

// ─── HousePoints ────────────────────────────────────────────────────────────

export interface IHousePoints extends Document {
  schoolId: Types.ObjectId;
  houseName: string;
  houseColor: string;
  totalPoints: number;
  term: number;
  year: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const housePointsSchema = new Schema<IHousePoints>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    houseName: {
      type: String,
      required: true,
      trim: true,
    },
    houseColor: {
      type: String,
      required: true,
      trim: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    term: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

housePointsSchema.index({ schoolId: 1, year: 1, term: 1 });

export const HousePoints = mongoose.model<IHousePoints>('HousePoints', housePointsSchema);

// ─── HousePointLog ──────────────────────────────────────────────────────────

export interface IHousePointLog extends Document {
  studentId: Types.ObjectId;
  houseId: Types.ObjectId;
  points: number;
  reason: string;
  awardedBy: Types.ObjectId;
  createdAt: Date;
  isDeleted: boolean;
}

const housePointLogSchema = new Schema<IHousePointLog>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    houseId: {
      type: Schema.Types.ObjectId,
      ref: 'HousePoints',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

housePointLogSchema.index({ houseId: 1, createdAt: -1 });

export const HousePointLog = mongoose.model<IHousePointLog>('HousePointLog', housePointLogSchema);
