/**
 * One behaviour log (programme phase 4B): folds the old Merits and Discipline
 * records into each learner's behaviour log. The old records stay; each moves
 * once (a second run skips it).
 *
 *   npm run migrate:behaviour                    # dry run: counts only
 *   npm run migrate:behaviour -- --apply         # makes the changes
 *   npm run migrate:behaviour -- --school <id>   # one school
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { migrateBehaviour } from '../modules/Behaviour/service-migration.js';

function schoolArg(): string | undefined {
  const at = process.argv.indexOf('--school');
  if (at === -1) return undefined;
  const value = process.argv[at + 1];
  // A --school with no id must never widen the run to every school.
  if (!value || !mongoose.Types.ObjectId.isValid(value)) throw new Error('--school needs a school id');
  return value;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const schoolId = schoolArg();
  await mongoose.connect(config.mongodb.uri);
  try {
    const r = await migrateBehaviour({ apply, schoolId });
    logger.info(
      { ...r },
      `${apply ? 'Moved' : 'Would move'} ${r.merits} merit/demerit and ${r.discipline} discipline record(s) into the behaviour log; `
        + `${r.alreadyMoved} already moved; ${r.skippedLeftLearners} left alone (the learner has left).`
        + (apply ? '' : ' Run with --apply to move them.'),
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Moving behaviour records failed');
  process.exit(1);
});
