import { z } from 'zod/v4';
import { UserRole } from '../../common/enums.js';

export const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]),
  schoolId: z.string().optional(),
  phone: z.string().optional(),
}).strict();

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.email(),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
}).strict();

export const registerTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  schoolName: z.string().optional(),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterTeacherInput = z.infer<typeof registerTeacherSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
