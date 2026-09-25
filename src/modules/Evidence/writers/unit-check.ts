// src/modules/Evidence/writers/unit-check.ts
//
// Course unit quick checks (spec §2.4): automatic, all-or-nothing marks; one
// row per answered question per attempt (retries are separate attempts).
import mongoose from 'mongoose';
import { Course, QuizAttempt } from '../../Course/model.js';
import { Question } from '../../QuestionBank/model.js';
import { Student } from '../../Student/model.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import type { CapsLevel, EvidenceItem, Oid, WriteResult, WriterOptions } from '../types.js';

const CHOICE_TYPES = new Set(['mcq', 'true_false']);
const toOid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));

export function answerAsText(answer: unknown): string {
  if (typeof answer === 'string') return answer;
  if (answer === null || answer === undefined) return '';
  return JSON.stringify(answer);
}

/** The attempt is read inside its school (checkpoint fix 4, carried to every writer). */
export async function syncQuickCheckEvidence(
  attemptId: string | Oid, schoolId: string | Oid, options: WriterOptions = {},
): Promise<WriteResult | null> {
  const attempt = await QuizAttempt.findOne({ _id: toOid(attemptId), schoolId: toOid(schoolId) }).lean();
  if (!attempt) return null;
  if (attempt.isDeleted) {
    if (!options.dryRun) await softDeleteRows({ schoolId: attempt.schoolId, 'source.type': 'unit_check', 'source.recordId': attempt._id }, 'source_deleted');
    return null;
  }
  const [course, questions, student] = await Promise.all([
    Course.findOne({ _id: attempt.courseId, schoolId: attempt.schoolId }).select('subjectId scope').lean(),
    Question.find({ _id: { $in: attempt.answers.map((a) => a.questionId) }, isDeleted: false }).select('curriculumNodeId cognitiveLevel marks type').lean(),
    Student.findOne({ _id: attempt.studentId, schoolId: attempt.schoolId }).select('userId').lean(),
  ]);
  const byId = new Map(questions.map((q) => [String(q._id), q]));
  const items = attempt.answers.flatMap((a, position): EvidenceItem[] => {
    const q = byId.get(String(a.questionId));
    if (!q) return [];
    return [{
      itemKey: String(q._id), position, questionKey: `q:${String(q._id)}`, questionId: q._id as Oid, nodeId: q.curriculumNodeId as Oid,
      topicFrom: 'question', cognitiveLevel: (q.cognitiveLevel?.caps as CapsLevel | undefined) ?? null,
      marksAwarded: a.marks ?? 0, marksAvailable: q.marks, answerText: answerAsText(a.answer),
      answerKind: CHOICE_TYPES.has(q.type) ? 'choice' : 'typed', markedBy: 'deterministic', markerNote: '',
    }];
  });
  return writeEvidenceRows({
    schoolId: attempt.schoolId, studentId: attempt.studentId, userId: (student?.userId as Oid | undefined) ?? null,
    classId: (course?.scope?.builtForClassId as Oid | null | undefined) ?? null, subjectId: (course?.subjectId as Oid | undefined) ?? null, gradeId: null,
    source: { type: 'unit_check', channel: null, recordId: attempt._id as Oid, parentId: attempt.lessonId, attemptNumber: attempt.attemptNumber },
    markedAt: attempt.submittedAt, status: 'final', finalAt: attempt.submittedAt, totalOverridden: false,
  }, items, options);
}
