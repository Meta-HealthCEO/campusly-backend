import { describe, it, expect } from 'vitest';
import { resolveSchoolScopeFor } from '../school-scope.js';

const OWN = '69ffc04ec0873db981983955';
const OTHER = '5f1111111111111111111111';

describe('resolveSchoolScopeFor', () => {
  it('IGNORES a client-supplied schoolId for a teacher', () => {
    // Regression: controllers did `req.query.schoolId ?? user.schoolId`, so any
    // teacher could read another school's data by appending ?schoolId=<other>.
    expect(resolveSchoolScopeFor('teacher', OWN, OTHER)).toBe(OWN);
  });

  it('ignores a client-supplied schoolId for school_admin', () => {
    expect(resolveSchoolScopeFor('school_admin', OWN, OTHER)).toBe(OWN);
  });

  it('ignores a client-supplied schoolId for parent and student', () => {
    expect(resolveSchoolScopeFor('parent', OWN, OTHER)).toBe(OWN);
    expect(resolveSchoolScopeFor('student', OWN, OTHER)).toBe(OWN);
  });

  it('allows super_admin to target another school explicitly', () => {
    expect(resolveSchoolScopeFor('super_admin', OWN, OTHER)).toBe(OTHER);
  });

  it('falls back to the super_admin own school when no override is given', () => {
    expect(resolveSchoolScopeFor('super_admin', OWN, undefined)).toBe(OWN);
  });

  it('returns the JWT school when no override is given', () => {
    expect(resolveSchoolScopeFor('teacher', OWN, undefined)).toBe(OWN);
  });

  it('rejects a repeated query param (array) rather than trusting it', () => {
    // Express turns ?schoolId=a&schoolId=b into an array — must not be coerced.
    expect(resolveSchoolScopeFor('super_admin', OWN, [OTHER, OWN])).toBe(OWN);
  });

  it('rejects a non-string override for super_admin', () => {
    expect(resolveSchoolScopeFor('super_admin', OWN, { $ne: null })).toBe(OWN);
    expect(resolveSchoolScopeFor('super_admin', OWN, 12345)).toBe(OWN);
  });

  it('ignores an empty-string override', () => {
    expect(resolveSchoolScopeFor('super_admin', OWN, '')).toBe(OWN);
    expect(resolveSchoolScopeFor('super_admin', OWN, '   ')).toBe(OWN);
  });

  it('returns undefined when the user has no school and is not overriding', () => {
    expect(resolveSchoolScopeFor('teacher', undefined, undefined)).toBeUndefined();
  });

  it('still refuses the override for a school-less non-super-admin', () => {
    expect(resolveSchoolScopeFor('teacher', undefined, OTHER)).toBeUndefined();
  });

  it('treats an unknown role as untrusted', () => {
    expect(resolveSchoolScopeFor(undefined, OWN, OTHER)).toBe(OWN);
    expect(resolveSchoolScopeFor('coach', OWN, OTHER)).toBe(OWN);
  });
});
