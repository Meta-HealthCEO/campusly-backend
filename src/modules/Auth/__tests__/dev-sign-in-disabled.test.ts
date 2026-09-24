import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';

// Rate limiting is not under test here, and its Redis client blocks forever
// when Redis is down, so swap in a pass-through.
vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from '../../../app.js';

// NODE_ENV is test here, so the gate is closed whatever DEV_SIGN_IN says.
describe('development sign-in when the gate is closed', () => {
  it('does not mount the account list', async () => {
    const res = await request(app).get('/api/auth/dev-sign-in/accounts');

    expect(res.status).toBe(404);
  });

  it('does not mount the sign-in', async () => {
    const res = await request(app).post('/api/auth/dev-sign-in').send({ userId: '64b000000000000000000001' });

    expect(res.status).toBe(404);
  });
});
