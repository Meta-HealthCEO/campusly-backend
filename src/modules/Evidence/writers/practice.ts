// src/modules/Evidence/writers/practice.ts
//
// AI tutor practice (spec §2.5, §4.2): the attempt's student is a User; rows
// need the Student. With a curriculum node the rows have a topic; a free-text
// topic counts at subject level only.
import mongoose from 'mongoose';
import { PracticeAttempt } from '../../AITutor/model.js';
import { Subject } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import { emptyResult, type EvidenceItem, type Oid, type WriteResult, type WriterOptions } from '../types.js';

const toOid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));

/** The school Subject, whether the attempt stored a Subject id or a CurriculumNode id (student-context.ts:90-108). */
async function schoolSubject(schoolId: Oid, id: Oid): Promise<Oid | null> {
  const direct = await Subject.findOne({ _id: id, schoolId, isDeleted: false }).select('_id').lean();
  if (direct) return direct._id as Oid;
  const byNode = await Subject.findOne({ schoolId, curriculumNodeId: id, isDeleted: false }).select('_id').lean();
  return (byNode?._id as Oid | undefined) ?? null;
}

/** The attempt is read inside its school (checkpoint fix 4, carried to every writer). */
export async function syncPracticeEvidence(
  attemptId: string | Oid, schoolId: string | Oid, options: WriterOptions = {},
): Promise<WriteResult | null> {
  const attempt = await PracticeAttempt.findOne({ _id: toOid(attemptId), schoolId: toOid(schoolId) }).lean();
  if (!attempt) return null;
  if (attempt.isDeleted) {
    if (!options.dryRun) await softDeleteRows({ schoolId: attempt.schoolId, 'source.type': 'practice', 'source.recordId': attempt._id }, 'source_deleted');
    return null;
  }
  if (!attempt.completedAt) return null;
  const student = await Student.findOne({ userId: attempt.studentId, schoolId: attempt.schoolId, isDeleted: false }).select('_id').lean();
  if (!student) return { ...emptyResult(), skipped: { no_learner: 1 } };
  const nodeId = (attempt.curriculumNodeId as Oid | null | undefined) ?? null;
  const items = attempt.questions.flatMap((q, i): EvidenceItem[] => (q.studentAnswer === undefined ? [] : [{
    itemKey: `q${i}`, position: i, questionKey: `pr:${String(attempt._id)}:${i}`, questionId: null, nodeId,
    topicFrom: 'practice', cognitiveLevel: q.capsLevel ?? null,
    marksAwarded: q.marksAwarded ?? (q.isCorrect ? q.marks : 0), marksAvailable: q.marks, answerText: q.studentAnswer ?? '',
    answerKind: q.questionType === 'short_answer' ? 'typed' : 'choice',
    markedBy: q.questionType === 'short_answer' ? 'ai' : 'deterministic', markerNote: q.feedback ?? '',
  }]));
  return writeEvidenceRows({
    schoolId: attempt.schoolId, studentId: student._id as Oid, userId: attempt.studentId as Oid, classId: null,
    subjectId: await schoolSubject(attempt.schoolId as Oid, new mongoose.Types.ObjectId(String(attempt.subjectId))), gradeId: null,
    source: { type: 'practice', channel: null, recordId: attempt._id as Oid, parentId: attempt._id as Oid, attemptNumber: 1 },
    markedAt: attempt.completedAt, status: 'final', finalAt: attempt.completedAt, totalOverridden: false,
  }, items, options);
}
