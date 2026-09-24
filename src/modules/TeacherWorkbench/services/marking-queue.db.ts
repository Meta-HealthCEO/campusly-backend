// src/modules/TeacherWorkbench/services/marking-queue.db.ts
//
// Gathers the rows the marking queue needs (one query per collection) and
// hands them to the pure builders in marking-queue.ts.

import mongoose from 'mongoose';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { AssessmentPaper } from '../../QuestionBank/model.js';
import { PaperSubmission } from '../../QuestionBank/model-submissions.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { Class } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import {
  calcPriority,
  paperQueueItems,
  type MarkingQueueItem,
  type PaperClassInput,
  type QueueMarkingStatus,
  type QueueSubmissionStatus,
} from './marking-queue.js';

type Oid = mongoose.Types.ObjectId;
const toOid = (id: string): Oid => new mongoose.Types.ObjectId(id);

function nameOf(ref: unknown): string {
  return ref && typeof ref === 'object' && 'name' in ref ? String((ref as { name?: unknown }).name ?? '') : '';
}

/** Homework with ungraded submissions: pending = no mark yet, total = every submission. */
export async function homeworkQueueItems(teacherId: string, schoolId: string, now: Date): Promise<MarkingQueueItem[]> {
  const homeworks = await Homework.find({ schoolId: toOid(schoolId), teacherId: toOid(teacherId), isDeleted: false })
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .lean();
  if (homeworks.length === 0) return [];

  const counts = await HomeworkSubmission.aggregate<{ _id: Oid; total: number; pending: number }>([
    { $match: { homeworkId: { $in: homeworks.map((h) => h._id) }, schoolId: toOid(schoolId), isDeleted: false } },
    {
      $group: {
        _id: '$homeworkId',
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $in: [{ $type: '$mark' }, ['missing', 'null']] }, 1, 0] } },
      },
    },
    { $match: { pending: { $gt: 0 } } },
  ]);

  const byId = new Map(homeworks.map((h) => [String(h._id), h]));
  return counts.flatMap((row) => {
    const hw = byId.get(String(row._id));
    if (!hw) return [];
    const id = String(hw._id);
    const classRef = hw.classId as unknown;
    const classId = classRef && typeof classRef === 'object' && '_id' in classRef
      ? String((classRef as { _id: Oid })._id)
      : String(classRef ?? '');
    return [{
      id,
      type: 'homework' as const,
      title: hw.title ?? 'Untitled',
      subjectName: nameOf(hw.subjectId),
      className: nameOf(hw.classId),
      dueDate: hw.dueDate ? hw.dueDate.toISOString() : '',
      totalMarks: hw.totalMarks ?? 0,
      pendingCount: row.pending,
      totalCount: row.total,
      priority: calcPriority(hw.dueDate, now),
      href: `/teacher/homework/${id}`,
      classId,
    }];
  });
}

/** One input per (paper the teacher owns or assigned, class it went to). */
async function loadPaperInputs(teacherId: string, schoolId: string): Promise<PaperClassInput[]> {
  const school = toOid(schoolId);
  const teacher = toOid(teacherId);
  const papers = await AssessmentPaper.find({
    schoolId: school,
    isDeleted: false,
    'assignments.0': { $exists: true },
    $or: [{ createdBy: teacher }, { 'assignments.assignedBy': teacher }],
  })
    .select('title subjectId totalMarks assignments')
    .populate('subjectId', 'name')
    .lean();
  if (papers.length === 0) return [];

  const paperIds = papers.map((p) => p._id);
  const classIds = [...new Set(papers.flatMap((p) => (p.assignments ?? []).map((a) => String(a.classId))))].map(toOid);
  const [classes, students, submissions, markings] = await Promise.all([
    Class.find({ _id: { $in: classIds }, schoolId: school, isDeleted: false }).select('_id name').lean(),
    Student.find({ classId: { $in: classIds }, schoolId: school, isDeleted: false }).select('_id classId').lean(),
    PaperSubmission.find({ paperId: { $in: paperIds }, schoolId: school, isDeleted: false }).select('paperId studentId status').lean(),
    PaperMarking.find({ paperId: { $in: paperIds }, schoolId: school, isDeleted: false }).select('paperId studentId status createdAt').lean(),
  ]);

  const classNames = new Map(classes.map((c) => [String(c._id), c.name]));
  const studentsByClass = new Map<string, string[]>();
  for (const s of students) {
    const key = String(s.classId);
    studentsByClass.set(key, [...(studentsByClass.get(key) ?? []), String(s._id)]);
  }
  const submissionStatus = new Map(submissions.map((s) => [`${s.paperId}:${s.studentId}`, s.status as QueueSubmissionStatus]));
  // Latest marking per learner and paper: a re-mark supersedes the old one.
  const latestMarking = new Map<string, { status: QueueMarkingStatus; at: number }>();
  for (const m of markings) {
    if (!m.studentId) continue;
    const key = `${m.paperId}:${m.studentId}`;
    const at = m.createdAt ? new Date(m.createdAt).getTime() : 0;
    const existing = latestMarking.get(key);
    if (!existing || at > existing.at) latestMarking.set(key, { status: m.status as QueueMarkingStatus, at });
  }

  return papers.flatMap((paper) => (paper.assignments ?? []).map((assignment): PaperClassInput => {
    const paperId = String(paper._id);
    const classId = String(assignment.classId);
    return {
      paperId,
      title: paper.title,
      subjectName: nameOf(paper.subjectId),
      totalMarks: paper.totalMarks ?? 0,
      classId,
      className: classNames.get(classId) ?? 'Unknown class',
      mode: assignment.mode,
      dueAt: assignment.dueAt ?? null,
      students: (studentsByClass.get(classId) ?? []).map((studentId) => ({
        studentId,
        submissionStatus: submissionStatus.get(`${paperId}:${studentId}`) ?? null,
        markingStatus: latestMarking.get(`${paperId}:${studentId}`)?.status ?? null,
      })),
    };
  }));
}

export async function paperQueueItemsFor(teacherId: string, schoolId: string, now: Date): Promise<MarkingQueueItem[]> {
  return paperQueueItems(await loadPaperInputs(teacherId, schoolId), now);
}

/** Soonest due first; undated items last. */
export function sortQueue(items: MarkingQueueItem[]): MarkingQueueItem[] {
  return [...items].sort((a, b) => {
    if (!a.dueDate) return b.dueDate ? 1 : 0;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
