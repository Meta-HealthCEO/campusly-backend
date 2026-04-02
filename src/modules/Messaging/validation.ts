import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createThreadSchema = z.object({
  recipientId: objectIdSchema,
  studentId: objectIdSchema,
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(4000),
}).strict();

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message is required').max(4000),
}).strict();

export const markReadSchema = z.object({}).strict();

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
