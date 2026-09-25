/**
 * Which Claude models accept the sampling parameters (temperature, top_p,
 * top_k). Current models (Sonnet 5, Opus 5 / 5.5, Fable 5 / 5.1, Opus 4.7 /
 * 4.8 and anything newer) reject a request carrying any of them with a 400,
 * so sampling is sent only to models known to accept it. An unknown model is
 * treated as rejecting: leaving temperature off costs a little determinism,
 * sending it to a model that rejects it fails every call.
 */

// Versions are matched after the `claude-` prefix, so this file names model
// families, never a model to call: the model in use is still set only in
// config/env.ts (guarded by config/__tests__/ai-model.test.ts).
const PREFIX = 'claude-';

/** Model versions that accept sampling, as `family-major-minor`. */
const SAMPLING_VERSIONS: readonly string[] = [
  'opus-4-6',
  'sonnet-4-6',
  'opus-4-5',
  'sonnet-4-5',
  'haiku-4-5',
  'opus-4-1',
  'opus-4-0',
  'sonnet-4-0',
];

/** Claude 4.0 dated IDs, e.g. claude-opus-4-20250514. */
const CLAUDE_4_0_DATED = /^(opus|sonnet)-4-\d{8}$/;

export function acceptsSampling(model: string): boolean {
  const id = model.trim().toLowerCase();
  if (!id.startsWith(PREFIX)) return false;
  const version = id.slice(PREFIX.length);
  if (version.startsWith('3-')) return true; // every Claude 3.x (3, 3.5, 3.7)
  if (CLAUDE_4_0_DATED.test(version)) return true;
  return SAMPLING_VERSIONS.some((v) => version === v || version.startsWith(`${v}-`));
}

/** The sampling fields to spread into a Messages request for `model`: the temperature, or nothing. */
export function samplingParams(model: string, temperature: number): { temperature?: number } {
  return acceptsSampling(model) ? { temperature } : {};
}
