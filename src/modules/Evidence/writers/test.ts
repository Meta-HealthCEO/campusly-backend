// src/modules/Evidence/writers/test.ts
//
// Tests and scripts (spec §4.1): one row per marked answer of the newest
// usable marking of a (paper, learner). Provisional until the teacher issues.
import mongoose from 'mongoose';
import { logger } from '../../../common/logger.js';
import { PaperMarking, type IPaperMarking } from '../../AITools/model-marking.js';
import { PaperSubmission } from '../../QuestionBank/model-submissions.js';
import { Student } from '../../Student/model.js';
import { AnswerEvidence } from '../model.js';
import { normaliseQuestionNumber } from '../normalise.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import { loadPaperContext, type PaperContext } from './test-paper.js';
import type { Channel, EvidenceItem, Oid, WriteResult, WriterOptions } from '../types.js';

export const WRITABLE_MARKING_STATUSES = ['completed', 'needs_review', 'published'] as const;
type Marking = IPaperMarking & { _id: Oid };
type MarkingState = Pick<IPaperMarking, 'status' | 'paperMismatch' | 'isDeleted'>;

/** A photo of another paper, waiting for the teacher to accept or re-mark it. */
const isWrongPaper = (m: MarkingState): boolean => m.status === 'needs_review' && m.paperMismatch === true;

/**
 * Whether a marking's answers are evidence: not deleted, a usable status, and
 * not a photo of the wrong paper. Task 9's reconcile uses this rule too, and
 * `evidenceMarkingFilter` is the same rule as a query.
 */
export function markingWritesEvidence(m: MarkingState): boolean {
  return !m.isDeleted && (WRITABLE_MARKING_STATUSES as readonly string[]).includes(m.status) && !isWrongPaper(m);
}

export function evidenceMarkingFilter(): Record<string, unknown> {
  return {
    isDeleted: false,
    status: { $in: [...WRITABLE_MARKING_STATUSES] },
    $nor: [{ status: 'needs_review', paperMismatch: true }],
  };
}

/** The AI's own mark per question number, to tell a teacher's change from the AI's. */
function aiMarks(raw: Record<string, unknown> | null): Map<string, number> {
  const questions = Array.isArray(raw?.questions) ? (raw.questions as Array<{ questionNumber?: unknown; marksAwarded?: unknown }>) : [];
  return new Map(questions
    .filter((q) => typeof q.marksAwarded === 'number')
    .map((q) => [normaliseQuestionNumber(String(q.questionNumber ?? '')), q.marksAwarded as number]));
}

async function channelOf(m: Marking, studentId: Oid): Promise<Channel> {
  if ((m.images ?? []).length > 0) return 'photo';
  const online = await PaperSubmission.exists({ schoolId: m.schoolId, paperId: m.paperId, studentId, isDeleted: false });
  return online ? 'online' : 'typed_by_teacher';
}

function itemsFor(m: Marking, paper: PaperContext, channel: Channel): { items: EvidenceItem[]; unmatched: number } {
  const ai = aiMarks(m.aiRawResult);
  let unmatched = 0;
  const items = m.questions.map((q, position): EvidenceItem => {
    const label = normaliseQuestionNumber(q.questionNumber);
    const info = paper.questions.get(label);
    if (!info) unmatched += 1;
    const aiMark = ai.get(label);
    return {
      itemKey: label, position, questionKey: info?.questionKey ?? paper.keyFor(label), questionId: info?.questionId ?? null,
      nodeId: info?.nodeId ?? null, topicFrom: info?.topicFrom ?? 'none', cognitiveLevel: info?.level ?? null,
      marksAwarded: q.marksAwarded, marksAvailable: q.maxMarks, answerText: q.studentAnswer ?? '',
      answerKind: channel === 'photo' ? 'transcribed' : info?.hasOptions ? 'choice' : 'typed',
      markedBy: aiMark !== undefined && aiMark !== q.marksAwarded ? 'teacher' : 'ai',
      markerNote: q.rationale || q.feedback || '',
    };
  });
  return { items, unmatched };
}

const toOid = (id: string | Oid): Oid => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);

/** The learner a marking's rows belong to: the stored one, else the one issue named; only a learner of the marking's school. */
async function learnerOf(m: Marking, named: string | undefined): Promise<{ _id: Oid; userId: Oid | null } | null> {
  const id = (m.studentId as Oid | undefined) ?? (named && mongoose.isValidObjectId(named) ? toOid(named) : null);
  if (!id) return null;
  const student = await Student.findOne({ _id: id, schoolId: m.schoolId, isDeleted: false }).select('userId').lean();
  return student ? { _id: student._id as Oid, userId: (student.userId as Oid | undefined) ?? null } : null;
}

/**
 * The newest usable marking of (paper, learner) wins. A marking issued with a
 * body studentId stores none, so markings that already own this learner's rows
 * count too; order is createdAt, then _id.
 */
async function isNewest(m: Marking, studentId: Oid): Promise<boolean> {
  const owners = await AnswerEvidence.distinct('source.recordId', {
    schoolId: m.schoolId, 'source.type': 'test', 'source.parentId': m.paperId, studentId, isDeleted: false,
  });
  const newest = await PaperMarking.findOne({
    schoolId: m.schoolId, paperId: m.paperId, ...evidenceMarkingFilter(),
    $or: [{ studentId }, { _id: { $in: [m._id, ...owners] } }],
  }).sort({ createdAt: -1, _id: -1 }).select('_id').lean();
  return !newest || String(newest._id) === String(m._id);
}

export interface SyncMarkingOptions extends WriterOptions {
  /** The learner `issueMarking` resolved from its body; never stored on the marking. */
  studentId?: string;
}

export async function syncMarkingEvidence(
  markingId: string | Oid, schoolId: string | Oid, options: SyncMarkingOptions = {},
): Promise<WriteResult | null> {
  const m = (await PaperMarking.findOne({ _id: toOid(markingId), schoolId: toOid(schoolId) }).lean()) as Marking | null;
  if (!m) return null;
  const own = { schoolId: m.schoolId, 'source.type': 'test', 'source.recordId': m._id };
  if (!markingWritesEvidence(m)) {
    const reason = m.isDeleted ? 'source_deleted' : isWrongPaper(m) ? 'wrong_paper' : null;
    if (reason && !options.dryRun) await softDeleteRows(own, reason);
    return null;
  }
  const learner = await learnerOf(m, options.studentId);
  if (!learner) return null;
  const studentId = learner._id;
  if (!(await isNewest(m, studentId))) {
    if (!options.dryRun) await softDeleteRows(own, 'superseded');
    return null;
  }
  const paper = await loadPaperContext(m);
  if (!paper) return null;

  const channel = await channelOf(m, studentId);
  const { items, unmatched } = itemsFor(m, paper, channel);
  if (unmatched > 0) logger.warn({ markingId: String(m._id), unmatched }, '[Evidence] marked question numbers not on the paper');
  const result = await writeEvidenceRows({
    schoolId: m.schoolId, studentId, userId: learner.userId, classId: (m.classId as Oid | null) ?? null,
    subjectId: paper.subjectId, gradeId: paper.gradeId,
    source: { type: 'test', channel, recordId: m._id, parentId: m.paperId as Oid, attemptNumber: 1 },
    markedAt: m.createdAt, status: m.issuedToStudent ? 'final' : 'provisional', finalAt: m.issuedToStudent ? (m.issuedAt ?? null) : null,
    totalOverridden: false,
  }, items, options);
  // Only once this marking's rows are safely written do the older ones go.
  if (!options.dryRun) {
    await softDeleteRows({
      schoolId: m.schoolId, 'source.type': 'test', 'source.parentId': m.paperId, studentId, 'source.recordId': { $ne: m._id },
    }, 'superseded');
  }
  if (unmatched > 0) result.skipped.unmatched_number = unmatched;
  return result;
}
