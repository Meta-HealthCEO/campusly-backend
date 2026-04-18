import mongoose from 'mongoose';
import { ILessonPlan } from './model.js';
import { Homework } from '../Homework/model.js';
import type { CreateHomeworkInput } from '../Homework/validation.js';
import { BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import {
  LessonPlanService,
  verifyRefs,
  assertTopicMatchesClassGrade,
} from './service.js';

/**
 * Attempt to soft-delete every created homework record. Logs (never throws) on failure
 * so the caller's original error continues to propagate. Keeps ops-visible breadcrumbs
 * for any orphan records.
 */
async function rollbackStagedHomework(
  createdHomeworkIds: mongoose.Types.ObjectId[],
  originalErr: unknown,
  context: string,
): Promise<void> {
  if (!createdHomeworkIds.length) return;
  try {
    await Homework.updateMany(
      { _id: { $in: createdHomeworkIds } },
      { $set: { isDeleted: true } },
    );
  } catch (rollbackErr: unknown) {
    logger.error(
      { rollbackErr, createdHomeworkIds: createdHomeworkIds.map(String), originalErr },
      `Failed to rollback staged homework (${context}) — orphan records may exist`,
    );
  }
}

/**
 * Create a lesson plan together with staged homework records.
 * Compensation flow (MongoDB is standalone — no transactions available):
 *   0. Validate plan shape AND multi-tenancy of each staged homework up-front.
 *   1. Create all staged homework docs.
 *   2. Create the lesson plan referencing those homework IDs.
 *   3. If either phase fails, soft-delete any homework rows already created.
 */
export async function createLessonPlanWithStagedHomework(
  data: Partial<ILessonPlan> & { stagedHomework?: CreateHomeworkInput[] },
  teacherId: string,
): Promise<ILessonPlan> {
  if (!data.schoolId || !data.classId || !data.subjectId) {
    throw new BadRequestError('schoolId, classId, and subjectId are required');
  }

  const staged = data.stagedHomework ?? [];

  // I6: validate plan shape BEFORE creating any homework records
  await verifyRefs(
    String(data.schoolId),
    String(data.classId),
    String(data.subjectId),
    data.curriculumTopicId ? String(data.curriculumTopicId) : undefined,
  );
  if (data.curriculumTopicId) {
    await assertTopicMatchesClassGrade(
      String(data.curriculumTopicId),
      String(data.classId),
      String(data.schoolId),
    );
  }

  // C1: multi-tenancy — each staged homework must target the same school/class/subject
  // as the lesson plan. Prevents a teacher from injecting homework into another school.
  for (const hw of staged) {
    if (String(hw.schoolId) !== String(data.schoolId)) {
      throw new BadRequestError('Staged homework must belong to the same school as the lesson plan');
    }
    if (String(hw.classId) !== String(data.classId)) {
      throw new BadRequestError('Staged homework class must match lesson plan class');
    }
    if (String(hw.subjectId) !== String(data.subjectId)) {
      throw new BadRequestError('Staged homework subject must match lesson plan subject');
    }
  }

  const createdHomeworkIds: mongoose.Types.ObjectId[] = [];

  // Phase 1: create homework records
  try {
    for (const hw of staged) {
      const doc = await Homework.create({
        ...hw,
        teacherId,
      });
      createdHomeworkIds.push(doc._id as mongoose.Types.ObjectId);
    }
  } catch (err: unknown) {
    await rollbackStagedHomework(createdHomeworkIds, err, 'phase-1 homework create');
    throw err;
  }

  // Phase 2: create the lesson plan
  try {
    const { stagedHomework: _staged, ...planData } = data;
    void _staged;
    return await LessonPlanService.createLessonPlan(
      {
        ...planData,
        homeworkIds: createdHomeworkIds as unknown as ILessonPlan['homeworkIds'],
      },
      teacherId,
    );
  } catch (err: unknown) {
    await rollbackStagedHomework(createdHomeworkIds, err, 'phase-2 plan create');
    throw err;
  }
}
