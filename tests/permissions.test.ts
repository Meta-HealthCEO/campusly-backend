import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { canUser, type Capability, type CapabilityUser } from '../src/common/permissions.js';

const snapshot = JSON.parse(
  readFileSync(resolve(__dirname, '../src/common/permissions.snapshot.json'), 'utf8'),
) as Record<string, Record<Capability, boolean>>;

const ARCHETYPES: Record<string, CapabilityUser> = {
  super_admin:         { role: 'super_admin' },
  school_admin:        { role: 'school_admin' },
  teacher_plain:       { role: 'teacher' },
  teacher_principal:   { role: 'teacher', isSchoolPrincipal: true },
  teacher_standalone:  { role: 'teacher', isSchoolPrincipal: true, isStandaloneTeacher: true },
  teacher_hod:         { role: 'teacher', isHOD: true },
  teacher_bursar:      { role: 'teacher', isBursar: true },
  teacher_counselor:   { role: 'teacher', isCounselor: true },
  teacher_receptionist:{ role: 'teacher', isReceptionist: true },
  parent:              { role: 'parent' },
  student:             { role: 'student' },
  sports_manager:      { role: 'sports_manager' },
  coach_standalone:    { role: 'coach', isStandaloneCoach: true },
};

describe('permissions snapshot', () => {
  it('covers every archetype in the snapshot', () => {
    expect(Object.keys(ARCHETYPES).sort()).toEqual(Object.keys(snapshot).sort());
  });

  for (const [name, user] of Object.entries(ARCHETYPES)) {
    describe(name, () => {
      const expected = snapshot[name];
      for (const cap of Object.keys(expected) as Capability[]) {
        it(`${cap} → ${expected[cap]}`, () => {
          expect(canUser(user, cap)).toBe(expected[cap]);
        });
      }
    });
  }

  it('undefined user gets no capability', () => {
    expect(canUser(undefined, 'manage_school_config')).toBe(false);
  });
});
