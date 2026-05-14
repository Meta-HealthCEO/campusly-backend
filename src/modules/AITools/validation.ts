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
  finalMark: z.number().nonnegative().optional(),
  teacherNotes: z.string().default(''),
  criteriaScores: z.array(z.object({
    criterion: z.string().min(1),
    score: z.number().nonnegative(),
    maxScore: z.number().positive(),
    feedback: z.string().optional(),
  })).optional(),
}).refine(
  (data) => data.finalMark !== undefined || (data.criteriaScores && data.criteriaScores.length > 0),
  { message: 'Either finalMark or criteriaScores is required' },
);

export type ReviewGradeInput = z.infer<typeof reviewGradeSchema>;

// ─── Mark Paper from Images (OCR, multi-image) ───────────────────────────────
// NOTE: /mark-paper is a multipart/form-data endpoint (Multer-handled). The
// previous Zod schema for a JSON base64 body has been removed; the controller
// validates the parsed text fields inline.

// ─── Update Marking (teacher overrides) ──────────────────────────────────────

// Flat body schemas — see note on issueMarkingSchema below for why.

export const updateMarkingSchema = z.object({
  questions: z.array(z.object({
    questionNumber: z.string(),
    marksAwarded: z.number().nonnegative(),
    maxMarks: z.number().nonnegative(),
    feedback: z.string().optional(),
  })).optional(),
  status: z.enum(['completed', 'needs_review']).optional(),
});

// ─── Publish Grade ───────────────────────────────────────────────────────────

export const publishGradeSchema = z.object({
  assessmentId: z.string().min(1),
  comment: z.string().optional(),
});

// ─── Issue Marking ───────────────────────────────────────────────────────────
//
// Flat body schema — the `validate` middleware (when given a single Zod
// schema) calls `safeParse(req.body)`. The previous wrapped form of
// `z.object({ params, body })` always failed because params/body aren't
// present on req.body itself. Route-level :id capture is enforced by Express.

export const issueMarkingSchema = z.object({
  // Optional — if omitted, the service will lazily find or create an
  // Assessment record from the linked paper's metadata.
  assessmentId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  comment: z.string().optional(),
});

// ─── Rubric Templates ─────────────────────────────────────────────────────────

export const createRubricTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  criteria: z.array(z.object({
    criterion: z.string().min(1).max(200),
    maxScore: z.number().int().positive().max(100),
    description: z.string().max(500).default(''),
  })).min(1).max(20),
  isShared: z.boolean().optional(),
});

export type CreateRubricTemplateInput = z.infer<typeof createRubricTemplateSchema>;
