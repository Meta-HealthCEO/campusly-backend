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
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as StringValue,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
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
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
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

    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async refreshToken(token: string): Promise<TokenPair> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted) {
      throw new UnauthorizedError('User not found');
    }

    // Theft detection: if token not found, clear ALL refresh tokens
    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
    }

    // Rotate: remove old token, add new one
    user.refreshTokens.splice(tokenIndex, 1);

    const tokens = AuthService.generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

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
      config.jwt.accessSecret,
      { expiresIn: '1h' },
    );

    // TODO: Send reset email with token
    // await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return 'If an account with that email exists, a password reset link has been sent';
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    user.password = newPassword;
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
