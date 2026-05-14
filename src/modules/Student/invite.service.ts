import { Student } from './model.js';
import { User } from '../Auth/model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import { EmailService } from '../../services/email.service.js';
import crypto from 'crypto';

export class StudentInviteService {
  static async inviteStudent(
    studentId: string,
    schoolId: string,
    data: { email: string },
  ): Promise<{
    loginEmail: string;
    tempPassword: string;
    emailSent: boolean;
  }> {
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false });
    if (!student) throw new NotFoundError('Student not found');
    if (!data.email) throw new BadRequestError('Email is required to invite a student');

    const loginEmail = data.email.toLowerCase();
    const existingUser = await User.findOne({ email: loginEmail, isDeleted: false });
    if (existingUser && existingUser._id.toString() !== student.userId?.toString()) {
      throw new ConflictError('A user with this email already exists');
    }

    const tempPassword = `Campus-${crypto.randomBytes(3).toString('hex')}`;

    let user = student.userId
      ? await User.findOne({ _id: student.userId, schoolId, isDeleted: false }).select('+password')
      : null;

    if (user) {
      user.email = loginEmail;
      user.password = tempPassword;
      user.mustChangePassword = true;
      await user.save();
    } else {
      user = await User.create({
        email: loginEmail,
        password: tempPassword,
        firstName: student.admissionNumber,
        lastName: '',
        role: 'student',
        schoolId,
        mustChangePassword: true,
      });
      student.userId = user._id;
      await student.save();
    }

    let emailSent = false;
    try {
      const result = await EmailService.sendStudentPortalCredentials(loginEmail, {
        studentName: student.admissionNumber,
        loginEmail,
        tempPassword,
      });
      emailSent = result.success;
    } catch {
      emailSent = false;
    }

    return {
      loginEmail,
      tempPassword,
      emailSent,
    };
  }
}
