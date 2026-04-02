import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Book ───────────────────────────────────────────────────────────────────

export const createBookSchema = z.object({
  schoolId: objectIdSchema,
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  copies: z.number().int().min(0),
  availableCopies: z.number().int().min(0),
  shelfLocation: z.string().optional(),
  coverImageUrl: z.string().optional(),
}).strict();

export const updateBookSchema = createBookSchema.partial().strict();

// ─── Book Loan ──────────────────────────────────────────────────────────────

export const issueBookSchema = z.object({
  bookId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  dueDate: z.string().datetime(),
}).strict();

export const returnBookSchema = z.object({
  fineAmount: z.number().min(0).optional(),
}).strict();

// ─── Reading Challenge ──────────────────────────────────────────────────────

export const createChallengeSchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(1, 'Name is required'),
  targetBooks: z.number().int().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rewardPoints: z.number().int().min(0).optional(),
}).strict();

export const updateChallengeSchema = createChallengeSchema.partial().strict();

// ─── Reading Log ────────────────────────────────────────────────────────────

export const createReadingLogSchema = z.object({
  studentId: objectIdSchema,
  challengeId: objectIdSchema.optional(),
  bookId: objectIdSchema,
  pagesRead: z.number().int().min(0).optional(),
  completedDate: z.string().datetime().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().optional(),
}).strict();

// ─── Library Fine Config ────────────────────────────────────────────────────

export const updateFineConfigSchema = z.object({
  finePerDayCents: z.number().int().min(0).optional(),
  maxFineCents: z.number().int().min(0).optional(),
  exemptGrades: z.array(z.string()).optional(),
}).strict();

export const generateFineInvoicesSchema = z.object({
  finePerDayCents: z.number().int().min(0).optional(),
}).strict();

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type IssueBookInput = z.infer<typeof issueBookSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateReadingLogInput = z.infer<typeof createReadingLogSchema>;
