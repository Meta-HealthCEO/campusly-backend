import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  subjectId: objectIdSchema,
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  rubric: z.string().optional(),
  attachments: z.array(
    z.object({
      url: z.string().min(1),
      name: z.string().min(1),
    }).strict(),
  ).optional(),
}).strict();

export const cloneTemplateSchema = z.object({
  classId: objectIdSchema,
  dueDate: z.string().datetime(),
  title: z.string().trim().optional(),
}).strict();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>;
