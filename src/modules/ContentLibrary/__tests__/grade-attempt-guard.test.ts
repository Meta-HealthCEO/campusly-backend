// src/modules/ContentLibrary/__tests__/grade-attempt-guard.test.ts
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { AIService } from '../../../services/ai.service.js';
import { School } from '../../School/model.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { cleanUpClassrooms, standaloneClassroom, trackSchool } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterEach(() => { vi.restoreAllMocks(); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const attempt = (token: string, body: Record<string, unknown>) =>
  request(app).post('/api/content-library/grade-attempt').set('Authorization', `Bearer ${token}`).send(body);
const body = { blockContent: 'Explain photosynthesis.', blockType: 'short_answer', response: 'Plants make food from light.' };

describe('POST /api/content-library/grade-attempt', () => {
  it("refuses a standalone teacher's learner before any AI call", async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const ai = vi.spyOn(AIService, 'generateCompletion');
    expect((await attempt(thabo.token, body)).status).toBe(403);
    expect(ai).not.toHaveBeenCalled();
  });

  it('validates the body with length caps, and still grades for a school learner', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false });
    const token = signTestToken({ id: new mongoose.Types.ObjectId(), schoolId, role: 'student', isStandaloneTeacher: false, isSchoolPrincipal: false });
    expect((await attempt(token, { ...body, response: 'x'.repeat(4001) })).status).toBe(400);
    expect((await attempt(token, { ...body, response: '   ' })).status).toBe(400);
    expect((await attempt(token, { ...body, extra: true })).status).toBe(400);
    vi.spyOn(AIService, 'generateCompletion').mockResolvedValue('{"correct":true,"score":1,"feedback":"Yes."}');
    const ok = await attempt(token, body);
    expect(ok.status).toBe(200);
    expect(ok.body.data).toMatchObject({ correct: true, score: 1 });
  });
});
