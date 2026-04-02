import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function createRateLimiter(windowMs: number, maxRequests: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? req.socket.remoteAddress;
    if (!ip) {
      res.status(400).json({ success: false, error: 'Cannot determine request origin' });
      return;
    }
    const key = `rl:${ip}:${req.path}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      const ttl = await redis.pttl(key);
      const resetTime = Math.ceil((Date.now() + Math.max(ttl, 0)) / 1000);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(maxRequests - current, 0));
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (current > maxRequests) {
        const retryAfter = Math.ceil(Math.max(ttl, 0) / 1000);
        res.setHeader('Retry-After', retryAfter);
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
        });
        return;
      }

      next();
    } catch {
      // Redis down — use in-memory fallback (fail closed)
      const now = Date.now();
      const entry = memoryStore.get(key) ?? { count: 0, resetAt: now + windowMs };
      if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + windowMs;
      }
      entry.count++;
      memoryStore.set(key, entry);

      if (entry.count > maxRequests) {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
        });
        return;
      }

      next();
    }
  };
}
