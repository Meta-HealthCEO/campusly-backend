import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { Homework } from '../../Homework/model.js';
import { Quiz } from '../model.js';
import { LearningController } from '../controller.js';
import { HomeworkService } from '../../Homework/service.js';
import { HomeworkTemplateService } from '../../Homework/template.service.js';
import { addMaterial } from '../../Lesson/service-materials.js';
import { AppError } from '../../../common/errors.js';
import { QUIZ_HOMEWORK_RETIRED, QUIZ_MATERIAL_RETIRED, QUIZZES_RETIRED } from '../quiz-migration.js';

const QUIZ_ID = '64b000000000000000000001';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('the old Learning quiz is retired: nothing new is made with it', () => {
  it('POST /learning/quizzes says where quizzes are made now (410), and creates nothing', async () => {
    const before = await Quiz.countDocuments({});
    const req = { user: { id: 'u1', role: 'teacher', schoolId: 's1' }, body: { title: 'x' } } as unknown as Request;
    const err = await LearningController.createQuiz(req, { status: vi.fn(), json: vi.fn() } as unknown as Response).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ statusCode: 410, message: QUIZZES_RETIRED });
    expect(await Quiz.countDocuments({})).toBe(before);
  });

  it('quiz-type homework is refused: it is an exercise now', async () => {
    await expect(HomeworkService.create({ type: 'quiz', quizId: QUIZ_ID, schoolId: '64b000000000000000000002' } as never, '64b000000000000000000003'))
      .rejects.toThrow(QUIZ_HOMEWORK_RETIRED);
  });

  it("an old quiz homework can't be saved as a new template", async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const hw = await Homework.collection.insertOne({
      title: 'Fractions quiz', type: 'quiz', quizId: new mongoose.Types.ObjectId(QUIZ_ID), exerciseQuestionIds: [],
      subjectId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), schoolId, teacherId, isDeleted: false,
    });
    const actor = { id: String(teacherId), role: 'teacher', schoolId: String(schoolId) };
    await expect(HomeworkTemplateService.saveAsTemplate(actor as never, String(hw.insertedId))).rejects.toThrow(QUIZ_HOMEWORK_RETIRED);
  });

  it('a lesson can no longer take a quiz material', async () => {
    await expect(addMaterial('64b000000000000000000004', { id: 'u1', role: 'teacher', schoolId: '64b000000000000000000002' } as never, { kind: 'quiz', title: 'Quiz', quizId: QUIZ_ID } as never))
      .rejects.toThrow(QUIZ_MATERIAL_RETIRED);
  });

  it('says it in plain words', () => {
    expect(QUIZZES_RETIRED).toBe('Quizzes are now made from the question bank. Set homework as an exercise, or add a quick check to a course.');
    expect(QUIZ_HOMEWORK_RETIRED).toBe('Quiz homework is now an exercise: pick questions from the question bank.');
    expect(QUIZ_MATERIAL_RETIRED).toBe('Add practice questions from the question bank instead of a quiz.');
  });
});
