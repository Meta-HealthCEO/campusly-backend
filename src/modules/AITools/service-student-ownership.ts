import { resolveStudentFromUserId } from '../../common/student-resolver.js';
import { NotFoundError } from '../../common/errors.js';

export interface ResolvedStudent {
  studentId: string;
  schoolId: string;
}

/**
 * Thin wrapper around the canonical resolver at src/common/student-resolver.ts.
 * Returns plain string IDs and throws NotFoundError when no record exists,
 * so student-facing controllers can use it without null-checking + casting.
 */
export async function resolveStudentForUser(
  userId: string,
  schoolId: string,
): Promise<ResolvedStudent> {
  const student = await resolveStudentFromUserId(userId, schoolId);
  if (!student) throw new NotFoundError('Student record not found for user');
  return {
    studentId: String(student._id),
    schoolId: String(student.schoolId),
  };
}
