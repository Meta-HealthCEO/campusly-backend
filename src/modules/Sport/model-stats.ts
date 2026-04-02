import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Match Stats ──────────────────────────────────────────────────────────────

export interface IPlayerMatchStat {
  studentId: Types.ObjectId;
  position?: string;
  stats: Record<string, unknown>;
  rating?: number;
  manOfMatch?: boolean;
}

export interface IMatchStats extends Document {
  schoolId: Types.ObjectId;
  fixtureId: Types.ObjectId;
  teamId: Types.ObjectId;
  sportCode: string;
  playerStats: IPlayerMatchStat[];
  teamStats?: Record<string, unknown>;
  scorecard?: Record<string, unknown>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerMatchStatSchema = new Schema<IPlayerMatchStat>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    position: {
      type: String,
    },
    stats: {
      type: Schema.Types.Mixed,
      default: {},
    },
    rating: {
      type: Number,
      min: 0,
      max: 99,
    },
    manOfMatch: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const matchStatsSchema = new Schema<IMatchStats>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    fixtureId: {
      type: Schema.Types.ObjectId,
      ref: 'SportFixture',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'SportTeam',
      required: true,
    },
    sportCode: {
      type: String,
      required: true,
      trim: true,
    },
    playerStats: {
      type: [playerMatchStatSchema],
      default: [],
    },
    teamStats: {
      type: Schema.Types.Mixed,
    },
    scorecard: {
      type: Schema.Types.Mixed,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

matchStatsSchema.index({ fixtureId: 1 }, { unique: true });
matchStatsSchema.index({ schoolId: 1, teamId: 1 });

export const MatchStats = mongoose.model<IMatchStats>('MatchStats', matchStatsSchema);

// ─── Player Card ──────────────────────────────────────────────────────────────

export interface IPlayerCard extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  sportCode: string;
  seasonId?: Types.ObjectId;
  overallRating: number;
  attributes: Map<string, number>;
  tier: 'bronze' | 'silver' | 'gold' | 'elite';
  position: string;
  appearances: number;
  keyStats: Map<string, number>;
  personalBests: Map<string, unknown>;
  formTrend: 'up' | 'down' | 'stable';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerCardSchema = new Schema<IPlayerCard>(
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
    sportCode: {
      type: String,
      required: true,
      trim: true,
    },
    seasonId: {
      type: Schema.Types.ObjectId,
      ref: 'Season',
    },
    overallRating: {
      type: Number,
      min: 0,
      max: 99,
      default: 0,
    },
    attributes: {
      type: Map,
      of: Number,
      default: {},
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'elite'],
      default: 'bronze',
    },
    position: {
      type: String,
      default: '',
    },
    appearances: {
      type: Number,
      default: 0,
    },
    keyStats: {
      type: Map,
      of: Number,
      default: {},
    },
    personalBests: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    formTrend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

playerCardSchema.index({ schoolId: 1, studentId: 1, sportCode: 1 }, { unique: true });
playerCardSchema.index({ schoolId: 1, sportCode: 1, overallRating: -1 });

export const PlayerCard = mongoose.model<IPlayerCard>('PlayerCard', playerCardSchema);

// ─── Personal Best ────────────────────────────────────────────────────────────

export interface IPersonalBest extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  sportCode: string;
  event: string;
  value: number;
  unit: string;
  date: Date;
  fixtureId?: Types.ObjectId;
  previousBest?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const personalBestSchema = new Schema<IPersonalBest>(
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
    sportCode: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    fixtureId: {
      type: Schema.Types.ObjectId,
      ref: 'SportFixture',
    },
    previousBest: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

personalBestSchema.index({ schoolId: 1, studentId: 1, sportCode: 1, event: 1 });

export const PersonalBest = mongoose.model<IPersonalBest>('PersonalBest', personalBestSchema);
