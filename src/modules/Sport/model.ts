import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Sport Team ─────────────────────────────────────────────────────────────

export interface ISportTeam extends Document {
  name: string;
  schoolId: Types.ObjectId;
  sport: string;
  ageGroup?: string;
  coachId?: Types.ObjectId;
  playerIds: Types.ObjectId[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sportTeamSchema = new Schema<ISportTeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    sport: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    playerIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Student',
      default: [],
    },
    isActive: {
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

sportTeamSchema.index({ schoolId: 1, sport: 1 });
sportTeamSchema.index({ schoolId: 1, isActive: 1 });

export const SportTeam = mongoose.model<ISportTeam>('SportTeam', sportTeamSchema);

// ─── Sport Fixture ──────────────────────────────────────────────────────────

export interface ISportFixture extends Document {
  teamId: Types.ObjectId;
  schoolId: Types.ObjectId;
  opponent: string;
  date: Date;
  time: string;
  venue: string;
  isHome: boolean;
  result?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sportFixtureSchema = new Schema<ISportFixture>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'SportTeam',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    opponent: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    isHome: {
      type: Boolean,
      default: true,
    },
    result: {
      type: String,
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

sportFixtureSchema.index({ teamId: 1, date: -1 });
sportFixtureSchema.index({ schoolId: 1, date: -1 });

export const SportFixture = mongoose.model<ISportFixture>('SportFixture', sportFixtureSchema);
