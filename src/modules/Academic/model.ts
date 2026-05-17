import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Grade ───────────────────────────────────────────────────────────────────

export interface IGrade extends Document {
  name: string;
  schoolId: Types.ObjectId;
  orderIndex: number;
  // Optional bridge to the canonical CAPS CurriculumNode (type='grade').
  // Materialised eagerly from a standalone teacher's scope; left null when a
  // school admin creates a custom Grade row that doesn't map to CAPS.
  curriculumNodeId: Types.ObjectId | null;
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
      min: 0,
    },
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

gradeSchema.index({ schoolId: 1, orderIndex: 1 });
// Fast lookup when bridging a curriculum-node grade to its school-side row.
gradeSchema.index({ schoolId: 1, curriculumNodeId: 1 });

export const Grade = mongoose.model<IGrade>('Grade', gradeSchema);

// ─── Class ───────────────────────────────────────────────────────────────────

export interface IClass extends Document {
  name: string;
  gradeId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  capacity: number;
  classroomCode: string;
  isHomeroom: boolean;
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
    classroomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    isHomeroom: {
      type: Boolean,
      default: false,
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
classSchema.index({ schoolId: 1, gradeId: 1 });
classSchema.index({ classroomCode: 1 }, { unique: true });
classSchema.index({ schoolId: 1, teacherId: 1, isHomeroom: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);

// ─── Subject ─────────────────────────────────────────────────────────────────

export interface IPaperQuestionTypeWeight {
  type: 'mcq' | 'short_answer' | 'structured' | 'essay' | 'calculation';
  weight: number;
}

export interface IPaperDefaults {
  questionTypeMix: IPaperQuestionTypeWeight[];
}

export interface ISubject extends Document {
  name: string;
  code: string;
  schoolId: Types.ObjectId;
  gradeIds: Types.ObjectId[];
  // Optional bridge to the canonical CAPS CurriculumNode (type='subject').
  // See IGrade.curriculumNodeId for the same convention.
  curriculumNodeId: Types.ObjectId | null;
  // Per-subject defaults that pre-fill the AI paper-generation wizard. Stored
  // here (not on School.settings) because the right MCQ/essay/calculation
  // ratio is subject-shaped: Math papers ≠ History papers structurally.
  paperDefaults: IPaperDefaults | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paperQuestionTypeWeightSchema = new Schema<IPaperQuestionTypeWeight>(
  {
    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'structured', 'essay', 'calculation'],
      required: true,
    },
    weight: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const paperDefaultsSchema = new Schema<IPaperDefaults>(
  {
    questionTypeMix: { type: [paperQuestionTypeWeightSchema], default: [] },
  },
  { _id: false },
);

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
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    paperDefaults: {
      type: paperDefaultsSchema,
      default: null,
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
// Fast lookup when bridging a curriculum-node subject to its school-side row.
subjectSchema.index({ schoolId: 1, curriculumNodeId: 1 });

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

// NOTE: If upgrading from an older index, run: db.timetables.dropIndex('classId_1_day_1_period_1') first
timetableSchema.index(
  { classId: 1, day: 1, period: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
timetableSchema.index({ schoolId: 1, teacherId: 1, day: 1, period: 1 });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);

// ─── Assessment ──────────────────────────────────────────────────────────────

export type AssessmentType = 'test' | 'exam' | 'assignment' | 'practical' | 'project';

export interface IAssessment extends Document {
  name: string;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId | null;
  schoolId: Types.ObjectId;
  type: AssessmentType;
  totalMarks: number;
  weight: number;
  term: number;
  academicYear: number;
  date: Date;
  paperId: Types.ObjectId | null;
  assignmentId: Types.ObjectId | null;
  structureId?: Types.ObjectId;
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
      default: null,
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
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
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
    paperId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentPaper',
      default: null,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherAssignment',
      default: null,
    },
    structureId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentStructure',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

assessmentSchema.index({ classId: 1, subjectId: 1, term: 1 });
assessmentSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });
assessmentSchema.index({ paperId: 1 }, { sparse: true });
assessmentSchema.index({ assignmentId: 1, classId: 1 }, { sparse: true });
// Drives the term-summary aggregate: filter by class+term+year for a
// given school, then group marks per student per subject.
assessmentSchema.index({ schoolId: 1, classId: 1, term: 1, academicYear: 1, isDeleted: 1 });
assessmentSchema.index({ schoolId: 1, subjectId: 1, term: 1, academicYear: 1 });

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
  isAbsent: boolean;
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
    isAbsent: {
      type: Boolean,
      default: false,
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
// Cross-test queries (term summary / subject trends) drive lookups by
// schoolId then join to Assessment. These compounds give the planner a
// covering shape for the per-student and per-school slices.
markSchema.index({ schoolId: 1, studentId: 1, isDeleted: 1 });
markSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });

export const Mark = mongoose.model<IMark>('Mark', markSchema);

// ─── Exam ───────────────────────────────────────────────────────────────────

export type ExamStatus = 'scheduled' | 'in_progress' | 'completed';

export interface IExam extends Document {
  schoolId: Types.ObjectId;
  name: string;
  term: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status: ExamStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    term: { type: Number, required: true },
    year: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

examSchema.index({ schoolId: 1, year: 1, term: 1 });

export const Exam = mongoose.model<IExam>('Exam', examSchema);

// ─── Exam Timetable ─────────────────────────────────────────────────────────

export interface IExamTimetable extends Document {
  examId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  invigilator: Types.ObjectId;
  duration: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const examTimetableSchema = new Schema<IExamTimetable>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true },
    invigilator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

examTimetableSchema.index({ examId: 1, subjectId: 1, gradeId: 1 });

export const ExamTimetable = mongoose.model<IExamTimetable>('ExamTimetable', examTimetableSchema);

// ─── Past Paper ─────────────────────────────────────────────────────────────

export interface IPastPaper extends Document {
  schoolId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  year: number;
  term: number;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pastPaperSchema = new Schema<IPastPaper>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    year: { type: Number, required: true },
    term: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

pastPaperSchema.index({ schoolId: 1, subjectId: 1, gradeId: 1 });

export const PastPaper = mongoose.model<IPastPaper>('PastPaper', pastPaperSchema);

// ─── Subject Weighting ──────────────────────────────────────────────────────

export interface ISubjectWeighting extends Document {
  subjectId: Types.ObjectId;
  schoolId: Types.ObjectId;
  gradeId: Types.ObjectId;
  assessmentType: AssessmentType;
  weightPercentage: number;
  term: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectWeightingSchema = new Schema<ISubjectWeighting>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    assessmentType: {
      type: String,
      enum: ['test', 'exam', 'assignment', 'practical', 'project'],
      required: true,
    },
    weightPercentage: { type: Number, required: true },
    term: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subjectWeightingSchema.index({ subjectId: 1, schoolId: 1, gradeId: 1, term: 1 });
// One row per (subject, grade, term, type) within a school. Without this,
// concurrent saves can produce duplicate buckets that silently corrupt the
// weighted-average calc downstream.
subjectWeightingSchema.index(
  { schoolId: 1, subjectId: 1, gradeId: 1, term: 1, assessmentType: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const SubjectWeighting = mongoose.model<ISubjectWeighting>('SubjectWeighting', subjectWeightingSchema);

// ─── Remedial Tracking ──────────────────────────────────────────────────────

export type RemedialStatus = 'identified' | 'in_progress' | 'resolved';

export interface IRemedialTracking extends Document {
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  schoolId: Types.ObjectId;
  identifiedDate: Date;
  areas: string[];
  interventions: string[];
  progress: string[];
  status: RemedialStatus;
  reviewDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const remedialTrackingSchema = new Schema<IRemedialTracking>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    identifiedDate: { type: Date, required: true },
    areas: { type: [String], default: [] },
    interventions: { type: [String], default: [] },
    progress: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['identified', 'in_progress', 'resolved'],
      default: 'identified',
    },
    reviewDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

remedialTrackingSchema.index({ studentId: 1, subjectId: 1 });
remedialTrackingSchema.index({ schoolId: 1, status: 1 });

export const RemedialTracking = mongoose.model<IRemedialTracking>('RemedialTracking', remedialTrackingSchema);
