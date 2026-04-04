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
import type { RegisterInput } from './validation.js';

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
}
