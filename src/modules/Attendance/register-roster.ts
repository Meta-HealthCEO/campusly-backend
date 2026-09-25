// src/modules/Attendance/register-roster.ts
//
// The learners on a group's register: their own group or a group they joined.
import mongoose from 'mongoose';
import { Student } from '../Student/model.js';
import { classRosterFilter } from '../../common/class-roster.js';

export interface RegisterLearner {
  _id: mongoose.Types.ObjectId;
  admissionNumber?: string;
  userId: { firstName?: string; lastName?: string } | null;
}

export async function registerRoster(schoolId: string, classId: string): Promise<RegisterLearner[]> {
  return Student.find(classRosterFilter(classId, { schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false }))
    .select('admissionNumber userId')
    .populate({ path: 'userId', select: 'firstName lastName' })
    .lean<RegisterLearner[]>();
}
