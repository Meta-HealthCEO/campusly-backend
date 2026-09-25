// src/modules/Readiness/blueprint-resolve.ts
//
// Which blueprint applies to a learner, and which school Subjects feed it (spec §2.5).
import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { Grade, Subject } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { ExamBlueprint, type IExamBlueprint } from './model-blueprint.js';
import { gradeOfCode } from './blueprint-validate.js';
import { sastYear } from './engine/sast.js';
import type { Oid } from './types.js';

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `CAPS-MATHEMATICS-GR12` → `CAPS-MATHEMATICS`; anything that isn't a subject node code → null. */
export function familyOfCode(code: string): string | null {
  const m = code.match(/^(.*)-GR\d{1,2}$/);
  return m ? m[1] : null;
}

export async function gradeNumberFor(schoolId: Oid, gradeId: Oid | null | undefined): Promise<number | null> {
  if (!gradeId) return null;
  const grade = await Grade.findOne({ _id: gradeId, schoolId, isDeleted: false }).select('name curriculumNodeId').lean();
  if (!grade) return null;
  if (grade.curriculumNodeId) {
    const node = await CurriculumNode.findOne({ _id: grade.curriculumNodeId, isDeleted: false }).select('code').lean();
    const fromCode = node ? gradeOfCode(node.code) : null;
    if (fromCode !== null) return fromCode;
  }
  const m = grade.name.match(/\b(\d{1,2})\b/);
  return m ? Number(m[1]) : null;
}

/** A school Subject's family; a teaching group's Timetable subject may be a CurriculumNode instead (grade.service.ts:55-60). */
export async function subjectFamily(schoolId: Oid, subjectId: Oid): Promise<{ subjectKey: string | null; title: string } | null> {
  const subject = await Subject.findOne({ _id: subjectId, schoolId, isDeleted: false }).select('name curriculumNodeId').lean();
  const nodeId = subject ? subject.curriculumNodeId : subjectId;
  const node = nodeId ? await CurriculumNode.findOne({ _id: nodeId, type: 'subject', isDeleted: false }).select('code title').lean() : null;
  if (!subject && !node) return null;
  const title = subject?.name ?? node?.title ?? '';
  if (node) return { subjectKey: familyOfCode(node.code), title };
  const byName = await ExamBlueprint.findOne({ subjectTitle: new RegExp(`^${escape(title.trim())}$`, 'i'), status: 'published', isDeleted: false })
    .select('subjectKey').lean();
  return { subjectKey: byName?.subjectKey ?? null, title };
}

/** Every school Subject in the family: linked to one of its subject nodes, or unlinked with exactly its title. */
export async function familySubjectIds(schoolId: Oid, bp: { subjectKey: string; subjectTitle: string }): Promise<Oid[]> {
  const nodes = await CurriculumNode.find({ type: 'subject', code: new RegExp(`^${escape(bp.subjectKey)}-GR\\d{1,2}$`), isDeleted: false })
    .select('_id').lean();
  const subjects = await Subject.find({
    schoolId, isDeleted: false,
    $or: [
      { curriculumNodeId: { $in: nodes.map((n) => n._id) } },
      { curriculumNodeId: null, name: new RegExp(`^${escape(bp.subjectTitle.trim())}$`, 'i') },
    ],
  }).select('_id').lean();
  return subjects.map((s) => s._id as Oid);
}

export async function publishedBlueprint(q: { subjectKey?: string; slug?: string; grade: number; examYear: number }): Promise<IExamBlueprint | null> {
  const key = q.subjectKey ? { subjectKey: q.subjectKey } : { slug: q.slug };
  return ExamBlueprint.findOne({ ...key, grade: q.grade, examYear: q.examYear, status: 'published', isDeleted: false });
}

export interface LearnerTarget { studentId: Oid; grade: number; blueprint: IExamBlueprint; subjectIds: Oid[] }

export async function learnerTarget(schoolId: Oid, studentId: Oid, subjectKey: string, now: Date): Promise<LearnerTarget | null> {
  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false }).select('gradeId').lean();
  if (!student) return null;
  const grade = await gradeNumberFor(schoolId, student.gradeId as Oid);
  if (grade === null) return null;
  const blueprint = await publishedBlueprint({ subjectKey, grade, examYear: sastYear(now) });
  if (!blueprint) return null;
  const subjectIds = await familySubjectIds(schoolId, blueprint);
  return { studentId: new mongoose.Types.ObjectId(String(studentId)), grade, blueprint, subjectIds };
}
