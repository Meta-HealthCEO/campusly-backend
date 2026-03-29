import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Homework ────────────────────────────────────────────────────────────────

export const createHomeworkSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required'),
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  dueDate: z.string().datetime(),
  attachments: z.array(z.string()).optional(),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
});

export const updateHomeworkSchema = createHomeworkSchema.partial();

// ─── Submission ──────────────────────────────────────────────────────────────

export const submitHomeworkSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file is required'),
});

// ─── Grading ─────────────────────────────────────────────────────────────────

export const gradeSubmissionSchema = z.object({
  mark: z.number().min(0, 'Mark cannot be negative'),
  feedback: z.string().trim().optional(),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
export type SubmitHomeworkInput = z.infer<typeof submitHomeworkSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
