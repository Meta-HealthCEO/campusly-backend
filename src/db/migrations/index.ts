import { runLessonPlanToLessonMigration } from '../../modules/Lesson/service-lesson-migration.js';
import { runLessonAssignmentsMigration } from '../../modules/Lesson/service-lesson-assignments-migration.js';
import { runLessonPublishedAtMigration } from '../../modules/Lesson/service-lesson-publishedat-migration.js';
import { runStripGradeSuffixFromSubjects } from '../../modules/CurriculumStructure/service-normalize-titles.js';
import { runDenormalizeCurriculumHierarchy } from '../../modules/CurriculumStructure/service-denormalize-hierarchy.js';
import { runBackfillTopicTermFromCode } from '../../modules/CurriculumStructure/service-backfill-term-from-code.js';
import { runDenormalizeTextbookCurriculumRefs } from '../../modules/Textbook/service-denormalize-curriculum-refs.js';
import { runBackfillStandaloneAcademicRows } from '../../modules/Academic/services/backfill-standalone-scope.service.js';
import { runSweepCurriculumNodeForeignKeys } from '../../modules/Academic/services/sweep-curriculum-fks.service.js';
import { runNotificationPrefsBackfill } from '../../modules/Notification/service-notification-prefs-backfill.js';
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
    // Must run AFTER both lesson migrations so every document has the new
    // shape before we collapse `status` into `publishedAt`.
    await runLessonPublishedAtMigration();
    // Must run AFTER runDenormalizeCurriculumHierarchy so the standalone
    // teacher's scope (CurriculumNode IDs) resolves to nodes with valid
    // title fields. Materialises school-side Subject/Grade rows so other
    // modules (papers, marks, timetable) see normal data shapes.
    await runBackfillStandaloneAcademicRows();
    // Must run AFTER the standalone-row backfill so the curriculumNodeId
    // lookup tables on Subject and Grade are populated. Rewrites any stale
    // FKs in downstream collections that were captured during the era when
    // /academic/subjects and /academic/grades returned CurriculumNode rows.
    await runSweepCurriculumNodeForeignKeys();
    // Must run at startup so legacy NotificationPreference docs (missing
    // schoolId / categories) are clean before the upsert paths in
    // NotificationService are reachable. Without this, a legacy pref doc
    // with no schoolId can collide on the { userId: 1 } unique index when
    // a new upsert that includes schoolId is attempted (E11000).
    await runNotificationPrefsBackfill();
  } catch (err: unknown) {
    logger.error({ err }, '[migrations] failed');
    throw err;
  }
}
