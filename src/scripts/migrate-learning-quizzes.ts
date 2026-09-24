/**
 * One quiz system (programme phase 3F): moves old Learning quizzes into the
 * question bank. Their homework becomes exercises and their lesson materials
 * become practice questions on the new questions; each quiz is then closed.
 *
 *   npm run migrate:learning-quizzes                    # dry run: reports only
 *   npm run migrate:learning-quizzes -- --apply         # makes the changes
 *   npm run migrate:learning-quizzes -- --school <id>   # one school
 *
 * Safe to run more than once: a moved quiz is skipped.
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { migrateLearningQuizzes } from '../modules/Learning/service-quiz-migration.js';

function argValue(name: string): string | undefined {
  const at = process.argv.indexOf(name);
  if (at === -1) return undefined;
  const value = process.argv[at + 1];
  // A --school with no id must never widen the run to every school.
  if (!value || !mongoose.Types.ObjectId.isValid(value)) throw new Error(`${name} needs a school id`);
  return value;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const schoolId = argValue('--school');
  await mongoose.connect(config.mongodb.uri);
  try {
    const report = await migrateLearningQuizzes({ apply, schoolId, onProgress: (line) => logger.info(`Moved: ${line}`) });
    if (!apply) for (const line of report.lines) logger.info(`Would move: ${line}`);
    for (const s of report.skipped) logger.warn({ quizId: s.quizId, schoolId: s.schoolId }, `Left as it is: ${s.quiz}. ${s.reason}`);
    logger.info(
      { moved: report.moved, planned: report.lines.length, skipped: report.skipped.length, apply },
      apply
        ? `Moved ${report.moved} quiz(zes) to the question bank; ${report.skipped.length} left as they are.`
        : `Dry run: ${report.lines.length} quiz(zes) would move; ${report.skipped.length} would be left. Run with --apply to move them.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Moving Learning quizzes failed');
  process.exit(1);
});
