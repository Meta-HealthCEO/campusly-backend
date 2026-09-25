// src/scripts/evidence-backfill.ts
/**
 * Turns existing marked work into AnswerEvidence rows (Phase E §5).
 *
 *   npm run migrate:evidence                               # dry run: reports only
 *   npm run migrate:evidence -- --apply                    # writes
 *   npm run migrate:evidence -- --school=<id> --source=test --since=2026-01-01
 *
 * Order: migrate:paper-question-tags → migrate:evidence → evidence:diagnose.
 * Uses the same writers as the hooks, so running it twice changes nothing.
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { reconcileEvidence } from '../modules/Evidence/reconcile.js';
import { parseEvidenceArgs } from './evidence-args.js';

const pct = (part: number, whole: number): string => (whole === 0 ? '—' : `${Math.round((part / whole) * 100)}%`);

async function main(): Promise<void> {
  const args = parseEvidenceArgs(process.argv.slice(2));
  await mongoose.connect(config.mongodb.uri);
  try {
    const reports = await reconcileEvidence({ apply: args.apply, schoolId: args.school, source: args.source, since: args.since });
    for (const [source, r] of Object.entries(reports)) {
      if (r.records === 0) continue;
      logger.info(
        { source, ...r },
        `${source}: ${r.records} records; rows written ${r.written}, updated ${r.updated}, unchanged ${r.unchanged}, removed ${r.removed}; `
        + `with a topic ${pct(r.withTopic, r.rows)}, with a level ${pct(r.withLevel, r.rows)}; skipped ${JSON.stringify(r.skipped)}`,
      );
    }
    logger.info(args.apply ? 'Evidence backfill applied.' : 'Dry run: nothing written. Run with --apply to write.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'migrate:evidence failed');
  process.exit(1);
});
