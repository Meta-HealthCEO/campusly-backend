import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Department ──────────────────────────────────────────────────────────────

export interface IDepartment extends Document {
  schoolId: Types.ObjectId;
  name: string;
  description: string;
  hodUserId: Types.ObjectId | null;
  subjectIds: Types.ObjectId[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    hodUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

departmentSchema.index({ schoolId: 1, name: 1 }, { unique: true });
departmentSchema.index({ schoolId: 1, isDeleted: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);

// ─── TeacherObservation ──────────────────────────────────────────────────────

export type ObservationStatus = 'scheduled' | 'completed' | 'cancelled';

export type FocusArea =
  | 'lesson_planning'
  | 'learner_engagement'
  | 'assessment_practices'
  | 'classroom_management'
  | 'subject_knowledge'
  | 'differentiation'
  | 'use_of_resources'
  | 'questioning_techniques';

export interface IObservationScores {
  lesson_planning?: number;
  learner_engagement?: number;
  assessment_practices?: number;
  classroom_management?: number;
  subject_knowledge?: number;
  differentiation?: number;
  use_of_resources?: number;
  questioning_techniques?: number;
}

export interface ITeacherObservation extends Document {
  schoolId: Types.ObjectId;
  departmentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  observerId: Types.ObjectId;
  classId: Types.ObjectId;
  subjectId: Types.ObjectId;
  scheduledDate: Date;
  duration: number;
  status: ObservationStatus;
  focusAreas: FocusArea[];
  scores: IObservationScores | null;
  notes: string;
  recommendations: string;
  completedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scoreField = { type: Number, min: 1, max: 5 };

const teacherObservationSchema = new Schema<ITeacherObservation>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    observerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 45 },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    focusAreas: [{
      type: String,
      enum: [
        'lesson_planning', 'learner_engagement', 'assessment_practices',
        'classroom_management', 'subject_knowledge', 'differentiation',
        'use_of_resources', 'questioning_techniques',
      ],
    }],
    scores: {
      type: {
        lesson_planning: scoreField,
        learner_engagement: scoreField,
        assessment_practices: scoreField,
        classroom_management: scoreField,
        subject_knowledge: scoreField,
        differentiation: scoreField,
        use_of_resources: scoreField,
        questioning_techniques: scoreField,
      },
      default: null,
      _id: false,
    },
    notes: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    completedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

teacherObservationSchema.index({ schoolId: 1, departmentId: 1, status: 1 });
teacherObservationSchema.index({ schoolId: 1, teacherId: 1, scheduledDate: 1 });

export const TeacherObservation = mongoose.model<ITeacherObservation>(
  'TeacherObservation',
  teacherObservationSchema,
);
