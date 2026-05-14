// Per-student term detail: every mark the student has for the supplied
// term/year, grouped by subject. Each subject row carries the weighted
// average and an ordered list of assessment scores for a mini sparkline.
//
// Used by the gradebook Term Summary tab when a teacher clicks a student
// to drill in.

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

interface PopulatedStudentDoc {
  _id: mongoose.Types.ObjectId;
  admissionNumber?: string;
  classId?: mongoose.Types.ObjectId | null;
  userId?: PopulatedUserName | null;
}

export interface StudentTermDetailMark {
  assessmentId: string;
  assessmentName: string;
  date: string;
  term: number;
  type: AssessmentType;
  mark: number;
  total: number;
  percent: number;
  weight: number;
  isAbsent: boolean;
  comment?: string | null;
}

export interface StudentTermDetailSubject {
  subjectId: string;
  subjectName: string;
  // Bucket-based weighted average (CAPS-style). null when student has no
  // marks OR when no buckets are configured for any in-scope term.
  weightedAverage: number | null;
  // True when no buckets configured for any in-scope term — drill-down UI
  // shows a "configure weightings" prompt.
  missingWeighting: boolean;
  highestPercent: number | null;
  lowestPercent: number | null;
  marks: StudentTermDetailMark[];
}

export interface StudentTermDetail {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  // null when scope === 'year'.
  term: number | null;
  scope: 'term' | 'year';
  academicYear: number;
  subjects: StudentTermDetailSubject[];
  // Mean of all per-subject weighted averages (where present).
  overallAverage: number | null;
}

export async function getStudentTermDetail(input: {
  schoolId: string;
  studentId: string;
  // Omit for full-year aggregate.
  term?: number;
  academicYear: number;
}): Promise<StudentTermDetail> {
  const schoolOid = new Types.ObjectId(input.schoolId);
  const studentOid = new Types.ObjectId(input.studentId);

  const student = await Student.findOne({
    _id: studentOid,
    schoolId: schoolOid,
    isDeleted: false,
  })
    .populate<{ userId: PopulatedUserName | null }>('userId', 'firstName lastName')
    .lean<PopulatedStudentDoc>();
  if (!student) throw new NotFoundError('Student not found');

  const studentName = displayName(student);

  // Pull every mark for the student in one go, then constrain by the term/year
  // via the Assessment join. Cheaper than two queries.
  const marks = await Mark.find({
    studentId: studentOid,
    schoolId: schoolOid,
    isDeleted: false,
  }).lean();

  const scope: 'term' | 'year' = input.term ? 'term' : 'year';

  if (marks.length === 0) {
    return {
      studentId: input.studentId,
      studentName,
      admissionNumber: student.admissionNumber ?? '',
      term: input.term ?? null,
      scope,
      academicYear: input.academicYear,
      subjects: [],
      overallAverage: null,
    };
  }

  const assessmentIds = Array.from(new Set(marks.map((m) => String(m.assessmentId))));
  const assessmentFilter: Record<string, unknown> = {
    _id: { $in: assessmentIds },
    schoolId: schoolOid,
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

  const assessmentById = new Map(assessments.map((a) => [String(a._id), a]));

  // Group marks by subject (only those whose assessment matches term/year).
  const bySubject = new Map<string, {
    subjectName: string;
    marks: StudentTermDetailMark[];
  }>();

  for (const m of marks) {
    const a = assessmentById.get(String(m.assessmentId));
    if (!a) continue;
    const subjectId = a.subjectId && typeof a.subjectId === 'object'
      ? String(a.subjectId._id)
      : '';
    const subjectName = a.subjectId && typeof a.subjectId === 'object'
      ? (a.subjectId.name ?? 'Subject')
      : 'Subject';
    if (!subjectId) continue;
    const total = typeof m.total === 'number' && m.total > 0 ? m.total : 1;
    const percent = round1((m.mark / total) * 100);
    const detail: StudentTermDetailMark = {
      assessmentId: String(a._id),
      assessmentName: a.name,
      date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
      term: a.term,
      type: a.type as AssessmentType,
      mark: m.mark,
      total: m.total,
      percent,
      weight: typeof a.weight === 'number' && a.weight > 0 ? a.weight : 1,
      isAbsent: !!m.isAbsent,
      comment: m.comment ?? null,
    };
    const bucket = bySubject.get(subjectId) ?? { subjectName, marks: [] };
    bucket.marks.push(detail);
    bySubject.set(subjectId, bucket);
  }

  // ─── Pull bucket weightings ──────────────────────────────────────────
  // We need the student's class to know which grade's buckets apply. If
  // the student isn't in a class (rare — placement gap), there's no grade
  // to look up and weightings can't be applied.
  const subjectIds = Array.from(bySubject.keys());
  const studentClass = student.classId
    ? await Class.findOne({
      _id: student.classId,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean()
    : null;
  const weightingMap = studentClass
    ? await getWeightingMap({
      schoolId: input.schoolId,
      gradeId: String(studentClass.gradeId),
      subjectIds,
    })
    : new Map();
  const termsInScope = input.term ? [input.term] : [1, 2, 3, 4];

  const subjects: StudentTermDetailSubject[] = Array.from(bySubject.entries())
    .map(([subjectId, bucket]) => {
      const present = bucket.marks.filter((m) => !m.isAbsent);
      const percents = present.map((m) => m.percent);

      // Per-term bucket-weighted avg, then average across terms with data.
      // When no buckets are configured for a (subject, term), fall back to
      // a flat percent average so marks are still surfaced. The
      // `missingWeighting` flag still signals the admin to configure proper
      // buckets.
      const termAverages: number[] = [];
      let hasAnyBuckets = false;
      for (const term of termsInScope) {
        const buckets = getBucketsFor(weightingMap, subjectId, term);
        if (!buckets) {
          const flat = present.filter((m) => m.term === term).map((m) => m.percent);
          if (flat.length > 0) {
            termAverages.push(flat.reduce((s, v) => s + v, 0) / flat.length);
          }
          continue;
        }
        hasAnyBuckets = true;
        const byType = new Map<AssessmentType, Array<{ percent: number; weight: number }>>();
        for (const m of present) {
          if (m.term !== term) continue;
          const arr = byType.get(m.type) ?? [];
          arr.push({ percent: m.percent, weight: m.weight });
          byType.set(m.type, arr);
        }
        if (byType.size === 0) continue;
        let weightedSum = 0;
        let weightTotal = 0;
        for (const [type, list] of byType) {
          const bucketWeight = buckets.get(type) ?? 0;
          if (bucketWeight === 0) continue;
          const bAvg = weightedAvg(list);
          if (bAvg === null) continue;
          weightedSum += bAvg * bucketWeight;
          weightTotal += bucketWeight;
        }
        if (weightTotal > 0) termAverages.push(weightedSum / weightTotal);
      }
      const wAvg = termAverages.length > 0
        ? round1(termAverages.reduce((s, v) => s + v, 0) / termAverages.length)
        : null;

      return {
        subjectId,
        subjectName: bucket.subjectName,
        weightedAverage: wAvg,
        missingWeighting: !hasAnyBuckets,
        highestPercent: percents.length > 0 ? round1(Math.max(...percents)) : null,
        lowestPercent: percents.length > 0 ? round1(Math.min(...percents)) : null,
        marks: bucket.marks.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      };
    })
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const subjectAverages = subjects
    .map((s) => s.weightedAverage)
    .filter((v): v is number => v !== null);
  const overallAverage = subjectAverages.length > 0
    ? round1(subjectAverages.reduce((sum, v) => sum + v, 0) / subjectAverages.length)
    : null;

  return {
    studentId: input.studentId,
    studentName,
    admissionNumber: student.admissionNumber ?? '',
    term: input.term ?? null,
    scope,
    academicYear: input.academicYear,
    subjects,
    overallAverage,
  };
}

function weightedAvg(list: ReadonlyArray<{ percent: number; weight: number }>): number | null {
  if (list.length === 0) return null;
  let wSum = 0;
  let wTotal = 0;
  for (const m of list) {
    wSum += m.percent * m.weight;
    wTotal += m.weight;
  }
  if (wTotal === 0) return null;
  return round1(wSum / wTotal);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function displayName(s: PopulatedStudentDoc): string {
  const first = s.userId?.firstName ?? '';
  const last = s.userId?.lastName ?? '';
  const name = `${first} ${last}`.trim();
  return name || s.admissionNumber || 'Student';
}
