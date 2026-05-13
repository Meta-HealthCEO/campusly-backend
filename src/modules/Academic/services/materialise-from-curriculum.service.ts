// src/modules/Academic/services/materialise-from-curriculum.service.ts
//
// Bridge between the CAPS curriculum tree (CurriculumNode, framework-scoped,
// mostly shared across schools) and the per-school roster models (Grade,
// Subject — which is what classes, marks, timetables, papers etc. reference).
//
// Standalone teachers' teaching scope is stored as CurriculumNode IDs in
// User.teachingScope (because they have no school admin to provision school
// rows). For every consumer that needs a real Subject/Grade — paper
// generation, gradebook publishing, etc. — we materialise the matching
// school-side rows here, eagerly when scope is set and lazily as a fallback.
//
// Idempotent: re-running for the same school + same nodes returns the same
// pre-existing rows. Safe to call from migrations + request handlers.

import mongoose from 'mongoose';
import { Grade, Subject, type IGrade, type ISubject } from '../model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { BadRequestError } from '../../../common/errors.js';

function toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
}

function deriveSubjectCode(title: string): string {
  return title.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16) || 'SUBJ';
}

function parseGradeOrderIndex(title: string): number {
  const m = title.match(/(\d{1,2})/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 0 && n <= 12) return n;
  }
  return 0;
}

interface SubjectCurriculumPair {
  /** CurriculumNode IDs (type='grade' and type='subject' respectively). */
  curriculumGradeId: string | mongoose.Types.ObjectId;
  curriculumSubjectId: string | mongoose.Types.ObjectId;
}

export interface MaterialisedPair {
  /** Resolved school-side Grade._id. */
  gradeId: mongoose.Types.ObjectId;
  /** Resolved school-side Subject._id. */
  subjectId: mongoose.Types.ObjectId;
}

/**
 * Find-or-create the school-side Grade row that mirrors a curriculum grade
 * node. Sequence: (1) Grade with matching curriculumNodeId → (2) Grade with
 * matching name → (3) create new. The match-by-name fallback covers school
 * admins who created Grade rows manually before the bridge existed.
 */
export async function ensureGradeForCurriculumNode(
  schoolId: string | mongoose.Types.ObjectId,
  curriculumGradeNodeId: string | mongoose.Types.ObjectId,
): Promise<IGrade> {
  const schoolOid = toObjectId(schoolId);
  const nodeOid = toObjectId(curriculumGradeNodeId);

  const linked = await Grade.findOne({
    schoolId: schoolOid,
    curriculumNodeId: nodeOid,
    isDeleted: false,
  });
  if (linked) return linked;

  const node = await CurriculumNode.findOne({
    _id: nodeOid,
    type: 'grade',
    isDeleted: false,
  }).select('title').lean();
  if (!node) throw new BadRequestError('Curriculum grade node not found');

  // Title-bridge fallback for rows that pre-date the curriculumNodeId field.
  const titleRegex = new RegExp(`^${escapeRegex(node.title.trim())}$`, 'i');
  const byName = await Grade.findOne({
    schoolId: schoolOid,
    name: titleRegex,
    isDeleted: false,
  });
  if (byName) {
    if (!byName.curriculumNodeId) {
      byName.curriculumNodeId = nodeOid;
      await byName.save();
    }
    return byName;
  }

  return Grade.create({
    schoolId: schoolOid,
    name: node.title,
    orderIndex: parseGradeOrderIndex(node.title),
    curriculumNodeId: nodeOid,
  });
}

/**
 * Find-or-create the school-side Subject row that mirrors a curriculum
 * subject node, and ensure it's linked to the supplied gradeId. Mirrors the
 * resolution sequence of ensureGradeForCurriculumNode.
 */
export async function ensureSubjectForCurriculumNode(
  schoolId: string | mongoose.Types.ObjectId,
  curriculumSubjectNodeId: string | mongoose.Types.ObjectId,
  gradeId: mongoose.Types.ObjectId,
): Promise<ISubject> {
  const schoolOid = toObjectId(schoolId);
  const nodeOid = toObjectId(curriculumSubjectNodeId);

  let subject = await Subject.findOne({
    schoolId: schoolOid,
    curriculumNodeId: nodeOid,
    isDeleted: false,
  });

  if (!subject) {
    const node = await CurriculumNode.findOne({
      _id: nodeOid,
      type: 'subject',
      isDeleted: false,
    }).select('title').lean();
    if (!node) throw new BadRequestError('Curriculum subject node not found');

    const titleRegex = new RegExp(`^${escapeRegex(node.title.trim())}$`, 'i');
    const byName = await Subject.findOne({
      schoolId: schoolOid,
      name: titleRegex,
      isDeleted: false,
    });
    if (byName) {
      if (!byName.curriculumNodeId) byName.curriculumNodeId = nodeOid;
      subject = byName;
    } else {
      subject = await Subject.create({
        schoolId: schoolOid,
        name: node.title,
        code: deriveSubjectCode(node.title),
        gradeIds: [gradeId],
        curriculumNodeId: nodeOid,
      });
    }
  }

  // Always ensure the requested grade is linked.
  if (!subject.gradeIds.some((id) => id.equals(gradeId))) {
    subject.gradeIds.push(gradeId);
    await subject.save();
  } else if (subject.isModified()) {
    await subject.save();
  }

  return subject;
}

/**
 * Materialise the full subjectsByGrade scope. Returns a map of curriculum
 * IDs → academic IDs the caller can use without further lookups.
 */
export async function materialiseTeachingScope(
  schoolId: string | mongoose.Types.ObjectId,
  pairs: SubjectCurriculumPair[],
): Promise<{
  gradeIdByCurriculumId: Map<string, mongoose.Types.ObjectId>;
  subjectIdByCurriculumId: Map<string, mongoose.Types.ObjectId>;
}> {
  const gradeIdByCurriculumId = new Map<string, mongoose.Types.ObjectId>();
  const subjectIdByCurriculumId = new Map<string, mongoose.Types.ObjectId>();

  // Materialise each unique curriculum grade once.
  const uniqueGradeIds = Array.from(
    new Set(pairs.map((p) => String(p.curriculumGradeId))),
  );
  for (const gradeNodeId of uniqueGradeIds) {
    const grade = await ensureGradeForCurriculumNode(schoolId, gradeNodeId);
    gradeIdByCurriculumId.set(gradeNodeId, grade._id as mongoose.Types.ObjectId);
  }

  // Then materialise each subject under its resolved grade.
  for (const pair of pairs) {
    const subjectKey = String(pair.curriculumSubjectId);
    if (subjectIdByCurriculumId.has(subjectKey)) continue;
    const resolvedGradeId = gradeIdByCurriculumId.get(String(pair.curriculumGradeId));
    if (!resolvedGradeId) continue;
    const subject = await ensureSubjectForCurriculumNode(
      schoolId,
      pair.curriculumSubjectId,
      resolvedGradeId,
    );
    subjectIdByCurriculumId.set(subjectKey, subject._id as mongoose.Types.ObjectId);
  }

  return { gradeIdByCurriculumId, subjectIdByCurriculumId };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
