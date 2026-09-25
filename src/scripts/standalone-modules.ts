/**
 * The standalone teacher portal has no messaging or incident/wellbeing pages
 * (spec 2026-09-25 §1), so independent teachers' schools no longer carry those
 * modules. New sign-ups start without them (STANDALONE_DEFAULT_MODULES); this
 * pulls them from standalone teachers' schools that already exist. Standalone
 * coaches' sport clubs are also plan 'standalone' but keep messaging, so any
 * school with a standalone coach (User.isStandaloneCoach) is skipped, and
 * school-plan schools are never touched. Safe to run repeatedly.
 * Run: npm run migrate:standalone-modules            (dry run: counts only)
 *      npm run migrate:standalone-modules -- --apply (writes)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { School } from '../modules/School/model.js';
import { User } from '../modules/Auth/model.js';

export const RETIRED_STANDALONE_MODULES = ['incident_wellbeing', 'communication'] as const;

export async function pullStandaloneModules(
  { apply, schoolIds }: { apply: boolean; /** Limit to these schools (tests); default: every standalone school. */ schoolIds?: mongoose.Types.ObjectId[] },
): Promise<{ matched: number; updated: number }> {
  // Standalone coaches' clubs share plan 'standalone'; they keep their modules.
  const coachClubIds = await User.collection.distinct('schoolId', { isStandaloneCoach: true });
  const filter = {
    plan: 'standalone',
    modulesEnabled: { $in: [...RETIRED_STANDALONE_MODULES] },
    $and: [
      { _id: { $nin: coachClubIds } },
      ...(schoolIds ? [{ _id: { $in: schoolIds } }] : []),
    ],
  };
  const matched = await School.collection.countDocuments(filter);
  if (!apply) return { matched, updated: 0 };
  const result = await School.updateMany(filter, { $pull: { modulesEnabled: { $in: [...RETIRED_STANDALONE_MODULES] } } });
  return { matched, updated: result.modifiedCount };
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(config.mongodb.uri);
  try {
    const { matched, updated } = await pullStandaloneModules({ apply });
    const message = apply
      ? `Removed messaging and incident/wellbeing from ${updated} standalone teacher school(s).`
      : `Dry run: ${matched} standalone teacher school(s) would lose messaging and incident/wellbeing. Re-run with --apply.`;
    logger.info({ matched, updated, apply }, message);
  } finally {
    await mongoose.disconnect();
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main().catch((err: unknown) => {
    logger.error({ err }, 'Standalone modules migration failed');
    process.exit(1);
  });
}
