// src/test-utils/readiness-fixture.ts
//
// Phase R test world: a small CAPS-like Mathematics tree (unique codes per run), a standalone classroom with
// Grade 12 and Grade 10 rows, four Subjects (two linked Mathematics, one loose "Mathematics", one Mathematical
// Literacy) and blueprints (final evidence rows join with Task 7, on E's base). cleanUpReadiness() removes the nodes and blueprints it made;
// cleanUpClassrooms() removes every school-scoped document.
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { CurriculumNode } from '../modules/CurriculumStructure/model.js';
import { Class, Grade, Subject, Timetable } from '../modules/Academic/model.js';
import { Student } from '../modules/Student/model.js';
import { ExamBlueprint, type IExamBlueprint } from '../modules/Readiness/model-blueprint.js';
import { blueprintFileSchema, type BlueprintFile } from '../modules/Readiness/blueprint-validate.js';
import { importDraft, publishBlueprint } from '../modules/Readiness/blueprint-service.js';
import { classroomCode, standaloneClassroom, type Classroom, type Group, type Learner } from './standalone-classroom.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();

export interface ReadinessWorld {
  prefix: string; subjectKey: string; nodes: Record<string, Oid>; gradeNode: Oid;
  subjectNodes: { gr11: Oid; gr12: Oid; lit: Oid };
}

export async function makeCurriculum(): Promise<ReadinessWorld> {
  const prefix = `RT${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const subjectKey = `${prefix}-MATHEMATICS`;
  const frameworkId = oid();
  const gradeNode = oid();
  const subjectNodes = { gr11: oid(), gr12: oid(), lit: oid() };
  const nodes: Record<string, Oid> = {};
  const now = new Date();
  const doc = (id: Oid, type: string, code: string, title: string, parentId: Oid | null, termNumber: number | null) => ({
    _id: id, frameworkId, type, code, title, parentId, termNumber, description: '', order: 0, schoolId: null, isDeleted: false,
    metadata: { weekNumbers: [], capsReference: '', assessmentStandards: [], notionalHours: 0, cognitiveWeighting: null },
    phaseId: null, gradeId: null, subjectId: null, createdAt: now, updatedAt: now,
  });
  const topic = (key: string, code: string, title: string, parent: Oid, term: number | null, type = 'topic') => {
    nodes[key] = oid();
    return doc(nodes[key], type, `${subjectKey}-${code}`, title, parent, term);
  };
  await CurriculumNode.collection.insertMany([
    doc(gradeNode, 'grade', `${prefix}-GR12`, 'Grade 12', null, null),
    doc(subjectNodes.gr12, 'subject', `${subjectKey}-GR12`, 'Mathematics', gradeNode, null),
    doc(subjectNodes.gr11, 'subject', `${subjectKey}-GR11`, 'Mathematics', null, null),
    doc(subjectNodes.lit, 'subject', `${prefix}-MATHEMATICAL-LITERACY-GR12`, 'Mathematical Literacy', gradeNode, null),
    topic('FUNC12', 'GR12-T1-FUNC', 'Functions', subjectNodes.gr12, 1),
    topic('CALC12', 'GR12-T2-CALC', 'Differential Calculus', subjectNodes.gr12, 2),
    topic('PROB12', 'GR12-T3-PROB', 'Counting and Probability', subjectNodes.gr12, 3),
    topic('TRIG12', 'GR12-T1-TRIG', 'Trigonometry', subjectNodes.gr12, 1),
    topic('STAT12', 'GR12-T3-STAT', 'Statistics', subjectNodes.gr12, 3),
    topic('FUNC11', 'GR11-T2-FUNC', 'Functions (including Trigonometric Functions)', subjectNodes.gr11, 2),
    topic('REV12', 'GR12-T4-REV', 'Revision', subjectNodes.gr12, 4),
  ]);
  await CurriculumNode.collection.insertMany([
    topic('FUNC12_INV', 'GR12-T1-FUNC-01', 'Inverse of a function', nodes.FUNC12, 1, 'subtopic'),
    topic('FUNC11_TRIG', 'GR11-T2-FUNC-03', 'Trigonometric graphs', nodes.FUNC11, 2, 'subtopic'),
  ]);
  return { prefix, subjectKey, nodes, gradeNode, subjectNodes };
}

export function fixtureBlueprintFile(
  w: ReadinessWorld,
  over: { verified?: boolean; examDates?: [string | null, string | null]; family?: string; examYear?: number } = {},
): BlueprintFile {
  const v = over.verified ?? false;
  const year = over.examYear ?? 2026;
  const [d1, d2] = over.examDates ?? [null, null];
  const c = (s: string) => `${w.subjectKey}-${s}`;
  return blueprintFileSchema.parse({
    family: over.family ?? `${w.prefix}-NSC-MATHEMATICS-GR12`, examBody: 'DBE', qualification: 'NSC', session: 'november',
    subjectKey: w.subjectKey, slug: `m${w.prefix.toLowerCase()}`, subjectTitle: 'Mathematics', grade: 12, examYear: year,
    sources: [{ ref: 'TEST', title: 'Test guidelines', edition: 'test', publisher: 'test' }],
    cognitiveScheme: { key: 'maths-4', levels: [
      { key: 'knowledge', label: 'Knowledge', percent: 20, fromStored: ['knowledge'], verified: v },
      { key: 'routine', label: 'Routine procedures', percent: 35, fromStored: ['routine'], verified: v },
      { key: 'complex', label: 'Complex procedures', percent: 30, fromStored: ['complex'], verified: v },
      { key: 'problem_solving', label: 'Problem solving', percent: 15, fromStored: ['problem_solving'], verified: v },
    ] },
    papers: [
      { key: 'P1', title: 'Paper 1', totalMarks: 100, durationMinutes: 120, examDate: d1, verified: v, topics: [
        { key: 'P1.FUNC', label: 'Functions and graphs', group: 'Functions and calculus', marks: 40, verified: v, nodes: [c('GR12-T1-FUNC'), c('GR11-T2-FUNC')] },
        { key: 'P1.CALC', label: 'Differential calculus', group: 'Functions and calculus', marks: 35, verified: v, nodes: [c('GR12-T2-CALC')] },
        { key: 'P1.PROB', label: 'Counting and probability', group: 'Probability', marks: 25, verified: v, nodes: [c('GR12-T3-PROB')] },
      ] },
      { key: 'P2', title: 'Paper 2', totalMarks: 50, durationMinutes: 60, examDate: d2, verified: v, topics: [
        { key: 'P2.TRIG', label: 'Trigonometry', group: 'Trigonometry and statistics', marks: 30, verified: v, nodes: [c('GR12-T1-TRIG'), c('GR11-T2-FUNC-03')] },
        { key: 'P2.STAT', label: 'Statistics', group: 'Trigonometry and statistics', marks: 20, verified: v, nodes: [c('GR12-T3-STAT')] },
      ] },
    ],
  });
}

/** Imports the fixture as a draft and publishes it (warnings acknowledged). */
export async function publishFixture(
  w: ReadinessWorld, over: Parameters<typeof fixtureBlueprintFile>[1] = {},
): Promise<IExamBlueprint> {
  const { blueprint } = await importDraft(fixtureBlueprintFile(w, over));
  if (!blueprint) throw new Error('fixture blueprint did not import');
  return publishBlueprint(String(blueprint._id), String(oid()), true);
}

export interface ReadinessRoom extends Classroom {
  world: ReadinessWorld; grade12: Oid; grade10: Oid; maths12: Oid; maths11: Oid; mathsLoose: Oid; mathsLit: Oid; g12: Group;
}

export async function readinessRoom(w: ReadinessWorld): Promise<ReadinessRoom> {
  const room = await standaloneClassroom();
  const now = new Date();
  const [grade12, grade10, maths12, maths11, mathsLoose, mathsLit] = [oid(), oid(), oid(), oid(), oid(), oid()];
  await Grade.collection.insertMany([
    { _id: grade12, schoolId: room.schoolId, name: 'Grade 12', orderIndex: 12, curriculumNodeId: w.gradeNode, isDeleted: false, createdAt: now, updatedAt: now },
    { _id: grade10, schoolId: room.schoolId, name: 'Grade 10', orderIndex: 10, curriculumNodeId: null, isDeleted: false, createdAt: now, updatedAt: now },
  ]);
  const subject = (_id: Oid, name: string, curriculumNodeId: Oid | null) => ({
    _id, schoolId: room.schoolId, name, code: name.slice(0, 4).toUpperCase(), gradeIds: [grade12], curriculumNodeId,
    paperDefaults: null, isDeleted: false, createdAt: now, updatedAt: now,
  });
  await Subject.collection.insertMany([
    subject(maths12, 'Mathematics', w.subjectNodes.gr12), subject(maths11, 'Mathematics', w.subjectNodes.gr11),
    subject(mathsLoose, 'mathematics', null), subject(mathsLit, 'Mathematical Literacy', null),
  ]);
  const g12: Group = { id: oid(), code: classroomCode(), name: 'Grade 12 Maths' };
  await Class.collection.insertOne({
    _id: g12.id, schoolId: room.schoolId, name: g12.name, gradeId: grade12, teacherId: room.teacherId, capacity: 40,
    classroomCode: g12.code, isHomeroom: false, isDeleted: false, createdAt: now, updatedAt: now,
  });
  await Timetable.collection.insertOne({
    schoolId: room.schoolId, classId: g12.id, subjectId: maths12, teacherId: room.teacherId, day: 'monday', period: 1,
    startTime: '08:00', endTime: '08:30', isDeleted: false, createdAt: now, updatedAt: now,
  });
  return { ...room, world: w, grade12, grade10, maths12, maths11, mathsLoose, mathsLit, g12 };
}

export async function grade12Learner(room: ReadinessRoom, first: string, subjectClassIds: Oid[] = []): Promise<Learner> {
  const l = await room.learner(first, room.g12.id, subjectClassIds);
  await Student.collection.updateOne({ _id: l.studentId }, { $set: { gradeId: room.grade12 } });
  return l;
}

export async function cleanUpReadiness(w: ReadinessWorld): Promise<void> {
  await Promise.all([
    CurriculumNode.deleteMany({ code: new RegExp(`^${w.prefix}-`) }),
    ExamBlueprint.deleteMany({ subjectKey: w.subjectKey }),
  ]);
}
