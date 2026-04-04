import { logger } from '../common/logger.js';
import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  nodeEnv: getEnv('NODE_ENV', 'development'),

  mongodb: {
    uri: getEnv('MONGODB_URI'),
  },

  redis: {
    url: getEnv('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    accessSecret: getEnv('JWT_ACCESS_SECRET'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
    resetTokenSecret: getEnv('JWT_RESET_SECRET', getEnv('JWT_ACCESS_SECRET')),
    accessExpiry: getEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: getEnv('JWT_REFRESH_EXPIRY', '7d'),
  },

  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  },

  smtp: {
    host: getEnv('SMTP_HOST'),
    port: parseInt(getEnv('SMTP_PORT', '587'), 10),
    user: getEnv('SMTP_USER'),
    pass: getEnv('SMTP_PASS'),
  },

  sms: {
    apiKey: getEnv('SMS_API_KEY'),
    apiUrl: getEnv('SMS_API_URL'),
  },

  app: {
    name: getEnv('APP_NAME', 'Campusly'),
    url: getEnv('APP_URL', 'http://localhost:3000'),
  },

  anthropic: {
    apiKey: getEnv('ANTHROPIC_API_KEY', ''),
    model: getEnv('ANTHROPIC_MODEL', 'claude-sonnet-4-6-20250514'),
  },

  resend: {
    apiKey: getEnv('RESEND_API_KEY', ''),
  },

  twilio: {
    accountSid: getEnv('TWILIO_ACCOUNT_SID', ''),
    authToken: getEnv('TWILIO_AUTH_TOKEN', ''),
    phoneNumber: getEnv('TWILIO_PHONE_NUMBER', ''),
  },

  firebase: {
    projectId: getEnv('FIREBASE_PROJECT_ID', ''),
    clientEmail: getEnv('FIREBASE_CLIENT_EMAIL', ''),
    privateKey: getEnv('FIREBASE_PRIVATE_KEY', ''),
  },

  email: {
    from: getEnv('EMAIL_FROM', 'Campusly <noreply@campusly.co.za>'),
  },
} as const;

export type Config = typeof config;

// Validate critical config at startup
if (config.nodeEnv === 'production') {
  if (!config.anthropic.apiKey) logger.warn('WARNING: ANTHROPIC_API_KEY not set');
  if (config.cors.origin === '*') {
    throw new Error('FATAL: CORS origin cannot be "*" in production. Set CORS_ORIGIN env var.');
  }
}
