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

export const registerStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  classroomCode: z
    .string()
    .length(6, 'Classroom code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Classroom code must be alphanumeric')
    .transform((v: string) => v.toUpperCase()),
}).strict();

export const standaloneTeacherSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  country: z.string().optional(),
  subjects: z.array(z.string()).optional(),
}).strict();

export const standaloneCoachSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  country: z.string().optional(),
  sports: z.array(z.string()).optional(),
}).strict();

export const joinSchoolSchema = z.object({
  joinCode: z
    .string()
    .length(6, 'Join code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Join code must be alphanumeric')
    .transform((v: string) => v.toUpperCase()),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterTeacherInput = z.infer<typeof registerTeacherSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type JoinSchoolInput = z.infer<typeof joinSchoolSchema>;
export type StandaloneTeacherSignupInput = z.infer<typeof standaloneTeacherSignupSchema>;
export type StandaloneCoachSignupInput = z.infer<typeof standaloneCoachSignupSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
