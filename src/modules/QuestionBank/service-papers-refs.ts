// src/modules/QuestionBank/service-papers-refs.ts
//
// Checks and builders for a paper create/update payload: subject and grade
// ids, who may create for them, the topic ids, and the sections. Moved
// unchanged from service-papers.ts (a pure move, to stay under 350 lines).
import mongoose from 'mongoose';
import type { IPaperQuestion } from './model.js';
import { Class, Grade, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { resolveAcademicAncestor } from '../CurriculumStructure/service-academic-bridge.js';
import {
  ensureGradeForCurriculumNode,
  ensureSubjectForCurriculumNode,
} from '../Academic/services/materialise-from-curriculum.service.js';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';
import type { CreatePaperInput, UpdatePaperInput } from './validation.js';
import { assertVisibleNode } from './paper-question-tags.js';

export const REVIEW_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'];

export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Defensive lazy bridge for the unusual case where a request arrives with
 * CurriculumNode IDs instead of school-side Subject/Grade IDs.
 *
 * The eager materialisation in TeacherSettingsService.updateTeachingScope
 * (and the boot-time backfill migration) means standalone teachers always
 * have matching school rows. This function exists in case a request still
 * arrives stale — e.g. from a client cached before the refactor — and to
 * keep paper generation forward-compatible if a future flow ever passes
 * curriculum IDs directly.
 *
 * Pass-through when the IDs are already valid school-side rows; otherwise
 * resolve via ensureGradeForCurriculumNode / ensureSubjectForCurriculumNode.
 */
export async function normaliseSubjectGradeIds(
  schoolId: string,
  subjectId: string,
  gradeId: string,
): Promise<{ subjectId: string; gradeId: string }> {
  const soid = toObjectId(schoolId);

  let resolvedGradeId: string;
  const directGrade = await Grade.findOne({
    _id: toObjectId(gradeId), schoolId: soid, isDeleted: false,
  }).select('_id').lean();
  if (directGrade) {
    resolvedGradeId = String(directGrade._id);
  } else {
    const grade = await ensureGradeForCurriculumNode(soid, gradeId);
    resolvedGradeId = String(grade._id);
  }

  let resolvedSubjectId: string;
  const directSubject = await Subject.findOne({
    _id: toObjectId(subjectId), schoolId: soid, isDeleted: false,
  }).select('_id').lean();
  if (directSubject) {
    resolvedSubjectId = String(directSubject._id);
  } else {
    const subject = await ensureSubjectForCurriculumNode(
      soid, subjectId, toObjectId(resolvedGradeId),
    );
    resolvedSubjectId = String(subject._id);
  }

  // Defensive — ensure Subject.gradeIds includes the resolved grade even
  // when both IDs were passed in directly. verifyPaperRefs rejects otherwise.
  await Subject.updateOne(
    {
      _id: toObjectId(resolvedSubjectId),
      schoolId: soid,
      gradeIds: { $ne: toObjectId(resolvedGradeId) },
    },
    { $addToSet: { gradeIds: toObjectId(resolvedGradeId) } },
  );

  return { subjectId: resolvedSubjectId, gradeId: resolvedGradeId };
}

export function normaliseTopicIds(topicIds: string[]): mongoose.Types.ObjectId[] {
  return Array.from(new Set(topicIds)).map((id) => toObjectId(id));
}

export async function assertCanCreateForSubjectGrade(
  schoolId: string,
  userId: string,
  userRole: string,
  subjectId: string,
  gradeId: string,
  isStandaloneTeacher = false,
): Promise<void> {
  if (REVIEW_ROLES.includes(userRole)) return;
  // Standalone teachers run a single-teacher school — they're the only
  // teacher for every subject and grade by definition, so the Class/Timetable
  // assignment check below doesn't apply.
  if (isStandaloneTeacher) return;

  const matchingClasses = await Class.find({
    schoolId: toObjectId(schoolId),
    gradeId: toObjectId(gradeId),
    isDeleted: false,
  }).select('_id teacherId').lean();

  const classIds = matchingClasses.map((cls) => cls._id);
  if (classIds.length === 0) {
    throw new ForbiddenError('You are not assigned to this grade');
  }

  const isHomeroomTeacher = matchingClasses.some(
    (cls) => String(cls.teacherId) === userId,
  );
  if (isHomeroomTeacher) return;

  const teachesSubject = await Timetable.exists({
    schoolId: toObjectId(schoolId),
    teacherId: toObjectId(userId),
    subjectId: toObjectId(subjectId),
    classId: { $in: classIds },
    isDeleted: false,
  });

  if (!teachesSubject) {
    throw new ForbiddenError('You can only create papers for subjects and grades you teach');
  }
}

export async function verifyPaperRefs(
  schoolId: string,
  subjectId: string,
  gradeId: string,
  topicIds: string[],
): Promise<void> {
  const soid = toObjectId(schoolId);
  const suboid = toObjectId(subjectId);
  const groid = toObjectId(gradeId);
  const topicOids = normaliseTopicIds(topicIds);

  const [subject, grade] = await Promise.all([
    Subject.findOne({ _id: suboid, schoolId: soid, isDeleted: false }).select('gradeIds').lean(),
    Grade.findOne({ _id: groid, schoolId: soid, isDeleted: false }).select('_id').lean(),
  ]);

  if (!grade) throw new BadRequestError('Grade does not belong to this school');
  if (!subject) throw new BadRequestError('Subject does not belong to this school');

  const subjectGradeIds = (subject.gradeIds ?? []).map((id) => String(id));
  if (subjectGradeIds.length > 0 && !subjectGradeIds.includes(String(groid))) {
    throw new BadRequestError('Subject is not available for the selected grade');
  }

  const [subjectNodeIds, gradeNodeIds] = await Promise.all([
    resolveAcademicAncestor(subjectId, 'subject', soid),
    resolveAcademicAncestor(gradeId, 'grade', soid),
  ]);

  if (subjectNodeIds === null || gradeNodeIds === null) {
    throw new BadRequestError('No curriculum topics found for the selected subject and grade');
  }

  const subjectSet = new Set((subjectNodeIds ?? []).map((id) => id.toString()));
  const gradeSet = new Set((gradeNodeIds ?? []).map((id) => id.toString()));
  const constrainedIds = topicOids.filter((id) => {
    const value = id.toString();
    const subjectOk = subjectSet.size === 0 || subjectSet.has(value);
    const gradeOk = gradeSet.size === 0 || gradeSet.has(value);
    return subjectOk && gradeOk;
  });

  if (constrainedIds.length !== topicOids.length) {
    throw new BadRequestError('One or more topics do not match the selected subject and grade');
  }

  // The wizard's CurriculumTreeBrowser lets the user select topic, subtopic,
  // or outcome nodes — all three are valid "topic" inputs for paper
  // generation. Restricting to `type: 'topic'` here rejects any subtopic
  // selection with "One or more curriculum topics are unavailable".
  const visibleTopics = await CurriculumNode.countDocuments({
    _id: { $in: topicOids },
    type: { $in: ['topic', 'subtopic', 'outcome'] },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
  });
  if (visibleTopics !== topicOids.length) {
    throw new BadRequestError('One or more curriculum topics are unavailable');
  }
}

export function buildPaperSections(data: CreatePaperInput | UpdatePaperInput): {
  sections: Array<{
    title: string;
    instructions?: string;
    order: number;
    questions: IPaperQuestion[];
  }>;
  actualMarks: number;
} {
  const sections = (data.sections ?? []).map((section, sectionIndex) => {
    const questions = (section.questions ?? []).map((question, questionIndex) => ({
      questionId: question.questionId ? toObjectId(question.questionId) : null,
      questionText: question.questionText ?? null,
      options: question.options ?? [],
      marks: question.marks,
      position: questionIndex,
      modelAnswer: question.modelAnswer ?? null,
      markingGuideline: question.markingGuideline ?? null,
      diagram: question.diagram
        ? {
            tikz: question.diagram.tikz,
            caption: question.diagram.caption ?? null,
            svgUrl: null,
            renderStatus: 'pending' as const,
          }
        : null,
      curriculumNodeId: question.curriculumNodeId ? toObjectId(question.curriculumNodeId) : null,
      capsLevel: question.capsLevel ?? null,
      tagFrom: question.curriculumNodeId || question.capsLevel ? ('teacher' as const) : null,
    }));

    return {
      title: section.title,
      instructions: section.instructions,
      order: sectionIndex,
      questions,
    };
  });

  const actualMarks = sections.reduce(
    (sum, section) => sum + section.questions.reduce((total, question) => total + question.marks, 0),
    0,
  );

  return { sections, actualMarks };
}

/** Every topic a section payload names must be one the school can see. */
export async function assertSectionNodes(sections: Array<{ questions: IPaperQuestion[] }>, schoolId: string): Promise<void> {
  for (const node of sections.flatMap((s) => s.questions.map((q) => q.curriculumNodeId)).filter(Boolean)) {
    await assertVisibleNode(String(node), schoolId);
  }
}
