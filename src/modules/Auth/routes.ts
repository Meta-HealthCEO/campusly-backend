import express from 'express';
import { AuthController } from './controller.js';
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
router.get('/me', authenticate, AuthController.getMe);
router.post('/join-school', authenticate, validate(joinSchoolSchema), AuthController.joinSchool);

export default router;
