import { runLessonPlanToLessonMigration } from '../../modules/Lesson/service-lesson-migration.js';
import { runLessonAssignmentsMigration } from '../../modules/Lesson/service-lesson-assignments-migration.js';
import { runStripGradeSuffixFromSubjects } from '../../modules/CurriculumStructure/service-normalize-titles.js';
import { runDenormalizeCurriculumHierarchy } from '../../modules/CurriculumStructure/service-denormalize-hierarchy.js';
import { runBackfillTopicTermFromCode } from '../../modules/CurriculumStructure/service-backfill-term-from-code.js';
import { logger } from '../../common/logger.js';

export async function runMigrations(): Promise<void> {
  try {
    await runStripGradeSuffixFromSubjects();
    // Must run AFTER strip-grade-suffix so term-number parsing sees clean titles
    // (and, more generally, so denormalization runs on the cleaned-up tree).
    await runDenormalizeCurriculumHierarchy();
    // Recovery for CAPS source data where topic/subtopic nodes parentId
    // straight to the SUBJECT (skipping the term node) — leaves termNumber
    // null after denormalize. Parses term from the node's code instead.
    await runBackfillTopicTermFromCode();
    await runLessonPlanToLessonMigration();
    // Must run AFTER runDenormalizeCurriculumHierarchy (so CurriculumNode.termNumber
    // is available to backfill) AND AFTER runLessonPlanToLessonMigration (so all
    // legacy LessonPlans have been promoted to Lessons before we reshape them).
    await runLessonAssignmentsMigration();
  } catch (err: unknown) {
    logger.error({ err }, '[migrations] failed');
    throw err;
  }
}
