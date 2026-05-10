import { runLessonPlanToLessonMigration } from '../../modules/Lesson/service-lesson-migration.js';
import { runStripGradeSuffixFromSubjects } from '../../modules/CurriculumStructure/service-normalize-titles.js';
import { runDenormalizeCurriculumHierarchy } from '../../modules/CurriculumStructure/service-denormalize-hierarchy.js';
import { logger } from '../../common/logger.js';

export async function runMigrations(): Promise<void> {
  try {
    await runStripGradeSuffixFromSubjects();
    // Must run AFTER strip-grade-suffix so term-number parsing sees clean titles
    // (and, more generally, so denormalization runs on the cleaned-up tree).
    await runDenormalizeCurriculumHierarchy();
    await runLessonPlanToLessonMigration();
  } catch (err: unknown) {
    logger.error({ err }, '[migrations] failed');
    throw err;
  }
}
