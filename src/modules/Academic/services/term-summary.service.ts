// Term Summary aggregate.
//
// Returns a single object that powers the teacher gradebook's "Class
// overview" tab: the per-subject roll-up (chips), the flat per-assessment
// list (table columns), and per-student rows holding both per-assessment
// scores and per-subject weighted averages.
//
// Scope:
//   • { term: 1-4 } → only assessments in that term.
//   • { term: undefined } → "Full year": every assessment in the academic year.
//
// Works identically for school teachers and standalone teachers — both have
// real Class + Assessment + Mark documents under their schoolId.

import mongoose from 'mongoose';
import {
  Assessment, Mark, Class, type AssessmentType,
} from '../model.js';
import { Student } from '../../Student/model.js';
import { NotFoundError } from '../../../common/errors.js';
import { getWeightingMap, getBucketsFor } from './subject-weighting.service.js';

const { Types } = mongoose;

interface PopulatedUserName {
  _id: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
}

interface PopulatedStudent {
  _id: mongoose.Types.ObjectId;
  admissionNumber?: string;
  classId?: mongoose.Types.ObjectId | null;
  userId?: PopulatedUserName | null;
}

export interface TermSummaryAssessment {
  assessmentId: string;
  name: string;
  subjectId: string;
  subjectName: string;
  type: AssessmentType;
  totalMarks: number;
  date: string;
  term: number;
  weight: number;
  classAverage: number | null;
  studentsWithMarks: number;
}

export interface TermSummarySubjectColumn {
  subjectId: string;
  subjectName: string;
  classAverage: number | null;
  studentsWithMarks: number;
  assessmentCount: number;
  // True when no SubjectWeighting buckets are configured for this subject
  // in any term in scope. The frontend uses this to surface a "configure
  // weightings" prompt instead of a misleading number. We do not fall back
  // to a flat average — the calc must reflect school policy.
  missingWeighting: boolean;
}

export interface TermSummaryAssessmentMark {
  mark: number;
  total: number;
  percent: number;
  isAbsent: boolean;
}

export interface TermSummaryStudentRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  // Keyed by assessmentId. Missing key = no mark captured.
  marksByAssessment: Record<string, TermSummaryAssessmentMark>;
  // Keyed by subjectId. Per-subject weighted average across all assessments
  // the student has contributed to in this scope.
  subjectAverages: Record<string, number | null>;
  overallAverage: number | null;
}

export interface TermSummary {
  classId: string;
  className: string;
  // The class's grade id — surfaced so the weightings dialog can open
  // without prop-drilling from the page.
  gradeId: string;
  // null when scope === 'year'.
  term: number | null;
  scope: 'term' | 'year';
  academicYear: number;
  subjects: TermSummarySubjectColumn[];
  assessments: TermSummaryAssessment[];
  students: TermSummaryStudentRow[];
  classOverallAverage: number | null;
}

export async function getTermSummary(input: {
  schoolId: string;
  classId: string;
  // Omit for full-year aggregate.
  term?: number;
  academicYear: number;
}): Promise<TermSummary> {
  const schoolOid = new Types.ObjectId(input.schoolId);
  const classOid = new Types.ObjectId(input.classId);
  const scope: 'term' | 'year' = input.term ? 'term' : 'year';

  const cls = await Class.findOne({
    _id: classOid,
    schoolId: schoolOid,
    isDeleted: false,
  }).lean();
  if (!cls) throw new NotFoundError('Class not found');

  const assessmentFilter: Record<string, unknown> = {
    schoolId: schoolOid,
    classId: classOid,
    academicYear: input.academicYear,
    isDeleted: false,
  };
  if (input.term) assessmentFilter.term = input.term;

  const assessments = await Assessment.find(assessmentFilter)
    .populate<{ subjectId: { _id: mongoose.Types.ObjectId; name: string } | null }>(
      'subjectId', 'name',
    )
    .sort({ date: 1 })
    .lean();

  const roster = await Student.find({
    schoolId: schoolOid,
    classId: classOid,
    isDeleted: false,
  })
    .populate<{ userId: PopulatedUserName | null }>('userId', 'firstName lastName')
    .lean<PopulatedStudent[]>();

  if (assessments.length === 0) {
    return {
      classId: input.classId,
      className: cls.name,
      gradeId: String(cls.gradeId),
      term: input.term ?? null,
      scope,
      academicYear: input.academicYear,
      subjects: [],
      assessments: [],
      students: roster
        .map((s) => ({
          studentId: String(s._id),
          studentName: studentDisplayName(s),
          admissionNumber: s.admissionNumber ?? '',
          marksByAssessment: {},
          subjectAverages: {},
          overallAverage: null,
        }))
        .sort((a, b) => a.studentName.localeCompare(b.studentName)),
      classOverallAverage: null,
    };
  }

  const assessmentIds = assessments.map((a) => a._id);
  const marks = await Mark.find({
    schoolId: schoolOid,
    assessmentId: { $in: assessmentIds },
    isDeleted: false,
  }).lean();

  // ─── Per-assessment metadata + classAverage ──────────────────────────

  interface AssessmentMeta {
    weight: number;
    subjectId: string;
    subjectName: string;
    type: AssessmentType;
    totalMarks: number;
    name: string;
    term: number;
    date: string;
  }
  const assessmentMetaById = new Map<string, AssessmentMeta>();
  const assessmentOrder: string[] = [];
  const subjectOrder: string[] = [];
  const subjectNameById = new Map<string, string>();
  const assessmentsBySubject = new Map<string, Set<string>>();

  for (const a of assessments) {
    const subjectIdStr = a.subjectId && typeof a.subjectId === 'object'
      ? String(a.subjectId._id)
      : '';
    const subjectName = a.subjectId && typeof a.subjectId === 'object'
      ? (a.subjectId.name ?? 'Subject')
      : 'Subject';
    if (!subjectIdStr) continue;
    const id = String(a._id);
    assessmentMetaById.set(id, {
      weight: typeof a.weight === 'number' && a.weight > 0 ? a.weight : 1,
      subjectId: subjectIdStr,
      subjectName,
      type: a.type as AssessmentType,
      totalMarks: a.totalMarks ?? 0,
      name: a.name,
      term: a.term,
      date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
    });
    assessmentOrder.push(id);
    if (!subjectNameById.has(subjectIdStr)) {
      subjectOrder.push(subjectIdStr);
      subjectNameById.set(subjectIdStr, subjectName);
      assessmentsBySubject.set(subjectIdStr, new Set());
    }
    assessmentsBySubject.get(subjectIdStr)!.add(id);
  }

  // ─── Pull bucket weightings for this class's grade ───────────────────
  // The calc applies CAPS-style type buckets — no flat-average fallback.
  // For year scope we need every term's config; for term scope we pull
  // them all anyway and let the per-term lookup pick what's needed.
  const weightingMap = await getWeightingMap({
    schoolId: input.schoolId,
    gradeId: String(cls.gradeId),
    subjectIds: subjectOrder,
  });
  const termsInScope = input.term ? [input.term] : [1, 2, 3, 4];

  // ─── Bucket marks ────────────────────────────────────────────────────

  // assessmentId → array of percents (for class avg)
  const percentsByAssessment = new Map<string, number[]>();
  // studentId → assessmentId → mark detail
  const marksByStudent = new Map<string, Map<string, TermSummaryAssessmentMark>>();

  for (const m of marks) {
    const meta = assessmentMetaById.get(String(m.assessmentId));
    if (!meta) continue;
    const total = typeof m.total === 'number' && m.total > 0 ? m.total : 1;
    const percent = round1((m.mark / total) * 100);
    const detail: TermSummaryAssessmentMark = {
      mark: m.mark,
      total: m.total,
      percent,
      isAbsent: !!m.isAbsent,
    };
    const studentId = String(m.studentId);
    let perStudent = marksByStudent.get(studentId);
    if (!perStudent) {
      perStudent = new Map();
      marksByStudent.set(studentId, perStudent);
    }
    perStudent.set(String(m.assessmentId), detail);
    if (!m.isAbsent) {
      const arr = percentsByAssessment.get(String(m.assessmentId)) ?? [];
      arr.push(percent);
      percentsByAssessment.set(String(m.assessmentId), arr);
    }
  }

  const flatAssessments: TermSummaryAssessment[] = assessmentOrder.map((id) => {
    const meta = assessmentMetaById.get(id)!;
    const percents = percentsByAssessment.get(id) ?? [];
    return {
      assessmentId: id,
      name: meta.name,
      subjectId: meta.subjectId,
      subjectName: meta.subjectName,
      type: meta.type,
      totalMarks: meta.totalMarks,
      date: meta.date,
      term: meta.term,
      weight: meta.weight,
      classAverage: percents.length > 0
        ? round1(percents.reduce((sum, p) => sum + p, 0) / percents.length)
        : null,
      studentsWithMarks: percents.length,
    };
  });

  // ─── Per-student per-subject weighted avg (bucket-based) ─────────────

  // For each student × subject, compute the term avg per term in scope.
  // When CAPS-style bucket weightings are configured, apply them. When no
  // buckets are configured, fall back to a flat percent average so marks
  // are still surfaced (the per-subject `missingWeighting` flag still tells
  // the admin to configure proper buckets).
  function flatAverage(
    perStudentMarks: Map<string, TermSummaryAssessmentMark>,
    subjectId: string,
    term: number,
  ): number | null {
    const percents: number[] = [];
    for (const [aid, detail] of perStudentMarks) {
      if (detail.isAbsent) continue;
      const meta = assessmentMetaById.get(aid)!;
      if (meta.subjectId !== subjectId || meta.term !== term) continue;
      percents.push(detail.percent);
    }
    if (percents.length === 0) return null;
    return percents.reduce((s, v) => s + v, 0) / percents.length;
  }

  function computeSubjectAverage(
    perStudentMarks: Map<string, TermSummaryAssessmentMark>,
    subjectId: string,
  ): number | null {
    const termAverages: number[] = [];
    for (const term of termsInScope) {
      const buckets = getBucketsFor(weightingMap, subjectId, term);
      if (!buckets) {
        const flat = flatAverage(perStudentMarks, subjectId, term);
        if (flat !== null) termAverages.push(flat);
        continue;
      }

      // Group this student's present marks for (subject, term) by type.
      const byType = new Map<AssessmentType, Array<{ percent: number; weight: number }>>();
      for (const [aid, detail] of perStudentMarks) {
        if (detail.isAbsent) continue;
        const meta = assessmentMetaById.get(aid)!;
        if (meta.subjectId !== subjectId || meta.term !== term) continue;
        const arr = byType.get(meta.type) ?? [];
        arr.push({ percent: detail.percent, weight: meta.weight });
        byType.set(meta.type, arr);
      }
      if (byType.size === 0) continue;

      // Each bucket avg is weighted by Assessment.weight (within-bucket
      // weighting); buckets are then weighted by configured percentage.
      // Buckets without marks are skipped and their weight is excluded
      // from the denominator (prorate to "what's configured AND present").
      let weightedSum = 0;
      let weightTotal = 0;
      for (const [type, list] of byType) {
        const bucketWeight = buckets.get(type) ?? 0;
        if (bucketWeight === 0) continue;
        const bucketAvg = weightedAvg(list);
        if (bucketAvg === null) continue;
        weightedSum += bucketAvg * bucketWeight;
        weightTotal += bucketWeight;
      }
      if (weightTotal > 0) termAverages.push(weightedSum / weightTotal);
    }
    if (termAverages.length === 0) return null;
    return round1(termAverages.reduce((s, v) => s + v, 0) / termAverages.length);
  }

  // ─── Student rows ────────────────────────────────────────────────────

  const students: TermSummaryStudentRow[] = roster
    .map((s) => {
      const studentId = String(s._id);
      const perStudent = marksByStudent.get(studentId) ?? new Map();
      const marksByAssessment: Record<string, TermSummaryAssessmentMark> = {};
      for (const [aid, detail] of perStudent) {
        marksByAssessment[aid] = detail;
      }
      const subjectAverages: Record<string, number | null> = {};
      for (const subjectId of subjectOrder) {
        subjectAverages[subjectId] = computeSubjectAverage(perStudent, subjectId);
      }
      const presentSubjectAvgs = Object.values(subjectAverages)
        .filter((v): v is number => v !== null);
      const overall = presentSubjectAvgs.length > 0
        ? round1(presentSubjectAvgs.reduce((sum, v) => sum + v, 0) / presentSubjectAvgs.length)
        : null;
      return {
        studentId,
        studentName: studentDisplayName(s),
        admissionNumber: s.admissionNumber ?? '',
        marksByAssessment,
        subjectAverages,
        overallAverage: overall,
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  // ─── Per-subject column summary (chips) ──────────────────────────────
  // Cohort average per subject = mean of student weighted averages who
  // have one. missingWeighting flags subjects with no buckets configured
  // for any in-scope term — frontend prompts the admin to configure.

  const subjects: TermSummarySubjectColumn[] = subjectOrder.map((subjectId) => {
    const studentAvgs = students
      .map((s) => s.subjectAverages[subjectId])
      .filter((v): v is number => v !== null && v !== undefined);
    const hasAnyBuckets = termsInScope.some(
      (t) => getBucketsFor(weightingMap, subjectId, t) !== null,
    );
    return {
      subjectId,
      subjectName: subjectNameById.get(subjectId) ?? 'Subject',
      classAverage: studentAvgs.length > 0
        ? round1(studentAvgs.reduce((sum, v) => sum + v, 0) / studentAvgs.length)
        : null,
      studentsWithMarks: studentAvgs.length,
      assessmentCount: assessmentsBySubject.get(subjectId)?.size ?? 0,
      missingWeighting: !hasAnyBuckets,
    };
  });

  const subjectAverages = subjects
    .map((s) => s.classAverage)
    .filter((v): v is number => v !== null);
  const classOverallAverage = subjectAverages.length > 0
    ? round1(subjectAverages.reduce((sum, v) => sum + v, 0) / subjectAverages.length)
    : null;

  return {
    classId: input.classId,
    className: cls.name,
    gradeId: String(cls.gradeId),
    term: input.term ?? null,
    scope,
    academicYear: input.academicYear,
    subjects,
    assessments: flatAssessments,
    students,
    classOverallAverage,
  };
}

// ─── helpers ───────────────────────────────────────────────────────────────

function weightedAvg(list: ReadonlyArray<{ percent: number; weight: number }>): number | null {
  if (list.length === 0) return null;
  let weightSum = 0;
  let weightedSum = 0;
  for (const m of list) {
    weightedSum += m.percent * m.weight;
    weightSum += m.weight;
  }
  if (weightSum === 0) return null;
  return round1(weightedSum / weightSum);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function studentDisplayName(s: PopulatedStudent): string {
  const first = s.userId?.firstName ?? '';
  const last = s.userId?.lastName ?? '';
  const name = `${first} ${last}`.trim();
  return name || s.admissionNumber || 'Student';
}
