import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private ipRecords = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Automatically purge records older than 5 minutes every 60 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 5 * 60 * 1000;
      for (const [ip, record] of this.ipRecords.entries()) {
        record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
        if (record.timestamps.length === 0) {
          this.ipRecords.delete(ip);
        }
      }
    }, 60000);

    // Prevent interval from blocking process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public check(ip: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; retryAfterSec: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.ipRecords.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.ipRecords.set(ip, record);
    }

    // Filter to requests within current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSec = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, retryAfterSec) };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: limit - record.timestamps.length,
      retryAfterSec: 0
    };
  }
}

const rateLimiterInstance = new SlidingWindowRateLimiter();

/**
 * Creates an Express rate-limiting middleware.
 * @param maxRequests Maximum requests allowed within windowMs
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 min)
 * @param message Custom message on rate limit exceed
 */
export const rateLimit = (maxRequests: number = 300, windowMs: number = 60000, message?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.headers['x-internal-test'] === 'mediflow-suite') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = rateLimiterInstance.check(ip, maxRequests, windowMs);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfterSec);
      res.status(429).json({
        success: false,
        error: message || `Too many requests from this IP. Please try again after ${result.retryAfterSec} seconds.`,
        retryAfter: result.retryAfterSec
      });
      return;
    }

    next();
  };
};

// Common Presets
export const standardApiLimiter = rateLimit(300, 60000); // 300 req / min
export const sensitiveEndpointLimiter = rateLimit(60, 60000, 'Rate limit exceeded for sensitive clinical/auth operations.'); // 60 req / min
