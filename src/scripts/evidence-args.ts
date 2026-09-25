// src/scripts/evidence-args.ts
//
// Flags shared by the Phase E scripts. A bad value stops the run; it never
// widens it (a --school with no id must not mean every school).
import mongoose from 'mongoose';
import { SOURCE_TYPES, type SourceType } from '../modules/Evidence/types.js';

export interface EvidenceArgs {
  apply: boolean; direct: boolean; yes: boolean; retrySkippedBudget: boolean;
  school?: string; source?: SourceType; since?: Date; limit?: number; subject?: string;
  /** A .txt of examiners' common errors, passed to seeding as grounding. */
  grounding?: string;
}

function value(argv: readonly string[], name: string): string | undefined {
  const hit = argv.find((a: string) => a.startsWith(`--${name}=`));
  return hit === undefined ? undefined : hit.slice(name.length + 3);
}

export function parseEvidenceArgs(argv: readonly string[]): EvidenceArgs {
  const args: EvidenceArgs = {
    apply: argv.includes('--apply'), direct: argv.includes('--direct'), yes: argv.includes('--yes'),
    retrySkippedBudget: argv.includes('--retry-skipped-budget'),
  };
  const school = value(argv, 'school');
  if (school !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(school) || school.length !== 24) throw new Error('--school needs a school id');
    args.school = school;
  }
  const source = value(argv, 'source');
  if (source !== undefined) {
    if (!(SOURCE_TYPES as readonly string[]).includes(source)) throw new Error(`--source must be one of ${SOURCE_TYPES.join(', ')}`);
    args.source = source as SourceType;
  }
  const since = value(argv, 'since');
  if (since !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error('--since must be YYYY-MM-DD');
    args.since = new Date(`${since}T00:00:00.000Z`);
  }
  const limit = value(argv, 'limit');
  if (limit !== undefined) {
    const n = Number(limit);
    if (!Number.isInteger(n) || n < 1) throw new Error('--limit must be a whole number above 0');
    args.limit = n;
  }
  const subject = value(argv, 'subject');
  if (subject !== undefined) args.subject = subject;
  const grounding = value(argv, 'grounding');
  if (grounding !== undefined) args.grounding = grounding;
  return args;
}
