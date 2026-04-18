import { z } from 'zod/v4';
import { ANNOUNCEMENT_PRIORITIES } from './model-announcement.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const createAnnouncementSchema = z.object({
  teamId: objectId,
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  pinned: z.boolean().optional(),
  publishedAt: z.iso.datetime().optional(),
  expiresAt: z.iso.datetime().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  pinned: z.boolean().optional(),
  publishedAt: z.iso.datetime().optional(),
  expiresAt: z.iso.datetime().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
