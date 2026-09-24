import { describe, it, expect } from 'vitest';
import { fromDiscipline, fromMerit } from '../legacy-map.js';

describe('fromMerit', () => {
  it('keeps a merit as a merit and a demerit as a demerit, with signed points', () => {
    expect(fromMerit({ type: 'merit', category: 'behaviour', points: 3, reason: 'Tidied the class.' }))
      .toEqual({ kind: 'merit', category: 'effort', points: 3, severity: null, note: 'Tidied the class.' });
    expect(fromMerit({ type: 'demerit', category: 'academic', points: 2, reason: 'No homework.' }))
      .toEqual({ kind: 'demerit', category: 'homework', points: -2, severity: 'low', note: 'No homework.' });
    expect(fromMerit({ type: 'merit', category: 'sport', points: 9, reason: '' })).toMatchObject({ category: 'sport', points: 5 });
  });
});

describe('fromDiscipline', () => {
  it('makes a minor or moderate matter a demerit, and a serious one (or bullying or vandalism) an incident', () => {
    expect(fromDiscipline({ type: 'late', severity: 'minor', description: 'Late after break.' }))
      .toEqual({ kind: 'demerit', category: 'late', points: -1, severity: 'low', note: 'Late after break.' });
    expect(fromDiscipline({ type: 'dress_code', severity: 'moderate', description: 'No tie.' }))
      .toMatchObject({ kind: 'demerit', category: 'uniform', severity: 'medium' });
    expect(fromDiscipline({ type: 'misconduct', severity: 'critical', description: 'Threw a chair.' }))
      .toEqual({ kind: 'incident', category: 'other', points: 0, severity: 'high', note: 'Threw a chair.' });
    expect(fromDiscipline({ type: 'bullying', severity: 'minor', description: 'Name-calling.' }))
      .toMatchObject({ kind: 'incident', category: 'bullying', severity: 'low' });
    expect(fromDiscipline({ type: 'vandalism', severity: 'moderate', description: 'Broke a window.' }))
      .toMatchObject({ kind: 'incident', category: 'property' });
  });
});
