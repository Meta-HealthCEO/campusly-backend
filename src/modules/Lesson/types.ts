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
  | 'notes'
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
  kind: 'notes';
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

export interface ILesson extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  classId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  curriculumNodeId: Types.ObjectId;
  title: string;
  date: Date;
  durationMinutes: number;
  objectives: string[];
  phases: ILessonPhaseEntry[];
  materials: ILessonMaterial[];
  status: LessonStatus;
  reflectionNotes?: string;
  aiGenerated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
