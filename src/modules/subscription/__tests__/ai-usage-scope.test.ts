// src/modules/subscription/__tests__/ai-usage-scope.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AIUsage } from '../ai-usage.model.js';
import { aiAllowance } from '../ai-allowance.js';
import { cleanUpClassrooms, standaloneClassroom } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

describe("the teacher's AI allowance counts only the teacher's own actions", () => {
  it('ignores learner tutor rows and still counts rows written before scope existed', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await AIUsage.insertMany(Array.from({ length: 25 }, () => ({ schoolId: room.schoolId, userId: thabo.userId, action: 'tutor_message', scope: 'learner' })));
    await AIUsage.create({ schoolId: room.schoolId, userId: room.teacherId, action: 'paper' });
    await AIUsage.collection.insertOne({ schoolId: room.schoolId, userId: room.teacherId, action: 'memo', meta: {}, createdAt: new Date(), updatedAt: new Date() });
    expect((await aiAllowance(String(room.schoolId))).used).toBe(2);
    expect((await AIUsage.findOne({ action: 'paper', schoolId: room.schoolId }).lean())?.scope).toBe('teacher');
  });
});
