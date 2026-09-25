import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The real Anthropic SDK runs here; only the network (global fetch) is faked.
// That proves how many HTTP attempts one AIService call makes, and what the
// learner gets back when they all fail.
const log = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('../../common/logger.js', () => ({ logger: log }));
vi.mock('../../config/env.js', () => ({
  config: { anthropic: { apiKey: 'sk-ant-test-secret', model: 'claude-sonnet-5' } },
}));

import { AIService, AI_MAX_RETRIES } from '../ai.service.js';

const PROMPT = 'Learner Thandi wrote: my secret essay text';

function errorResponse(status: number, type: string): Response {
  return new Response(JSON.stringify({ type: 'error', error: { type, message: 'nope' } }), {
    status,
    headers: {
      'content-type': 'application/json',
      'request-id': `req_${status}`,
      'retry-after-ms': '0', // no backoff wait in tests
    },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  log.warn.mockReset();
  log.error.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AIService retries: one layer (the SDK), not ours stacked on top', () => {
  it('uses the SDK retry count of 2', () => {
    expect(AI_MAX_RETRIES).toBe(2);
  });

  it('attempts a 429 at most maxRetries + 1 times, then says the AI is busy', async () => {
    fetchMock.mockImplementation(async () => errorResponse(429, 'rate_limit_error'));
    await expect(AIService.generateCompletion('sys', PROMPT)).rejects.toMatchObject({
      statusCode: 503,
      code: 'AI_BUSY',
      message: 'The AI is busy right now. Try again in a minute.',
    });
    expect(fetchMock).toHaveBeenCalledTimes(AI_MAX_RETRIES + 1);
  });

  it('attempts a 529 overloaded at most maxRetries + 1 times', async () => {
    fetchMock.mockImplementation(async () => errorResponse(529, 'overloaded_error'));
    await expect(AIService.generateChatCompletionWithUsage('sys', [{ role: 'user', content: PROMPT }]))
      .rejects.toMatchObject({ code: 'AI_BUSY', statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(AI_MAX_RETRIES + 1);
  });

  it('attempts a 500 at most maxRetries + 1 times, then says the AI is unavailable', async () => {
    fetchMock.mockImplementation(async () => errorResponse(500, 'api_error'));
    await expect(AIService.generateVisionCompletion('sys', PROMPT, 'aGk=', 'image/png'))
      .rejects.toMatchObject({ code: 'AI_UNAVAILABLE', statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(AI_MAX_RETRIES + 1);
  });

  it('does not retry a 400 (the same request would fail the same way)', async () => {
    fetchMock.mockImplementation(async () => errorResponse(400, 'invalid_request_error'));
    await expect(AIService.generateDocumentCompletion('sys', PROMPT, 'aGk=', 'application/pdf'))
      .rejects.toMatchObject({ code: 'AI_REQUEST_REJECTED', statusCode: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps a 401 to AI_NOT_CONFIGURED without retrying', async () => {
    fetchMock.mockImplementation(async () => errorResponse(401, 'authentication_error'));
    await expect(AIService.generateJSON('sys', PROMPT))
      .rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED', statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a 429 on the streaming path the same way, then says the AI is busy', async () => {
    fetchMock.mockImplementation(async () => errorResponse(429, 'rate_limit_error'));
    await expect(
      AIService.streamChatCompletion('sys', [{ role: 'user', content: PROMPT }], () => undefined),
    ).rejects.toMatchObject({ code: 'AI_BUSY', statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(AI_MAX_RETRIES + 1);
  });

  it('logs the failure once, with request id, model and path, but never the prompt or the key', async () => {
    fetchMock.mockImplementation(async () => errorResponse(400, 'invalid_request_error'));
    await expect(AIService.generateCompletion('sys', PROMPT)).rejects.toBeDefined();
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error.mock.calls[0][0]).toMatchObject({
      aiPath: 'generateCompletion',
      model: 'claude-sonnet-5',
      status: 400,
      requestId: 'req_400',
    });
    const logged = JSON.stringify([...log.error.mock.calls, ...log.warn.mock.calls]);
    expect(logged).not.toContain('Thandi');
    expect(logged).not.toContain('secret essay');
    expect(logged).not.toContain('sk-ant-test-secret');
  });
});

describe('AIService audio', () => {
  it('fails fast with AI_AUDIO_UNSUPPORTED (501) and never calls the API', async () => {
    await expect(
      AIService.generateAudioCompletion('sys', 'transcribe', 'aGk=', 'audio/mp4'),
    ).rejects.toMatchObject({
      statusCode: 501,
      code: 'AI_AUDIO_UNSUPPORTED',
      message: "Audio transcription isn't available yet.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
