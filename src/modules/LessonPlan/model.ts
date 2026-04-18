import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILessonPlan extends Document {
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  curriculumTopicId: Types.ObjectId;
  date: Date;
  topic: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  durationMinutes: number;
  homeworkIds: Types.ObjectId[];
  reflectionNotes?: string;
  aiGenerated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonPlanSchema = new Schema<ILessonPlan>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    curriculumTopicId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', required: true },
    durationMinutes: { type: Number, default: 45, min: 5, max: 240 },
    homeworkIds: { type: [Schema.Types.ObjectId], ref: 'Homework', default: [] },
    date: { type: Date, required: true },
    topic: { type: String, required: true, trim: true },
    objectives: { type: [String], default: [] },
    activities: { type: [String], default: [] },
    resources: { type: [String], default: [] },
    reflectionNotes: { type: String },
    aiGenerated: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lessonPlanSchema.index({ teacherId: 1, date: 1 });
lessonPlanSchema.index({ schoolId: 1, classId: 1, date: 1 });
lessonPlanSchema.index({ curriculumTopicId: 1 });

export const LessonPlan = mongoose.model<ILessonPlan>('LessonPlan', lessonPlanSchema);
