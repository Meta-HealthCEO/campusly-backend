import type { Document, Types } from 'mongoose';

export type LessonStatus = 'draft' | 'ready' | 'taught';
export type LessonPhase =
  | 'introduction'
  | 'direct_instruction'
  | 'practice'
  | 'assessment'
  | 'homework';
export const LESSON_PHASES: LessonPhase[] = [
  'introduction',
  'direct_instruction',
  'practice',
  'assessment',
  'homework',
];
export type LessonMaterialKind =
  | 'reading'
  | 'worksheet'
  | 'activity'
  | 'study_notes'
  | 'worked_example'
  | 'quiz'
  | 'practice_questions'
  | 'homework'
  | 'paper';

export interface InternalTextbookRef {
  source: 'internal';
  textbookId: Types.ObjectId;
  chapterId?: Types.ObjectId;
  pageStart?: number;
  pageEnd?: number;
  notes?: string;
}
export interface ExternalTextbookRef {
  source: 'external';
  title: string;
  publisher?: string;
  isbn?: string;
  pageStart?: number;
  pageEnd?: number;
  excerpt?: string;
  notes?: string;
}
export type TextbookRef = InternalTextbookRef | ExternalTextbookRef;

export interface ILessonMaterialBase {
  _id: Types.ObjectId;
  kind: LessonMaterialKind;
  title: string;
  teacherNotes?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface IReadingMaterial extends ILessonMaterialBase {
  kind: 'reading';
  textbookRef: TextbookRef;
  comprehensionQuestionIds?: Types.ObjectId[];
}
export interface IWorksheetMaterial extends ILessonMaterialBase {
  kind: 'worksheet';
  contentResourceId: Types.ObjectId;
}
export interface IActivityMaterial extends ILessonMaterialBase {
  kind: 'activity';
  contentResourceId: Types.ObjectId;
}
export interface INotesMaterial extends ILessonMaterialBase {
  kind: 'study_notes';
  contentResourceId?: Types.ObjectId;
}
export interface IWorkedExampleMaterial extends ILessonMaterialBase {
  kind: 'worked_example';
  contentResourceId: Types.ObjectId;
}
export interface IQuizMaterial extends ILessonMaterialBase {
  kind: 'quiz';
  quizId: Types.ObjectId;
}
export interface IPracticeQuestionsMaterial extends ILessonMaterialBase {
  kind: 'practice_questions';
  questionIds: Types.ObjectId[];
}
export interface IHomeworkMaterial extends ILessonMaterialBase {
  kind: 'homework';
  homeworkId: Types.ObjectId;
}
export interface IPaperMaterial extends ILessonMaterialBase {
  kind: 'paper';
  paperId: Types.ObjectId;
}
export type ILessonMaterial =
  | IReadingMaterial
  | IWorksheetMaterial
  | IActivityMaterial
  | INotesMaterial
  | IWorkedExampleMaterial
  | IQuizMaterial
  | IPracticeQuestionsMaterial
  | IHomeworkMaterial
  | IPaperMaterial;

export interface ILessonPhaseEntry {
  phase: LessonPhase;
  materialIds: Types.ObjectId[];
}

export type LessonAssignmentStatus = 'planned' | 'taught';

/**
 * One delivery of a lesson pack to a single class on a single date. A lesson
 * may have zero (library) or many of these — the pack itself is curriculum-
 * scoped (grade + subject + term + topic), classes are just the audience.
 */
export interface ILessonAssignment {
  _id?: Types.ObjectId;
  classId: Types.ObjectId;
  scheduledDate: Date;
  status: LessonAssignmentStatus;
  taughtAt?: Date;
}

export interface ILesson extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  /**
   * Optional: standalone teachers (no school subject/grade collections) source
   * subject/grade from CAPS curriculum nodes via `curriculumNodeId`. When
   * present these may point at academic Subject/Grade docs OR at CurriculumNode
   * subject/grade docs (denormalized from the topic). The Lesson layer treats
   * both as opaque IDs.
   */
  subjectId?: Types.ObjectId | null;
  gradeId?: Types.ObjectId | null;
  curriculumNodeId: Types.ObjectId;
  /** SA school term derived from the topic on create (1-4). Optional. */
  termNumber?: number | null;
  title: string;
  durationMinutes: number;
  objectives: string[];
  phases: ILessonPhaseEntry[];
  materials: ILessonMaterial[];
  status: LessonStatus;
  reflectionNotes?: string;
  aiGenerated: boolean;
  isDeleted: boolean;
  /** Per-class scheduling. Empty array == library lesson (unscheduled). */
  assignedClasses: ILessonAssignment[];
  createdAt: Date;
  updatedAt: Date;
}
