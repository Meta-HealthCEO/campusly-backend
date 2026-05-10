import { runLessonPlanToLessonMigration } from '../../modules/Lesson/service-lesson-migration.js';
import { logger } from '../../common/logger.js';

export async function runMigrations(): Promise<void> {
  try {
    await runLessonPlanToLessonMigration();
  } catch (err: unknown) {
    logger.error({ err }, '[migrations] failed');
    throw err;
  }
}
