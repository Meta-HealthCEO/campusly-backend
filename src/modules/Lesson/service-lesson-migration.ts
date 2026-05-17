import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { LESSON_PHASES } from './types.js';
import { LessonPlan } from '../LessonPlan/model.js';
import type { ILessonPlan } from '../LessonPlan/model.js';
import { Class } from '../Academic/model.js';
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

    // Resolve gradeId for each plan via its Class. Legacy LessonPlan documents
    // do not store gradeId, so without this lookup we'd have to fall back to
    // plan.subjectId — polluting Lesson.gradeId with a Subject _id. Bulk-fetch
    // the classes once and build a Map for O(1) lookups in the per-plan loop.
    const classIds = Array.from(
      new Set(plans.map((p) => p.classId.toString())),
    ).map((id) => new mongoose.Types.ObjectId(id));
    const classes = await Class.find(
      { _id: { $in: classIds } },
      { _id: 1, gradeId: 1 },
    ).lean<{ _id: mongoose.Types.ObjectId; gradeId: mongoose.Types.ObjectId }[]>();
    const classGradeMap = new Map<string, mongoose.Types.ObjectId>();
    for (const c of classes) {
      if (c.gradeId) classGradeMap.set(c._id.toString(), c.gradeId);
    }
    let resolvedFromClass = 0;
    let fallbackToSubject = 0;

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
          kind: 'study_notes',
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
          kind: 'study_notes',
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
      const resolvedGradeId = classGradeMap.get(plan.classId.toString());
      if (resolvedGradeId) {
        resolvedFromClass++;
      } else {
        fallbackToSubject++;
      }
      return {
        _id: plan._id,
        schoolId: plan.schoolId,
        teacherId: plan.teacherId,
        classId: plan.classId,
        subjectId: plan.subjectId,
        // Prefer the class's gradeId; fall back to subjectId only if the
        // class is missing or has no gradeId (effectively never in production).
        gradeId: resolvedGradeId ?? plan.subjectId,
        curriculumNodeId: plan.curriculumTopicId,
        title: plan.topic,
        date: lessonDate,
        durationMinutes: plan.durationMinutes ?? 45,
        objectives: plan.objectives ?? [],
        phases,
        materials,
        // Lessons whose scheduled date is already in the past were "taught",
        // and a taught lesson is by definition something students could see.
        // Stamp publishedAt with the lesson date so the audit trail matches.
        publishedAt: lessonDate >= today ? null : lessonDate,
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

    logger.info(
      { resolvedFromClass, fallbackToSubject },
      '[migrations] gradeId resolution complete',
    );
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
