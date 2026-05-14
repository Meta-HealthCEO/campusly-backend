import crypto from 'crypto';
import { Student } from './model.js';
import { User } from '../Auth/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { EmailService } from '../../services/email.service.js';

const SYNTHETIC_STUDENT_EMAIL_DOMAIN = '@students.campusly.local';

export interface RegenerateCredentialsResult {
  credentials: {
    loginEmail: string;
    tempPassword: string;
    emailSent: boolean;
    emailError?: string;
  };
}

/**
 * Regenerates a temporary password for an existing student User. Used when a
 * teacher needs to re-issue login details (forgotten password, lost slip).
 *
 * - Throws NotFoundError if the student isn't in the requesting school.
 * - Throws BadRequestError if the student has no linked User (invite flow
 *   should be used instead to bootstrap an account).
 * - Bcrypt-hashed password is overwritten via Mongoose pre-save hook, so the
 *   old password is invalidated immediately.
 * - Sends email only when the login email is a real address; synthetic
 *   `@students.campusly.local` logins skip email and return emailSent: false.
 */
export async function regenerateCredentials(
  studentId: string,
  schoolId: string,
): Promise<RegenerateCredentialsResult> {
  const student = await Student.findOne({
    _id: studentId,
    schoolId,
    isDeleted: false,
  });
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  if (!student.userId) {
    throw new BadRequestError('Student has no portal account - use the invite flow instead');
  }

  const user = await User.findOne({ _id: student.userId, schoolId }).select('+password');
  if (!user) {
    throw new BadRequestError('Linked user account not found');
  }

  const tempPassword = `Campus-${crypto.randomBytes(3).toString('hex')}`;
  user.password = tempPassword;
  user.mustChangePassword = true;
  await user.save();

  const isSynthetic = user.email.endsWith(SYNTHETIC_STUDENT_EMAIL_DOMAIN);
  let emailSent = false;
  let emailError: string | undefined;
  if (!isSynthetic) {
    try {
      const result = await EmailService.sendStudentPortalCredentials(user.email, {
        studentName: `${user.firstName} ${user.lastName}`.trim(),
        loginEmail: user.email,
        tempPassword,
      });
      emailSent = result.success;
      if (!result.success) {
        emailError = 'Email provider reported failure';
      }
    } catch (err: unknown) {
      emailSent = false;
      emailError = err instanceof Error ? err.message : 'Unknown email error';
    }
  }

  return {
    credentials: {
      loginEmail: user.email,
      tempPassword,
      emailSent,
      ...(emailError ? { emailError } : {}),
    },
  };
}
