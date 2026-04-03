import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Node Types ──────────────────────────────────────────────────────────────

const nodeTypeEnum = z.enum([
  'phase', 'grade', 'subject', 'term', 'topic', 'subtopic', 'outcome',
]);

// ─── Cognitive Weighting ─────────────────────────────────────────────────────

const cognitiveWeightingSchema = z.object({
  knowledge: z.number().min(0).max(100),
  routine: z.number().min(0).max(100),
  complex: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
}).strict();

// ─── Node Metadata ───────────────────────────────────────────────────────────

const nodeMetadataSchema = z.object({
  weekNumbers: z.array(z.number().int().min(1)).default([]),
  capsReference: z.string().default(''),
  assessmentStandards: z.array(z.string()).default([]),
  notionalHours: z.number().min(0).default(0),
  cognitiveWeighting: cognitiveWeightingSchema.nullable().default(null),
}).strict();

// ─── Create / Update ─────────────────────────────────────────────────────────

export const createNodeSchema = z.object({
  frameworkId: objectIdSchema,
  type: nodeTypeEnum,
  parentId: objectIdSchema.nullable().default(null),
  title: z.string().min(1, 'Title is required').trim(),
  code: z.string().min(1, 'Code is required').trim(),
  description: z.string().default(''),
  metadata: nodeMetadataSchema.default({
    weekNumbers: [],
    capsReference: '',
    assessmentStandards: [],
    notionalHours: 0,
    cognitiveWeighting: null,
  }),
  order: z.number().int().min(0).default(0),
}).strict();

export const updateNodeSchema = z.object({
  title: z.string().min(1).trim().optional(),
  code: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  metadata: nodeMetadataSchema.partial().optional(),
  order: z.number().int().min(0).optional(),
  parentId: objectIdSchema.nullable().optional(),
}).strict();

// ─── Bulk Import ─────────────────────────────────────────────────────────────

const bulkNodeSchema = z.object({
  type: nodeTypeEnum,
  parentCode: z.string().nullable().default(null),
  title: z.string().min(1).trim(),
  code: z.string().min(1).trim(),
  description: z.string().default(''),
  metadata: nodeMetadataSchema.default({
    weekNumbers: [],
    capsReference: '',
    assessmentStandards: [],
    notionalHours: 0,
    cognitiveWeighting: null,
  }),
  order: z.number().int().min(0).default(0),
});

export const bulkImportSchema = z.object({
  frameworkId: objectIdSchema,
  nodes: z.array(bulkNodeSchema).min(1).max(500),
}).strict();

// ─── Query ───────────────────────────────────────────────────────────────────

export const nodeQuerySchema = z.object({
  frameworkId: objectIdSchema.optional(),
  parentId: z.preprocess(
    (val) => val === 'null' ? null : val,
    objectIdSchema.nullable(),
  ).optional(),
  type: nodeTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
}).strict();

// ─── Framework ───────────────────────────────────────────────────────────────

export const createFrameworkSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().default(''),
}).strict();

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type NodeQueryInput = z.infer<typeof nodeQuerySchema>;
export type CreateFrameworkInput = z.infer<typeof createFrameworkSchema>;
