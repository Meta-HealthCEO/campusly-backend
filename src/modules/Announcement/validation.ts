import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  schoolId: objectIdSchema,
  targetAudience: z.enum(['all', 'teachers', 'parents', 'students', 'grade', 'class']),
  targetId: objectIdSchema.optional(),
  attachments: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expiresAt: z.string().datetime().optional(),
  pinned: z.boolean().optional(),
  scheduledPublishDate: z.string().datetime().optional(),
}).strict();

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  targetAudience: z.enum(['all', 'teachers', 'parents', 'students', 'grade', 'class']).optional(),
  targetId: objectIdSchema.optional(),
  attachments: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expiresAt: z.string().datetime().optional(),
}).strict();

export const schedulePublishSchema = z.object({
  publishAt: z.string().datetime('publishAt must be a valid date-time'),
}).strict();

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type SchedulePublishInput = z.infer<typeof schedulePublishSchema>;

export const markReadParamsSchema = z.object({
  id: objectIdSchema,
}).strict();
