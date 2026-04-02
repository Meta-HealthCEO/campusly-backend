import mongoose from 'mongoose';
import { Student } from './model.js';
import { Mark, Assessment } from '../Academic/model.js';
import { NotFoundError } from '../../common/errors.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TranscriptSubject {
  name: string;
  mark: number;
  total: number;
  percentage: number;
  symbol: string;
}

interface TranscriptTerm {
  term: number;
  subjects: TranscriptSubject[];
  termAverage: number;
}

interface TranscriptYear {
  year: number;
  terms: TranscriptTerm[];
}

interface TranscriptStudent {
  name: string;
  admissionNumber: string;
  currentGrade: string;
  dateOfBirth: string | null;
}

interface TranscriptSchool {
  name: string;
}

export interface TranscriptData {
  student: TranscriptStudent;
  school: TranscriptSchool;
  years: TranscriptYear[];
  overallAverage: number;
  generatedAt: Date;
}

interface PopulatedMark {
  _id: unknown;
  mark: number;
  total: number;
  percentage: number;
  assessmentId: {
    _id: unknown;
    name: string;
    subjectId: { _id: unknown; name: string } | unknown;
    term: number;
    academicYear: number;
    totalMarks: number;
  } | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSymbol(percentage: number): string {
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  if (percentage >= 30) return 'F';
  return 'G';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Service ────────────────────────────────────────────────────────────────

export class TranscriptService {
  static async generateTranscript(
    schoolId: string,
    studentId: string,
  ): Promise<TranscriptData> {
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName')
      .populate('gradeId', 'name')
      .populate({
        path: 'schoolId',
        select: 'name',
      })
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const user = student.userId as unknown as { firstName: string; lastName: string } | null;
    const grade = student.gradeId as unknown as { name: string } | null;
    const school = student.schoolId as unknown as { name: string } | null;

    // Fetch all marks for this student
    const marks = (await Mark.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate({
        path: 'assessmentId',
        populate: { path: 'subjectId', select: 'name' },
      })
      .lean()) as unknown as PopulatedMark[];

    // Group by year -> term -> subject
    const yearMap = new Map<number, Map<number, Map<string, { marks: number[]; totals: number[]; name: string }>>>();

    for (const m of marks) {
      if (!m.assessmentId) continue;
      const assessment = m.assessmentId;
      const year = assessment.academicYear;
      const term = assessment.term;
      const subject = assessment.subjectId as { _id: unknown; name: string } | null;
      if (!subject || typeof subject !== 'object' || !('name' in subject)) continue;

      const subjectName = subject.name;
      const subjectId = String(subject._id);

      if (!yearMap.has(year)) yearMap.set(year, new Map());
      const termMap = yearMap.get(year)!;
      if (!termMap.has(term)) termMap.set(term, new Map());
      const subjectMap = termMap.get(term)!;
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { marks: [], totals: [], name: subjectName });
      }
      const entry = subjectMap.get(subjectId)!;
      entry.marks.push(m.mark);
      entry.totals.push(m.total);
    }

    // Build structured transcript
    const years: TranscriptYear[] = [];
    let allPercentages: number[] = [];

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);
    for (const year of sortedYears) {
      const termMap = yearMap.get(year)!;
      const terms: TranscriptTerm[] = [];
      const sortedTerms = Array.from(termMap.keys()).sort((a, b) => a - b);

      for (const term of sortedTerms) {
        const subjectMap = termMap.get(term)!;
        const subjects: TranscriptSubject[] = [];

        for (const [, data] of subjectMap) {
          const totalMark = data.marks.reduce((a, b) => a + b, 0);
          const totalPossible = data.totals.reduce((a, b) => a + b, 0);
          const percentage = totalPossible > 0 ? round2((totalMark / totalPossible) * 100) : 0;

          subjects.push({
            name: data.name,
            mark: totalMark,
            total: totalPossible,
            percentage,
            symbol: getSymbol(percentage),
          });
        }

        subjects.sort((a, b) => a.name.localeCompare(b.name));

        const termPercentages = subjects.map((s) => s.percentage);
        const termAverage =
          termPercentages.length > 0
            ? round2(termPercentages.reduce((a, b) => a + b, 0) / termPercentages.length)
            : 0;

        allPercentages = allPercentages.concat(termPercentages);
        terms.push({ term, subjects, termAverage });
      }

      years.push({ year, terms });
    }

    const overallAverage =
      allPercentages.length > 0
        ? round2(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length)
        : 0;

    return {
      student: {
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        admissionNumber: student.admissionNumber,
        currentGrade: grade?.name ?? 'Unknown',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().slice(0, 10) : null,
      },
      school: { name: school?.name ?? 'Unknown School' },
      years,
      overallAverage,
      generatedAt: new Date(),
    };
  }
}
