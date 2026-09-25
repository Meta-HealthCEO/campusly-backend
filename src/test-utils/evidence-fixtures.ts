// src/test-utils/evidence-fixtures.ts
//
// A marked test the way the AI leaves it: a paper with a bank question, a
// tagged inline question and an untagged one; markings per learner.
import mongoose from 'mongoose';
import { AssessmentPaper, Question } from '../modules/QuestionBank/model.js';
import { PaperMarking } from '../modules/AITools/model-marking.js';
import { CurriculumNode } from '../modules/CurriculumStructure/model.js';
import { Student } from '../modules/Student/model.js';
import { AnswerEvidence } from '../modules/Evidence/model.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();

export interface MarkedPaperFixture {
  schoolId: Oid; teacherId: Oid; classId: Oid; paperId: Oid; topicId: Oid; subtopicId: Oid; bankQuestionId: Oid; students: Oid[];
}

/** The fixture's nodes are tagged with their school, so one school's clean-up leaves another's topics alone. */
const schoolTag = (schoolId: Oid): string => String(schoolId).slice(-10);

async function node(schoolId: Oid, type: string, title: string, parentId: Oid | null, subjectId: Oid | null): Promise<Oid> {
  const id = oid();
  await CurriculumNode.collection.insertOne({
    // No full ObjectId in the code: type codes built from it reach the AI prompt, which must carry no ids.
    _id: id, frameworkId: oid(), type, parentId, title, code: `E-FX-${type}-${schoolTag(schoolId)}-${String(id).slice(-10)}`, description: '', metadata: {},
    order: 0, schoolId: null, subjectId, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  return id;
}

/** The writers only write learners that exist in the marking's school. */
async function ensureStudent(schoolId: Oid, classId: Oid, studentId: Oid): Promise<void> {
  if (await Student.exists({ _id: studentId })) return;
  await Student.collection.insertOne({ _id: studentId, schoolId, classId, gradeId: oid(), admissionNumber: `E-${String(studentId)}`, isDeleted: false });
}

export async function seedMarkedPaper(input: { schoolId?: Oid; teacherId?: Oid; classId?: Oid; students?: Oid[] } = {}): Promise<MarkedPaperFixture> {
  const schoolId = input.schoolId ?? oid();
  const teacherId = input.teacherId ?? oid();
  const classId = input.classId ?? oid();
  const subject = await node(schoolId, 'subject', 'Mathematics', null, null);
  const topicId = await node(schoolId, 'topic', 'Functions', subject, subject);
  const subtopicId = await node(schoolId, 'subtopic', 'Inverse functions', topicId, subject);
  const bank = await Question.create({
    curriculumNodeId: subtopicId, schoolId, subjectId: oid(), gradeId: oid(), type: 'short_answer',
    stem: 'Write down the inverse of f(x) = 3x.', answer: 'f^-1(x) = x/3', markingRubric: '1 mark for swapping, 1 for solving.',
    marks: 2, cognitiveLevel: { caps: 'routine', blooms: 'apply' }, status: 'approved', createdBy: teacherId,
  });
  const paper = await AssessmentPaper.create({
    schoolId, title: 'Functions test', subjectId: oid(), gradeId: oid(), topicIds: [topicId], term: 1, year: 2026,
    paperType: 'class_test', duration: 30, totalMarks: 8, status: 'finalised', createdBy: teacherId,
    sections: [
      { title: 'A', instructions: '', order: 0, questions: [
        { questionId: bank._id, questionText: null, marks: 2, position: 0 },
        { questionText: 'Is the inverse of y = x² a function? Explain.', marks: 3, position: 1, modelAnswer: 'No: it fails the vertical line test.',
          curriculumNodeId: topicId, capsLevel: 'complex', tagFrom: 'generator' },
      ] },
      { title: 'B', instructions: '', order: 1, questions: [
        { questionText: 'Sketch y = 2^x.', marks: 3, position: 0, modelAnswer: 'Exponential curve through (0;1).' },
      ] },
    ],
  });
  const students = input.students ?? [oid(), oid(), oid()];
  for (const studentId of students) await ensureStudent(schoolId, classId, studentId);
  return { schoolId, teacherId, classId, paperId: paper._id as Oid, topicId, subtopicId, bankQuestionId: bank._id as Oid, students };
}

export async function seedMarking(
  fx: MarkedPaperFixture, studentId: Oid, answers: Array<{ n: string; answer: string; awarded: number; max: number }>,
  extra: Record<string, unknown> = {},
): Promise<Oid> {
  const questions = answers.map((a) => ({
    questionNumber: a.n, studentAnswer: a.answer, correctAnswer: '', marksAwarded: a.awarded, maxMarks: a.max,
    feedback: a.awarded < a.max ? 'Not quite.' : 'Good.', rationale: a.awarded < a.max ? 'Method incomplete.' : 'Correct.',
  }));
  const total = answers.reduce((s, a) => s + a.awarded, 0);
  const max = answers.reduce((s, a) => s + a.max, 0);
  await ensureStudent(fx.schoolId, fx.classId, studentId);
  const m = await PaperMarking.create({
    paperId: fx.paperId, paperType: 'assessment', studentId, studentName: 'Learner', teacherId: fx.teacherId, schoolId: fx.schoolId,
    classId: fx.classId, imageCount: 0, totalMarks: total, maxMarks: max, percentage: Math.round((total / max) * 100), status: 'completed',
    questions, aiRawResult: { questions }, paperVersion: 1, images: [], ...extra,
  });
  return m._id as Oid;
}

export async function cleanUpEvidenceFixtures(schoolId: Oid): Promise<void> {
  await Promise.all([
    AssessmentPaper.deleteMany({ schoolId }), Question.deleteMany({ schoolId }), PaperMarking.deleteMany({ schoolId }),
    Student.deleteMany({ schoolId }), AnswerEvidence.deleteMany({ schoolId }),
    CurriculumNode.deleteMany({ code: new RegExp(`^E-FX-[a-z]+-${schoolTag(schoolId)}-`) }),
  ]);
}
