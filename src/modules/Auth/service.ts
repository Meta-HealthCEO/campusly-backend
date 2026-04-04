import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../../config/env.js';
import { User, IUser } from './model.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../common/errors.js';
import { EmailService } from '../../services/email.service.js';
import type { RegisterInput, RegisterTeacherInput, JoinSchoolInput, RegisterStudentInput } from './validation.js';
import mongoose from 'mongoose';
import { School, generateJoinCode } from '../School/model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static generateTokenPair(user: IUser): TokenPair {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?.toString(),
      isSchoolPrincipal: user.isSchoolPrincipal ?? false,
      isHOD: user.isHOD ?? false,
      departmentId: user.departmentId?.toString() ?? null,
      isBursar: user.isBursar ?? false,
      isReceptionist: user.isReceptionist ?? false,
      isCounselor: user.isCounselor ?? false,
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwt.accessExpiry as StringValue,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwt.refreshExpiry as StringValue,
    });

    return { accessToken, refreshToken };
  }

  static async register(data: RegisterInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const user = await User.create(data);
    const tokens = AuthService.generateTokenPair(user);

    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async registerTeacher(data: RegisterTeacherInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const schoolName = data.schoolName?.trim() || `${data.firstName}'s Classroom`;

    // Create the school with sensible defaults for an independent teacher
    const school = await School.create({
      name: schoolName,
      type: 'combined',
      address: { street: 'TBD', city: 'TBD', province: 'TBD', postalCode: '0000', country: 'South Africa' },
      contactInfo: { email: data.email.toLowerCase(), phone: '0000000000' },
      subscription: { tier: 'basic', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      modulesEnabled: ['auth', 'academic', 'ai_tools', 'teacher_workbench', 'learning'],
      settings: { academicYear: new Date().getFullYear(), terms: 4, gradingSystem: 'percentage' },
      principal: `${data.firstName} ${data.lastName}`,
      joinCode: generateJoinCode(),
      isActive: true,
    });

    // Create user as teacher + school principal
    const user = await User.create({
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'teacher',
      schoolId: school._id,
      isSchoolPrincipal: true,
    });

    const tokens = AuthService.generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async login(email: string, password: string): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = AuthService.generateTokenPair(user);

    user.lastLoginAt = new Date();
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async refreshToken(token: string): Promise<TokenPair> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Atomically pull old token — prevents race conditions
    const result = await User.findOneAndUpdate(
      { _id: decoded.id, isDeleted: false, refreshTokens: token },
      { $pull: { refreshTokens: token } },
      { new: true },
    );

    if (!result) {
      // Token not found = reuse detected, clear all tokens
      await User.findByIdAndUpdate(decoded.id, { $set: { refreshTokens: [] } });
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
    }

    // Generate new tokens
    const tokens = AuthService.generateTokenPair(result);
    await User.findByIdAndUpdate(decoded.id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    return tokens;
  }

  static async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      // Return silently to prevent email enumeration
      return 'If an account with that email exists, a password reset link has been sent';
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      config.jwt.resetTokenSecret,
      { algorithm: 'HS256', expiresIn: '1h' },
    );

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await EmailService.sendPasswordReset(user.email, resetToken);

    return 'If an account with that email exists, a password reset link has been sent';
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.resetTokenSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();
  }

  static async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async registerStudent(
    data: RegisterStudentInput,
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Find the class by classroom code
    const cls = await Class.findOne({ classroomCode: data.classroomCode, isDeleted: false });
    if (!cls) {
      throw new NotFoundError('No class found with that classroom code. Please check the code and try again.');
    }

    // Create the user with role student
    const user = await User.create({
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'student',
      schoolId: cls.schoolId,
    });

    // Generate a unique admission number
    const admissionNumber = `STU-${Date.now().toString(36).toUpperCase()}`;

    // Create the Student record linked to the class, grade, and school
    await Student.create({
      userId: user._id,
      schoolId: cls.schoolId,
      gradeId: cls.gradeId,
      classId: cls._id,
      admissionNumber,
      enrollmentStatus: 'active',
    });

    const tokens = AuthService.generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async joinSchool(
    userId: string,
    data: JoinSchoolInput,
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const teacher = await User.findOne({ _id: userId, isDeleted: false, isActive: true });
    if (!teacher) {
      throw new NotFoundError('User not found');
    }

    if (teacher.role !== 'teacher') {
      throw new BadRequestError('Only teachers can join a school via join code');
    }

    const targetSchool = await School.findOne({ joinCode: data.joinCode, isDeleted: false, isActive: true });
    if (!targetSchool) {
      throw new NotFoundError('No active school found with that join code');
    }

    const oldSchoolId = teacher.schoolId?.toString();
    const newSchoolId = targetSchool._id.toString();

    if (oldSchoolId === newSchoolId) {
      throw new BadRequestError('You are already a member of this school');
    }

    // Archive the old auto-created school if it exists and differs
    if (oldSchoolId) {
      await School.findOneAndUpdate(
        { _id: oldSchoolId, isDeleted: false },
        { $set: { isActive: false } },
      );

      // Migrate teacher-created content to the new school
      const contentModels = [
        'ContentResource',
        'Question',
        'GeneratedPaper',
        'LessonPlan',
        'Quiz',
      ];

      for (const modelName of contentModels) {
        const model = mongoose.models[modelName];
        if (!model) continue;
        const schemaPaths = model.schema.paths as Record<string, unknown>;
        const hasSchoolId = 'schoolId' in schemaPaths;
        const hasTeacherId = 'teacherId' in schemaPaths;
        if (hasSchoolId && hasTeacherId) {
          await model.updateMany(
            { teacherId: userId, schoolId: oldSchoolId, isDeleted: false },
            { $set: { schoolId: targetSchool._id } },
          );
        }
      }
    }

    // Link teacher to new school, demote from principal of old school
    teacher.schoolId = targetSchool._id as typeof teacher.schoolId;
    teacher.isSchoolPrincipal = false;
    await teacher.save();

    const updatedUser = await User.findById(userId).select('-password -refreshTokens');
    if (!updatedUser) {
      throw new NotFoundError('User not found after update');
    }

    const tokens = AuthService.generateTokenPair(updatedUser);
    await User.findByIdAndUpdate(userId, { $push: { refreshTokens: tokens.refreshToken } });

    return { user: updatedUser, tokens };
  }
}
