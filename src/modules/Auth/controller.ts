import { Request, Response } from 'express';
import { AuthService } from './service.js';
import { apiResponse } from '../../common/utils.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.register(req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(201).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'User registered successfully'),
    );
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(200).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Login successful'),
    );
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.refresh_token || req.body.refreshToken;

    if (!token) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'Refresh token is required'));
      return;
    }

    const tokens = await AuthService.refreshToken(token);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json(
      apiResponse(true, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Token refreshed successfully'),
    );
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

    if (req.user?.id && refreshToken) {
      await AuthService.logout(req.user.id, refreshToken);
    }

    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

    res.status(200).json(apiResponse(true, undefined, 'Logged out successfully'));
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const message = await AuthService.forgotPassword(req.body.email);
    res.status(200).json(apiResponse(true, undefined, message));
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    res.status(200).json(apiResponse(true, undefined, 'Password reset successfully'));
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    const user = await AuthService.getMe(req.user!.id);
    res.status(200).json(apiResponse(true, { user }, 'User retrieved successfully'));
  }
}
