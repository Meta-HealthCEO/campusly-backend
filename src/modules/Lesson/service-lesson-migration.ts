import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { LESSON_PHASES } from './types.js';
import { LessonPlan } from '../LessonPlan/model.js';
import type { ILessonPlan } from '../LessonPlan/model.js';
import { hasRun, markComplete } from '../../db/migrations/sentinel.js';

const MIGRATION_NAME = 'lesson-plan-to-lesson';

type LeanLessonPlan = Omit<ILessonPlan, keyof mongoose.Document> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export async function runLessonPlanToLessonMigration(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plans = await LessonPlan.find({ isDeleted: { $ne: true } }).lean<LeanLessonPlan[]>();
  if (plans.length === 0) {
    await markComplete(MIGRATION_NAME);
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
        title: 'Resource',
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
        title: 'Activity',
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

  if (lessonDocs.length > 0) {
    await Lesson.insertMany(lessonDocs, { ordered: false });
    await LessonPlan.updateMany(
      { _id: { $in: plans.map((p) => p._id) } },
      { $set: { isDeleted: true } },
    );
  }

  await markComplete(MIGRATION_NAME);
}
