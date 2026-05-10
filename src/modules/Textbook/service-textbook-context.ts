import mongoose from 'mongoose';
import { Textbook } from './model.js';
import type { IChapter } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { logger } from '../../common/logger.js';

// ── Public types ───────────────────────────────────────────────────────────
export interface TextbookContext {
  source: 'matched' | 'none';
  textbookTitle?: string;
  chapterTitle?: string;
  /** Composed prompt-ready snippet; '' when source === 'none'. */
  text: string;
}

export interface ResolveOptions {
  maxChars?: number;
}

const DEFAULT_MAX_CHARS = 6000;
const MAX_ANCESTOR_HOPS = 5;

// ── Helper: extract text from a ContentResource ────────────────────────────
// Mirrors Homework/service-homework-comprehension.ts:extractText. Kept inline
// (rather than extracting to a shared util) because the surface area is tiny
// and the two callers want subtly different bounds.
interface ContentResourceLike {
  title?: string;
  blocks?: Array<{ type?: string; content?: string }>;
}

function extractResourceText(resource: ContentResourceLike): string {
  const parts: string[] = [];
  if (resource.title) parts.push(`Title: ${resource.title}`);
  for (const b of resource.blocks ?? []) {
    if (typeof b.content === 'string' && b.content.trim().length > 0) {
      parts.push(b.content);
    }
  }
  return parts.join('\n\n');
}

// ── Helper: walk topic ancestor chain ──────────────────────────────────────
interface NodeParentLite {
  _id: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
}

async function getAncestorChain(
  startNodeId: mongoose.Types.ObjectId,
  hopBudget: number,
): Promise<mongoose.Types.ObjectId[]> {
  const chain: mongoose.Types.ObjectId[] = [];
  let cursor: mongoose.Types.ObjectId | null = startNodeId;
  let hops = 0;
  while (cursor && hops < hopBudget) {
    const node: NodeParentLite | null = await CurriculumNode.findById(cursor)
      .select('_id parentId')
      .lean<NodeParentLite | null>();
    if (!node) break;
    chain.push(node._id);
    cursor = node.parentId;
    hops += 1;
  }
  return chain;
}

// ── Helper: pick chapter from candidate textbooks ──────────────────────────
interface PickedChapter {
  textbook: { _id: mongoose.Types.ObjectId; title: string };
  chapter: IChapter;
}

function findChapterByNodeId(
  textbooks: Array<{ _id: mongoose.Types.ObjectId; title: string; chapters: IChapter[] }>,
  nodeId: mongoose.Types.ObjectId,
): PickedChapter | null {
  const key = nodeId.toString();
  for (const tb of textbooks) {
    const chapter = tb.chapters.find(
      (c) => c.curriculumNodeId && c.curriculumNodeId.toString() === key,
    );
    if (chapter) {
      return { textbook: { _id: tb._id, title: tb.title }, chapter };
    }
  }
  return null;
}

// ── Main resolver ──────────────────────────────────────────────────────────
export async function resolveTextbookContextForTopic(
  curriculumNodeId: string,
  schoolOid: mongoose.Types.ObjectId,
  options: ResolveOptions = {},
): Promise<TextbookContext> {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;

  let topicOid: mongoose.Types.ObjectId;
  try {
    topicOid = new mongoose.Types.ObjectId(curriculumNodeId);
  } catch {
    return { source: 'none', text: '' };
  }

  const topic = await CurriculumNode.findOne({
    _id: topicOid,
    isDeleted: false,
  })
    .select('_id parentId subjectId gradeId')
    .lean<{
      _id: mongoose.Types.ObjectId;
      parentId: mongoose.Types.ObjectId | null;
      subjectId: mongoose.Types.ObjectId | null;
      gradeId: mongoose.Types.ObjectId | null;
    } | null>();

  if (!topic || !topic.subjectId || !topic.gradeId) {
    return { source: 'none', text: '' };
  }

  // Candidate textbooks — school-scoped OR national. Sorted so school-scoped
  // come first (preferred), then most recently updated as a tie-breaker.
  const candidates = await Textbook.find({
    subjectNodeId: topic.subjectId,
    gradeNodeId: topic.gradeId,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  })
    .select('_id title chapters schoolId updatedAt')
    .sort({ schoolId: -1, updatedAt: -1 }) // null sorts last in -1; school docs first
    .lean<
      Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        chapters: IChapter[];
        schoolId: mongoose.Types.ObjectId | null;
        updatedAt: Date;
      }>
    >();

  if (candidates.length === 0) {
    return { source: 'none', text: '' };
  }

  // Match priority: topic itself → parent → walk up ancestors.
  let picked: PickedChapter | null = findChapterByNodeId(candidates, topic._id);

  if (!picked && topic.parentId) {
    picked = findChapterByNodeId(candidates, topic.parentId);
  }

  if (!picked) {
    // Walk further up (skip the topic and immediate parent — already tried).
    const ancestors = topic.parentId
      ? await getAncestorChain(topic.parentId, MAX_ANCESTOR_HOPS)
      : [];
    // ancestors[0] is the immediate parent we already tried; start from index 1.
    for (let i = 1; i < ancestors.length; i += 1) {
      const hit = findChapterByNodeId(candidates, ancestors[i]);
      if (hit) {
        picked = hit;
        break;
      }
    }
  }

  if (!picked) {
    return { source: 'none', text: '' };
  }

  // Compose the snippet.
  const { textbook, chapter } = picked;
  const descBudget = Math.floor(maxChars / 3);
  const description = (chapter.description ?? '').trim().slice(0, descBudget);

  const parts: string[] = [];
  if (description.length > 0) parts.push(description);

  // Append chapter resource text up to the budget.
  const resourceIds = (chapter.resources ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((r) => r.resourceId)
    .filter((id): id is mongoose.Types.ObjectId => !!id);

  if (resourceIds.length > 0) {
    try {
      const resources = await ContentResource.find({
        _id: { $in: resourceIds },
        isDeleted: false,
      })
        .select('title blocks')
        .lean<Array<{ _id: mongoose.Types.ObjectId; title: string; blocks: Array<{ type?: string; content?: string }> }>>();

      // Preserve the chapter's resource ordering.
      const byId = new Map(resources.map((r) => [r._id.toString(), r]));
      let runningLen = parts.join('\n\n').length;
      for (const id of resourceIds) {
        if (runningLen >= maxChars) break;
        const resource = byId.get(id.toString());
        if (!resource) continue;
        const snippet = extractResourceText(resource);
        if (!snippet) continue;
        const remaining = maxChars - runningLen;
        const sliceText = snippet.length > remaining ? snippet.slice(0, remaining) : snippet;
        parts.push(sliceText);
        runningLen += sliceText.length + 2; // approx for the joiner
      }
    } catch (err: unknown) {
      logger.warn({ err }, '[textbook-context] failed to load chapter resources');
    }
  }

  const text = parts.join('\n\n').slice(0, maxChars);

  if (text.trim().length === 0) {
    // Chapter matched but had no usable text. Still useful as a signpost.
    return {
      source: 'matched',
      textbookTitle: textbook.title,
      chapterTitle: chapter.title,
      text: '',
    };
  }

  return {
    source: 'matched',
    textbookTitle: textbook.title,
    chapterTitle: chapter.title,
    text,
  };
}

// ── Convenience: render the prompt-ready SOURCE section ────────────────────
// AI-generator services call this to append a delimited textbook section to
// their user prompt. Returns '' when no match exists, so callers can
// unconditionally `prompt += renderTextbookSourceSection(ctx)`.
export function renderTextbookSourceSection(ctx: TextbookContext): string {
  if (ctx.source !== 'matched' || !ctx.text || ctx.text.trim().length === 0) {
    return '';
  }
  const headerParts: string[] = [];
  if (ctx.textbookTitle) headerParts.push(ctx.textbookTitle);
  if (ctx.chapterTitle) headerParts.push(ctx.chapterTitle);
  const header = headerParts.join(' — ');
  return [
    '',
    `--- TEXTBOOK SOURCE${header ? ` (${header})` : ''} ---`,
    ctx.text,
    '--- END SOURCE ---',
    '',
    'Anchor your output to this textbook section. Reuse its vocabulary, examples,',
    'and conventions. Do not contradict it. Where the source is silent, you may',
    'extend with curriculum-aligned content.',
  ].join('\n');
}
