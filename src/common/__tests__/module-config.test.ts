import { describe, it, expect } from 'vitest';
import { STANDALONE_DEFAULT_MODULES, BOLT_ON_MODULES } from '../moduleConfig.js';

describe('STANDALONE_DEFAULT_MODULES', () => {
  it('turns courses on for every new independent teacher (courses are core for teachers)', () => {
    expect(STANDALONE_DEFAULT_MODULES).toContain('courses');
  });

  it('keeps the modules independent teachers already had', () => {
    expect(STANDALONE_DEFAULT_MODULES).toEqual(expect.arrayContaining([
      'auth', 'academic', 'ai_tools', 'teacher_workbench', 'learning', 'homework', 'attendance', 'incident_wellbeing', 'communication',
    ]));
    for (const m of STANDALONE_DEFAULT_MODULES) {
      if (m !== 'auth') expect(BOLT_ON_MODULES).toContain(m);
    }
  });
});
