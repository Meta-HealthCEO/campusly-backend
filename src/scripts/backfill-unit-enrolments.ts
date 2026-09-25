/**
 * Enrols learners in class units already released to their groups (spec §4):
 * learners who joined before enrol-on-join shipped, or joined a second group.
 * A learner with any earlier enrolment row for a unit (dropped included) is
 * left alone. Safe to run repeatedly.
 * Run: npm run migrate:unit-enrolments            (dry run: counts only)
 *      npm run migrate:unit-enrolments -- --apply (writes)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { Course, Enrolment } from '../modules/Course/model.js';
import { Student } from '../modules/Student/model.js';
import { classRosterFilter, learnerClassIds } from '../common/class-roster.js';
import { upsertEnrolments } from '../modules/Course/enrolment.js';

type Oid = mongoose.Types.ObjectId;

export async function backfillUnitEnrolments(
  { apply, schoolIds }: { apply: boolean; /** Limit to these schools (tests); default: every school. */ schoolIds?: Oid[] },
): Promise<{ units: number; missing: number; created: number }> {
  const units = await Course.find({
    kind: 'class_unit', status: 'published', isDeleted: false, 'scope.classIds.0': { $exists: true },
    ...(schoolIds ? { schoolId: { $in: schoolIds } } : {}),
  }).select('_id schoolId createdBy publishedBy scope.classIds').lean();

  let missing = 0;
  let created = 0;
  for (const unit of units) {
    const classIds = (unit.scope?.classIds ?? []) as Oid[];
    const released = new Set(classIds.map(String));
    const roster = await Student.find(classRosterFilter(classIds, { schoolId: unit.schoolId, isDeleted: false }))
      .select('_id classId subjectClassIds').lean();
    const earlier = await Enrolment.find({ courseId: unit._id, studentId: { $in: roster.map((s) => s._id) } }).select('studentId').lean();
    const had = new Set(earlier.map((e) => String(e.studentId)));
    const todo = roster.filter((s) => !had.has(String(s._id)));
    missing += todo.length;
    if (!apply) continue;
    for (const learner of todo) {
      const classId = learnerClassIds(learner).find((id) => released.has(String(id))) as Oid;
      const enrolledBy = (unit.publishedBy ?? unit.createdBy) as Oid;
      created += (await upsertEnrolments({ _id: unit._id as Oid, schoolId: unit.schoolId as Oid }, classId, [learner._id as Oid], enrolledBy)).newEnrolments;
    }
  }
  return { units: units.length, missing, created };
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(config.mongodb.uri);
  try {
    const result = await backfillUnitEnrolments({ apply });
    const message = apply
      ? `Enrolled ${result.created} learner(s) across ${result.units} released unit(s).`
      : `Dry run: ${result.missing} learner(s) across ${result.units} released unit(s) would be enrolled. Re-run with --apply.`;
    logger.info({ ...result, apply }, message);
  } finally {
    await mongoose.disconnect();
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main().catch((err: unknown) => {
    logger.error({ err }, 'Unit enrolment backfill failed');
    process.exit(1);
  });
}
