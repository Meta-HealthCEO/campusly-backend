// src/modules/Auth/standalone-learner.ts
//
// A learner of a standalone (self-sign-up) teacher gets the seven-item
// learner portal (spec §1). Computed from the school, never stored: a
// student whose school's plan is 'standalone' and whose owner is a
// standalone teacher. Standalone coaches' clubs use the same plan and are
// excluded (their owner is a coach).
import mongoose from 'mongoose';
import { School } from '../School/model.js';
import { User } from './model.js';

type IdLike = string | mongoose.Types.ObjectId;

/** Whether a school is a standalone teacher's classroom. */
export async function isStandaloneTeacherSchool(schoolId: IdLike | null | undefined): Promise<boolean> {
  if (!schoolId || !mongoose.Types.ObjectId.isValid(String(schoolId))) return false;
  const school = await School.findOne({ _id: new mongoose.Types.ObjectId(String(schoolId)), isDeleted: false })
    .select('plan ownerUserId').lean();
  if (school?.plan !== 'standalone' || !school.ownerUserId) return false;
  const owner = await User.findOne({ _id: school.ownerUserId, isDeleted: false }).select('isStandaloneTeacher').lean();
  return owner?.isStandaloneTeacher === true;
}

export async function isStandaloneLearner(user: { role: string; schoolId?: IdLike | null }): Promise<boolean> {
  if (user.role !== 'student') return false;
  return isStandaloneTeacherSchool(user.schoolId);
}
