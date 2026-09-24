/**
 * Courses are core for every teacher (programme decision, 2026-09-24): new
 * schools get the module by default; this turns it on for schools that
 * already exist. Safe to run repeatedly. Run: npm run migrate:courses-module
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { School } from '../modules/School/model.js';

async function main(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  try {
    const result = await School.updateMany(
      { modulesEnabled: { $ne: 'courses' } },
      { $addToSet: { modulesEnabled: 'courses' } },
    );
    logger.info({ schoolsUpdated: result.modifiedCount }, `Courses turned on for ${result.modifiedCount} school(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Enabling the courses module failed');
  process.exit(1);
});
