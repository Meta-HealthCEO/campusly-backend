// src/modules/Evidence/writers/homework.ts
//
// Homework (spec §2.3, §4.1): final as soon as graded, no teacher step.
// Pending answers have no row; a teacher's total override flags the rows.
import mongoose from 'mongoose';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Question } from '../../QuestionBank/model.js';
import { Quiz } from '../../Learning/model.js';
import { Student } from '../../Student/model.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import type { CapsLevel, EvidenceItem, MarkedBy, Oid, WriteResult, WriterOptions } from '../types.js';

interface AnswerDoc {
  studentAnswer: string;
  awarded?: number;
  maxMarks: number;
  rationale?: string;
  gradingMethod: string;
  questionId?: Oid;
  questionIndex?: number;
}
interface BankLite { _id: Oid; curriculumNodeId: Oid; cognitiveLevel?: { caps?: string }; type: string }

const CHOICE_TYPES = new Set(['mcq', 'true_false']);
const toOid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));

async function bankById(ids: Oid[]): Promise<Map<string, BankLite>> {
  if (ids.length === 0) return new Map();
  const docs = (await Question.find({ _id: { $in: ids }, isDeleted: false }).select('curriculumNodeId cognitiveLevel type').lean()) as unknown as BankLite[];
  return new Map(docs.map((q) => [String(q._id), q]));
}

function bankItem(itemKey: string, position: number, a: AnswerDoc, q: BankLite | undefined, questionKey: string): EvidenceItem {
  return {
    itemKey, position, questionKey, questionId: q?._id ?? null, nodeId: q?.curriculumNodeId ?? null,
    topicFrom: q ? 'question' : 'none', cognitiveLevel: (q?.cognitiveLevel?.caps as CapsLevel | undefined) ?? null,
    marksAwarded: a.awarded ?? 0, marksAvailable: a.maxMarks, answerText: a.studentAnswer ?? '',
    answerKind: q && CHOICE_TYPES.has(q.type) ? 'choice' : 'typed', markedBy: a.gradingMethod as MarkedBy, markerNote: a.rationale ?? '',
  };
}

/** The submission is read inside its school (checkpoint fix 4, carried to every writer). */
export async function syncHomeworkEvidence(
  submissionId: string | Oid, schoolId: string | Oid, options: WriterOptions = {},
): Promise<WriteResult | null> {
  const sub = await HomeworkSubmission.findOne({ _id: toOid(submissionId), schoolId: toOid(schoolId) }).lean();
  if (!sub) return null;
  const own = { schoolId: sub.schoolId, 'source.type': 'homework', 'source.recordId': sub._id };
  const homework = await Homework.findOne({ _id: sub.homeworkId, schoolId: sub.schoolId }).lean();
  if (sub.isDeleted || !homework || homework.isDeleted) {
    if (!options.dryRun) await softDeleteRows(own, 'source_deleted');
    return null;
  }
  const docs = sub as unknown as { answers?: AnswerDoc[]; comprehensionAnswers?: AnswerDoc[]; gradedBy?: Oid | null; gradedAt?: Date };
  const answers = (sub.type === 'reading' ? docs.comprehensionAnswers : docs.answers) ?? [];
  const graded = answers
    .map((a: AnswerDoc, position: number) => ({ a, position }))
    .filter(({ a }) => a.gradingMethod !== 'pending' && typeof a.awarded === 'number');

  let items: EvidenceItem[];
  if (sub.type === 'quiz') {
    const quiz = homework.quizId
      ? await Quiz.findOne({ _id: homework.quizId, schoolId: sub.schoolId }).select('migratedQuestionIds questions').lean()
      : null;
    const migrated = (quiz?.migratedQuestionIds ?? []) as Oid[];
    const bank = await bankById(migrated);
    items = graded.map(({ a, position }) => {
      const index = a.questionIndex ?? position;
      const q = migrated[index] ? bank.get(String(migrated[index])) : undefined;
      const item = bankItem(`q${index}`, position, a, q, q ? `q:${String(q._id)}` : `lq:${String(homework.quizId)}:${index}`);
      const quizType = quiz?.questions?.[index]?.questionType;
      return q ? item : { ...item, answerKind: quizType && CHOICE_TYPES.has(quizType) ? 'choice' : 'typed' };
    });
  } else {
    const bank = await bankById(graded.map(({ a }) => a.questionId).filter((id): id is Oid => Boolean(id)));
    items = graded.map(({ a, position }) =>
      bankItem(String(a.questionId), position, a, bank.get(String(a.questionId)), `q:${String(a.questionId)}`));
  }

  const student = await Student.findOne({ _id: sub.studentId, schoolId: sub.schoolId }).select('userId').lean();
  const when = docs.gradedAt ?? sub.submittedAt;
  return writeEvidenceRows({
    schoolId: sub.schoolId, studentId: sub.studentId, userId: (student?.userId as Oid | undefined) ?? null,
    classId: homework.classId, subjectId: homework.subjectId, gradeId: null,
    source: { type: 'homework', channel: null, recordId: sub._id as Oid, parentId: sub.homeworkId, attemptNumber: 1 },
    markedAt: when, status: 'final', finalAt: when, totalOverridden: Boolean(docs.gradedBy),
  }, items, options);
}
