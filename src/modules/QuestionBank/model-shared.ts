// Shared constants used by both model.ts and model-papers.ts.
// Lives in its own module to avoid a circular ESM evaluation order:
// model.ts re-exports from model-papers.ts, which previously imported
// DIAGRAM_RENDER_STATUSES from model.ts — Node ESM hit "Cannot access
// before initialization" at runtime even though tsc was happy.

export const DIAGRAM_RENDER_STATUSES = ['pending', 'rendered', 'failed'] as const;
export type DiagramRenderStatus = (typeof DIAGRAM_RENDER_STATUSES)[number];

export const CAPS_LEVELS = ['knowledge', 'routine', 'complex', 'problem_solving'] as const;
export type CapsLevel = (typeof CAPS_LEVELS)[number];

/** Who set an inline paper question's topic and level (Phase E §4.2). */
export const PAPER_QUESTION_TAG_FROM = ['generator', 'teacher', 'ai_tag'] as const;
export type PaperQuestionTagFrom = (typeof PAPER_QUESTION_TAG_FROM)[number];
