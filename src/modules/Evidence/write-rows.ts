// src/modules/Evidence/write-rows.ts
//
// Writes the whole set of one source record's rows (spec §3): upsert each item
// by (school, source, record, item), soft-delete items no longer in the set,
// reset a row's diagnosis only when its answer, marks or topic changed.
import type { AnyBulkWriteOperation } from 'mongoose';
import { logger } from '../../common/logger.js';
import { AnswerEvidence, type IAnswerEvidence, type IEvidenceDiagnosis } from './model.js';
import { MAX_ANSWER_CHARS, MAX_NOTE_CHARS, answerHash, capText, diagnosisCacheKey } from './normalise.js';
import { initialDiagnosis } from './rules.js';
import { announceReadinessRecompute } from './events.js';
import { genericTypeId } from './taxonomy-generic.js';
import { createTopicResolver, resolveTopics, topicOf, type ResolvedTopic } from './topic-resolver.js';
import {
  emptyResult, type DeletedReason, type EvidenceItem, type EvidenceRecord, type Oid, type WriteResult, type WriterOptions,
} from './types.js';

type Lean = Pick<IAnswerEvidence, 'marksAwarded' | 'marksAvailable' | 'topicNodeId' | 'isDeleted' | 'status' | 'finalAt' | 'markedBy'
  | 'markerNote' | 'totalOverridden' | 'cognitiveLevel' | 'questionKey' | 'topicFrom' | 'classId' | 'subjectId'> & {
  _id: Oid; answer: { hash: string }; source: { itemKey: string; channel: string | null; position: number };
};

interface BuiltRow { fields: Record<string, unknown>; diagnosis: IEvidenceDiagnosis; topicNodeId: Oid | null; hash: string }

function buildRow(record: EvidenceRecord, item: EvidenceItem, topic: ResolvedTopic, unanswered: Oid): BuiltRow {
  const answer = capText(item.answerText, MAX_ANSWER_CHARS);
  const hash = answerHash(item.answerText, item.answerKind);
  const cacheKey = diagnosisCacheKey(String(record.schoolId), item.questionKey, hash, item.marksAwarded, item.marksAvailable);
  const fields: Record<string, unknown> = {
    studentId: record.studentId, userId: record.userId, classId: record.classId, subjectId: record.subjectId, gradeId: record.gradeId,
    topicNodeId: topic.topicNodeId, subtopicNodeId: topic.subtopicNodeId,
    topicFrom: topic.topicNodeId ? item.topicFrom : 'none', cognitiveLevel: item.cognitiveLevel,
    marksAwarded: item.marksAwarded, marksAvailable: item.marksAvailable,
    'source.channel': record.source.channel, 'source.parentId': record.source.parentId,
    'source.position': item.position, 'source.attemptNumber': record.source.attemptNumber,
    questionKey: item.questionKey, questionId: item.questionId,
    answer: { kind: item.answerKind, text: answer.text, truncated: answer.truncated, hash },
    markedBy: item.markedBy, markerNote: item.markerNote.slice(0, MAX_NOTE_CHARS),
    markedAt: record.markedAt, status: record.status, finalAt: record.finalAt, totalOverridden: record.totalOverridden,
  };
  const diagnosis = initialDiagnosis({
    marksAwarded: item.marksAwarded, marksAvailable: item.marksAvailable, answerText: item.answerText,
    topicNodeId: topic.topicNodeId, cacheKey,
  }, unanswered);
  return { fields, diagnosis, topicNodeId: topic.topicNodeId, hash };
}

/** Question, answer, marks or topic changed: the old reason no longer applies. */
function diagnosisStale(prior: Lean, row: BuiltRow): boolean {
  return prior.questionKey !== row.fields.questionKey
    || prior.answer.hash !== row.hash
    || prior.marksAwarded !== row.fields.marksAwarded
    || prior.marksAvailable !== row.fields.marksAvailable
    || String(prior.topicNodeId ?? '') !== String(row.topicNodeId ?? '');
}

/** Everything else a re-sync may change (status at issue, a teacher's mark, the marker's note). */
function sameDetails(prior: Lean, f: Record<string, unknown>): boolean {
  return prior.status === f.status
    && String(prior.finalAt?.getTime() ?? '') === String((f.finalAt as Date | null)?.getTime() ?? '')
    && prior.markedBy === f.markedBy && prior.markerNote === f.markerNote && prior.totalOverridden === f.totalOverridden
    && prior.cognitiveLevel === f.cognitiveLevel && prior.questionKey === f.questionKey && prior.topicFrom === f.topicFrom
    && prior.source.channel === f['source.channel'] && prior.source.position === f['source.position']
    && String(prior.classId ?? '') === String(f.classId ?? '') && String(prior.subjectId ?? '') === String(f.subjectId ?? '');
}

export async function writeEvidenceRows(
  record: EvidenceRecord, items: readonly EvidenceItem[], options: WriterOptions = {},
): Promise<WriteResult> {
  const result = emptyResult();
  const skip = (reason: string): void => { result.skipped[reason] = (result.skipped[reason] ?? 0) + 1; };
  const key = { schoolId: record.schoolId, 'source.type': record.source.type, 'source.recordId': record.source.recordId };
  const [unanswered, topics, existingRows] = await Promise.all([
    genericTypeId('unanswered'),
    resolveTopics(createTopicResolver(record.schoolId), items.map((i: EvidenceItem) => i.nodeId)),
    AnswerEvidence.find(key).lean(),
  ]);
  const existing = existingRows as unknown as Lean[];
  const byItem = new Map(existing.map((r: Lean) => [r.source.itemKey, r]));
  const kept = new Set<string>();
  const ops: AnyBulkWriteOperation<IAnswerEvidence>[] = [];

  for (const item of items) {
    if (!(item.marksAvailable > 0)) {
      skip('zero_marks');
      continue;
    }
    if (kept.has(item.itemKey)) {
      skip('duplicate_item');
      continue;
    }
    kept.add(item.itemKey);
    const row = buildRow(record, item, topicOf(topics, item.nodeId), unanswered);
    if (row.topicNodeId) result.withTopic += 1;
    if (item.cognitiveLevel) result.withLevel += 1;
    const prior = byItem.get(item.itemKey);
    const stale = !prior || diagnosisStale(prior, row);
    if (prior && !stale && !prior.isDeleted && sameDetails(prior, row.fields)) {
      result.unchanged += 1;
      continue;
    }
    if (prior) result.updated += 1;
    else result.written += 1;
    ops.push({
      updateOne: {
        filter: { ...key, 'source.itemKey': item.itemKey },
        update: { $set: { ...row.fields, isDeleted: false, deletedReason: null, ...(stale ? { diagnosis: row.diagnosis } : {}) } },
        upsert: true,
      },
    });
  }

  const gone = existing.filter((r: Lean) => !r.isDeleted && !kept.has(r.source.itemKey));
  result.removed = gone.length;
  if (options.dryRun) return result;
  if (ops.length > 0) await AnswerEvidence.bulkWrite(ops, { ordered: false });
  if (gone.length > 0) {
    await softDeleteRows({ schoolId: record.schoolId, _id: { $in: gone.map((r: Lean) => r._id) } }, 'item_removed', { announce: false });
  }
  if (record.status === 'final' && ops.length + gone.length > 0) {
    await announceReadinessRecompute({ schoolId: String(record.schoolId), studentId: String(record.studentId), subjectId: idOrNull(record.subjectId) });
  }
  return result;
}

const idOrNull = (id: Oid | null | undefined): string | null => (id ? String(id) : null);

/** Soft-deletes matching live rows with a reason; returns how many. Removing final rows announces a readiness recompute. */
export async function softDeleteRows(
  filter: Record<string, unknown>, reason: DeletedReason, options: { announce?: boolean } = {},
): Promise<number> {
  const live = { ...filter, isDeleted: false };
  const finals = options.announce === false ? [] : (await AnswerEvidence.find({ ...live, status: 'final' })
    .select('schoolId studentId subjectId').lean()) as unknown as Array<{ schoolId: Oid; studentId: Oid; subjectId: Oid | null }>;
  const res = await AnswerEvidence.updateMany(live, { $set: { isDeleted: true, deletedReason: reason } });
  const learners = new Map(finals.map((r) => [`${String(r.studentId)}|${idOrNull(r.subjectId)}`, r]));
  for (const r of res.modifiedCount > 0 ? learners.values() : []) {
    await announceReadinessRecompute({ schoolId: String(r.schoolId), studentId: String(r.studentId), subjectId: idOrNull(r.subjectId) });
  }
  return res.modifiedCount;
}

/** Every hook: evidence never fails the learner's or teacher's request; the daily reconcile repairs a miss. */
export async function safeEvidence(label: string, run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (err: unknown) {
    logger.error({ err, label }, '[Evidence] writing evidence failed; the daily reconcile will retry');
  }
}
