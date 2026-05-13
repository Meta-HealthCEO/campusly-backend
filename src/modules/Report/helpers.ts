import { Types } from 'mongoose';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import { UserRole } from '../../common/enums.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { GradeService } from '../Academic/services/grade.service.js';
import { Parent } from '../Parent/model.js';
import { Student } from '../Student/model.js';

interface StudentAccessRecord {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  userId?: Types.ObjectId;
}

export interface StudentReportAccess {
  schoolId: string;
  student: StudentAccessRecord;
}

export async function assertCanAccessStudentReport(
  user: AuthenticatedUser,
  studentId: string,
): Promise<StudentReportAccess> {
  const student = await Student.findOne({
    _id: studentId,
    ...(user.schoolId ? { schoolId: user.schoolId } : {}),
    isDeleted: false,
  })
    .select('_id schoolId classId userId guardianIds')
    .lean<StudentAccessRecord>();

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const schoolId = String(student.schoolId);

  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SCHOOL_ADMIN) {
    return { schoolId, student };
  }

  if (user.role === UserRole.TEACHER) {
    const canAccess = await GradeService.teacherCanAccessClass(user.id, String(student.classId), schoolId);
    if (canAccess) {
      return { schoolId, student };
    }
  }

  if (user.role === UserRole.STUDENT && student.userId && String(student.userId) === user.id) {
    return { schoolId, student };
  }

  if (user.role === UserRole.PARENT) {
    const parent = await Parent.findOne({
      userId: user.id,
      schoolId,
      childrenIds: student._id,
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (parent) {
      return { schoolId, student };
    }
  }

  throw new ForbiddenError('You do not have access to this student report');
}
