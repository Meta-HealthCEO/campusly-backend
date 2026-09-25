import { describe, expect, it } from 'vitest';
import { acceptsSampling, samplingParams } from '../ai-model-capabilities.js';

// Current Claude models answer a request carrying temperature / top_p / top_k
// with a 400. Only models known to accept them get them.
const REJECTS_SAMPLING = [
  'claude-sonnet-5',
  'claude-opus-5',
  'claude-opus-5-5',
  'claude-fable-5',
  'claude-fable-5-1',
  'claude-mythos-5-1',
  'claude-opus-4-8',
  'claude-opus-4-7',
  // Unknown or future models: never guess that they accept sampling.
  'claude-sonnet-6',
  'claude-haiku-5',
  'some-other-model',
  '',
];

const ACCEPTS_SAMPLING = [
  'claude-haiku-4-5',
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
  'claude-sonnet-4-5',
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-5',
  'claude-opus-4-1',
  'claude-opus-4-1-20250805',
  'claude-opus-4-0',
  'claude-sonnet-4-0',
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
];

describe('acceptsSampling', () => {
  it.each(REJECTS_SAMPLING)('is false for %s', (model) => {
    expect(acceptsSampling(model)).toBe(false);
  });

  it.each(ACCEPTS_SAMPLING)('is true for %s', (model) => {
    expect(acceptsSampling(model)).toBe(true);
  });

  it('does not treat a newer minor version as an older one (4-5 is not 4-50, 4-0 is not 4-8)', () => {
    expect(acceptsSampling('claude-opus-4-50')).toBe(false);
    expect(acceptsSampling('claude-opus-4-8-20260101')).toBe(false);
  });
});

describe('samplingParams', () => {
  it('returns no sampling fields for a model that rejects them', () => {
    expect(samplingParams('claude-sonnet-5', 0.4)).toEqual({});
  });

  it('returns the temperature for a model that accepts it', () => {
    expect(samplingParams('claude-haiku-4-5', 0.4)).toEqual({ temperature: 0.4 });
  });
});
