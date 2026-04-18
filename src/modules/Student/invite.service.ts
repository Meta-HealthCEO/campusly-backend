import { Student } from './model.js';
import { User } from '../Auth/model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import crypto from 'crypto';

export class StudentInviteService {
  static async inviteStudent(
    studentId: string,
    schoolId: string,
    data: { email: string },
  ): Promise<{ tempPassword: string }> {
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false });
    if (!student) throw new NotFoundError('Student not found');
    if (student.userId) throw new ConflictError('Student already has a portal account');
    if (!data.email) throw new BadRequestError('Email is required to invite a student');

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) throw new ConflictError('A user with this email already exists');

    const tempPassword = crypto.randomBytes(4).toString('hex');

    const user = await User.create({
      email: data.email.toLowerCase(),
      password: tempPassword,
      firstName: student.admissionNumber,
      lastName: '',
      role: 'student',
      schoolId,
    });

    student.userId = user._id;
    await student.save();

    return { tempPassword };
  }
}
