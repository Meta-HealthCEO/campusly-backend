import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Session Settings ────────────────────────────────────────────────────────

const sessionSettingsSchema = z.object({
  studentVideoEnabled: z.boolean().optional(),
  studentAudioEnabled: z.boolean().optional(),
  chatEnabled: z.boolean().optional(),
  maxParticipants: z.number().int().min(1).max(500).optional(),
  allowLateJoin: z.boolean().optional(),
});

// ─── Create Session ──────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional(),
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  gradeId: objectIdSchema.optional(),
  scheduledStart: z.string().min(1, 'Scheduled start is required'),
  scheduledEnd: z.string().min(1, 'Scheduled end is required'),
  isRecorded: z.boolean().optional(),
  settings: sessionSettingsSchema.optional(),
  recurringRule: z.string().optional(),
  timetablePeriodId: objectIdSchema.optional(),
}).strict();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ─── Update Session ──────────────────────────────────────────────────────────

export const updateSessionSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  subjectId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  isRecorded: z.boolean().optional(),
  settings: sessionSettingsSchema.optional(),
  recurringRule: z.string().optional(),
}).strict();

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

// ─── End Session ─────────────────────────────────────────────────────────────

export const endSessionSchema = z.object({
  recordingUrl: z.string().optional(),
}).strict();

export type EndSessionInput = z.infer<typeof endSessionSchema>;

// ─── Create Poll ─────────────────────────────────────────────────────────────

export const createPollSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string().min(1)).min(2, 'At least 2 options required'),
}).strict();

export type CreatePollInput = z.infer<typeof createPollSchema>;

// ─── Poll Response ───────────────────────────────────────────────────────────

export const respondToPollSchema = z.object({
  answer: z.number().int().min(0),
}).strict();

export type RespondToPollInput = z.infer<typeof respondToPollSchema>;

// ─── Create Video ────────────────────────────────────────────────────────────

export const createVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  videoUrl: z.string().min(1, 'Video URL is required'),
  videoType: z.enum(['upload', 'youtube', 'vimeo', 'recording']),
  thumbnailUrl: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sessionId: objectIdSchema.optional(),
}).strict();

export type CreateVideoInput = z.infer<typeof createVideoSchema>;

// ─── Update Video ────────────────────────────────────────────────────────────

export const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  videoUrl: z.string().optional(),
  videoType: z.enum(['upload', 'youtube', 'vimeo', 'recording']).optional(),
  thumbnailUrl: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
}).strict();

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

// ─── Update Progress ──────────────────────────────────────────────────────────

export const updateProgressSchema = z.object({
  watchedSeconds: z.number().int().min(0),
  totalSeconds: z.number().int().min(1),
}).strict();

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// ─── Query Schemas ────────────────────────────────────────────────────────────

export const sessionQuerySchema = z.object({
  status: z.enum(['scheduled', 'live', 'ended', 'cancelled']).optional(),
  classId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const videoQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  published: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
