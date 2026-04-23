import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../src/common/errors.js';
import { requireCapability } from '../src/middleware/capability.js';

function makeReq(user?: Request['user']): Request {
  return { user } as Request;
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('requireCapability', () => {
  it('throws Unauthorized when req.user is missing', () => {
    const mw = requireCapability('manage_school_config');
    const next = vi.fn() as NextFunction;
    expect(() => mw(makeReq(undefined), makeRes(), next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() for super_admin', () => {
    const mw = requireCapability('manage_school_config');
    const next = vi.fn() as NextFunction;
    mw(makeReq({ role: 'super_admin' } as Request['user']), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next() for a user with the capability', () => {
    const mw = requireCapability('manage_school_config');
    const next = vi.fn() as NextFunction;
    mw(
      makeReq({ role: 'teacher', isSchoolPrincipal: true } as Request['user']),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it('responds 403 with structured body for denied users', () => {
    const mw = requireCapability('manage_school_config');
    const next = vi.fn() as NextFunction;
    const res = makeRes();
    mw(makeReq({ role: 'teacher' } as Request['user']), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: 'FORBIDDEN_CAPABILITY',
      capability: 'manage_school_config',
      error: 'You do not have permission to manage school configuration.',
    });
  });
});
