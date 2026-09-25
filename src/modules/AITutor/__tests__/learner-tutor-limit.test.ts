// src/modules/AITutor/__tests__/learner-tutor-limit.test.ts
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { AIService } from '../../../services/ai.service.js';
import { AIUsage } from '../../subscription/ai-usage.model.js';
import { School } from '../../School/model.js';
import { User } from '../../Auth/model.js';
import { Student } from '../../Student/model.js';
import { Subject } from '../../Academic/model.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { cleanUpClassrooms, standaloneClassroom, trackSchool, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';

const oid = () => new mongoose.Types.ObjectId();
const usage = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
const message = (extra: Record<string, unknown> = {}) => ({ subjectId: String(oid()), subjectName: 'Mathematics', grade: 10, message: 'Explain slope.', ...extra });

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterEach(() => { vi.restoreAllMocks(); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

/** The tutor only teaches a subject of the learner's school (student-context.ts resolveSubject). */
async function subjectIn(schoolId: mongoose.Types.ObjectId): Promise<string> {
  const _id = oid();
  await Subject.collection.insertOne({ _id, schoolId, name: 'Mathematics', code: `M${_id.toString().slice(-5)}`, gradeIds: [], isDeleted: false });
  return String(_id);
}

const learnerRows = (room: Classroom) => AIUsage.countDocuments({ schoolId: room.schoolId, scope: 'learner' });
const spend = (room: Classroom, l: Learner, n: number) =>
  AIUsage.insertMany(Array.from({ length: n }, () => ({ schoolId: room.schoolId, userId: l.userId, action: 'tutor_message', scope: 'learner' })));

async function thaboIn(): Promise<{ room: Classroom; thabo: Learner }> {
  const room = await standaloneClassroom();
  return { room, thabo: await room.learner('Thabo', room.maths.id) };
}

describe('each send path counts one learner message', () => {
  it('chat, photo, stream and practice generation', async () => {
    const { room, thabo } = await thaboIn();
    vi.spyOn(AIService, 'generateChatCompletionWithUsage').mockResolvedValue({ text: 'Slope is rise over run.', usage });
    vi.spyOn(AIService, 'generateVisionCompletionWithImages').mockResolvedValue({ text: 'That graph rises.', usage });
    vi.spyOn(AIService, 'streamChatCompletion').mockImplementation(async (_s, _m, onDelta) => { onDelta('Hi'); return { text: 'Hi', usage }; });
    vi.spyOn(AIService, 'generateJSONWithUsage').mockResolvedValue({
      data: Array.from({ length: 3 }, (_, i) => ({ questionText: `${i} + 2 = ?`, questionType: 'mcq', options: [`${i + 1}`, `${i + 2}`, `${i + 3}`, `${i + 4}`], correctAnswer: `${i + 2}`, explanation: 'Adding.', marks: 1 })), usage,
    });
    const auth = { Authorization: `Bearer ${thabo.token}` };
    const subjectId = await subjectIn(room.schoolId);

    expect((await request(app).post('/api/ai-tutor/chat').set(auth).send(message({ subjectId }))).status).toBe(201);
    expect((await request(app).post('/api/ai-tutor/chat').set(auth).send(message({ subjectId, image: { mediaType: 'image/png', base64: 'aGVsbG8=' } }))).status).toBe(201);
    const stream = await request(app).post('/api/ai-tutor/chat/stream').set(auth).send(message({ subjectId }));
    expect(stream.text).toContain('event: done');
    const [system, sent] = vi.mocked(AIService.streamChatCompletion).mock.calls[0]!;
    expect((system as Array<{ cache_control?: unknown }>)[0]?.cache_control).toEqual({ type: 'ephemeral' });
    expect(JSON.stringify((sent as Array<{ content: unknown }>).at(-1)?.content)).toContain('recent academic performance');
    expect((await request(app).post('/api/ai-tutor/practice').set(auth)
      .send({ subjectId, subjectName: 'Mathematics', grade: 10, topic: 'Algebra', questionCount: 3, difficulty: 'easy', questionTypes: ['mcq'] })).status).toBe(201);

    expect(await learnerRows(room)).toBe(4);
    expect(await AIUsage.countDocuments({ schoolId: room.schoolId, scope: { $ne: 'learner' } })).toBe(0);
  }, 20_000); // four round trips through the app; the 5 s default is tight when the whole suite runs
});

describe('a learner at their limit', () => {
  it('is refused on chat before any AI call', async () => {
    const { room, thabo } = await thaboIn();
    await spend(room, thabo, 60);
    const ai = vi.spyOn(AIService, 'generateChatCompletionWithUsage');
    const res = await request(app).post('/api/ai-tutor/chat').set('Authorization', `Bearer ${thabo.token}`).send(message());
    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({ code: 'LEARNER_AI_LIMIT', details: { used: 60, limit: 60, scope: 'learner' } });
    expect(ai).not.toHaveBeenCalled();
  });

  it('gets a JSON 402 from the stream, not an event stream', async () => {
    const { room, thabo } = await thaboIn();
    await spend(room, thabo, 60);
    const ai = vi.spyOn(AIService, 'streamChatCompletion');
    const res = await request(app).post('/api/ai-tutor/chat/stream').set('Authorization', `Bearer ${thabo.token}`).send(message());
    expect(res.status).toBe(402);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.code).toBe('LEARNER_AI_LIMIT');
    expect(ai).not.toHaveBeenCalled();
  });
});

describe('refusals on every learner send path (release review M6)', () => {
  it('refuses practice generation and a photo at the cap, before any AI call', async () => {
    const { room, thabo } = await thaboIn();
    await spend(room, thabo, 60);
    const subjectId = await subjectIn(room.schoolId);
    const vision = vi.spyOn(AIService, 'generateVisionCompletionWithImages');
    const json = vi.spyOn(AIService, 'generateJSONWithUsage');
    const auth = { Authorization: `Bearer ${thabo.token}` };

    const photo = await request(app).post('/api/ai-tutor/chat').set(auth)
      .send(message({ subjectId, image: { mediaType: 'image/png', base64: 'aGVsbG8=' } }));
    expect(photo.status).toBe(402);
    expect(photo.body).toMatchObject({ code: 'LEARNER_AI_LIMIT', details: { scope: 'learner' } });
    const practice = await request(app).post('/api/ai-tutor/practice').set(auth)
      .send({ subjectId, subjectName: 'Mathematics', grade: 10, topic: 'Algebra', questionCount: 3, difficulty: 'easy', questionTypes: ['mcq'] });
    expect(practice.status).toBe(402);
    expect(practice.body).toMatchObject({ code: 'LEARNER_AI_LIMIT', details: { scope: 'learner' } });
    expect(vision).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(await learnerRows(room)).toBe(60);
  });

  it("refuses a learner under their own cap once the class pool is used (scope 'class')", async () => {
    const { room, thabo } = await thaboIn();
    const lebo = await room.learner('Lebo', room.maths.id);
    const zola = await room.learner('Zola', room.maths.id);
    await spend(room, lebo, 50);
    await spend(room, zola, 50);
    const ai = vi.spyOn(AIService, 'generateChatCompletionWithUsage');
    const res = await request(app).post('/api/ai-tutor/chat').set('Authorization', `Bearer ${thabo.token}`)
      .send(message({ subjectId: await subjectIn(room.schoolId) }));
    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({ code: 'LEARNER_AI_LIMIT', details: { used: 100, limit: 100, scope: 'class' } });
    expect(ai).not.toHaveBeenCalled();
  });
});

describe('does not count a stream that fails (Review Focus 3)', () => {
  it('records nothing when the AI call errors mid-stream', async () => {
    const { room, thabo } = await thaboIn();
    vi.spyOn(AIService, 'streamChatCompletion').mockRejectedValue(new Error('overloaded'));
    const res = await request(app).post('/api/ai-tutor/chat/stream').set('Authorization', `Bearer ${thabo.token}`).send(message());
    expect(res.text).toContain('event: error');
    expect(await learnerRows(room)).toBe(0);
  });
});

describe('school learners (unchanged)', () => {
  it('are never limited or recorded', async () => {
    const schoolId = oid();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false, modulesEnabled: ['ai_tools'] });
    const userId = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: 'Kea', lastName: 'S', email: `lp-kea-${userId}@test.local`, role: 'student', isActive: true, isDeleted: false });
    await Student.collection.insertOne({ schoolId, userId, classId: oid(), gradeId: oid(), subjectClassIds: [], admissionNumber: `K-${userId}`, isDeleted: false });
    vi.spyOn(AIService, 'generateChatCompletionWithUsage').mockResolvedValue({ text: 'Sure.', usage });
    const token = signTestToken({ id: userId, schoolId, role: 'student', isStandaloneTeacher: false, isSchoolPrincipal: false });
    const subjectId = await subjectIn(schoolId);
    expect((await request(app).post('/api/ai-tutor/chat').set('Authorization', `Bearer ${token}`).send(message({ subjectId }))).status).toBe(201);
    expect(await AIUsage.countDocuments({ schoolId })).toBe(0);
  });
});
