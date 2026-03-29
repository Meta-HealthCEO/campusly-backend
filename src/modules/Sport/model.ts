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

// ─── Season ────────────────────────────────────────────────────────────────

export interface ISeason extends Document {
  name: string;
  schoolId: Types.ObjectId;
  sport: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const seasonSchema = new Schema<ISeason>(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
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

seasonSchema.index({ schoolId: 1, sport: 1 });
seasonSchema.index({ schoolId: 1, isActive: 1 });

export const Season = mongoose.model<ISeason>('Season', seasonSchema);

// ─── Player Availability ───────────────────────────────────────────────────

export interface IPlayerAvailability extends Document {
  fixtureId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  status: 'available' | 'unavailable' | 'injured';
  parentConfirmed: boolean;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerAvailabilitySchema = new Schema<IPlayerAvailability>(
  {
    fixtureId: {
      type: Schema.Types.ObjectId,
      ref: 'SportFixture',
      required: true,
    },
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
    status: {
      type: String,
      enum: ['available', 'unavailable', 'injured'],
      required: true,
    },
    parentConfirmed: {
      type: Boolean,
      default: false,
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

playerAvailabilitySchema.index({ fixtureId: 1, studentId: 1 });
playerAvailabilitySchema.index({ schoolId: 1, fixtureId: 1 });

export const PlayerAvailability = mongoose.model<IPlayerAvailability>('PlayerAvailability', playerAvailabilitySchema);

// ─── Match Result ──────────────────────────────────────────────────────────

export interface IMatchResult extends Document {
  fixtureId: Types.ObjectId;
  schoolId: Types.ObjectId;
  homeScore: number;
  awayScore: number;
  scorers: { studentId: Types.ObjectId; goals: number }[];
  manOfTheMatch?: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const matchResultSchema = new Schema<IMatchResult>(
  {
    fixtureId: {
      type: Schema.Types.ObjectId,
      ref: 'SportFixture',
      required: true,
      unique: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    homeScore: {
      type: Number,
      required: true,
    },
    awayScore: {
      type: Number,
      required: true,
    },
    scorers: {
      type: [
        {
          studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
          goals: { type: Number, required: true },
        },
      ],
      default: [],
    },
    manOfTheMatch: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
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

matchResultSchema.index({ schoolId: 1 });

export const MatchResult = mongoose.model<IMatchResult>('MatchResult', matchResultSchema);

// ─── Season Standing ───────────────────────────────────────────────────────

export interface ISeasonStanding extends Document {
  seasonId: Types.ObjectId;
  teamId: Types.ObjectId;
  schoolId: Types.ObjectId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const seasonStandingSchema = new Schema<ISeasonStanding>(
  {
    seasonId: {
      type: Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },
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
    played: {
      type: Number,
      default: 0,
    },
    won: {
      type: Number,
      default: 0,
    },
    drawn: {
      type: Number,
      default: 0,
    },
    lost: {
      type: Number,
      default: 0,
    },
    goalsFor: {
      type: Number,
      default: 0,
    },
    goalsAgainst: {
      type: Number,
      default: 0,
    },
    points: {
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

seasonStandingSchema.index({ seasonId: 1, teamId: 1 });
seasonStandingSchema.index({ seasonId: 1, points: -1 });

export const SeasonStanding = mongoose.model<ISeasonStanding>('SeasonStanding', seasonStandingSchema);

// ─── MVP Vote ──────────────────────────────────────────────────────────────

export interface IMvpVote extends Document {
  fixtureId: Types.ObjectId;
  voterId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mvpVoteSchema = new Schema<IMvpVote>(
  {
    fixtureId: {
      type: Schema.Types.ObjectId,
      ref: 'SportFixture',
      required: true,
    },
    voterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

mvpVoteSchema.index({ fixtureId: 1, voterId: 1 }, { unique: true });
mvpVoteSchema.index({ fixtureId: 1, studentId: 1 });

export const MvpVote = mongoose.model<IMvpVote>('MvpVote', mvpVoteSchema);
