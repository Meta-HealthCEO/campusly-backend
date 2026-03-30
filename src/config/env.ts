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
    model: getEnv('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514'),
  },
} as const;

export type Config = typeof config;
