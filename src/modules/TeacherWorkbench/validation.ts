import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const nullableObjectId = objectIdSchema.nullable().default(null);

const cognitiveLevels = [
  'knowledge',
  'comprehension',
  'application',
  'analysis',
  'synthesis',
  'evaluation',
] as const;

const questionTypes = [
  'mcq',
  'structured',
  'essay',
  'true_false',
  'matching',
  'short_answer',
  'fill_in_blank',
] as const;

const difficulties = ['easy', 'medium', 'hard'] as const;

const assessmentTypes = ['test', 'exam', 'assignment', 'practical', 'project'] as const;

// ─── createFrameworkSchema ────────────────────────────────────────────────────

export const createFrameworkSchema = z
  .object({
    schoolId: objectIdSchema,
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).default(''),
    isDefault: z.boolean().default(false),
  })
  .strict();

export type CreateFrameworkInput = z.infer<typeof createFrameworkSchema>;

// ─── createTopicSchema ────────────────────────────────────────────────────────

export const createTopicSchema = z
  .object({
    schoolId: objectIdSchema,
    frameworkId: objectIdSchema,
    subjectId: objectIdSchema,
    gradeLevel: z.number().int().min(1).max(12),
    parentTopicId: nullableObjectId,
    name: z.string().min(1).max(200).trim(),
    description: z.string().max(1000).default(''),
    term: z.number().int().min(1).max(4),
    orderIndex: z.number().int().min(0).default(0),
    cognitiveLevel: z.enum(cognitiveLevels).default('knowledge'),
    estimatedPeriods: z.number().int().min(1).default(1),
  })
  .strict();

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

// ─── updateTopicSchema ────────────────────────────────────────────────────────

export const updateTopicSchema = z
  .object({
    parentTopicId: nullableObjectId.optional(),
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).optional(),
    term: z.number().int().min(1).max(4).optional(),
    orderIndex: z.number().int().min(0).optional(),
    cognitiveLevel: z.enum(cognitiveLevels).optional(),
    estimatedPeriods: z.number().int().min(1).optional(),
  })
  .strict();

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;

// ─── bulkImportTopicsSchema ───────────────────────────────────────────────────

const bulkTopicItemSchema = z.object({
  parentTopicId: nullableObjectId,
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).default(''),
  term: z.number().int().min(1).max(4),
  orderIndex: z.number().int().min(0).default(0),
  cognitiveLevel: z.enum(cognitiveLevels).default('knowledge'),
  estimatedPeriods: z.number().int().min(1).default(1),
});

export const bulkImportTopicsSchema = z
  .object({
    schoolId: objectIdSchema,
    frameworkId: objectIdSchema,
    subjectId: objectIdSchema,
    gradeLevel: z.number().int().min(1).max(12),
    topics: z.array(bulkTopicItemSchema).min(1).max(200),
  })
  .strict();

export type BulkImportTopicsInput = z.infer<typeof bulkImportTopicsSchema>;

// ─── updateCoverageSchema ─────────────────────────────────────────────────────

export const updateCoverageSchema = z
  .object({
    classId: objectIdSchema,
    status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']),
    dateCovered: z.string().datetime().nullable().default(null),
    notes: z.string().max(500).default(''),
    linkedLessonPlanId: nullableObjectId,
  })
  .strict();

export type UpdateCoverageInput = z.infer<typeof updateCoverageSchema>;

// ─── createQuestionSchema ─────────────────────────────────────────────────────

const questionOptionItemSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z
  .object({
    schoolId: objectIdSchema,
    frameworkId: objectIdSchema,
    subjectId: objectIdSchema,
    gradeLevel: z.number().int().min(1).max(12),
    topicId: nullableObjectId,
    questionText: z.string().min(1).max(5000),
    questionType: z.enum(questionTypes),
    marks: z.number().int().min(1).max(100),
    difficulty: z.enum(difficulties),
    cognitiveLevel: z.enum(cognitiveLevels),
    modelAnswer: z.string().max(5000).default(''),
    markingNotes: z.string().max(2000).default(''),
    images: z.array(z.string().url()).max(10).default([]),
    options: z.array(questionOptionItemSchema).max(10).default([]),
    tags: z.array(z.string()).max(20).default([]),
    source: z.enum(['manual', 'ai_generated', 'imported']).default('manual'),
  })
  .strict();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// ─── updateQuestionSchema ─────────────────────────────────────────────────────

export const updateQuestionSchema = z
  .object({
    topicId: nullableObjectId.optional(),
    questionText: z.string().min(1).max(5000).optional(),
    questionType: z.enum(questionTypes).optional(),
    marks: z.number().int().min(1).max(100).optional(),
    difficulty: z.enum(difficulties).optional(),
    cognitiveLevel: z.enum(cognitiveLevels).optional(),
    modelAnswer: z.string().max(5000).optional(),
    markingNotes: z.string().max(2000).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    options: z.array(questionOptionItemSchema).max(10).optional(),
    tags: z.array(z.string()).max(20).optional(),
    source: z.enum(['manual', 'ai_generated', 'imported']).optional(),
  })
  .strict();

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

// ─── updateMemoSchema ─────────────────────────────────────────────────────────

const markAllocationItemSchema = z.object({
  criterion: z.string().min(1),
  marks: z.number().min(0),
});

const memoAnswerItemSchema = z.object({
  questionNumber: z.string().min(1),
  expectedAnswer: z.string().min(1),
  markAllocation: z.array(markAllocationItemSchema).default([]),
  commonMistakes: z.array(z.string()).default([]),
  acceptableAlternatives: z.array(z.string()).default([]),
});

const memoSectionItemSchema = z.object({
  sectionTitle: z.string().min(1),
  answers: z.array(memoAnswerItemSchema).default([]),
});

export const updateMemoSchema = z
  .object({
    sections: z.array(memoSectionItemSchema).optional(),
    status: z.enum(['draft', 'final']).optional(),
  })
  .strict();

export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;

// ─── reviewPaperSchema ────────────────────────────────────────────────────────

export const reviewPaperSchema = z
  .object({
    status: z.enum(['approved', 'changes_requested']),
    comments: z.string().max(2000).default(''),
  })
  .strict();

export type ReviewPaperInput = z.infer<typeof reviewPaperSchema>;

// ─── createPlanSchema ─────────────────────────────────────────────────────────

const plannedAssessmentItemSchema = z.object({
  title: z.string().min(1).trim(),
  type: z.enum(assessmentTypes),
  plannedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid plannedDate',
  }),
  marks: z.number().int().min(1),
  weight: z.number().min(0).max(100),
  topicIds: z.array(objectIdSchema).default([]),
  assessmentId: nullableObjectId,
  status: z.enum(['planned', 'created', 'completed']).default('planned'),
});

export const createPlanSchema = z
  .object({
    schoolId: objectIdSchema.optional(),
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    term: z.number().int().min(1).max(4),
    year: z.number().int().min(2020).max(2050),
    plannedAssessments: z.array(plannedAssessmentItemSchema).max(30).default([]),
  })
  .strict();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
