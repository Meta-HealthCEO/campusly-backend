import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format');

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

// ─── Grade ───────────────────────────────────────────────────────────────────

export const gradeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  schoolId: objectIdSchema,
  orderIndex: z.number().int().min(0),
}).strict();

export const updateGradeSchema = gradeSchema.partial().strict();

// ─── Class ───────────────────────────────────────────────────────────────────

export const classSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer').trim(),
  gradeId: objectIdSchema,
  schoolId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(200, 'Capacity cannot exceed 200'),
  subjectId: objectIdSchema.nullable().optional(),
  isHomeroom: z.boolean().optional(),
}).strict();

export const updateClassSchema = classSchema.partial().strict();

export const joinClassByCodeSchema = z.object({
  code: z.string().min(1, 'Classroom code is required').max(20).trim(),
}).strict();

// ─── Subject ─────────────────────────────────────────────────────────────────

export const PAPER_QUESTION_TYPES = [
  'mcq', 'short_answer', 'structured', 'essay', 'calculation',
] as const;

export const paperDefaultsSchema = z.object({
  questionTypeMix: z.array(
    z.object({
      type: z.enum(PAPER_QUESTION_TYPES),
      weight: z.number().min(0).max(100),
    }).strict(),
  ).max(PAPER_QUESTION_TYPES.length).default([]),
}).strict();

export const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(1, 'Code is required').trim(),
  schoolId: objectIdSchema,
  gradeIds: z.array(objectIdSchema).min(1, 'At least one grade is required'),
  paperDefaults: paperDefaultsSchema.nullable().optional(),
}).strict();

export const updateSubjectSchema = subjectSchema.partial().strict();

// ─── Timetable ───────────────────────────────────────────────────────────────

const timetableBaseSchema = z.object({
  schoolId: objectIdSchema.optional(),
  classId: objectIdSchema,
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  period: z.number().int().min(1),
  startTime: timeSchema,
  endTime: timeSchema,
  subjectId: objectIdSchema,
  teacherId: objectIdSchema,
  room: z.string().trim().optional(),
}).strict();

export const timetableSchema = timetableBaseSchema.refine(
  (data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime),
  { message: 'End time must be after start time', path: ['endTime'] },
);

export const updateTimetableSchema = timetableBaseSchema.partial().strict().refine(
  (data) => !data.startTime || !data.endTime || timeToMinutes(data.endTime) > timeToMinutes(data.startTime),
  { message: 'End time must be after start time', path: ['endTime'] },
);

// ─── Assessment ──────────────────────────────────────────────────────────────

export const assessmentSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  type: z.enum(['test', 'exam', 'assignment', 'practical', 'project']),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  weight: z.number().min(0).max(100, 'Weight must be between 0 and 100'),
  term: z.number().int().min(1),
  academicYear: z.number().int().min(2000),
  date: z.iso.datetime(),
}).strict();

export const updateAssessmentSchema = assessmentSchema.partial().strict();

// ─── Mark ────────────────────────────────────────────────────────────────────

export const markSchema = z.object({
  assessmentId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  mark: z.number().min(0),
  total: z.number().min(1),
  comment: z.string().trim().optional(),
}).strict();

export const bulkMarkSchema = z.object({
  assessmentId: objectIdSchema,
  schoolId: objectIdSchema,
  marks: z.array(
    z.object({
      studentId: objectIdSchema,
      mark: z.number().min(0),
      total: z.number().min(1),
      comment: z.string().trim().optional(),
    }),
  ).min(1, 'At least one mark is required'),
}).strict();

// ─── Inferred types ──────────────────────────────────────────────────────────

// ─── Exam ───────────────────────────────────────────────────────────────────

export const examCreateSchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(1, 'Name is required').trim(),
  term: z.number().int().min(1).max(4),
  year: z.number().int().min(2000),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
}).strict();

export const examUpdateSchema = examCreateSchema.partial().strict();

// ─── Exam Timetable ─────────────────────────────────────────────────────────

export const examTimetableCreateSchema = z.object({
  examId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  date: z.iso.datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  venue: z.string().min(1, 'Venue is required'),
  invigilator: objectIdSchema,
  duration: z.number().int().positive('Duration must be positive'),
}).strict();

export const examTimetableUpdateSchema = examTimetableCreateSchema.partial().strict();

// ─── Past Paper ─────────────────────────────────────────────────────────────

export const pastPaperCreateSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  year: z.number().int().min(2000),
  term: z.number().int().min(1).max(4),
  fileUrl: z.string().min(1, 'File URL is required'),
}).strict();

export const pastPaperUpdateSchema = pastPaperCreateSchema.partial().strict();

// ─── Subject Weighting ──────────────────────────────────────────────────────

export const subjectWeightingCreateSchema = z.object({
  subjectId: objectIdSchema,
  schoolId: objectIdSchema,
  gradeId: objectIdSchema,
  assessmentType: z.enum(['test', 'exam', 'assignment', 'practical', 'project']),
  weightPercentage: z.number().min(0).max(100),
  term: z.number().int().min(1).max(4),
}).strict();

export const subjectWeightingUpdateSchema = subjectWeightingCreateSchema.partial().strict();

// Atomic upsert of all 5 type buckets for a single (subject, grade, term).
// Sum-to-100 is enforced server-side too — the service is the source of
// truth for that invariant.
export const subjectWeightingBulkSetSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  buckets: z.array(
    z.object({
      assessmentType: z.enum(['test', 'exam', 'assignment', 'practical', 'project']),
      weightPercentage: z.number().min(0).max(100),
    }).strict(),
  ).min(1),
}).strict();

// ─── Remedial Tracking ──────────────────────────────────────────────────────

export const remedialCreateSchema = z.object({
  studentId: objectIdSchema,
  subjectId: objectIdSchema,
  schoolId: objectIdSchema,
  identifiedDate: z.iso.datetime(),
  areas: z.array(z.string()).min(1, 'At least one area is required'),
  interventions: z.array(z.string()).optional(),
  progress: z.array(z.string()).optional(),
  status: z.enum(['identified', 'in_progress', 'resolved']).optional(),
  reviewDate: z.iso.datetime().optional(),
}).strict();

export const remedialUpdateSchema = remedialCreateSchema.partial().strict();

// ─── Inferred types ──────────────────────────────────────────────────────────

export type GradeInput = z.infer<typeof gradeSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type MarkInput = z.infer<typeof markSchema>;
export type BulkMarkInput = z.infer<typeof bulkMarkSchema>;
export type ExamInput = z.infer<typeof examCreateSchema>;
export type ExamTimetableInput = z.infer<typeof examTimetableCreateSchema>;
export type PastPaperInput = z.infer<typeof pastPaperCreateSchema>;
export type SubjectWeightingInput = z.infer<typeof subjectWeightingCreateSchema>;
export type RemedialInput = z.infer<typeof remedialCreateSchema>;
