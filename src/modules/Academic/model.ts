import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Grade ───────────────────────────────────────────────────────────────────

export interface IGrade extends Document {
  name: string;
  schoolId: Types.ObjectId;
  orderIndex: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gradeSchema = new Schema<IGrade>(
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
    orderIndex: {
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

gradeSchema.index({ schoolId: 1, orderIndex: 1 });

export const Grade = mongoose.model<IGrade>('Grade', gradeSchema);

// ─── Class ───────────────────────────────────────────────────────────────────

export interface IClass extends Document {
  name: string;
  gradeId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  capacity: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    capacity: {
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

classSchema.index({ gradeId: 1 });
classSchema.index({ schoolId: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);

// ─── Subject ─────────────────────────────────────────────────────────────────

export interface ISubject extends Document {
  name: string;
  code: string;
  schoolId: Types.ObjectId;
  gradeIds: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    gradeIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Grade',
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

subjectSchema.index({ schoolId: 1 });
subjectSchema.index({ code: 1, schoolId: 1 });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

// ─── Timetable ───────────────────────────────────────────────────────────────

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface ITimetable extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
  room?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<ITimetable>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

timetableSchema.index({ classId: 1, day: 1, period: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);

// ─── Assessment ──────────────────────────────────────────────────────────────

export type AssessmentType = 'test' | 'exam' | 'assignment' | 'practical' | 'project';

export interface IAssessment extends Document {
  name: string;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: AssessmentType;
  totalMarks: number;
  weight: number;
  term: number;
  academicYear: number;
  date: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    type: {
      type: String,
      enum: ['test', 'exam', 'assignment', 'practical', 'project'],
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    term: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

assessmentSchema.index({ classId: 1, subjectId: 1, term: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);

// ─── Mark ────────────────────────────────────────────────────────────────────

export interface IMark extends Document {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  mark: number;
  total: number;
  percentage: number;
  comment?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const markSchema = new Schema<IMark>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
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
    mark: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

markSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
markSchema.index({ studentId: 1 });

export const Mark = mongoose.model<IMark>('Mark', markSchema);
