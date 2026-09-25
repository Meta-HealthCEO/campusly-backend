// src/modules/Evidence/seed.ts
//
// The first time a topic has a row to diagnose and no usable types, one
// direct call writes 8–15 topic types (spec §6.3). Platform cost: never
// counted in a school's pool; logged to AIUsageLog when a school triggered it.
import { z } from 'zod/v4';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ACTIVE_TYPE_STATUSES, MisconceptionType } from './model-taxonomy.js';
import { GENERIC_TYPES } from './taxonomy-generic.js';
import { parseReply, sendDirect, transportMode } from './ai-transport.js';
import { closeRequest, customIdFor, logAIUsage, openRequest } from './ledger.js';
import type { Oid } from './types.js';

export const SEED_SYSTEM = [
  'You list the common misconceptions South African learners show on one CAPS topic, for a marking assistant.',
  'Return JSON only: {"types":[{"slug":"...","kind":"misconception|procedural","label":"...","learnerLabel":"...","description":"..."}]} with 8 to 15 items.',
  'kind: misconception = a wrong idea; procedural = a wrong or missing step.',
  'slug: 2-40 characters of lower-case letters, digits and hyphens.',
  'label: at most 60 characters, for teachers. learnerLabel: at most 60 characters, in plain words a learner understands.',
  'description: at most 300 characters: what the error looks like in an answer. Generalise; never quote a learner.',
  `Do not repeat these general types, which already exist: ${GENERIC_TYPES.map((t) => t.label).join('; ')}.`,
].join('\n');

const cap = (n: number) => z.string().min(2).transform((s: string) => s.slice(0, n));
export const SeedReplySchema = z.object({
  types: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9-]{2,40}$/),
    kind: z.enum(['misconception', 'procedural']),
    label: cap(60), learnerLabel: cap(60), description: cap(300),
  })).min(1).max(15),
});

export interface SeedContext { schoolId: Oid | null; teacherId: Oid | null; grounding?: string }

export async function hasActiveTypes(topicNodeId: Oid): Promise<boolean> {
  return Boolean(await MisconceptionType.exists({ topicNodeId, status: { $in: ACTIVE_TYPE_STATUSES } }));
}

async function title(id: unknown): Promise<string> {
  if (!id) return '';
  const node = await CurriculumNode.findOne({ _id: id, isDeleted: false }).select('title').lean();
  return node?.title ?? '';
}

export async function seedTopicTypes(topicNodeId: Oid, ctx: SeedContext): Promise<number> {
  const topic = await CurriculumNode.findOne({ _id: topicNodeId, isDeleted: false }).lean();
  if (!topic) return 0;
  const [subject, grade, subtopics] = await Promise.all([
    title(topic.subjectId), title(topic.gradeId),
    CurriculumNode.find({ parentId: topic._id, type: 'subtopic', isDeleted: false }).select('title').lean(),
  ]);
  const user = [
    `Subject: ${subject}`, `Grade: ${grade}`, `Topic: ${topic.title}`,
    `Subtopics: ${subtopics.map((s) => s.title).join('; ') || 'none listed'}`,
    `CAPS reference: ${topic.metadata?.capsReference || 'none'}`,
    `Assessment standards: ${(topic.metadata?.assessmentStandards ?? []).join('; ') || 'none'}`,
    ...(ctx.grounding ? ['', 'Common errors reported by examiners (use them as grounding):', ctx.grounding.slice(0, 6000)] : []),
  ].join('\n');
  const mode = transportMode() === 'fixture' ? 'fixture' : 'direct';
  const request = await openRequest({ kind: 'seed', mode, schoolId: ctx.schoolId, topicNodeId });
  const reply = await sendDirect({ customId: customIdFor(request._id), kind: 'seed', system: SEED_SYSTEM, user, maxTokens: 2500, hint: {} }, mode);
  const parsed = reply.ok ? parseReply(reply.text, SeedReplySchema) : null;
  await closeRequest(request._id, reply, reply.ok && !parsed ? 'invalid_reply' : undefined);
  await logAIUsage(ctx.schoolId, ctx.teacherId, 'misconception_seed', reply.usage);
  if (!parsed) return 0;
  await MisconceptionType.bulkWrite(parsed.types.map((t) => ({
    updateOne: {
      filter: { code: `${topic.code}.${t.slug}` },
      update: { $setOnInsert: {
        code: `${topic.code}.${t.slug}`, kind: t.kind, subjectNodeId: topic.subjectId ?? null, topicNodeId: topic._id,
        schoolId: topic.schoolId ?? null, label: t.label, learnerLabel: t.learnerLabel, description: t.description,
        status: 'seeded', origin: 'ai_seed', learnerVisible: true,
      } },
      upsert: true,
    },
  })));
  return parsed.types.length;
}

/** Seed on first use (a direct call, so the next batch can use the codes). */
export async function ensureTopicTypes(topicNodeId: Oid, ctx: SeedContext): Promise<boolean> {
  if (await hasActiveTypes(topicNodeId)) return true;
  return (await seedTopicTypes(topicNodeId, ctx)) > 0;
}
