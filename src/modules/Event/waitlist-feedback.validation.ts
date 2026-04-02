import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const joinWaitlistSchema = z.object({
  eventId: objectIdSchema,
  studentId: objectIdSchema.optional(),
}).strict();

export const submitFeedbackSchema = z.object({
  eventId: objectIdSchema,
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional(),
}).strict();

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
