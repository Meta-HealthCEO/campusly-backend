// src/modules/Evidence/diagnosis-types.ts
//
// A topic's usable codes, and turning one reply item into a type id
// (spec §6.4): a listed code; else the proposal, saved as `proposed` and used
// at once; a check-mark flag → GEN.possible-marking-error; anything else →
// GEN.incomplete-answer. A proposal that lands on a merged code follows it.
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ACTIVE_TYPE_STATUSES, MisconceptionType } from './model-taxonomy.js';
import { ensureGenericTypes, genericCode, genericTypeId } from './taxonomy-generic.js';
import type { DiagnosisReplyItem, TopicBlock } from './diagnosis-prompt.js';
import type { Oid } from './types.js';

export interface TopicTaxonomy {
  topic: { _id: Oid; code: string; schoolId: Oid | null; subjectId: Oid | null };
  byCode: Map<string, Oid>;
  block: TopicBlock;
}

const SLUG = /^[a-z0-9-]{2,40}$/;
const slugify = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

async function titleOf(id: unknown): Promise<string> {
  if (!id) return '';
  return (await CurriculumNode.findOne({ _id: id, isDeleted: false }).select('title').lean())?.title ?? '';
}

export async function topicTaxonomy(topicNodeId: Oid): Promise<TopicTaxonomy | null> {
  const topic = await CurriculumNode.findOne({ _id: topicNodeId, isDeleted: false }).select('code title schoolId subjectId gradeId').lean();
  if (!topic) return null;
  const [types, generic, subject, grade, subtopics] = await Promise.all([
    MisconceptionType.find({ topicNodeId, status: { $in: ACTIVE_TYPE_STATUSES } }).select('code label description').sort({ createdAt: 1 }).lean(),
    ensureGenericTypes(), titleOf(topic.subjectId), titleOf(topic.gradeId),
    CurriculumNode.find({ parentId: topicNodeId, type: 'subtopic', isDeleted: false }).select('title').lean(),
  ]);
  const byCode = new Map<string, Oid>([
    ...[...generic.entries()].map(([slug, id]) => [genericCode(slug), id] as [string, Oid]),
    ...types.map((t) => [t.code, t._id as Oid] as [string, Oid]),
  ]);
  return {
    topic: { _id: topic._id as Oid, code: topic.code, schoolId: (topic.schoolId as Oid | null) ?? null, subjectId: (topic.subjectId as Oid | null) ?? null },
    byCode,
    block: {
      subject, grade, topic: topic.title, subtopics: subtopics.map((s) => s.title),
      types: types.map((t) => ({ code: t.code, label: t.label, description: t.description })),
    },
  };
}

export async function typeForItem(tax: TopicTaxonomy, item: DiagnosisReplyItem): Promise<Oid> {
  if (item.checkMark) return genericTypeId('possible-marking-error');
  const listed = item.code ? tax.byCode.get(item.code) : undefined;
  if (listed) return listed;
  if (!item.proposed) return genericTypeId('incomplete-answer');
  const p = item.proposed;
  const slug = SLUG.test(p.slug) ? p.slug : slugify(p.slug || p.label);
  const code = `${tax.topic.code}.${slug}`;
  const doc = await MisconceptionType.findOneAndUpdate(
    { code },
    { $setOnInsert: {
      code, kind: p.kind, subjectNodeId: tax.topic.subjectId, topicNodeId: tax.topic._id, schoolId: tax.topic.schoolId,
      label: p.label, learnerLabel: p.learnerLabel, description: p.description, status: 'proposed', origin: 'ai_proposed', learnerVisible: true,
    } },
    { upsert: true, new: true },
  ).lean();
  if (doc!.status === 'merged' && doc!.mergedInto) return doc!.mergedInto as Oid;
  if (doc!.status === 'retired') return genericTypeId('incomplete-answer');
  tax.byCode.set(code, doc!._id as Oid);
  return doc!._id as Oid;
}
