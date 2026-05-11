import type { ILessonMaterial } from './types.js';

// ── Public types ──────────────────────────────────────────────────────────
export type SlideTextRun = {
  text: string;
  options?: {
    breakLine?: boolean;
    bullet?: boolean | { code?: string };
    bold?: boolean;
  };
};

const MAX_BLOCKS_PER_MATERIAL = 3;
const MAX_BLOCK_CHARS = 400;
const MAX_QUESTIONS_PREVIEW = 3;

// ── Public dispatch ───────────────────────────────────────────────────────
/**
 * Per-kind renderer that turns a populated lesson material into the rich-text
 * runs that the slideshow body addText() call expects. Returns an empty array
 * when the material has nothing useful to surface (e.g. unpopulated ref) so
 * the slide builder can skip the body addText() call entirely.
 */
export function renderMaterialBody(material: ILessonMaterial): SlideTextRun[] {
  switch (material.kind) {
    case 'notes':
    case 'worksheet':
    case 'activity':
    case 'worked_example':
      return renderContentResourceBody(material);
    case 'practice_questions':
      return renderQuestionBody(
        toMaybeArray((material as { questionIds?: unknown }).questionIds),
      );
    case 'homework':
      return renderHomeworkBody(material);
    case 'reading':
      return renderReadingBody(material);
    case 'quiz':
    case 'paper':
      return renderLinkedEntityBody(material);
    default:
      return [];
  }
}

// ── Per-kind renderers ────────────────────────────────────────────────────
interface ContentBlockLike {
  type?: string;
  content?: string;
}
interface ContentResourceLike {
  title?: string;
  blocks?: ContentBlockLike[];
}

function renderContentResourceBody(
  material: ILessonMaterial,
): SlideTextRun[] {
  const ref = (material as { contentResourceId?: unknown }).contentResourceId;
  if (!isPopulatedObject(ref)) return [];
  const resource = ref as ContentResourceLike;
  const blocks = (resource.blocks ?? [])
    .filter(
      (b) =>
        b.type === 'text'
        && typeof b.content === 'string'
        && b.content.trim().length > 0,
    )
    .slice(0, MAX_BLOCKS_PER_MATERIAL);
  if (blocks.length === 0) return [];
  return blocks.map((b) => ({
    text: truncate(stripMarkdown((b.content ?? '').trim()), MAX_BLOCK_CHARS),
    options: { breakLine: true },
  }));
}

interface QuestionLike {
  stem?: string;
}

function renderQuestionBody(rawIds: unknown[]): SlideTextRun[] {
  const stems: string[] = [];
  for (const item of rawIds) {
    if (!isPopulatedObject(item)) continue;
    const stem = (item as QuestionLike).stem;
    if (typeof stem !== 'string' || stem.trim().length === 0) continue;
    stems.push(stem.trim());
  }
  const remaining = stems.length - MAX_QUESTIONS_PREVIEW;
  const previewed = stems.slice(0, MAX_QUESTIONS_PREVIEW);
  const out: SlideTextRun[] = previewed.map((s) => ({
    text: truncate(stripMarkdown(s), 220),
    options: { bullet: true, breakLine: true },
  }));
  if (remaining > 0) {
    out.push({
      text: `+ ${remaining} more`,
      options: { breakLine: true, bold: true },
    });
  }
  return out;
}

interface HomeworkLike {
  title?: string;
  type?: string;
  dueDate?: string | Date;
  exerciseQuestionIds?: unknown[];
}

function renderHomeworkBody(material: ILessonMaterial): SlideTextRun[] {
  const ref = (material as { homeworkId?: unknown }).homeworkId;
  if (!isPopulatedObject(ref)) return [];
  const hw = ref as HomeworkLike;
  const out: SlideTextRun[] = [];
  if (hw.title) {
    out.push({ text: hw.title, options: { breakLine: true, bold: true } });
  }
  if (hw.dueDate) {
    const date = new Date(hw.dueDate);
    if (!Number.isNaN(date.getTime())) {
      out.push({
        text: `Due: ${date.toLocaleDateString()}`,
        options: { breakLine: true },
      });
    }
  }
  if (hw.type === 'exercise' && Array.isArray(hw.exerciseQuestionIds)) {
    const questionRuns = renderQuestionBody(hw.exerciseQuestionIds);
    if (questionRuns.length > 0) {
      out.push({ text: '', options: { breakLine: true } });
      out.push(...questionRuns);
    }
  }
  return out;
}

function renderReadingBody(material: ILessonMaterial): SlideTextRun[] {
  if (material.kind !== 'reading') return [];
  const ref = material.textbookRef;
  const out: SlideTextRun[] = [];
  if (ref.source === 'internal') {
    const tb = (
      material as unknown as {
        textbookRef: {
          textbookId?: unknown;
          pageStart?: number;
          pageEnd?: number;
        };
      }
    ).textbookRef;
    const tbName = isPopulatedObject(tb.textbookId)
      ? readPopulatedName(tb.textbookId as { title?: string; name?: string })
      : 'Textbook';
    out.push({
      text: tbName || 'Textbook',
      options: { breakLine: true, bold: true },
    });
    if (tb.pageStart || tb.pageEnd) {
      out.push({
        text: `Pages ${tb.pageStart ?? '?'} – ${tb.pageEnd ?? '?'}`,
        options: { breakLine: true },
      });
    }
  } else {
    out.push({ text: ref.title, options: { breakLine: true, bold: true } });
    if (ref.publisher) {
      out.push({ text: ref.publisher, options: { breakLine: true } });
    }
    if (ref.pageStart || ref.pageEnd) {
      out.push({
        text: `Pages ${ref.pageStart ?? '?'} – ${ref.pageEnd ?? '?'}`,
        options: { breakLine: true },
      });
    }
  }
  return out;
}

function renderLinkedEntityBody(material: ILessonMaterial): SlideTextRun[] {
  const refKey = material.kind === 'quiz' ? 'quizId' : 'paperId';
  // Discriminated-union narrowing through an arbitrary string key is what
  // forces this widening — we only ever read the populated entity, never
  // mutate, so an `unknown` cast keeps the rest of the helper honest.
  const ref = (material as unknown as Record<string, unknown>)[refKey];
  if (!isPopulatedObject(ref)) return [];
  const name = readPopulatedName(ref as { title?: string; name?: string });
  if (!name) return [];
  return [{ text: name, options: { breakLine: true, bold: true } }];
}

// ── Helpers ───────────────────────────────────────────────────────────────
function isPopulatedObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function readPopulatedName(
  v: { name?: string; title?: string } | null | undefined,
): string {
  if (!v || typeof v !== 'object') return '';
  return v.title ?? v.name ?? '';
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function stripMarkdown(s: string): string {
  return s
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function toMaybeArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
