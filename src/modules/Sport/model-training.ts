import mongoose, { Schema, Document, Types } from 'mongoose';

export type TrainingFocus =
  | 'fitness'
  | 'technical'
  | 'tactical'
  | 'recovery'
  | 'strength'
  | 'match_prep';

export type TrainingSessionStatus = 'scheduled' | 'completed' | 'cancelled';

export type TrainingAttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'injured';

export interface ITrainingSession extends Document {
  schoolId: Types.ObjectId;
  teamId: Types.ObjectId;
  title: string;
  date: Date;
  startTime: string;
  durationMinutes: number;
  location?: string;
  focus: TrainingFocus[];
  drillIds: Types.ObjectId[];
  notes?: string;
  status: TrainingSessionStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSessionSchema = new Schema<ITrainingSession>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'SportTeam', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    location: { type: String, trim: true },
    focus: {
      type: [String],
      enum: ['fitness', 'technical', 'tactical', 'recovery', 'strength', 'match_prep'],
      default: [],
    },
    drillIds: {
      type: [Schema.Types.ObjectId],
      ref: 'DrillTemplate',
      default: [],
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

trainingSessionSchema.index({ schoolId: 1, date: -1 });
trainingSessionSchema.index({ teamId: 1, date: -1 });

export const TrainingSession = mongoose.model<ITrainingSession>(
  'TrainingSession',
  trainingSessionSchema,
);

export interface ITrainingAttendance extends Document {
  schoolId: Types.ObjectId;
  sessionId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: TrainingAttendanceStatus;
  notes?: string;
  rating?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trainingAttendanceSchema = new Schema<ITrainingAttendance>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSession',
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused', 'injured'],
      required: true,
    },
    notes: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

trainingAttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
trainingAttendanceSchema.index({ schoolId: 1, sessionId: 1 });

export const TrainingAttendance = mongoose.model<ITrainingAttendance>(
  'TrainingAttendance',
  trainingAttendanceSchema,
);

export interface IDrillTemplate extends Document {
  schoolId: Types.ObjectId;
  name: string;
  sport?: string;
  focus: TrainingFocus[];
  description?: string;
  durationMinutes?: number;
  equipment: string[];
  imageUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const drillTemplateSchema = new Schema<IDrillTemplate>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sport: { type: String, trim: true },
    focus: {
      type: [String],
      enum: ['fitness', 'technical', 'tactical', 'recovery', 'strength', 'match_prep'],
      default: [],
    },
    description: { type: String, trim: true },
    durationMinutes: { type: Number, min: 1 },
    equipment: { type: [String], default: [] },
    imageUrl: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

drillTemplateSchema.index({ schoolId: 1, sport: 1 });

export const DrillTemplate = mongoose.model<IDrillTemplate>(
  'DrillTemplate',
  drillTemplateSchema,
);
