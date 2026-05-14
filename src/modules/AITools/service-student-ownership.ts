import mongoose from 'mongoose';
import { Student } from '../Student/model.js';
import { NotFoundError } from '../../common/errors.js';

export interface ResolvedStudent {
  studentId: string;
  schoolId: string;
}

/**
 * JWT carries the User._id, not the Student._id. Student-facing endpoints
 * use this resolver to convert userId → studentId before scoping marking
 * queries.
 */
export async function resolveStudentForUser(userId: string): Promise<ResolvedStudent> {
  const student = await Student.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  })
    .select('_id schoolId')
    .lean();
  if (!student) throw new NotFoundError('Student record not found for user');
  return {
    studentId: String(student._id),
    schoolId: String(student.schoolId),
  };
}
