// src/modules/Evidence/writers/test.ts
//
// Tests and scripts (spec §4.1): one row per marked answer of the newest
// usable marking of a (paper, learner). Provisional until the teacher issues.
import mongoose from 'mongoose';
import { logger } from '../../../common/logger.js';
import { PaperMarking, type IPaperMarking } from '../../AITools/model-marking.js';
import { PaperSubmission } from '../../QuestionBank/model-submissions.js';
import { Student } from '../../Student/model.js';
import { normaliseQuestionNumber } from '../normalise.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import { loadPaperContext, type PaperContext } from './test-paper.js';
import type { Channel, EvidenceItem, Oid, WriteResult, WriterOptions } from '../types.js';

export const WRITABLE_MARKING_STATUSES = ['completed', 'needs_review', 'published'] as const;
type Marking = IPaperMarking & { _id: Oid };

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

export async function syncMarkingEvidence(
  markingId: string | Oid, options: WriterOptions & { studentId?: string } = {},
): Promise<WriteResult | null> {
  const m = (await PaperMarking.findById(markingId).lean()) as Marking | null;
  if (!m) return null;
  const own = { schoolId: m.schoolId, 'source.type': 'test', 'source.recordId': m._id };
  if (m.isDeleted) {
    if (!options.dryRun) await softDeleteRows(own, 'source_deleted');
    return null;
  }
  if (!(WRITABLE_MARKING_STATUSES as readonly string[]).includes(m.status)) return null;
  const studentId = (m.studentId as Oid | undefined) ?? (options.studentId ? new mongoose.Types.ObjectId(options.studentId) : null);
  if (!studentId) return null;

  const newest = await PaperMarking.findOne({
    schoolId: m.schoolId, paperId: m.paperId, studentId, isDeleted: false, status: { $in: WRITABLE_MARKING_STATUSES },
  }).sort({ createdAt: -1 }).select('_id').lean();
  if (newest && String(newest._id) !== String(m._id)) {
    if (!options.dryRun) await softDeleteRows(own, 'superseded');
    return null;
  }
  const paper = await loadPaperContext(m);
  if (!paper) return null;
  if (!options.dryRun) {
    await softDeleteRows({
      schoolId: m.schoolId, 'source.type': 'test', 'source.parentId': m.paperId, studentId, 'source.recordId': { $ne: m._id },
    }, 'superseded');
  }

  const [student, channel] = await Promise.all([
    Student.findOne({ _id: studentId, schoolId: m.schoolId }).select('userId').lean(),
    channelOf(m, studentId),
  ]);
  const { items, unmatched } = itemsFor(m, paper, channel);
  if (unmatched > 0) logger.warn({ markingId: String(m._id), unmatched }, '[Evidence] marked question numbers not on the paper');
  const result = await writeEvidenceRows({
    schoolId: m.schoolId, studentId, userId: (student?.userId as Oid | undefined) ?? null, classId: (m.classId as Oid | null) ?? null,
    subjectId: paper.subjectId, gradeId: paper.gradeId,
    source: { type: 'test', channel, recordId: m._id, parentId: m.paperId as Oid, attemptNumber: 1 },
    markedAt: m.createdAt, status: m.issuedToStudent ? 'final' : 'provisional', finalAt: m.issuedToStudent ? (m.issuedAt ?? null) : null,
    totalOverridden: false,
  }, items, options);
  if (unmatched > 0) result.skipped.unmatched_number = unmatched;
  return result;
}
