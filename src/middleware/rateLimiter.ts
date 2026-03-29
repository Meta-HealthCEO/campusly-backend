import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, RateLimitEntry>();

  // Clean up expired entries periodically
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requests) {
      if (now >= entry.resetTime) {
        requests.delete(key);
      }
    }
  }, windowMs);

  // Allow the timer to not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const entry = requests.get(ip);

    if (!entry || now >= entry.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - entry.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
    next();
  };
}
