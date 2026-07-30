// ============================================================
// School scope resolution — the single source of truth for
// "which school's data is this request allowed to touch?"
// ============================================================
//
// SECURITY: the tenant is decided by the JWT, never by the client.
//
// Controllers used to write `const schoolId = req.query.schoolId ?? user.schoolId`,
// which let ANY authenticated user read another school's data simply by
// appending `?schoolId=<other school>`. The same shape appeared with
// `req.body.schoolId` on writes, which allowed cross-tenant WRITES.
//
// Only super_admin — the platform operator — may target another school, and
// only via an explicit, well-formed string parameter.

import type { Request } from 'express';
import { UserRole } from './enums.js';
import { BadRequestError } from './errors.js';

/**
 * Pure core: resolve the school a request may act on.
 *
 * @param role              role from the verified JWT
 * @param userSchoolId      schoolId from the verified JWT
 * @param requestedSchoolId raw, UNTRUSTED value from query/body
 */
export function resolveSchoolScopeFor(
  role: string | undefined,
  userSchoolId: string | undefined,
  requestedSchoolId: unknown,
): string | undefined {
  if (role !== UserRole.SUPER_ADMIN) return userSchoolId;

  // Only a plain, non-empty string is an acceptable override. Express turns a
  // repeated query param into an array, and a crafted body can supply an
  // object — neither may reach a Mongo filter.
  if (typeof requestedSchoolId !== 'string') return userSchoolId;
  const trimmed = requestedSchoolId.trim();
  return trimmed.length > 0 ? trimmed : userSchoolId;
}

/**
 * Resolve the school scope for an authenticated request, honouring a
 * `?schoolId=` override for super_admin only.
 */
export function resolveSchoolScope(req: Request): string | undefined {
  return resolveSchoolScopeFor(req.user?.role, req.user?.schoolId, req.query?.schoolId);
}

/**
 * Same as `resolveSchoolScope` but for endpoints that accepted the tenant in
 * the request body. The body value is only ever honoured for super_admin.
 */
export function resolveSchoolScopeFromBody(req: Request): string | undefined {
  const body = req.body as { schoolId?: unknown } | undefined;
  return resolveSchoolScopeFor(req.user?.role, req.user?.schoolId, body?.schoolId);
}

/**
 * School scope for endpoints that cannot operate without one. Throws 400
 * instead of letting `undefined` reach a Mongo filter (which would match
 * across tenants or silently return nothing).
 */
export function requireSchoolScope(req: Request): string {
  const schoolId = resolveSchoolScope(req);
  if (!schoolId) throw new BadRequestError('School context is required');
  return schoolId;
}
