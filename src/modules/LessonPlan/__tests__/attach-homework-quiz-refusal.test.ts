import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { LessonPlanService } from '../service.js';
import { LessonPlan } from '../model.js';
import type { CreateHomeworkInput } from '../../Homework/validation.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

// The LessonPlan module isn't mounted in app.ts (unreachable over HTTP), but
// attachHomeworkToLessonPlan writes Homework directly with Homework.create()
// instead of going through HomeworkService.create() — so it must carry its
// own copy of the "one quiz system" refusal, or a future caller (mounting
// the module, or calling the service directly) could still create retired
// quiz-type homework.
describe('LessonPlanService.attachHomeworkToLessonPlan', () => {
  async function plan() {
    const schoolId = oid();
    const teacherId = oid();
    const classId = oid();
    const subjectId = oid();
    const p = await LessonPlan.create({
      teacherId, schoolId, subjectId, classId,
      curriculumTopicId: oid(),
      date: new Date(),
      topic: 'Fractions',
    });
    return { planId: String(p._id), schoolId: String(schoolId), teacherId: String(teacherId), classId: String(classId), subjectId: String(subjectId) };
  }

  it('refuses to attach quiz-type homework, same message as HomeworkService.create', async () => {
    const f = await plan();
    const input = {
      type: 'quiz',
      quizId: String(oid()),
      title: 'Old-style quiz homework',
      subjectId: f.subjectId,
      classId: f.classId,
      schoolId: f.schoolId,
      dueDate: new Date().toISOString(),
      totalMarks: 10,
      latePolicy: 'block',
      gradebookAutoPublish: true,
    } as unknown as CreateHomeworkInput;

    await expect(
      LessonPlanService.attachHomeworkToLessonPlan(f.planId, f.schoolId, input, f.teacherId, 'teacher'),
    ).rejects.toThrow('Quiz homework is now an exercise: pick questions from the question bank.');
  });

  it('still attaches non-quiz homework (the refusal is quiz-only)', async () => {
    const f = await plan();
    const input = {
      type: 'exercise',
      exerciseQuestionIds: [String(oid())],
      title: 'Fractions practice',
      subjectId: f.subjectId,
      classId: f.classId,
      schoolId: f.schoolId,
      dueDate: new Date().toISOString(),
      totalMarks: 10,
      latePolicy: 'block',
      gradebookAutoPublish: true,
    } as unknown as CreateHomeworkInput;

    const hw = await LessonPlanService.attachHomeworkToLessonPlan(f.planId, f.schoolId, input, f.teacherId, 'teacher');
    expect(hw.title).toBe('Fractions practice');
    const reloaded = await LessonPlan.findById(f.planId).lean();
    expect(reloaded?.homeworkIds.map(String)).toContain(String(hw._id));
  });
});
