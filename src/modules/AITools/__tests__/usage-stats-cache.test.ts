import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AIUsageLog } from '../model.js';
import { getUsageStats } from '../service-queries.js';

// Tutor chat is prompt-cached, so most of its input arrives as cache reads,
// which the API does not count in input_tokens. The admin's AI usage stats
// report cache reads and writes separately and in the total (release review M2).

const schoolId = new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await AIUsageLog.deleteMany({ schoolId }); await mongoose.disconnect(); });

describe('AI usage stats with prompt caching', () => {
  it('reports cache read and write tokens per type and in the totals', async () => {
    const row = (type: string, tokensUsed: Record<string, number>) =>
      ({ schoolId, teacherId: new mongoose.Types.ObjectId(), type, tokensUsed, aiModel: 'claude-sonnet-5' });
    await AIUsageLog.create([
      row('tutor_chat', { input: 50, output: 200, cacheRead: 3000, cacheWrite: 1200 }),
      row('tutor_chat', { input: 40, output: 100, cacheRead: 4000, cacheWrite: 0 }),
      row('tutor_practice', { input: 500, output: 800 }),
    ]);

    const stats = await getUsageStats(String(schoolId));
    expect(stats).toMatchObject({
      totalCalls: 3, totalInputTokens: 590, totalOutputTokens: 1100,
      totalCacheReadTokens: 7000, totalCacheWriteTokens: 1200, totalTokens: 590 + 1100 + 7000 + 1200,
    });
    expect(stats.byType.find((t) => t.type === 'tutor_chat')).toMatchObject({
      count: 2, inputTokens: 90, outputTokens: 300, cacheReadTokens: 7000, cacheWriteTokens: 1200,
    });
    expect(stats.byType.find((t) => t.type === 'tutor_practice')).toMatchObject({ cacheReadTokens: 0, cacheWriteTokens: 0 });
  });
});
