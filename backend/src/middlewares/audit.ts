import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const auditLogger = (action: string, resource: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    res.send = function (body): Response {
      const user = req.user;
      const ip = req.ip || req.socket.remoteAddress;
      const statusCode = res.statusCode;

      if (statusCode >= 200 && statusCode < 400) {
        console.log(`[AUDIT LOG] [${new Date().toISOString()}] Action: ${action} | Resource: ${resource} | User: ${user?.email || 'Anonymous'} (${user?.role || 'NONE'}) | IP: ${ip}`);
      }
      return originalSend.call(this, body);
    };
    next();
  };
};
