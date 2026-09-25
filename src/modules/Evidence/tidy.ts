// src/modules/Evidence/tidy.ts
//
// Weekly (spec §6.4): for each topic with new proposals, one call lists the
// topic's types and returns duplicate pairs. A proposed → existing merge at
// ≥ 0.9 is applied; everything else becomes a suggestion for review.
// Platform cost: logged on DiagnosisRequest only (no school).
import { z } from 'zod/v4';
import { ACTIVE_TYPE_STATUSES, MisconceptionType } from './model-taxonomy.js';
import { parseReply, sendDirect, transportMode } from './ai-transport.js';
import { closeRequest, customIdFor, openRequest } from './ledger.js';
import { mergeType } from './taxonomy-admin.js';
import type { Oid } from './types.js';

export const AUTO_MERGE_CONFIDENCE = 0.9;

const TIDY_SYSTEM = [
  'You tidy a list of misconception types for one school topic.',
  'Find pairs that mean the same thing. "from" is the newer or narrower code, "to" the one to keep. Only pair codes from the list.',
  'Return JSON only: {"pairs":[{"from":"<code>","to":"<code>","confidence":0.0}]} (an empty list if there are none).',
].join('\n');

const TidyReplySchema = z.object({ pairs: z.array(z.object({ from: z.string(), to: z.string(), confidence: z.number().min(0).max(1) })) });

export async function tidyTaxonomy(): Promise<{ topics: number; merged: number; suggested: number }> {
  const topics = (await MisconceptionType.distinct('topicNodeId', { status: 'proposed', topicNodeId: { $ne: null } })) as Oid[];
  const mode = transportMode() === 'fixture' ? 'fixture' : 'direct';
  let merged = 0;
  let suggested = 0;
  for (const topicNodeId of topics) {
    const types = await MisconceptionType.find({ topicNodeId, status: { $in: ACTIVE_TYPE_STATUSES } }).select('code label description status').lean();
    if (types.length < 2) continue;
    const request = await openRequest({ kind: 'tidy', mode, schoolId: null, topicNodeId });
    const user = types.map((t) => `- ${t.code} [${t.status}]: ${t.label}. ${t.description}`).join('\n');
    const reply = await sendDirect({ customId: customIdFor(request._id), kind: 'tidy', system: TIDY_SYSTEM, user, maxTokens: 800, hint: {} }, mode);
    const parsed = reply.ok ? parseReply(reply.text, TidyReplySchema) : null;
    await closeRequest(request._id, reply, reply.ok && !parsed ? 'invalid_reply' : undefined);
    const byCode = new Map(types.map((t) => [t.code, t]));
    const gone = new Set<string>();
    for (const pair of parsed?.pairs ?? []) {
      const from = byCode.get(pair.from);
      const into = byCode.get(pair.to);
      if (!from || !into || from.code === into.code || gone.has(from.code) || gone.has(into.code)) continue;
      if (from.status === 'proposed' && into.status !== 'proposed' && pair.confidence >= AUTO_MERGE_CONFIDENCE) {
        await mergeType(from._id as Oid, into._id as Oid, null);
        gone.add(from.code);
        merged += 1;
      } else {
        await MisconceptionType.updateOne({ _id: from._id }, { $set: { suggestedMergeInto: into._id, suggestedMergeConfidence: pair.confidence } });
        suggested += 1;
      }
    }
  }
  return { topics: topics.length, merged, suggested };
}
