import mongoose from 'mongoose';
import { HomeworkService } from '../Homework/service.js';
import { generateAIQuestions } from '../QuestionBank/service-questions-generation.js';
import { resolveSubjectGradeForLesson } from './service-materials-helpers.js';
import type { ILesson } from './types.js';
import type { AddMaterialInput } from './validation.js';

interface BuildHomeworkArgs {
  lesson: ILesson;
  schoolId: string;
  teacherId: string;
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
  const { lesson, schoolId, teacherId, input, cleanupIds } = args;

  if (input.existingHomeworkId) {
    return new mongoose.Types.ObjectId(input.existingHomeworkId);
  }

  const aiPayload = input.createPayload as Record<string, unknown> | undefined;
  if (aiPayload && aiPayload.aiGenerate === true) {
    return await aiGenerateHomework({ lesson, schoolId, teacherId, input, cleanupIds });
  }

  // Manual quick-create path. Lesson must be assigned to at least one
  // class — Homework is class-scoped.
  const firstAssignment = lesson.assignedClasses?.[0];
  if (!firstAssignment) {
    throw new Error(
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
    throw new Error(
      'Assign this lesson to a class first — homework needs an audience',
    );
  }
  const { subjectId, gradeId } = await resolveSubjectGradeForLesson(lesson);
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
