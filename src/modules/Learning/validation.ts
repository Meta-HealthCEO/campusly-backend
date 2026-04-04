import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Quiz ──────────────────────────────────────────────────────────────────────

const quizOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required').trim(),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').trim(),
  questionType: z.enum(['mcq', 'true_false', 'short_answer', 'matching']),
  options: z.array(quizOptionSchema).optional().default([]),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1'),
  explanation: z.string().trim().optional(),
});

export const createQuizSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  type: z.enum(['mcq', 'true_false', 'mixed']),
  questions: z.array(quizQuestionSchema).min(1, 'At least one question is required'),
  totalPoints: z.number().min(1, 'Total points must be at least 1'),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').optional(),
  showInstantFeedback: z.boolean().optional().default(false),
  allowRetry: z.boolean().optional().default(false),
  attempts: z.number().min(1).optional().default(1),
  shuffleQuestions: z.boolean().optional().default(false),
  shuffleOptions: z.boolean().optional().default(false),
  dueDate: z.string().datetime().optional(),
}).strict();

export const updateQuizSchema = createQuizSchema.partial().strict();

export const publishQuizSchema = z.object({
  status: z.enum(['published', 'closed']),
}).strict();

// ─── Quiz Attempt ──────────────────────────────────────────────────────────────

const quizAnswerSchema = z.object({
  questionIndex: z.number().min(0),
  selectedOption: z.number().min(0).optional(),
  textAnswer: z.string().trim().optional(),
});

export const submitQuizAttemptSchema = z.object({
  answers: z.array(quizAnswerSchema).min(1, 'At least one answer is required'),
  startedAt: z.string().datetime(),
  timeSpent: z.number().min(0).optional(),
}).strict();

// ─── Study Material ────────────────────────────────────────────────────────────

export const createStudyMaterialSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  term: z.number().min(1).max(4),
  topic: z.string().min(1, 'Topic is required').trim(),
  type: z.enum(['notes', 'video', 'link', 'document', 'past_paper']),
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  fileUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  externalLink: z.string().optional(),
  tags: z.array(z.string().trim()).optional().default([]),
  curriculum: z.object({
    subject: z.string().min(1).trim(),
    grade: z.string().min(1).trim(),
    term: z.string().min(1).trim(),
    topic: z.string().min(1).trim(),
  }),
}).strict();

export const updateStudyMaterialSchema = createStudyMaterialSchema.partial().strict();

// ─── Rubric ────────────────────────────────────────────────────────────────────

const rubricLevelSchema = z.object({
  label: z.string().min(1, 'Label is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  points: z.number().min(0),
});

const rubricCriterionSchema = z.object({
  name: z.string().min(1, 'Criterion name is required').trim(),
  description: z.string().min(1, 'Criterion description is required').trim(),
  levels: z.array(rubricLevelSchema).min(1, 'At least one level is required'),
});

export const createRubricSchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(1, 'Rubric name is required').trim(),
  subjectId: objectIdSchema.optional(),
  criteria: z.array(rubricCriterionSchema).min(1, 'At least one criterion is required'),
  totalPoints: z.number().min(1, 'Total points must be at least 1'),
  reusable: z.boolean().optional().default(true),
}).strict();

export const updateRubricSchema = createRubricSchema.partial().strict();

// ─── Assignment Submission (Enhanced) ──────────────────────────────────────────

export const submitDraftSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file is required'),
}).strict();

export const submitFinalSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file is required'),
}).strict();

export const gradeWithRubricSchema = z.object({
  comments: z.string().min(1, 'Comments are required').trim(),
  rubricScores: z
    .array(
      z.object({
        criterionId: z.string().min(1),
        level: z.string().min(1),
        points: z.number().min(0),
      }),
    )
    .optional()
    .default([]),
  audioFeedbackUrl: z.string().optional(),
  mark: z.number().min(0).optional(),
}).strict();

export const submitPeerReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comments: z.string().min(1, 'Comments are required').trim(),
}).strict();

// ─── Type Exports ──────────────────────────────────────────────────────────────

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;
export type CreateStudyMaterialInput = z.infer<typeof createStudyMaterialSchema>;
export type UpdateStudyMaterialInput = z.infer<typeof updateStudyMaterialSchema>;
export type CreateRubricInput = z.infer<typeof createRubricSchema>;
export type UpdateRubricInput = z.infer<typeof updateRubricSchema>;
export type GradeWithRubricInput = z.infer<typeof gradeWithRubricSchema>;
export type SubmitPeerReviewInput = z.infer<typeof submitPeerReviewSchema>;

// ─── Request Revision (params only) ─────────────────────────────────────────

export const requestRevisionParamsSchema = z.object({
  id: objectIdSchema,
}).strict();
