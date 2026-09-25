import { afterEach, describe, expect, it, vi } from 'vitest';

// At most 5 AI calls run at once; the rest wait their turn. The wait is
// bounded (release review I1): once AI_MAX_QUEUED calls are waiting, a new
// call is refused at once with the plain "AI is busy" error instead of
// piling up behind them.
const log = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('../../common/logger.js', () => ({ logger: log }));
vi.mock('../../config/env.js', () => ({
  config: { anthropic: { apiKey: 'sk-ant-test-secret', model: 'claude-sonnet-5' } },
}));

import { AIService, AI_MAX_QUEUED } from '../ai.service.js';

function okResponse(): Response {
  return new Response(JSON.stringify({
    id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-5',
    content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('the AI wait queue is bounded', () => {
  it(`refuses a new call with AI_BUSY once ${200} calls are waiting, and still serves the queued ones`, async () => {
    expect(AI_MAX_QUEUED).toBe(200);
    // Every request hangs until the test lets them through.
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const fetchMock = vi.fn(async () => { await gate; return okResponse(); });
    vi.stubGlobal('fetch', fetchMock);

    const running = Array.from({ length: 5 + AI_MAX_QUEUED }, () => AIService.generateCompletion('sys', 'hi'));
    await expect(AIService.generateCompletion('sys', 'one too many')).rejects.toMatchObject({ statusCode: 503, code: 'AI_BUSY' });

    release();
    const settled = await Promise.allSettled(running);
    expect(settled.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(5 + AI_MAX_QUEUED);
  }, 30_000);
});
