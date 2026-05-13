import jwt from 'jsonwebtoken';
import type mongoose from 'mongoose';
import { config } from '../config/env.js';

export interface SignTestTokenInput {
  id?: mongoose.Types.ObjectId | string;
  schoolId?: mongoose.Types.ObjectId | string;
  role?: string;
  email?: string;
  isSchoolPrincipal?: boolean;
  isStandaloneTeacher?: boolean;
}

export function signTestToken(input: SignTestTokenInput = {}): string {
  const payload = {
    id: input.id?.toString() ?? 'test-user-id',
    email: input.email ?? 'test@example.test',
    role: input.role ?? 'teacher',
    schoolId: input.schoolId?.toString(),
    isSchoolPrincipal: input.isSchoolPrincipal ?? true,
    isStandaloneTeacher: input.isStandaloneTeacher ?? true,
  };
  return jwt.sign(payload, config.jwt.accessSecret, { algorithm: 'HS256', expiresIn: '15m' });
}
