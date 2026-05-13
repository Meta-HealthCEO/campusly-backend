// src/modules/Lesson/service-lesson-context.ts
//
// Parallel of Textbook/service-textbook-context.ts — given a CAPS topic id,
// resolve a prose context snippet drawn from the teacher's own finalised
// lessons covering that topic (or an ancestor). Used by AI paper generation
// so authored questions match what the teacher actually taught: their
// objectives, vocabulary, and worked examples.
//
// Only `ready` and `taught` lessons feed in — drafts may be half-built and
// shouldn't shape question generation.

import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { logger } from '../../common/logger.js';

export interface LessonContext {
  source: 'matched' | 'none';
  lessonTitle?: string;
  text: string;
}

export interface ResolveLessonOptions {
  maxChars?: number;
  /** Limit how many lessons we draw from (highest-priority first). */
  maxLessons?: number;
}

const DEFAULT_MAX_CHARS = 4000;
const DEFAULT_MAX_LESSONS = 2;
const MAX_ANCESTOR_HOPS = 5;

interface LessonLike {
  _id: mongoose.Types.ObjectId;
  title: string;
  objectives: string[];
  materials: Array<{
    kind: string;
    title: string;
    teacherNotes?: string;
    contentResourceId?: mongoose.Types.ObjectId | null;
  }>;
  status: 'draft' | 'ready' | 'taught';
  updatedAt: Date;
}

interface ContentResourceLike {
  title?: string;
  blocks?: Array<{ type?: string; content?: string }>;
}

function extractResourceText(resource: ContentResourceLike): string {
  const parts: string[] = [];
  for (const b of resource.blocks ?? []) {
    if (typeof b.content === 'string' && b.content.trim().length > 0) {
      parts.push(b.content);
    }
  }
  return parts.join('\n\n');
}

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

async function findFinalisedLessonsForNode(
  nodeId: mongoose.Types.ObjectId,
  schoolOid: mongoose.Types.ObjectId,
  limit: number,
): Promise<LessonLike[]> {
  return Lesson.find({
    curriculumNodeId: nodeId,
    schoolId: schoolOid,
    status: { $in: ['ready', 'taught'] },
    isDeleted: false,
  })
    .select('_id title objectives materials status updatedAt')
    .sort({ status: -1, updatedAt: -1 }) // taught first, then most recent
    .limit(limit)
    .lean<LessonLike[]>();
}

export async function resolveLessonContextForTopic(
  curriculumNodeId: string,
  schoolOid: mongoose.Types.ObjectId,
  options: ResolveLessonOptions = {},
): Promise<LessonContext> {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const maxLessons = options.maxLessons ?? DEFAULT_MAX_LESSONS;

  let topicOid: mongoose.Types.ObjectId;
  try {
    topicOid = new mongoose.Types.ObjectId(curriculumNodeId);
  } catch {
    return { source: 'none', text: '' };
  }

  // Build the candidate node list: topic first, then ancestors up to 5 hops.
  // First match (highest priority) wins.
  const ancestors = await getAncestorChain(topicOid, MAX_ANCESTOR_HOPS);
  if (ancestors.length === 0) return { source: 'none', text: '' };

  let lessons: LessonLike[] = [];
  for (const nodeId of ancestors) {
    lessons = await findFinalisedLessonsForNode(nodeId, schoolOid, maxLessons);
    if (lessons.length > 0) break;
  }

  if (lessons.length === 0) return { source: 'none', text: '' };

  // Compose: per lesson dump objectives + load 1-2 materials' resource text.
  const parts: string[] = [];
  let runningLen = 0;
  let firstTitle: string | undefined;

  for (const lesson of lessons) {
    if (runningLen >= maxChars) break;
    if (!firstTitle) firstTitle = lesson.title;
    const block: string[] = [`Lesson: ${lesson.title}`];

    if (lesson.objectives && lesson.objectives.length > 0) {
      block.push('Objectives:');
      for (const obj of lesson.objectives.slice(0, 5)) {
        block.push(`- ${obj}`);
      }
    }

    // Pull up to 2 materials' content (reading / study_notes / worked_example
    // are the most useful for question grounding — but we accept any kind
    // since teachers customise their phase ordering).
    const materialIds = lesson.materials
      .map((m) => m.contentResourceId)
      .filter((id): id is mongoose.Types.ObjectId => !!id)
      .slice(0, 2);

    if (materialIds.length > 0) {
      try {
        const resources = await ContentResource.find({
          _id: { $in: materialIds },
          isDeleted: false,
        })
          .select('title blocks')
          .lean<ContentResourceLike[]>();
        for (const res of resources) {
          const snippet = extractResourceText(res);
          if (snippet) block.push(snippet);
        }
      } catch (err: unknown) {
        logger.warn({ err }, '[lesson-context] failed to load lesson resources');
      }
    }

    const joined = block.join('\n');
    const remaining = maxChars - runningLen;
    const slice = joined.length > remaining ? joined.slice(0, remaining) : joined;
    parts.push(slice);
    runningLen += slice.length + 2;
  }

  const text = parts.join('\n\n').slice(0, maxChars);
  if (!text.trim()) return { source: 'none', text: '' };

  return {
    source: 'matched',
    lessonTitle: firstTitle,
    text,
  };
}

export function renderLessonSourceSection(ctx: LessonContext): string {
  if (ctx.source !== 'matched' || !ctx.text.trim()) return '';
  const header = ctx.lessonTitle ? ` (latest: ${ctx.lessonTitle})` : '';
  return [
    '',
    `--- TEACHER LESSON CONTEXT${header} ---`,
    ctx.text,
    '--- END LESSON CONTEXT ---',
    '',
    "These are the teacher's own finalised lessons on this topic. Match the",
    'depth, vocabulary, and emphasis they used. Where the lesson covers a',
    'sub-topic in detail, prefer test questions that exercise that sub-topic.',
  ].join('\n');
}
