/**
 * Email verification shipped 2026-09. Users who existed before then never
 * received a link, so they count as verified from the day they joined:
 * emailVerifiedAt = createdAt. Only users with no emailVerifiedAt field at all
 * are touched — anyone who signed up after the change has an explicit null
 * and must verify. Safe to run repeatedly.
 * Run: npm run migrate:email-verified            (dry run: counts only)
 *      npm run migrate:email-verified -- --apply (writes)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { User } from '../modules/Auth/model.js';

export async function backfillEmailVerified({ apply }: { apply: boolean }): Promise<{ matched: number; updated: number }> {
  const filter = { emailVerifiedAt: { $exists: false }, createdAt: { $lt: new Date() } };
  const matched = await User.collection.countDocuments(filter);
  if (!apply) return { matched, updated: 0 };
  // Native driver: an update pipeline copies createdAt per document.
  const result = await User.collection.updateMany(filter, [{ $set: { emailVerifiedAt: '$createdAt' } }]);
  return { matched, updated: result.modifiedCount };
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(config.mongodb.uri);
  try {
    const { matched, updated } = await backfillEmailVerified({ apply });
    const message = apply
      ? `Marked ${updated} existing user(s) as verified.`
      : `Dry run: ${matched} existing user(s) would be marked verified. Re-run with --apply.`;
    logger.info({ matched, updated, apply }, message);
  } finally {
    await mongoose.disconnect();
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main().catch((err: unknown) => {
    logger.error({ err }, 'Email verification backfill failed');
    process.exit(1);
  });
}
