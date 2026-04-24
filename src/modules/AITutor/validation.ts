import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const oid = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Send Message ────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  conversationId: oid.optional(),
  subjectId: oid,
  subjectName: z.string().min(1, 'Subject name is required'),
  grade: z.number().int().min(1).max(12),
  message: z.string().min(1, 'Message is required').max(4000),
  mode: z.enum(['chat', 'homework_help', 'practice', 'exam_prep']).default('chat'),
}).strict();

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ─── Generate Practice ───────────────────────────────────────────────────────

export const generatePracticeSchema = z.object({
  subjectId: oid,
  subjectName: z.string().min(1, 'Subject name is required'),
  grade: z.number().int().min(1).max(12),
  topic: z.string().min(1, 'Topic is required'),
  questionCount: z.number().int().min(3).max(20).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  questionTypes: z
    .array(z.enum(['mcq', 'short_answer', 'true_false']))
    .min(1, 'At least one question type required')
    .default(['mcq', 'short_answer']),
}).strict();

export type GeneratePracticeInput = z.infer<typeof generatePracticeSchema>;

// ─── Submit Practice ─────────────────────────────────────────────────────────

export const submitPracticeSchema = z.object({
  attemptId: oid,
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().min(0),
        answer: z.string().min(1, 'Answer is required'),
      }),
    )
    .min(1, 'At least one answer is required'),
}).strict();

export type SubmitPracticeInput = z.infer<typeof submitPracticeSchema>;

// ─── Generate Report Comments ────────────────────────────────────────────────

export const generateReportCommentsSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1).max(50),
  classId: z.string().min(1).optional(),
  subjectId: z.string().min(1),
  term: z.number().int().min(1).max(4),
  tone: z.enum(['encouraging', 'balanced', 'formal']).default('encouraging'),
});

export type GenerateReportCommentsInput = z.infer<typeof generateReportCommentsSchema>;

// ─── Report Comments — CRUD ──────────────────────────────────────────────────

export const updateReportCommentSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    finalText: z.string().min(1).max(5000),
  }),
};

export const listReportCommentsQuerySchema = {
  query: z.object({
    classId: z.string().optional(),
    subjectId: z.string().optional(),
    term: z.string().optional(),
    studentId: z.string().optional(),
    academicYear: z.string().optional(),
  }),
};

// ─── Parent Chat ─────────────────────────────────────────────────────────────

export const parentChatSchema = z.object({
  studentId: oid,
  message: z.string().min(1, 'Message is required').max(2000),
  conversationId: oid.optional(),
}).strict();

export type ParentChatInput = z.infer<typeof parentChatSchema>;
