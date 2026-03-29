import { Redis } from 'ioredis';
import { config } from './env.js';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error.message);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});
