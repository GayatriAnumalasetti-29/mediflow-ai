import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface LogEntry {
  correlationId: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  ip?: string;
  userAgent?: string;
  error?: string;
  details?: any;
}

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'cookie',
  'creditCard',
  'cvv',
  'ssn',
  'pin'
]);

export const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeLogData);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const logger = {
  info: (message: string, meta?: any): void => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? { meta: sanitizeLogData(meta) } : {})
    }));
  },

  warn: (message: string, meta?: any): void => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? { meta: sanitizeLogData(meta) } : {})
    }));
  },

  error: (message: string, error?: any, meta?: any): void => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      ...(meta ? { meta: sanitizeLogData(meta) } : {})
    }));
  }
};

/**
 * Express Middleware for Request Correlation ID & HTTP Structured Access Logging
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = (req.headers['x-request-id'] as string) || `req-${uuidv4().substring(0, 8)}`;
  (req as any).correlationId = correlationId;
  res.setHeader('X-Request-ID', correlationId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    const logEntry: LogEntry = {
      correlationId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1'
    };

    if (isError) {
      logger.warn(`HTTP ${req.method} ${logEntry.url} completed with ${res.statusCode} (${durationMs}ms)`, logEntry);
    } else {
      // Keep routine successful logs concise
      if (req.method !== 'GET' || logEntry.url.startsWith('/api/')) {
        logger.info(`HTTP ${req.method} ${logEntry.url} ${res.statusCode} (${durationMs}ms)`, logEntry);
      }
    }
  });

  next();
};
