import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid ObjectId');

export const CreatePaperImportSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  curriculumNodeId: objectIdSchema,
  generateAnswers: z.boolean(),
  addHints: z.boolean(),
  addWorkedExample: z.boolean(),
  addExplanations: z.boolean(),
  instructions: z.string().max(2000).optional(),
});
export type CreatePaperImportInput = z.infer<typeof CreatePaperImportSchema>;

const resourceKindEnum = z.enum([
  'lesson', 'worksheet', 'activity', 'study_notes', 'worked_example',
]);

export const SegmentResponseSchema = z.object({
  resources: z.array(
    z.object({
      kind: resourceKindEnum,
      title: z.string().min(1).max(200),
      pageRange: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
      reasoning: z.string().default(''),
    }),
  ).min(1),
});
export type SegmentResponse = z.infer<typeof SegmentResponseSchema>;

const blockTypeEnum = z.enum([
  'text', 'quiz', 'fill_blank', 'match_columns', 'ordering', 'step_reveal', 'image',
]);

export const TranscribeResponseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  blocks: z.array(
    z.object({
      blockId: z.string().min(1),
      type: blockTypeEnum,
      order: z.number().int().min(0),
      content: z.string(),
      confidence: z.number().min(0).max(1),
      cropBox: z
        .object({
          page: z.number().int().min(1),
          x: z.number().min(0).max(1),
          y: z.number().min(0).max(1),
          w: z.number().min(0).max(1),
          h: z.number().min(0).max(1),
        })
        .optional(),
    }),
  ).default([]),
});
export type TranscribeResponse = z.infer<typeof TranscribeResponseSchema>;

export const AnswersEnhancementSchema = z.object({
  answers: z.array(z.object({ blockId: z.string(), answer: z.string() })),
});

export const HintsEnhancementSchema = z.object({
  hints: z.array(z.object({ blockId: z.string(), hints: z.array(z.string()) })),
});

export const ExplanationsEnhancementSchema = z.object({
  explanations: z.array(z.object({ blockId: z.string(), explanation: z.string() })),
});

export const WorkedExampleEnhancementSchema = z.object({
  block: z.object({
    blockId: z.string().min(1),
    type: z.literal('step_reveal'),
    order: z.number().int().min(0),
    content: z.string(),
  }),
});
