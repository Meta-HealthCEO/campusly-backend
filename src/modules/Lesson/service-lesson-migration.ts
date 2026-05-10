import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { LESSON_PHASES } from './types.js';
import { LessonPlan } from '../LessonPlan/model.js';
import type { ILessonPlan } from '../LessonPlan/model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'lesson-plan-to-lesson';

type LeanLessonPlan = Omit<ILessonPlan, keyof mongoose.Document> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

function truncateTitle(text: string, max = 80): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max - 1) + '…';
}

export async function runLessonPlanToLessonMigration(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] lesson-plan-to-lesson already complete, skipping');
    return;
  }

  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug(
      '[migrations] lesson-plan-to-lesson lock held by another instance, skipping',
    );
    return;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plans = await LessonPlan.find({ isDeleted: { $ne: true } }).lean<LeanLessonPlan[]>();
    if (plans.length === 0) {
      await markComplete(MIGRATION_NAME);
      logger.info(
        { migrated: 0, total: 0 },
        '[migrations] lesson-plan-to-lesson complete',
      );
      return;
    }

    const lessonDocs = plans.map((plan) => {
      const phases = LESSON_PHASES.map((phase) => ({
        phase,
        materialIds: [] as mongoose.Types.ObjectId[],
      }));
      const materials: Record<string, unknown>[] = [];
      const directIdx = phases.findIndex((p) => p.phase === 'direct_instruction');
      const practiceIdx = phases.findIndex((p) => p.phase === 'practice');
      const homeworkIdx = phases.findIndex((p) => p.phase === 'homework');

      for (const text of (plan.resources ?? []).filter((s: string) => s?.trim())) {
        const id = new mongoose.Types.ObjectId();
        materials.push({
          _id: id,
          kind: 'notes',
          title: truncateTitle(text) || 'Resource',
          teacherNotes: text,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        });
        phases[directIdx].materialIds.push(id);
      }
      for (const text of (plan.activities ?? []).filter((s: string) => s?.trim())) {
        const id = new mongoose.Types.ObjectId();
        materials.push({
          _id: id,
          kind: 'notes',
          title: truncateTitle(text) || 'Activity',
          teacherNotes: text,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        });
        phases[practiceIdx].materialIds.push(id);
      }
      for (const hwId of plan.homeworkIds ?? []) {
        const id = new mongoose.Types.ObjectId();
        materials.push({
          _id: id,
          kind: 'homework',
          title: 'Homework',
          homeworkId: hwId,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        });
        phases[homeworkIdx].materialIds.push(id);
      }

      const lessonDate = new Date(plan.date);
      return {
        _id: plan._id,
        schoolId: plan.schoolId,
        teacherId: plan.teacherId,
        classId: plan.classId,
        subjectId: plan.subjectId,
        gradeId: plan.subjectId, // best-effort fallback; will be patched by teacher on next edit
        curriculumNodeId: plan.curriculumTopicId,
        title: plan.topic,
        date: lessonDate,
        durationMinutes: plan.durationMinutes ?? 45,
        objectives: plan.objectives ?? [],
        phases,
        materials,
        status: lessonDate >= today ? 'draft' : 'taught',
        reflectionNotes: plan.reflectionNotes,
        aiGenerated: plan.aiGenerated ?? false,
        isDeleted: false,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };
    });

    // Detect Lessons that already exist (from a prior failed/partial run) so we
    // can skip them on retry instead of crashing on duplicate _id.
    const planIds = plans.map((p) => p._id);
    const existingLessons = await Lesson.find(
      { _id: { $in: planIds } },
      { _id: 1 },
    ).lean<{ _id: mongoose.Types.ObjectId }[]>();
    const existingLessonIds = new Set(existingLessons.map((d) => d._id.toString()));

    const toInsert = lessonDocs.filter(
      (d) => !existingLessonIds.has(d._id.toString()),
    );

    if (toInsert.length > 0) {
      // ordered: true → any failure aborts the run; sentinel stays as the epoch
      // placeholder, so on next boot hasRun() returns false and we retry. The
      // already-inserted Lessons will be detected above and skipped.
      await Lesson.insertMany(toInsert, { ordered: true });
    }

    // Soft-delete only the LessonPlans whose Lesson actually exists now (either
    // freshly inserted in this run or pre-existing from a prior partial run).
    const insertedIds = new Set(toInsert.map((d) => d._id.toString()));
    const deletableIds = planIds.filter(
      (id) => insertedIds.has(id.toString()) || existingLessonIds.has(id.toString()),
    );
    if (deletableIds.length > 0) {
      await LessonPlan.updateMany(
        { _id: { $in: deletableIds } },
        { $set: { isDeleted: true } },
      );
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      { migrated: toInsert.length, total: plans.length },
      '[migrations] lesson-plan-to-lesson complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error(
      { err },
      '[migrations] lesson-plan-to-lesson failed; lock released for retry',
    );
    throw err;
  }
}
