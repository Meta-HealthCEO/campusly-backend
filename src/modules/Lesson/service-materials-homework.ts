import mongoose from 'mongoose';
import { BadRequestError } from '../../common/errors.js';
import { Homework } from '../Homework/model.js';
import { HomeworkService } from '../Homework/service.js';
import { Class } from '../Academic/model.js';
import { generateAIQuestions } from '../QuestionBank/service-questions-generation.js';
import { resolveSubjectGradeForLesson } from './service-materials-helpers.js';
import type { ILesson } from './types.js';
import type { AddMaterialInput } from './validation.js';
import {
  ownerFilterForScope,
  schoolObjectId,
  toObjectId,
  type LessonActor,
} from './service-access.js';

interface BuildHomeworkArgs {
  lesson: ILesson;
  schoolId: string;
  teacherId: string;
  actor: LessonActor;
  input: Extract<AddMaterialInput, { kind: 'homework' }>;
  cleanupIds: mongoose.Types.ObjectId[];
}

/**
 * Resolve the homework subdoc reference for a lesson material:
 * 1. existingHomeworkId — link path
 * 2. createPayload.aiGenerate — AI-generate questions + create exercise homework
 * 3. createPayload — manual quick-create (existing v1 path)
 *
 * Pushes any newly-created Question/Homework ids onto cleanupIds so the
 * outer addMaterial try/catch can compensate on lesson-write failure.
 */
export async function buildHomeworkRef(
  args: BuildHomeworkArgs,
): Promise<mongoose.Types.ObjectId> {
  const { lesson, schoolId, teacherId, actor, input, cleanupIds } = args;

  if (input.existingHomeworkId) {
    const homeworkId = toObjectId(input.existingHomeworkId, 'homeworkId');
    const ok = await Homework.exists({
      _id: homeworkId,
      schoolId: schoolObjectId(actor),
      isDeleted: false,
      ...ownerFilterForScope(actor, 'teacherId'),
    });
    if (!ok) throw new BadRequestError('Homework is not available for this lesson');
    return homeworkId;
  }

  const aiPayload = input.createPayload as Record<string, unknown> | undefined;
  if (aiPayload && aiPayload.aiGenerate === true) {
    return await aiGenerateHomework({ lesson, schoolId, teacherId, actor, input, cleanupIds });
  }

  // Manual quick-create path. Lesson must be assigned to at least one
  // class — Homework is class-scoped.
  const firstAssignment = lesson.assignedClasses?.[0];
  if (!firstAssignment) {
    throw new BadRequestError(
      'Assign this lesson to at least one class before creating inline homework',
    );
  }
  const { subjectId } = await resolveSubjectGradeForLesson(lesson);
  const hw = await HomeworkService.create(
    {
      ...input.createPayload,
      schoolId,
      classId: firstAssignment.classId.toString(),
      subjectId,
    } as never,
    teacherId,
  );
  const homeworkId = hw._id as mongoose.Types.ObjectId;
  cleanupIds.push(homeworkId);
  return homeworkId;
}

async function aiGenerateHomework(
  args: BuildHomeworkArgs,
): Promise<mongoose.Types.ObjectId> {
  const { lesson, schoolId, teacherId, input, cleanupIds } = args;
  const firstAssignment = lesson.assignedClasses?.[0];
  if (!firstAssignment) {
    throw new BadRequestError(
      'Assign this lesson to a class first — homework needs an audience',
    );
  }
  const { subjectId } = await resolveSubjectGradeForLesson(lesson);
  // Resolve gradeId from the CLASS (not the lesson). HomeworkService.create
  // validates exercise questions against the class's gradeId, so the
  // generation and validation paths must agree — otherwise every question
  // is rejected as "unavailable" when the lesson and class live in
  // different grade namespaces (e.g. imported lesson + local class).
  const classDoc = await Class.findOne({
    _id: firstAssignment.classId,
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  })
    .select('gradeId')
    .lean<{ gradeId: mongoose.Types.ObjectId } | null>();
  if (!classDoc) throw new BadRequestError('Assigned class not found');
  const gradeId = classDoc.gradeId.toString();
  const aiPayload = input.createPayload as Record<string, unknown>;
  const count = typeof aiPayload.aiCount === 'number' ? aiPayload.aiCount : 5;
  const topicHint =
    typeof aiPayload.topicHint === 'string'
      ? aiPayload.topicHint
      : (input.teacherNotes ?? input.title);
  const questionIds = await generateAIQuestions({
    count,
    questionTypes: ['mcq', 'short_answer'],
    cognitiveLevel: 'application',
    difficulty: 'medium',
    topicHint,
    schoolId,
    teacherId,
    subjectId,
    gradeId,
    curriculumNodeId: lesson.curriculumNodeId.toString(),
  });
  cleanupIds.push(...questionIds);
  const dueDate = typeof aiPayload.dueDate === 'string'
    ? aiPayload.dueDate
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const totalMarks = typeof aiPayload.totalMarks === 'number'
    ? aiPayload.totalMarks
    : count * 2;
  const hw = await HomeworkService.create(
    {
      type: 'exercise',
      title: input.title,
      schoolId,
      classId: firstAssignment.classId.toString(),
      subjectId,
      dueDate,
      totalMarks,
      exerciseQuestionIds: questionIds.map((id) => id.toString()),
      latePolicy: 'block',
      gradebookAutoPublish: true,
    } as never,
    teacherId,
  );
  const homeworkId = hw._id as mongoose.Types.ObjectId;
  cleanupIds.push(homeworkId);
  return homeworkId;
}
