// src/modules/Evidence/topic-resolver.ts
//
// Any curriculum node → the topic (and subtopic) a row counts under (spec §3).
// A node the school can't see, or one above topic level, gives no topic.
import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { Subject } from '../Academic/model.js';
import type { Oid } from './types.js';

export interface ResolvedTopic { topicNodeId: Oid | null; subtopicNodeId: Oid | null }
export type TopicResolver = (nodeId: Oid | null) => Promise<ResolvedTopic>;

interface NodeLite { _id: Oid; type: string; parentId: Oid | null; subjectId: Oid | null }

const NONE: ResolvedTopic = { topicNodeId: null, subtopicNodeId: null };
const MAX_HOPS = 6;

function nodeLoader(schoolId: Oid): (id: Oid) => Promise<NodeLite | null> {
  const seen = new Map<string, Promise<NodeLite | null>>();
  return (id: Oid) => {
    const key = String(id);
    if (!seen.has(key)) {
      seen.set(key, CurriculumNode.findOne({
        _id: new mongoose.Types.ObjectId(key), isDeleted: false, $or: [{ schoolId: null }, { schoolId }],
      }).select('type parentId subjectId').lean().then((n) => (n as NodeLite | null)));
    }
    return seen.get(key)!;
  };
}

/** One resolver per writer run: every node is loaded once. */
export function createTopicResolver(schoolId: Oid): TopicResolver {
  const load = nodeLoader(schoolId);
  return async (nodeId: Oid | null): Promise<ResolvedTopic> => {
    if (!nodeId) return NONE;
    let node = await load(nodeId);
    for (let hop = 0; node && hop < MAX_HOPS; hop += 1) {
      if (node.type === 'topic') return { topicNodeId: node._id, subtopicNodeId: null };
      if (node.type === 'subtopic') {
        const parent = node.parentId ? await load(node.parentId) : null;
        return { topicNodeId: parent?.type === 'topic' ? parent._id : null, subtopicNodeId: node._id };
      }
      if (node.type !== 'outcome' || !node.parentId) return NONE;
      node = await load(node.parentId);
    }
    return NONE;
  };
}

/** Resolves every distinct node of a record once, all at the same time; keyed by String(nodeId). */
export async function resolveTopics(
  resolve: TopicResolver, nodeIds: ReadonlyArray<Oid | null>,
): Promise<Map<string, ResolvedTopic>> {
  const distinct = [...new Set(nodeIds.filter((id): id is Oid => id !== null).map(String))];
  const resolved = await Promise.all(distinct.map((id: string) => resolve(new mongoose.Types.ObjectId(id))));
  return new Map(distinct.map((id: string, i: number) => [id, resolved[i]]));
}

/** A node's resolved topic from `resolveTopics`, or no topic. */
export function topicOf(topics: ReadonlyMap<string, ResolvedTopic>, nodeId: Oid | null): ResolvedTopic {
  return (nodeId && topics.get(String(nodeId))) || NONE;
}

/** The school's own Subject for a curriculum node (library blocks carry only the node). */
export async function schoolSubjectForNode(schoolId: Oid, nodeId: Oid | null): Promise<Oid | null> {
  if (!nodeId) return null;
  const node = await nodeLoader(schoolId)(nodeId);
  if (!node?.subjectId) return null;
  const subject = await Subject.findOne({ schoolId, curriculumNodeId: node.subjectId, isDeleted: false }).select('_id').lean();
  return (subject?._id as Oid | undefined) ?? null;
}
