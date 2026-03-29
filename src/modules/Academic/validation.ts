import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Grade ───────────────────────────────────────────────────────────────────

export const gradeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  schoolId: objectIdSchema,
  orderIndex: z.number().int().min(0),
});

export const updateGradeSchema = gradeSchema.partial();

// ─── Class ───────────────────────────────────────────────────────────────────

export const classSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  gradeId: objectIdSchema,
  schoolId: objectIdSchema,
  teacherId: objectIdSchema,
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
});

export const updateClassSchema = classSchema.partial();

// ─── Subject ─────────────────────────────────────────────────────────────────

export const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(1, 'Code is required').trim(),
  schoolId: objectIdSchema,
  gradeIds: z.array(objectIdSchema).min(1, 'At least one grade is required'),
});

export const updateSubjectSchema = subjectSchema.partial();

// ─── Timetable ───────────────────────────────────────────────────────────────

export const timetableSchema = z.object({
  schoolId: objectIdSchema,
  classId: objectIdSchema,
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  period: z.number().int().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  subjectId: objectIdSchema,
  teacherId: objectIdSchema,
  room: z.string().trim().optional(),
});

export const updateTimetableSchema = timetableSchema.partial();

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
  date: z.string().datetime(),
});

export const updateAssessmentSchema = assessmentSchema.partial();

// ─── Mark ────────────────────────────────────────────────────────────────────

export const markSchema = z.object({
  assessmentId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  mark: z.number().min(0),
  total: z.number().min(1),
  comment: z.string().trim().optional(),
});

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
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type GradeInput = z.infer<typeof gradeSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type MarkInput = z.infer<typeof markSchema>;
export type BulkMarkInput = z.infer<typeof bulkMarkSchema>;
