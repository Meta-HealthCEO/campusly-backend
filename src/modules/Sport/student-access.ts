import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { ForbiddenError } from '../../common/errors.js';
import { Parent } from '../Parent/model.js';
import { Student } from '../Student/model.js';

export async function resolveScopedStudentId(
  user: AuthenticatedUser,
  requestedStudentId?: string,
): Promise<string | undefined> {
  if (user.role === 'student') {
    const student = await Student.findOne({
      userId: user.id,
      ...(user.schoolId ? { schoolId: user.schoolId } : {}),
      isDeleted: false,
    }).select('_id').lean();

    if (!student) {
      throw new ForbiddenError('Student profile not found');
    }

    return student._id.toString();
  }

  if (user.role === 'parent') {
    if (!requestedStudentId) {
      throw new ForbiddenError('A child studentId is required');
    }

    const parent = await Parent.findOne({
      userId: user.id,
      ...(user.schoolId ? { schoolId: user.schoolId } : {}),
      childrenIds: requestedStudentId,
      isDeleted: false,
    }).select('_id').lean();

    if (!parent) {
      throw new ForbiddenError("You can only access your own children's data");
    }
  }

  return requestedStudentId;
}
