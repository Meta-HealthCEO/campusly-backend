import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

// When a learner's tutor stream counts against their limit (release review
// M3, M5): once any of the reply has reached them, even if they leave before
// the end; never when they leave before any of it arrives. The client leaving
// is heard on the response ('close'), not the request. A reply that was
// delivered and saved is never turned into an error because counting it failed.
const h = vi.hoisted(() => ({
  streamMessage: vi.fn(),
  record: vi.fn(),
  log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('../service.js', () => ({ AITutorService: { streamMessage: h.streamMessage } }));
vi.mock('../../../common/logger.js', () => ({ logger: h.log }));
vi.mock('../../subscription/learner-ai.js', () => ({
  learnerAIActorFor: vi.fn(async () => ({ schoolId: 's1', userId: 'u1', isStandaloneLearner: true })),
  assertLearnerAIAllowance: vi.fn(async () => undefined),
  recordLearnerAIUse: h.record,
  withLearnerAIAllowance: vi.fn(),
  learnerTutorUsage: vi.fn(),
}));

import { AITutorController } from '../controller.js';

type Handler = () => void;
interface StreamOptions { signal: AbortSignal }
type StreamImpl = (userId: string, schoolId: string, body: unknown, onDelta: (t: string) => void, options: StreamOptions) => Promise<unknown>;

function fakeReqRes(): { req: Request; res: Response; frames: string[]; reqOn: ReturnType<typeof vi.fn>; leave: () => void } {
  const frames: string[] = [];
  const closeHandlers: Handler[] = [];
  const reqOn = vi.fn();
  const res = {
    headersSent: false,
    setHeader: vi.fn(),
    flushHeaders() { res.headersSent = true; },
    write(chunk: string) { frames.push(chunk); return true; },
    end: vi.fn(),
    on(event: string, handler: Handler) { if (event === 'close') closeHandlers.push(handler); return res; },
  };
  const req = { user: { id: 'u1', schoolId: 's1', role: 'student' }, body: { message: 'hi' }, on: reqOn };
  return {
    req: req as unknown as Request, res: res as unknown as Response, frames, reqOn,
    leave: () => closeHandlers.forEach((f) => f()),
  };
}

/** The AI stream: rejects like the SDK does once the signal aborts. */
const aborted = (signal: AbortSignal) => new Promise((_resolve, reject) => {
  if (signal.aborted) reject(new Error('Request was aborted.'));
  signal.addEventListener('abort', () => reject(new Error('Request was aborted.')));
});

beforeEach(() => {
  h.streamMessage.mockReset();
  h.record.mockReset();
  h.record.mockResolvedValue(undefined);
  h.log.error.mockReset();
});

describe('a learner tutor stream counts', () => {
  it('once part of the reply was sent, even if the learner leaves before the end', async () => {
    const t = fakeReqRes();
    h.streamMessage.mockImplementation((async (_u, _s, _b, onDelta, options) => {
      onDelta('Slope is');
      t.leave();
      return aborted(options.signal);
    }) as StreamImpl);
    await AITutorController.streamMessage(t.req, t.res);
    expect(h.record).toHaveBeenCalledTimes(1);
    expect(t.frames.some((f) => f.startsWith('event: error'))).toBe(false);
  });

  it('not at all when the learner leaves before any of the reply was sent', async () => {
    const t = fakeReqRes();
    h.streamMessage.mockImplementation((async (_u, _s, _b, _onDelta, options) => {
      t.leave();
      return aborted(options.signal);
    }) as StreamImpl);
    await AITutorController.streamMessage(t.req, t.res);
    expect(h.record).not.toHaveBeenCalled();
  });

  it('once for a complete reply', async () => {
    const t = fakeReqRes();
    h.streamMessage.mockImplementation((async (_u, _s, _b, onDelta) => { onDelta('Hi'); return { _id: 'c1' }; }) as StreamImpl);
    await AITutorController.streamMessage(t.req, t.res);
    expect(h.record).toHaveBeenCalledTimes(1);
    expect(t.frames.some((f) => f.startsWith('event: done'))).toBe(true);
  });

  it('hears the learner leave on the response, not the request', async () => {
    const t = fakeReqRes();
    h.streamMessage.mockImplementation((async (_u, _s, _b, _onDelta, options) => {
      t.leave();
      expect(options.signal.aborted).toBe(true);
      return aborted(options.signal);
    }) as StreamImpl);
    await AITutorController.streamMessage(t.req, t.res);
    expect(t.reqOn).not.toHaveBeenCalledWith('close', expect.anything());
  });
});

describe('a delivered reply is not an error when counting it fails (M5)', () => {
  it('logs the failure and still sends done, with no error frame', async () => {
    const t = fakeReqRes();
    h.streamMessage.mockImplementation((async (_u, _s, _b, onDelta) => { onDelta('Hi'); return { _id: 'c1' }; }) as StreamImpl);
    h.record.mockRejectedValue(new Error('write conflict'));
    await AITutorController.streamMessage(t.req, t.res);
    expect(t.frames.some((f) => f.startsWith('event: done'))).toBe(true);
    expect(t.frames.some((f) => f.startsWith('event: error'))).toBe(false);
    expect(h.log.error).toHaveBeenCalledTimes(1);
  });
});
