// src/modules/Evidence/writers/library.ts
//
// Content library (spec §2.6): only interactive blocks that are really
// marked. Text, image, video and step-reveal always score full marks, and
// hotspot and code always 0, so they are noise and write nothing.
import mongoose from 'mongoose';
import { ContentResource } from '../../ContentLibrary/model.js';
import { StudentAttempt } from '../../ContentLibrary/model-tracking.js';
import { Student } from '../../Student/model.js';
import { CAPS_LEVELS } from '../../QuestionBank/model-shared.js';
import { schoolSubjectForNode } from '../topic-resolver.js';
import { writeEvidenceRows } from '../write-rows.js';
import { emptyResult, type CapsLevel, type Oid, type WriteResult, type WriterOptions } from '../types.js';

export const GRADED_BLOCK_TYPES: readonly string[] = ['quiz', 'fill_blank', 'match_columns', 'ordering', 'drag_drop'];

const toOid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));

/** Block levels are free text ("Routine", "problem solving"); keep only a CAPS level. */
function capsOf(raw: string | null | undefined): CapsLevel | null {
  const key = (raw ?? '').trim().toLowerCase().replace(/[\s-]+procedures?$/, '').replace(/[\s-]+/g, '_');
  return (CAPS_LEVELS as readonly string[]).includes(key) ? (key as CapsLevel) : null;
}

/** The attempt is read inside its school (checkpoint fix 4, carried to every writer). */
export async function syncLibraryEvidence(
  attemptId: string | Oid, schoolId: string | Oid, options: WriterOptions = {},
): Promise<WriteResult | null> {
  const attempt = await StudentAttempt.findOne({ _id: toOid(attemptId), schoolId: toOid(schoolId) }).lean();
  if (!attempt) return null;
  const resource = await ContentResource.findOne({
    _id: attempt.contentResourceId, $or: [{ schoolId: null }, { schoolId: attempt.schoolId }],
  }).select('blocks').lean();
  const block = resource?.blocks.find((b) => b.blockId === attempt.blockId);
  if (!resource || !block || !GRADED_BLOCK_TYPES.includes(block.type)) return { ...emptyResult(), skipped: { informational_block: 1 } };
  const [student, subjectId] = await Promise.all([
    Student.findOne({ _id: attempt.studentId, schoolId: attempt.schoolId }).select('userId').lean(),
    schoolSubjectForNode(attempt.schoolId as Oid, attempt.curriculumNodeId as Oid),
  ]);
  return writeEvidenceRows({
    schoolId: attempt.schoolId as Oid, studentId: attempt.studentId as Oid, userId: (student?.userId as Oid | undefined) ?? null,
    classId: null, subjectId, gradeId: null,
    source: { type: 'library', channel: null, recordId: attempt._id as Oid, parentId: resource._id as Oid, attemptNumber: attempt.attemptNumber },
    markedAt: attempt.createdAt, status: 'final', finalAt: attempt.createdAt, totalOverridden: false,
  }, [{
    itemKey: attempt.blockId, position: 0, questionKey: `cb:${String(resource._id)}:${attempt.blockId}`, questionId: null,
    nodeId: attempt.curriculumNodeId as Oid, topicFrom: 'block', cognitiveLevel: capsOf(attempt.cognitiveLevel?.caps),
    marksAwarded: attempt.score, marksAvailable: attempt.maxScore, answerText: attempt.response ?? '',
    answerKind: block.type === 'quiz' ? 'choice' : 'structured', markedBy: 'deterministic', markerNote: '',
  }], options);
}
