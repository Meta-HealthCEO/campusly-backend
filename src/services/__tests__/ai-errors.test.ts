import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from '@anthropic-ai/sdk';

const log = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('../../common/logger.js', () => ({ logger: log }));

import { AppError } from '../../common/errors.js';
import { toAIError } from '../ai-errors.js';

const CTX = { path: 'generateCompletion', model: 'claude-sonnet-5' };

/** An SDK error exactly as the SDK builds one from an HTTP error response. */
function httpError(status: number, type: string, message = 'boom'): APIError {
  return APIError.generate(
    status,
    { type: 'error', error: { type, message } },
    undefined,
    new Headers({ 'request-id': `req_${status}` }),
  );
}

/** An `event: error` frame arriving mid-stream (after a 200). */
function midStreamError(type: string): APIError {
  return new APIError(
    undefined,
    { type: 'error', error: { type, message: 'mid-stream' } },
    undefined,
    new Headers({ 'request-id': 'req_stream' }),
  );
}

beforeEach(() => {
  log.warn.mockReset();
  log.error.mockReset();
  log.info.mockReset();
});

describe('toAIError: SDK error -> plain AppError with a stable code', () => {
  it.each([
    ['429 rate limit', () => httpError(429, 'rate_limit_error'), 'AI_BUSY', 503],
    ['529 overloaded', () => httpError(529, 'overloaded_error'), 'AI_BUSY', 503],
    ['overloaded mid-stream', () => midStreamError('overloaded_error'), 'AI_BUSY', 503],
    ['500 api error', () => httpError(500, 'api_error'), 'AI_UNAVAILABLE', 503],
    ['503', () => httpError(503, 'api_error'), 'AI_UNAVAILABLE', 503],
    ['api error mid-stream', () => midStreamError('api_error'), 'AI_UNAVAILABLE', 503],
    ['connection failure', () => new APIConnectionError({ message: 'Connection error.' }), 'AI_UNAVAILABLE', 503],
    ['connection timeout', () => new APIConnectionTimeoutError(), 'AI_UNAVAILABLE', 503],
    ['400 bad request', () => httpError(400, 'invalid_request_error'), 'AI_REQUEST_REJECTED', 502],
    ['404 unknown model', () => httpError(404, 'not_found_error'), 'AI_REQUEST_REJECTED', 502],
    ['413 too large', () => httpError(413, 'request_too_large'), 'AI_REQUEST_REJECTED', 502],
    ['401 bad key', () => httpError(401, 'authentication_error'), 'AI_NOT_CONFIGURED', 503],
    ['403 no permission', () => httpError(403, 'permission_error'), 'AI_NOT_CONFIGURED', 503],
  ])('%s -> %s (%i)', (_name, make, code, status) => {
    const out = toAIError(make(), CTX);
    expect(out).toBeInstanceOf(AppError);
    expect(out).toMatchObject({ code, statusCode: status });
  });

  it('gives each code the plain message the learner sees', () => {
    expect(toAIError(httpError(429, 'rate_limit_error'), CTX)).toMatchObject({
      message: 'The AI is busy right now. Try again in a minute.',
    });
    expect(toAIError(httpError(401, 'authentication_error'), CTX)).toMatchObject({
      message: expect.stringMatching(/^AI isn't set up on this server yet\./),
    });
    const rejected = toAIError(httpError(400, 'invalid_request_error', 'temperature: not permitted'), CTX) as AppError;
    expect(rejected.message).not.toContain('temperature');
  });

  it('turns our own deadline firing into AI_UNAVAILABLE', () => {
    const out = toAIError(new APIUserAbortError(), { ...CTX, timedOut: true });
    expect(out).toMatchObject({ code: 'AI_UNAVAILABLE', statusCode: 503 });
  });

  it('leaves a caller cancellation (client went away) as it is, unlogged', () => {
    const abort = new APIUserAbortError();
    expect(toAIError(abort, CTX)).toBe(abort);
    expect(log.error).not.toHaveBeenCalled();
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('passes AppErrors and non-SDK errors through untouched', () => {
    const app = new AppError('nope', 503, true, { code: 'AI_NOT_CONFIGURED' });
    const bug = new TypeError('x is undefined');
    expect(toAIError(app, CTX)).toBe(app);
    expect(toAIError(bug, CTX)).toBe(bug);
  });
});

describe('toAIError logging', () => {
  it('logs status, error type, request id, model and calling path', () => {
    toAIError(httpError(400, 'invalid_request_error', 'temperature: Extra inputs are not permitted'), CTX);
    expect(log.error).toHaveBeenCalledTimes(1);
    const [entry] = log.error.mock.calls[0] as [Record<string, unknown>, string];
    expect(entry).toMatchObject({
      aiPath: 'generateCompletion',
      model: 'claude-sonnet-5',
      code: 'AI_REQUEST_REJECTED',
      status: 400,
      errorType: 'invalid_request_error',
      requestId: 'req_400',
    });
  });

  it('logs a busy API as a warning, with the request id', () => {
    toAIError(httpError(429, 'rate_limit_error'), CTX);
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toMatchObject({ code: 'AI_BUSY', status: 429, requestId: 'req_429' });
  });

  it('logs mid-stream failures with the stream request id', () => {
    toAIError(midStreamError('api_error'), { path: 'streamChatCompletion', model: 'claude-sonnet-5' });
    expect(log.error.mock.calls[0][0]).toMatchObject({
      aiPath: 'streamChatCompletion',
      errorType: 'api_error',
      requestId: 'req_stream',
    });
  });

  it('never logs the SDK error object itself (it can carry request details)', () => {
    toAIError(httpError(500, 'api_error'), CTX);
    const [entry] = log.error.mock.calls[0] as [Record<string, unknown>];
    for (const value of Object.values(entry)) {
      expect(value === null || ['string', 'number'].includes(typeof value)).toBe(true);
    }
  });
});
