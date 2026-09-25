import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

// A failed AI call reaches the error handler as an AppError with a stable
// code. It must come back with its own status, message and code, and be
// logged in production too (the handler used to log only in development).
const log = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('../../common/logger.js', () => ({ logger: log }));
vi.mock('../../config/env.js', () => ({ config: { nodeEnv: 'production' } }));

import { AppError } from '../../common/errors.js';
import { errorHandler } from '../errorHandler.js';

function fakeRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) { res.statusCode = code; return res; },
    json(body: unknown) { res.body = body; return res; },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

const req = { method: 'POST', originalUrl: '/api/ai-tools/mark?learner=Thandi', body: { answer: 'learner text' } } as unknown as Request;
const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
  log.warn.mockReset();
  log.error.mockReset();
});

describe('errorHandler with AI errors', () => {
  it.each([
    ['AI_BUSY', 503, 'The AI is busy right now. Try again in a minute.'],
    ['AI_UNAVAILABLE', 503, "The AI service isn't reachable right now. Try again in a few minutes."],
    ['AI_REQUEST_REJECTED', 502, "The AI couldn't process this request. Try again, and tell your administrator if it keeps happening."],
    ['AI_NOT_CONFIGURED', 503, "AI isn't set up on this server yet."],
    ['AI_AUDIO_UNSUPPORTED', 501, "Audio transcription isn't available yet."],
  ])('returns %s as HTTP %i with its plain message and code', (code, status, message) => {
    const res = fakeRes();
    errorHandler(new AppError(message, status, true, { code }), req, res, next);
    expect(res.statusCode).toBe(status);
    expect(res.body).toMatchObject({ success: false, error: message, code });
  });

  it('logs a 5xx AppError in production with route and code, but not the request body', () => {
    errorHandler(new AppError('The AI is busy right now. Try again in a minute.', 503, true, { code: 'AI_BUSY' }), req, fakeRes(), next);
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toMatchObject({
      code: 'AI_BUSY',
      statusCode: 503,
      method: 'POST',
      route: '/api/ai-tools/mark',
    });
    expect(JSON.stringify(log.warn.mock.calls)).not.toContain('learner text');
    expect(JSON.stringify(log.warn.mock.calls)).not.toContain('Thandi');
  });

  it('does not log ordinary 4xx AppErrors in production', () => {
    errorHandler(new AppError('Not found', 404), req, fakeRes(), next);
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });
});
