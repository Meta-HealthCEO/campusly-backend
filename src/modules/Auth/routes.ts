import express from 'express';
import { AuthController } from './controller.js';
import { getMobileContext } from './controllers/mobileContext.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createRateLimiter } from '../../middleware/rateLimiter.js';
import { RATE_LIMITS } from '../../common/constants.js';
import {
  registerSchema,
  registerTeacherSchema,
  registerStudentSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  joinSchoolSchema,
  standaloneTeacherSignupSchema,
  standaloneCoachSignupSchema,
} from './validation.js';

const router = express.Router();

const authRateLimiter = createRateLimiter(RATE_LIMITS.auth.windowMs, RATE_LIMITS.auth.max);

router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/register-teacher', authRateLimiter, validate(registerTeacherSchema), AuthController.registerTeacher);
router.post('/register-student', authRateLimiter, validate(registerStudentSchema), AuthController.registerStudent);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', createRateLimiter(15 * 60 * 1000, 30), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/change-password', authenticate, AuthController.changePassword);
router.get('/me', authenticate, AuthController.getMe);
router.get('/me/mobile-context', authenticate, getMobileContext);
router.post('/join-school', authenticate, validate(joinSchoolSchema), AuthController.joinSchool);

// Standalone signup flows
router.post(
  '/signup/standalone-teacher',
  authRateLimiter,
  validate(standaloneTeacherSignupSchema),
  AuthController.signupStandaloneTeacher,
);
router.post(
  '/signup/standalone-coach',
  authRateLimiter,
  validate(standaloneCoachSignupSchema),
  AuthController.signupStandaloneCoach,
);
router.get('/onboarding-status', authenticate, AuthController.getTeacherOnboardingStatus);
router.post('/onboarding-dismiss', authenticate, AuthController.dismissTeacherOnboarding);
router.get('/coach/onboarding-status', authenticate, AuthController.getCoachOnboardingStatus);
router.post('/coach/onboarding-dismiss', authenticate, AuthController.dismissCoachOnboarding);

export default router;
