// src/modules/Course/enrolment.ts
//
// Enrolling learners in class units. The teacher's release enrols a whole
// group (assignCourseToClass); a learner who arrives later — sign-up, join
// code, added by the teacher, bulk import, moved group — is enrolled in every
// unit already released to that group (spec §4). A learner with ANY earlier
// enrolment row for a unit, including a dropped one, is left alone (R10).
import mongoose from 'mongoose';
import { Course, Enrolment } from './model.js';
import { logger } from '../../common/logger.js';

type IdLike = string | mongoose.Types.ObjectId;
type Oid = mongoose.Types.ObjectId;
const toOid = (id: IdLike): Oid => new mongoose.Types.ObjectId(String(id));

/** Idempotent bulk upsert: a learner already actively enrolled is matched, not duplicated. */
export async function upsertEnrolments(
  unit: { _id: Oid; schoolId: Oid },
  classId: Oid,
  studentIds: Oid[],
  enrolledBy: Oid,
): Promise<{ newEnrolments: number; alreadyEnroled: number }> {
  if (studentIds.length === 0) return { newEnrolments: 0, alreadyEnroled: 0 };
  const ops = studentIds.map((studentId: Oid) => ({
    updateOne: {
      filter: { courseId: unit._id, studentId, isDeleted: false },
      update: {
        $setOnInsert: {
          isDeleted: false, schoolId: unit.schoolId, courseId: unit._id, studentId, enrolledBy, classId,
          enrolledAt: new Date(), status: 'active' as const, progressPercent: 0, completedAt: null, certificateId: null,
        },
      },
      upsert: true,
    },
  }));
  const result = await Enrolment.bulkWrite(ops, { ordered: false });
  return { newEnrolments: result.upsertedCount ?? 0, alreadyEnroled: result.matchedCount ?? 0 };
}

/** Enrols one learner in every unit released to this group that they have never had. Returns how many. */
export async function enrolLearnerInReleasedUnits(studentId: IdLike, classId: IdLike, schoolId: IdLike): Promise<number> {
  const school = toOid(schoolId);
  const cls = toOid(classId);
  const student = toOid(studentId);
  const units = await Course.find({ schoolId: school, kind: 'class_unit', status: 'published', isDeleted: false, 'scope.classIds': cls })
    .select('_id schoolId createdBy publishedBy').lean();
  if (units.length === 0) return 0;
  const earlier = await Enrolment.find({ schoolId: school, studentId: student, courseId: { $in: units.map((u) => u._id) } })
    .select('courseId').lean();
  const had = new Set(earlier.map((e) => String(e.courseId)));
  let made = 0;
  for (const unit of units.filter((u) => !had.has(String(u._id)))) {
    const enrolledBy = (unit.publishedBy ?? unit.createdBy) as Oid;
    made += (await upsertEnrolments({ _id: unit._id as Oid, schoolId: unit.schoolId as Oid }, cls, [student], enrolledBy)).newEnrolments;
  }
  return made;
}

/** enrolLearnerInReleasedUnits for a learner entering a group: logged, never thrown (R11). */
export async function enrolOnJoin(studentId: IdLike, classId: IdLike, schoolId: IdLike): Promise<void> {
  try {
    await enrolLearnerInReleasedUnits(studentId, classId, schoolId);
  } catch (err: unknown) {
    logger.warn({ err, studentId: String(studentId), classId: String(classId) }, '[enrolment] enrol on join failed; migrate:unit-enrolments repairs it');
  }
}
