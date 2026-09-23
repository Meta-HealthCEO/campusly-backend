import { ForbiddenError } from '../../common/errors.js';
import { UserRole } from '../../common/enums.js';

export interface RegistrationCaller {
  role: UserRole;
  schoolId?: string;
}

export interface RegistrationRequest {
  role: string;
  schoolId?: string;
}

export interface RegistrationScope {
  role: string;
  schoolId: string | undefined;
}

/**
 * Decides which role/school a POST /auth/register may create, based on who is
 * calling. The endpoint is public (school sign-up) but is also used by admins
 * to create accounts, so the caller's JWT — never the request body — sets the
 * limits:
 *
 * - Nobody can mint a super_admin here.
 * - Anonymous (and non-admin) callers may only sign up a school_admin with no
 *   school; Campusly links the school during onboarding.
 * - A school_admin may create users only inside their own school.
 * - A super_admin may create users for any school.
 */
export function resolveRegistrationScope(
  caller: RegistrationCaller | null,
  request: RegistrationRequest,
): RegistrationScope {
  const { role, schoolId } = request;

  if (role === UserRole.SUPER_ADMIN) {
    throw new ForbiddenError('This role cannot be registered');
  }

  if (caller?.role === UserRole.SUPER_ADMIN) {
    return { role, schoolId };
  }

  if (caller?.role === UserRole.SCHOOL_ADMIN && caller.schoolId) {
    if (schoolId && schoolId !== caller.schoolId) {
      throw new ForbiddenError('You can only create users in your own school');
    }
    return { role, schoolId: caller.schoolId };
  }

  if (role !== UserRole.SCHOOL_ADMIN || schoolId) {
    throw new ForbiddenError('Self-registration is only available for new schools');
  }
  return { role, schoolId: undefined };
}
