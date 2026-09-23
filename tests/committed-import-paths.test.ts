import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Windows and macOS resolve imports case-insensitively, so `./modules/Budget/`
 * works locally even when git tracks `src/modules/budget/`. The Linux build
 * server resolves against the tracked paths exactly and fails. This checks
 * every relative import in src/ against `git ls-files`, case-sensitively.
 */
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const IMPORT_SPECIFIER = /(?:from\s+|import\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
// Usage examples in JSDoc (e.g. common/BaseController.ts) are not real imports.
const COMMENTS = /\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm;

function trackedFiles(): Set<string> {
  const out = execFileSync('git', ['ls-files', '-z', 'src'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return new Set(out.split('\0').filter(Boolean));
}

function candidatePaths(resolved: string): string[] {
  if (resolved.endsWith('.js')) {
    const base = resolved.slice(0, -3);
    return [`${base}.ts`, `${base}.tsx`, resolved];
  }
  if (path.posix.extname(resolved)) return [resolved];
  return [`${resolved}.ts`, `${resolved}/index.ts`];
}

describe('committed import paths', () => {
  it('every relative import in src/ resolves to a git-tracked file with exact casing', () => {
    const tracked = trackedFiles();
    const unresolved: string[] = [];

    for (const file of tracked) {
      if (!/\.tsx?$/.test(file)) continue;
      const source = readFileSync(path.join(REPO_ROOT, file), 'utf8').replace(COMMENTS, '');
      for (const match of source.matchAll(IMPORT_SPECIFIER)) {
        const specifier = match[1];
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
        if (!candidatePaths(resolved).some((candidate) => tracked.has(candidate))) {
          unresolved.push(`${file} -> ${specifier}`);
        }
      }
    }

    expect(unresolved).toEqual([]);
  });
});
