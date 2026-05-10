import { runLessonPlanToLessonMigration } from '../../modules/Lesson/service-lesson-migration.js';
import { runLessonAssignmentsMigration } from '../../modules/Lesson/service-lesson-assignments-migration.js';
import { runStripGradeSuffixFromSubjects } from '../../modules/CurriculumStructure/service-normalize-titles.js';
import { runDenormalizeCurriculumHierarchy } from '../../modules/CurriculumStructure/service-denormalize-hierarchy.js';
import { runBackfillTopicTermFromCode } from '../../modules/CurriculumStructure/service-backfill-term-from-code.js';
import { runDenormalizeTextbookCurriculumRefs } from '../../modules/Textbook/service-denormalize-curriculum-refs.js';
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
    // Must run AFTER runDenormalizeCurriculumHierarchy so subject/grade
    // CurriculumNodes with cleaned-up titles are resolvable by name match.
    // Bridges academic Subject/Grade refs on Textbook to CurriculumNode refs
    // so the AI-generator textbook resolver can find a textbook for a topic.
    await runDenormalizeTextbookCurriculumRefs();
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
