// src/modules/Evidence/service-class.ts
//
// "Where the class lost marks" (spec §7.1, §8.2): misconception and
// procedural types shared by two or more learners on this paper or homework
// in this class, top three; general types on one line; marks to check.
import { User } from '../Auth/model.js';
import { Student } from '../Student/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AnswerEvidence } from './model.js';
import { MisconceptionType, type TypeKind } from './model-taxonomy.js';
import { groupBy } from './pipeline-collect.js';
import type { Oid } from './types.js';

export interface ClassMisconceptions {
  markedLearners: number;
  updatedAt: string;
  top: Array<{
    typeId: string; label: string; kind: 'misconception' | 'procedural'; topicTitle: string | null;
    learners: number; lostMarks: number; questions: string[];
    students: Array<{ studentId: string; name: string; recordId: string }>;
  }>;
  generic: Array<{ typeId: string; label: string; learners: number }>;
  marksToCheck: number;
  working: number;
}

interface Row {
  studentId: Oid; marksAwarded: number; marksAvailable: number; updatedAt: Date;
  source: { itemKey: string; recordId: Oid }; diagnosis: { state: string; typeId: Oid | null };
}

export async function studentNames(schoolId: Oid, ids: readonly Oid[]): Promise<Map<string, string>> {
  const students = await Student.find({ _id: { $in: ids }, schoolId }).select('userId admissionNumber').lean();
  const userIds = students.map((s) => s.userId).filter((id): id is Oid => Boolean(id));
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName').lean();
  const userName = new Map(users.map((u) => [String(u._id), `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()]));
  return new Map(students.map((s) => [String(s._id), userName.get(String(s.userId)) || s.admissionNumber || 'Learner']));
}

const byLearnersThenMarks = (a: { learners: number; lostMarks: number }, b: { learners: number; lostMarks: number }): number =>
  b.learners - a.learners || b.lostMarks - a.lostMarks;

export async function classMisconceptions(a: { schoolId: Oid; parentId: Oid; classId: Oid }): Promise<ClassMisconceptions> {
  const rows = (await AnswerEvidence.find({ schoolId: a.schoolId, 'source.parentId': a.parentId, classId: a.classId, isDeleted: false })
    .select('studentId marksAwarded marksAvailable updatedAt source diagnosis').lean()) as unknown as Row[];
  const ready = rows.filter((r) => r.diagnosis.state === 'ready' && r.diagnosis.typeId);
  const types = await MisconceptionType.find({ _id: { $in: ready.map((r) => r.diagnosis.typeId) } }).select('code kind label topicNodeId').lean();
  const typeById = new Map(types.map((t) => [String(t._id), t]));
  const [names, topics] = await Promise.all([
    studentNames(a.schoolId, [...new Set(ready.map((r) => String(r.studentId)))].map((id) => ready.find((r) => String(r.studentId) === id)!.studentId)),
    CurriculumNode.find({ _id: { $in: types.map((t) => t.topicNodeId).filter(Boolean) } }).select('title').lean(),
  ]);
  const topicTitle = new Map(topics.map((t) => [String(t._id), t.title]));

  const summaries = [...groupBy(ready, (r) => String(r.diagnosis.typeId)).entries()].flatMap(([typeId, rs]) => {
    const type = typeById.get(typeId);
    if (!type) return [];
    const learners = [...new Set(rs.map((r) => String(r.studentId)))];
    return [{
      typeId, code: type.code, kind: type.kind as TypeKind, label: type.label, rows: rs.length,
      topicTitle: type.topicNodeId ? topicTitle.get(String(type.topicNodeId)) ?? null : null,
      learners: learners.length, lostMarks: rs.reduce((s, r) => s + (r.marksAvailable - r.marksAwarded), 0),
      questions: [...new Set(rs.map((r) => r.source.itemKey))].sort(),
      students: learners.map((id) => ({ studentId: id, name: names.get(id) ?? 'Learner', recordId: String(rs.find((r) => String(r.studentId) === id)!.source.recordId) })),
    }];
  });
  const checks = summaries.find((s) => s.code === 'GEN.possible-marking-error');
  const updated = rows.reduce((max, r) => Math.max(max, r.updatedAt.getTime()), 0);
  return {
    markedLearners: new Set(rows.map((r) => String(r.studentId))).size,
    updatedAt: new Date(updated || Date.now()).toISOString(),
    top: summaries.filter((s) => s.kind !== 'generic' && s.learners >= 2).sort(byLearnersThenMarks).slice(0, 3)
      .map(({ typeId, label, kind, topicTitle: t, learners, lostMarks, questions, students }) => ({
        typeId, label, kind: kind as 'misconception' | 'procedural', topicTitle: t, learners, lostMarks, questions, students,
      })),
    generic: summaries.filter((s) => s.kind === 'generic' && s !== checks).sort(byLearnersThenMarks).slice(0, 3)
      .map(({ typeId, label, learners }) => ({ typeId, label, learners })),
    marksToCheck: checks?.rows ?? 0,
    working: rows.filter((r) => r.diagnosis.state === 'pending' || r.diagnosis.state === 'queued').length,
  };
}
