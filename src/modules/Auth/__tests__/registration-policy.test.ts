import { describe, expect, it } from 'vitest';
import { resolveRegistrationScope } from '../registration-policy.js';
import { ForbiddenError } from '../../../common/errors.js';
import { UserRole } from '../../../common/enums.js';

const SCHOOL_A = '64b000000000000000000001';
const SCHOOL_B = '64b000000000000000000002';

const schoolAdminOfA = { role: UserRole.SCHOOL_ADMIN, schoolId: SCHOOL_A };
const superAdmin = { role: UserRole.SUPER_ADMIN, schoolId: undefined };
const teacherOfA = { role: UserRole.TEACHER, schoolId: SCHOOL_A };

describe('resolveRegistrationScope', () => {
  describe('anonymous caller (public /register page)', () => {
    it('allows a school_admin with no school (Campusly links the school later)', () => {
      expect(resolveRegistrationScope(null, { role: 'school_admin' })).toEqual({
        role: 'school_admin',
        schoolId: undefined,
      });
    });

    it('rejects super_admin', () => {
      expect(() => resolveRegistrationScope(null, { role: 'super_admin' })).toThrow(ForbiddenError);
    });

    it('rejects joining an existing school as school_admin', () => {
      expect(() =>
        resolveRegistrationScope(null, { role: 'school_admin', schoolId: SCHOOL_B }),
      ).toThrow(ForbiddenError);
    });

    it.each(['teacher', 'student', 'parent', 'coach', 'sgb_member', 'sports_manager'])(
      'rejects %s (those roles have dedicated signup flows)',
      (role) => {
        expect(() => resolveRegistrationScope(null, { role })).toThrow(ForbiddenError);
      },
    );
  });

  describe('school_admin caller', () => {
    it('creates users in their own school when no schoolId is sent', () => {
      expect(resolveRegistrationScope(schoolAdminOfA, { role: 'student' })).toEqual({
        role: 'student',
        schoolId: SCHOOL_A,
      });
    });

    it('accepts their own schoolId explicitly', () => {
      expect(
        resolveRegistrationScope(schoolAdminOfA, { role: 'teacher', schoolId: SCHOOL_A }),
      ).toEqual({ role: 'teacher', schoolId: SCHOOL_A });
    });

    it('rejects creating users in another school', () => {
      expect(() =>
        resolveRegistrationScope(schoolAdminOfA, { role: 'student', schoolId: SCHOOL_B }),
      ).toThrow(ForbiddenError);
    });

    it('rejects super_admin', () => {
      expect(() => resolveRegistrationScope(schoolAdminOfA, { role: 'super_admin' })).toThrow(
        ForbiddenError,
      );
    });

    it('gets only anonymous rights while their school is not yet linked', () => {
      const unlinkedAdmin = { role: UserRole.SCHOOL_ADMIN, schoolId: undefined };

      expect(() =>
        resolveRegistrationScope(unlinkedAdmin, { role: 'student', schoolId: SCHOOL_B }),
      ).toThrow(ForbiddenError);
    });
  });

  describe('super_admin caller', () => {
    it('may create a school_admin for any school', () => {
      expect(
        resolveRegistrationScope(superAdmin, { role: 'school_admin', schoolId: SCHOOL_B }),
      ).toEqual({ role: 'school_admin', schoolId: SCHOOL_B });
    });

    it('still cannot mint another super_admin through this endpoint', () => {
      expect(() => resolveRegistrationScope(superAdmin, { role: 'super_admin' })).toThrow(
        ForbiddenError,
      );
    });
  });

  describe('other authenticated callers', () => {
    it('get no more than anonymous rights — a teacher cannot create students', () => {
      expect(() =>
        resolveRegistrationScope(teacherOfA, { role: 'student', schoolId: SCHOOL_A }),
      ).toThrow(ForbiddenError);
    });
  });
});
