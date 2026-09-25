import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../env.js';

const SRC = path.resolve(__dirname, '../..');
const MODEL_LITERAL = /['"`]claude-[a-z0-9.-]+['"`]/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name: string) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === '__tests__' ? [] : sourceFiles(full);
    return full.endsWith('.ts') ? [full] : [];
  });
}

describe('Claude model', () => {
  it('defaults to a current model when ANTHROPIC_MODEL is not set', () => {
    if (process.env.ANTHROPIC_MODEL) return;
    expect(config.anthropic.model).toBe('claude-sonnet-5');
  });

  it('diagnoses on the main model unless ANTHROPIC_DIAGNOSIS_MODEL is set', () => {
    if (process.env.ANTHROPIC_DIAGNOSIS_MODEL) return;
    expect(config.anthropic.diagnosisModel).toBe(config.anthropic.model);
  });

  it('is named in one place, so a model upgrade is a one-line change', () => {
    const offenders = sourceFiles(SRC)
      .filter((file: string) => !file.endsWith(path.join('config', 'env.ts')))
      .filter((file: string) => MODEL_LITERAL.test(readFileSync(file, 'utf8')))
      .map((file: string) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
