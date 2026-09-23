import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { UserRole } from '../../../common/enums.js';
import { Lesson } from '../model.js';
import { addMaterial } from '../service-materials.js';
import type { LessonActor } from '../service-access.js';
import { Plan, Subscription } from '../../subscription/model.js';
import { seedPlans } from '../../subscription/seed.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { FREE_PAPER_GENERATIONS } from '../../subscription/free-allowance.js';

const schools: mongoose.Types.ObjectId[] = [];

async function freeTeacherWithAllowanceUsed(isStandaloneTeacher: boolean) {
  const schoolId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();
  schools.push(schoolId);
  await Subscription.create({
    schoolId, subscriberType: 'teacher', planCode: 'free', status: 'free', retryCount: 0, gatewayProvider: 'onegate',
  });
  await AssessmentPaper.collection.insertMany(
    Array.from({ length: FREE_PAPER_GENERATIONS }, () => ({ schoolId, aiGenerated: true, isDeleted: false })),
  );
  const lesson = await Lesson.create({
    schoolId, teacherId, curriculumNodeId: new mongoose.Types.ObjectId(),
    subjectId: new mongoose.Types.ObjectId(), gradeId: new mongoose.Types.ObjectId(),
    title: 'Measures of central tendency', durationMinutes: 45, publishedAt: null, assignedClasses: [],
  });
  const actor: LessonActor = {
    id: teacherId.toString(), schoolId: schoolId.toString(), email: `${teacherId.toString()}@example.test`,
    role: UserRole.TEACHER, isStandaloneTeacher,
  };
  return { lessonId: String(lesson._id), actor };
}

const paperMaterial = {
  phase: 'assessment', kind: 'paper', title: 'Quick test', createPayload: { paperType: 'test' },
} as unknown as Parameters<typeof addMaterial>[2];

describe('AI papers created as lesson materials count against the free allowance', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await seedPlans();
  });

  afterAll(async () => {
    await Promise.all([
      Lesson.deleteMany({ schoolId: { $in: schools } }),
      Subscription.deleteMany({ schoolId: { $in: schools } }),
      AssessmentPaper.collection.deleteMany({ schoolId: { $in: schools } }),
    ]);
    await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
    await mongoose.connection.close();
  });

  it('asks a free independent teacher to upgrade once their free AI papers are used', async () => {
    const { lessonId, actor } = await freeTeacherWithAllowanceUsed(true);

    await expect(addMaterial(lessonId, actor, paperMaterial)).rejects.toMatchObject({ statusCode: 402 });
  });

  it('never applies the free allowance to school teachers', async () => {
    const { lessonId, actor } = await freeTeacherWithAllowanceUsed(false);

    const result = await addMaterial(lessonId, actor, paperMaterial).then(
      () => 'created',
      (err: { statusCode?: number }) => err.statusCode,
    );
    expect(result).not.toBe(402);
  });
});
