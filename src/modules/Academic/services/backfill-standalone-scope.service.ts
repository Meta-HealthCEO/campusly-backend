// src/modules/Academic/services/backfill-standalone-scope.service.ts
//
// One-time migration: for every standalone teacher whose User.teachingScope
// references CurriculumNode IDs, materialise the matching school-side Grade
// and Subject rows. After this runs, the controller-level standalone masks
// (which used to dress CurriculumNodes as Subjects/Grades) can stay removed
// because the data they were faking now actually exists.
//
// Idempotent — re-runs are no-ops because ensureGradeForCurriculumNode and
// ensureSubjectForCurriculumNode prefer the existing row when present.

import mongoose from 'mongoose';
import { User } from '../../Auth/model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../../db/migrations/sentinel.js';
import { logger } from '../../../common/logger.js';
import { materialiseTeachingScope } from './materialise-from-curriculum.service.js';

const MIGRATION_NAME = 'backfill-standalone-teacher-academic-rows';

interface TeachingScopeEntry {
  gradeId: mongoose.Types.ObjectId;
  subjectIds: mongoose.Types.ObjectId[];
}

interface StandaloneTeacherDoc {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId | null;
  teachingScope?: {
    grades: mongoose.Types.ObjectId[];
    subjectsByGrade: TeachingScopeEntry[];
  };
}

export async function runBackfillStandaloneAcademicRows(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] standalone-academic-backfill already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] standalone-academic-backfill lock held by another instance, skipping');
    return;
  }

  try {
    const teachers = await User.find({
      isStandaloneTeacher: true,
      isDeleted: false,
      schoolId: { $ne: null },
      'teachingScope.subjectsByGrade.0': { $exists: true },
    })
      .select('_id schoolId teachingScope')
      .lean<StandaloneTeacherDoc[]>();

    let materialised = 0;
    let skipped = 0;

    for (const teacher of teachers) {
      if (!teacher.schoolId || !teacher.teachingScope) {
        skipped += 1;
        continue;
      }
      const pairs = teacher.teachingScope.subjectsByGrade.flatMap((entry) =>
        entry.subjectIds.map((sid) => ({
          curriculumGradeId: entry.gradeId,
          curriculumSubjectId: sid,
        })),
      );
      if (pairs.length === 0) {
        skipped += 1;
        continue;
      }
      try {
        await materialiseTeachingScope(teacher.schoolId, pairs);
        materialised += 1;
      } catch (err: unknown) {
        logger.error(
          { err, teacherId: teacher._id, schoolId: teacher.schoolId },
          '[migrations] standalone-academic-backfill failed for one teacher; continuing',
        );
      }
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      { scanned: teachers.length, materialised, skipped },
      '[migrations] standalone-academic-backfill complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error({ err }, '[migrations] standalone-academic-backfill failed; lock released for retry');
    throw err;
  }
}
