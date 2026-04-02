import mongoose, { Schema, Document, Types } from 'mongoose';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
export type DayOfWeek = (typeof DAYS)[number];

// ─── TimetableConfig ────────────────────────────────────────────────────────

export interface IPeriodsPerDay {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
}

export interface IPeriodTime {
  period: number;
  startTime: string;
  endTime: string;
}

export interface IBreakSlot {
  afterPeriod: number;
  duration: number;
  label: string;
}

export interface ITimetableConfig extends Document {
  schoolId: Types.ObjectId;
  periodsPerDay: IPeriodsPerDay;
  periodTimes: IPeriodTime[];
  breakSlots: IBreakSlot[];
  academicYear: number;
  term: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timetableConfigSchema = new Schema<ITimetableConfig>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    periodsPerDay: {
      monday: { type: Number, default: 7 },
      tuesday: { type: Number, default: 7 },
      wednesday: { type: Number, default: 7 },
      thursday: { type: Number, default: 7 },
      friday: { type: Number, default: 7 },
    },
    periodTimes: [
      {
        _id: false,
        period: { type: Number, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    breakSlots: [
      {
        _id: false,
        afterPeriod: { type: Number, required: true },
        duration: { type: Number, required: true },
        label: { type: String, required: true },
      },
    ],
    academicYear: { type: Number },
    term: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const TimetableConfig = mongoose.model<ITimetableConfig>('TimetableConfig', timetableConfigSchema);

// ─── TeacherAvailability ────────────────────────────────────────────────────

export interface IUnavailableSlot {
  day: DayOfWeek;
  periods: number[];
  reason?: string;
}

export interface ITeacherAvailability extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  unavailable: IUnavailableSlot[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teacherAvailabilitySchema = new Schema<ITeacherAvailability>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unavailable: [
      {
        _id: false,
        day: { type: String, enum: DAYS, required: true },
        periods: { type: [Number], required: true },
        reason: { type: String },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

teacherAvailabilitySchema.index({ schoolId: 1, teacherId: 1 }, { unique: true });

export const TeacherAvailability = mongoose.model<ITeacherAvailability>('TeacherAvailability', teacherAvailabilitySchema);

// ─── SubjectRequirement ─────────────────────────────────────────────────────

export interface ISubjectRequirement extends Document {
  schoolId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  periodsPerWeek: number;
  requiresDoublePeriod: boolean;
  preferredTeacherId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectRequirementSchema = new Schema<ISubjectRequirement>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    periodsPerWeek: { type: Number, required: true, min: 1, max: 10 },
    requiresDoublePeriod: { type: Boolean, default: false },
    preferredTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subjectRequirementSchema.index({ schoolId: 1, subjectId: 1, gradeId: 1 }, { unique: true });

export const SubjectRequirement = mongoose.model<ISubjectRequirement>('SubjectRequirement', subjectRequirementSchema);

// ─── SubjectLine (FET) ──────────────────────────────────────────────────────

export interface ISubjectLine extends Document {
  schoolId: Types.ObjectId;
  gradeId: Types.ObjectId;
  lineName: string;
  subjectIds: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectLineSchema = new Schema<ISubjectLine>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    lineName: { type: String, required: true, trim: true },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subjectLineSchema.index({ schoolId: 1, gradeId: 1 });

export const SubjectLine = mongoose.model<ISubjectLine>('SubjectLine', subjectLineSchema);

// ─── TimetableGeneration ────────────────────────────────────────────────────

export interface ILockedSlot {
  classId: Types.ObjectId;
  day: DayOfWeek;
  period: number;
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
}

export interface IResultSlot {
  classId: Types.ObjectId;
  day: DayOfWeek;
  period: number;
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
  room?: string;
}

export interface IScoreDetail {
  constraint: string;
  score: number;
}

export interface IWarning {
  type: string;
  message: string;
}

export type GenerationStatus = 'configuring' | 'generating' | 'completed' | 'failed' | 'committed';

export interface ITimetableGeneration extends Document {
  schoolId: Types.ObjectId;
  gradeId?: Types.ObjectId;
  status: GenerationStatus;
  lockedSlots: ILockedSlot[];
  result: IResultSlot[];
  score: { total: number; details: IScoreDetail[] };
  warnings: IWarning[];
  generatedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timetableGenerationSchema = new Schema<ITimetableGeneration>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade' },
    status: {
      type: String,
      enum: ['configuring', 'generating', 'completed', 'failed', 'committed'],
      default: 'configuring',
    },
    lockedSlots: [
      {
        _id: false,
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        day: { type: String, enum: DAYS, required: true },
        period: { type: Number, required: true },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    result: [
      {
        _id: false,
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        day: { type: String, enum: DAYS, required: true },
        period: { type: Number, required: true },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        room: { type: String },
      },
    ],
    score: {
      total: { type: Number, default: 0 },
      details: [
        {
          _id: false,
          constraint: { type: String, required: true },
          score: { type: Number, required: true },
        },
      ],
    },
    warnings: [
      {
        _id: false,
        type: { type: String, required: true },
        message: { type: String, required: true },
      },
    ],
    generatedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

timetableGenerationSchema.index({ schoolId: 1, status: 1 });

export const TimetableGeneration = mongoose.model<ITimetableGeneration>('TimetableGeneration', timetableGenerationSchema);
