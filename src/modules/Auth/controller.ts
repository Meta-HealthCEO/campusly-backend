import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AuthService } from './service.js';
import { StandaloneService } from './standalone.service.js';
import { StandaloneCoachService } from './standalone-coach.service.js';
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
      }, 'User registered successfully'),
    );
  }

  static async registerTeacher(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.registerTeacher(req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(201).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
      }, 'Teacher registered successfully'),
    );
  }

  static async signupStandaloneTeacher(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await StandaloneService.signup(req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(201).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
      }, 'Standalone teacher registered successfully'),
    );
  }

  static async signupStandaloneCoach(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await StandaloneCoachService.signup(req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(201).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
      }, 'Standalone coach registered successfully'),
    );
  }

  static async getTeacherOnboardingStatus(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const status = await StandaloneService.getOnboardingStatus(user.id, user.schoolId!);
    res.status(200).json(apiResponse(true, status, 'Teacher onboarding status retrieved'));
  }

  static async dismissTeacherOnboarding(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await StandaloneService.dismissOnboarding(user.id);
    res.status(200).json(apiResponse(true, undefined, 'Onboarding dismissed'));
  }

  static async getCoachOnboardingStatus(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const status = await StandaloneCoachService.getOnboardingStatus(user.id, user.schoolId!);
    res.status(200).json(apiResponse(true, status, 'Coach onboarding status retrieved'));
  }

  static async dismissCoachOnboarding(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await StandaloneCoachService.dismissOnboarding(user.id);
    res.status(200).json(apiResponse(true, undefined, 'Onboarding dismissed'));
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
      }, 'Login successful'),
    );
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.refresh_token;

    if (!token) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'Refresh token is required'));
      return;
    }

    const tokens = await AuthService.refreshToken(token);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json(
      apiResponse(true, {
        accessToken: tokens.accessToken,
      }, 'Token refreshed successfully'),
    );
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;

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
    const user = await AuthService.getMe(getUser(req).id);
    res.status(200).json(apiResponse(true, { user }, 'User retrieved successfully'));
  }

  static async registerStudent(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.registerStudent(req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(201).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
      }, 'Student registered successfully'),
    );
  }

  static async joinSchool(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.joinSchool(getUser(req).id, req.body);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const userData = user.toObject();
    const { password: _, refreshTokens: __, ...safeUser } = userData;

    res.status(200).json(
      apiResponse(true, {
        user: safeUser,
        accessToken: tokens.accessToken,
      }, 'Successfully joined school'),
    );
  }
}
