import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Generate Paper ───────────────────────────────────────────────────────────

export const generatePaperSchema = z.object({
  schoolId: objectIdSchema,
  subject: z.string().min(1, 'Subject is required').trim(),
  grade: z.number().int().min(1).max(12),
  term: z.number().int().min(1).max(4),
  topic: z.string().min(1, 'Topic is required').trim(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  duration: z.number().int().min(15, 'Minimum 15 minutes').max(300),
  totalMarks: z.number().int().min(10).max(500),
}).strict();

export type GeneratePaperInput = z.infer<typeof generatePaperSchema>;

// ─── Update Paper ─────────────────────────────────────────────────────────────

export const updatePaperSchema = z.object({
  subject: z.string().min(1).trim().optional(),
  topic: z.string().min(1).trim().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
  duration: z.number().int().min(15).max(300).optional(),
  totalMarks: z.number().int().min(10).max(500).optional(),
  sections: z
    .array(
      z.object({
        sectionLabel: z.string().min(1),
        questionType: z.string().min(1),
        questions: z.array(
          z.object({
            questionNumber: z.number().int().min(1),
            questionText: z.string().min(1),
            marks: z.number().int().min(1),
            modelAnswer: z.string().min(1),
            markingGuideline: z.string().min(1),
          }),
        ),
      }),
    )
    .optional(),
  memorandum: z.string().optional(),
}).strict();

export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;

// ─── Regenerate Question ──────────────────────────────────────────────────────

export const regenerateQuestionSchema = z.object({
  sectionIndex: z.number().int().min(0),
  questionIndex: z.number().int().min(0),
}).strict();

export type RegenerateQuestionInput = z.infer<typeof regenerateQuestionSchema>;

// ─── Grade Submission ─────────────────────────────────────────────────────────

const rubricCriterionSchema = z.object({
  criterion: z.string().min(1, 'Criterion is required'),
  maxScore: z.number().min(1),
  description: z.string().min(1, 'Description is required'),
});

export const gradeSubmissionSchema = z.object({
  schoolId: objectIdSchema,
  assignmentId: objectIdSchema,
  studentId: objectIdSchema,
  submissionText: z.string().min(1, 'Submission text is required'),
  rubric: z.array(rubricCriterionSchema).min(1, 'At least one rubric criterion is required'),
}).strict();

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;

// ─── Bulk Grade ───────────────────────────────────────────────────────────────

export const bulkGradeSchema = z.object({
  schoolId: objectIdSchema,
  assignmentId: objectIdSchema,
  submissions: z
    .array(
      z.object({
        studentId: objectIdSchema,
        submissionText: z.string().min(1),
      }),
    )
    .min(1, 'At least one submission is required'),
  rubric: z.array(rubricCriterionSchema).min(1, 'At least one rubric criterion is required'),
}).strict();

export type BulkGradeInput = z.infer<typeof bulkGradeSchema>;

// ─── Review Grade ─────────────────────────────────────────────────────────────

export const reviewGradeSchema = z.object({
  finalMark: z.number().min(0),
  teacherNotes: z.string().optional().default(''),
}).strict();

export type ReviewGradeInput = z.infer<typeof reviewGradeSchema>;

// ─── Publish Grade (params only) ─────────────────────────────────────────────

export const publishGradeParamsSchema = z.object({
  jobId: objectIdSchema,
}).strict();
