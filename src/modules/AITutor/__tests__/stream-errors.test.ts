import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

// The tutor stream sends SSE headers first, so an AI failure mid-stream can
// only be reported as an `error` frame. It must carry the same plain message
// and code the JSON routes return, never a raw SDK or internal message.
const h = vi.hoisted(() => ({ streamMessage: vi.fn() }));
vi.mock('../service.js', () => ({ AITutorService: { streamMessage: h.streamMessage } }));
vi.mock('../../../common/logger.js', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { AppError } from '../../../common/errors.js';
import { AITutorController } from '../controller.js';

interface FakeRes {
  headersSent: boolean;
  frames: string[];
  ended: boolean;
  setHeader: ReturnType<typeof vi.fn>;
  flushHeaders?: () => void;
  write: (chunk: string) => boolean;
  end: () => void;
  on: (event: string, handler: () => void) => FakeRes;
}

function fakeRes(opts: { flushes: boolean }): FakeRes {
  const res: FakeRes = {
    headersSent: false,
    frames: [],
    ended: false,
    setHeader: vi.fn(),
    write(chunk: string) {
      res.headersSent = true;
      res.frames.push(chunk);
      return true;
    },
    end() {
      res.ended = true;
    },
    on() {
      return res;
    },
  };
  if (opts.flushes) res.flushHeaders = () => { res.headersSent = true; };
  return res;
}

function fakeReq(): Request {
  return {
    user: { id: 'u1', schoolId: 's1' },
    body: { message: 'hi' },
    on: vi.fn(),
  } as unknown as Request;
}

function errorFrame(res: FakeRes): Record<string, unknown> {
  const frame = res.frames.find((f) => f.startsWith('event: error'));
  expect(frame).toBeDefined();
  return JSON.parse(frame!.split('data: ')[1]) as Record<string, unknown>;
}

const busy = new AppError('The AI is busy right now. Try again in a minute.', 503, true, { code: 'AI_BUSY' });

beforeEach(() => {
  h.streamMessage.mockReset();
});

describe('AITutorController.streamMessage errors', () => {
  it('after headers: sends the AppError message and code as an SSE error frame', async () => {
    h.streamMessage.mockRejectedValue(busy);
    const res = fakeRes({ flushes: true });
    await AITutorController.streamMessage(fakeReq(), res as unknown as Response);
    expect(errorFrame(res)).toEqual({ message: busy.message, code: 'AI_BUSY' });
    expect(res.ended).toBe(true);
  });

  it('after headers: never leaks an internal error message', async () => {
    h.streamMessage.mockRejectedValue(new Error('E11000 duplicate key on tutorconversations'));
    const res = fakeRes({ flushes: true });
    await AITutorController.streamMessage(fakeReq(), res as unknown as Response);
    const data = errorFrame(res);
    expect(String(data.message)).not.toContain('E11000');
    expect(data.message).toBe('Something went wrong. Try again.');
  });

  it('before headers: hands the AppError to the error handler (proper HTTP status)', async () => {
    h.streamMessage.mockRejectedValue(busy);
    const res = fakeRes({ flushes: false });
    await expect(
      AITutorController.streamMessage(fakeReq(), res as unknown as Response),
    ).rejects.toBe(busy);
    expect(res.frames).toEqual([]);
    expect(res.ended).toBe(false);
  });
});
