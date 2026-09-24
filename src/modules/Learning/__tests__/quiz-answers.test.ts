import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { LearningController } from '../controller.js';
import { LearningService } from '../service.js';
import type { IQuiz } from '../model.js';

const quiz = {
  _id: 'q1',
  title: 'Fractions',
  questions: [{
    questionText: 'What is half of 10?',
    questionType: 'mcq',
    options: [{ text: '5', isCorrect: true }, { text: '2', isCorrect: false }],
    correctAnswer: '5',
    points: 1,
    explanation: 'Half means divide by 2.',
  }],
} as unknown as IQuiz;

function call(handler: (req: Request, res: Response) => Promise<void>, role: string) {
  const json = vi.fn();
  const req = { user: { id: 'u1', role, schoolId: 's1' }, params: { id: 'q1' }, query: {} } as unknown as Request;
  return handler(req, { json } as unknown as Response).then(() => json.mock.calls[0][0].data);
}

afterEach(() => vi.restoreAllMocks());

describe('Learning quizzes never show a learner the answers', () => {
  it('GET /learning/quizzes/:id hides the right answers from a student or parent', async () => {
    vi.spyOn(LearningService, 'getQuiz').mockResolvedValue(quiz);
    for (const role of ['student', 'parent']) {
      const data = await call(LearningController.getQuiz, role);
      expect(data.questions[0]).toEqual({ questionText: 'What is half of 10?', questionType: 'mcq', options: [{ text: '5' }, { text: '2' }], points: 1 });
    }
  });

  it('GET /learning/quizzes hides the right answers from a student', async () => {
    vi.spyOn(LearningService, 'listQuizzes').mockResolvedValue({ data: [quiz], total: 1, page: 1, limit: 20, totalPages: 1 });
    const data = await call(LearningController.listQuizzes, 'student');
    expect(data.data[0].questions[0].options).toEqual([{ text: '5' }, { text: '2' }]);
    expect(data.data[0].questions[0]).not.toHaveProperty('correctAnswer');
  });

  it('staff still see the answers', async () => {
    vi.spyOn(LearningService, 'getQuiz').mockResolvedValue(quiz);
    const data = await call(LearningController.getQuiz, 'teacher');
    expect(data.questions[0].correctAnswer).toBe('5');
    expect(data.questions[0].options[0].isCorrect).toBe(true);
  });
});
