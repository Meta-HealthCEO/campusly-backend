import type { Types } from 'mongoose';
import { BadRequestError } from '../../common/errors.js';
import { Class, Grade, Subject } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { Student } from '../Student/model.js';

export interface TutorContextInput {
  subjectId: string;
  subjectName?: string;
  grade?: number;
}

export interface ResolvedTutorContext {
  studentRecordId: string | null;
  subjectId: string;
  subjectName: string;
  grade: number;
}

type GradeLike = {
  _id: Types.ObjectId;
  name?: string;
  title?: string;
  orderIndex?: number;
};

type SubjectLike = {
  _id: Types.ObjectId;
  name?: string;
  title?: string;
  code?: string;
  gradeIds?: Types.ObjectId[];
};

function validGrade(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 1 || value > 12) return null;
  return Math.trunc(value);
}

function parseGradeFromText(value: string | undefined): number | null {
  if (!value) return null;
  const match = /\b(?:grade|gr)\s*(\d{1,2})\b/i.exec(value) ?? /\b(\d{1,2})\b/.exec(value);
  if (!match) return null;
  const parsed = Number.parseInt(match[1] ?? '', 10);
  return validGrade(parsed);
}

async function resolveGradeLevel(
  schoolId: string,
  gradeId: Types.ObjectId | string | undefined,
  fallback: unknown,
): Promise<number> {
  const fallbackGrade = validGrade(fallback);

  if (gradeId) {
    const [grade, node] = await Promise.all([
      Grade.findOne({ _id: gradeId, schoolId, isDeleted: false })
        .select('_id name orderIndex')
        .lean<GradeLike | null>(),
      CurriculumNode.findOne({ _id: gradeId, type: 'grade', isDeleted: false })
        .select('_id title')
        .lean<GradeLike | null>(),
    ]);

    if (grade) {
      const level = validGrade(grade.orderIndex) ?? parseGradeFromText(grade.name);
      if (level) return level;
    }

    if (node) {
      const level = parseGradeFromText(node.title);
      if (level) return level;
    }
  }

  if (fallbackGrade) return fallbackGrade;
  throw new BadRequestError('Your grade is not set. Ask your teacher to move you into the right teaching group.');
}

async function resolveSubject(
  schoolId: string,
  subjectId: string,
  fallbackName: string | undefined,
): Promise<{ id: string; name: string; gradeIds: string[] }> {
  const [subject, node] = await Promise.all([
    Subject.findOne({ _id: subjectId, schoolId, isDeleted: false })
      .select('_id name code gradeIds')
      .lean<SubjectLike | null>(),
    CurriculumNode.findOne({ _id: subjectId, type: 'subject', isDeleted: false })
      .select('_id title code gradeId')
      .lean<(SubjectLike & { gradeId?: Types.ObjectId }) | null>(),
  ]);

  if (subject) {
    return {
      id: String(subject._id),
      name: subject.name ?? subject.code ?? fallbackName ?? 'Subject',
      gradeIds: (subject.gradeIds ?? []).map(String),
    };
  }

  if (node) {
    return {
      id: String(node._id),
      name: node.title ?? node.code ?? fallbackName ?? 'Subject',
      gradeIds: node.gradeId ? [String(node.gradeId)] : [],
    };
  }

  throw new BadRequestError('Subject is not available for this student.');
}

export async function resolveTutorContext(
  userId: string,
  schoolId: string,
  input: TutorContextInput,
): Promise<ResolvedTutorContext> {
  const student = await Student.findOne({ userId, schoolId, isDeleted: false })
    .select('_id gradeId classId')
    .lean<{ _id: Types.ObjectId; gradeId?: Types.ObjectId; classId?: Types.ObjectId } | null>();

  const classDoc = student?.classId
    ? await Class.findOne({ _id: student.classId, schoolId, isDeleted: false })
        .select('gradeId')
        .lean<{ gradeId?: Types.ObjectId } | null>()
    : null;

  const gradeId = student?.gradeId ?? classDoc?.gradeId;
  const grade = await resolveGradeLevel(schoolId, gradeId, input.grade);
  const subject = await resolveSubject(schoolId, input.subjectId, input.subjectName);

  return {
    studentRecordId: student?._id ? String(student._id) : null,
    subjectId: subject.id,
    subjectName: subject.name,
    grade,
  };
}
