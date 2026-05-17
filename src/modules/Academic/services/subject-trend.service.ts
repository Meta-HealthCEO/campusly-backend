// Subject trend across the four terms of a single academic year for one
// class+subject. Returns the term-by-term cohort average plus the underlying
// per-assessment data points so the frontend can render a line chart with
// scatter overlay. Assessments without any captured marks contribute nothing.

import mongoose from 'mongoose';
import { Assessment, Mark, Class } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';

const { Types } = mongoose;

export interface SubjectTrendAssessment {
  assessmentId: string;
  name: string;
  totalMarks: number;
  weight: number;
  date: string;
  term: number;
  // Cohort average (%) for this assessment.
  classAverage: number | null;
  // How many students contributed.
  studentsWithMarks: number;
}

export interface SubjectTrendTerm {
  term: number;
  // Weighted average of all assessments in this term, across all students.
  classAverage: number | null;
  assessmentCount: number;
  // Total student-mark contributions (sum across assessments).
  markCount: number;
}

export interface SubjectTrend {
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  academicYear: number;
  terms: SubjectTrendTerm[];
  assessments: SubjectTrendAssessment[];
}

export async function getSubjectTrend(input: {
  schoolId: string;
  classId: string;
  subjectId: string;
  academicYear: number;
}): Promise<SubjectTrend> {
  const schoolOid = new Types.ObjectId(input.schoolId);
  const classOid = new Types.ObjectId(input.classId);
  const subjectOid = new Types.ObjectId(input.subjectId);

  const cls = await Class.findOne({
    _id: classOid,
    schoolId: schoolOid,
    isDeleted: false,
  }).lean();
  if (!cls) throw new NotFoundError('Class not found');

  const assessments = await Assessment.find({
    schoolId: schoolOid,
    classId: classOid,
    subjectId: subjectOid,
    academicYear: input.academicYear,
    isDeleted: false,
  })
    .populate<{ subjectId: { _id: mongoose.Types.ObjectId; name: string } | null }>(
      'subjectId', 'name',
    )
    .sort({ date: 1 })
    .lean();

  const subjectName = assessments.length > 0 && assessments[0].subjectId
    && typeof assessments[0].subjectId === 'object'
    ? (assessments[0].subjectId.name ?? 'Subject')
    : 'Subject';

  if (assessments.length === 0) {
    return {
      classId: input.classId,
      className: cls.name,
      subjectId: input.subjectId,
      subjectName,
      academicYear: input.academicYear,
      terms: emptyTerms(),
      assessments: [],
    };
  }

  const assessmentIds = assessments.map((a) => a._id);
  const marks = await Mark.find({
    schoolId: schoolOid,
    assessmentId: { $in: assessmentIds },
    isDeleted: false,
    isAbsent: false,
  }).lean();

  // Bucket marks by assessment.
  const marksByAssessment = new Map<string, Array<{ percent: number }>>();
  for (const m of marks) {
    const key = String(m.assessmentId);
    const total = typeof m.total === 'number' && m.total > 0 ? m.total : 1;
    const percent = (m.mark / total) * 100;
    const arr = marksByAssessment.get(key) ?? [];
    arr.push({ percent });
    marksByAssessment.set(key, arr);
  }

  const assessmentRows: SubjectTrendAssessment[] = assessments.map((a) => {
    const list = marksByAssessment.get(String(a._id)) ?? [];
    const avg = list.length > 0
      ? round1(list.reduce((sum, m) => sum + m.percent, 0) / list.length)
      : null;
    return {
      assessmentId: String(a._id),
      name: a.name,
      totalMarks: a.totalMarks,
      weight: typeof a.weight === 'number' && a.weight > 0 ? a.weight : 1,
      date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
      term: a.term,
      classAverage: avg,
      studentsWithMarks: list.length,
    };
  });

  // Per-term weighted aggregates.
  const termAccum = new Map<number, { wSum: number; wTotal: number; assessmentCount: number; markCount: number }>();
  for (const t of [1, 2, 3, 4]) {
    termAccum.set(t, { wSum: 0, wTotal: 0, assessmentCount: 0, markCount: 0 });
  }
  for (const row of assessmentRows) {
    const a = termAccum.get(row.term);
    if (!a || row.classAverage === null) {
      // Still count the assessment toward the term tally even when no marks.
      if (a) a.assessmentCount += 1;
      continue;
    }
    a.assessmentCount += 1;
    a.markCount += row.studentsWithMarks;
    a.wSum += row.classAverage * row.weight;
    a.wTotal += row.weight;
  }

  const terms: SubjectTrendTerm[] = Array.from(termAccum.entries())
    .map(([term, a]) => ({
      term,
      classAverage: a.wTotal > 0 ? round1(a.wSum / a.wTotal) : null,
      assessmentCount: a.assessmentCount,
      markCount: a.markCount,
    }))
    .sort((a, b) => a.term - b.term);

  return {
    classId: input.classId,
    className: cls.name,
    subjectId: input.subjectId,
    subjectName,
    academicYear: input.academicYear,
    terms,
    assessments: assessmentRows,
  };
}

function emptyTerms(): SubjectTrendTerm[] {
  return [1, 2, 3, 4].map((term) => ({
    term, classAverage: null, assessmentCount: 0, markCount: 0,
  }));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
