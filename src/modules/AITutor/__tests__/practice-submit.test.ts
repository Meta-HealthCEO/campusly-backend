import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { AIService } from '../../../services/ai.service.js';
import { PracticeAttempt } from '../model.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';

// Submitting a practice set asks the AI to mark each short answer, so the
// request is bounded (release review I1): at most 20 answers of at most 2000
// characters, each for a question in the set and only once, and one submit
// per attempt at a time.

type Oid = mongoose.Types.ObjectId;

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterEach(() => { vi.restoreAllMocks(); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

async function attemptFor(room: Classroom, learner: Learner, questions = 3): Promise<Oid> {
  const attempt = await PracticeAttempt.create({
    schoolId: room.schoolId, studentId: learner.userId, subjectId: new mongoose.Types.ObjectId(), topic: 'Waves', grade: 10,
    questions: Array.from({ length: questions }, (_, i) => ({
      questionText: `Question ${i}`, questionType: 'short_answer', correctAnswer: 'A wave', explanation: 'Because.', marks: 1,
    })),
    totalMarks: questions,
  });
  return attempt._id as Oid;
}

const submit = (learner: Learner, attemptId: Oid, answers: Array<{ questionIndex: number; answer: string }>) =>
  request(app).post('/api/ai-tutor/practice/submit').set('Authorization', `Bearer ${learner.token}`)
    .send({ attemptId: String(attemptId), answers });

const graded = () => vi.spyOn(AIService, 'generateJSONWithUsage').mockResolvedValue({
  data: { marksAwarded: 1, isCorrect: true, feedback: 'Yes.' },
  usage: { input_tokens: 1, output_tokens: 1 },
} as never);

describe('POST /api/ai-tutor/practice/submit is bounded', () => {
  it('refuses more than 20 answers, an answer over 2000 characters, and a question answered twice', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const id = await attemptFor(room, thabo, 3);
    const ai = graded();
    expect((await submit(thabo, id, Array.from({ length: 21 }, (_, i) => ({ questionIndex: i % 3, answer: 'x' })))).status).toBe(400);
    expect((await submit(thabo, id, [{ questionIndex: 0, answer: 'x'.repeat(2001) }])).status).toBe(400);
    expect((await submit(thabo, id, [{ questionIndex: 0, answer: 'a' }, { questionIndex: 0, answer: 'b' }])).status).toBe(400);
    expect(ai).not.toHaveBeenCalled();
  });

  it('refuses an answer to a question that is not in the set', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const id = await attemptFor(room, thabo, 3);
    const ai = graded();
    const res = await submit(thabo, id, [{ questionIndex: 0, answer: 'a' }, { questionIndex: 3, answer: 'b' }]);
    expect(res.status).toBe(400);
    expect(ai).not.toHaveBeenCalled();
    expect((await PracticeAttempt.findById(id).lean())?.completedAt).toBeUndefined();
  });

  it('marks one submit at a time: a second concurrent submit is refused with 409, and each answer is marked once', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const id = await attemptFor(room, thabo, 2);
    const ai = vi.spyOn(AIService, 'generateJSONWithUsage').mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 150));
      return { data: { marksAwarded: 1, isCorrect: true, feedback: 'Yes.' }, usage: { input_tokens: 1, output_tokens: 1 } } as never;
    });
    const answers = [{ questionIndex: 0, answer: 'a wave' }, { questionIndex: 1, answer: 'a wave' }];
    const [first, second] = await Promise.all([submit(thabo, id, answers), submit(thabo, id, answers)]);
    expect([first.status, second.status].sort()).toEqual([200, 409]);
    expect(ai).toHaveBeenCalledTimes(2);
    const saved = await PracticeAttempt.findById(id).lean();
    expect(saved?.score).toBe(2);
    expect(saved?.completedAt).toBeTruthy();
    expect((await submit(thabo, id, answers)).status).toBe(400);
  });
});
