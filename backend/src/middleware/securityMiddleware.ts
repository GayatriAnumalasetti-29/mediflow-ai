import { Request, Response, NextFunction } from 'express';
import { auditLoggerService } from '../services/auditLoggerService';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const securityMiddleware = {
  sanitizeInput: (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize string inputs recursively against basic script injection
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      }
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          obj[key] = sanitize(obj[key]);
        }
      }
      return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    next();
  },

  validateFileUpload: (req: Request, res: Response, next: NextFunction): void => {
    const { mimeType, fileSizeBytes, fileName } = req.body;

    // 1. Path Traversal & Suspicious File Extension Guard
    if (fileName && typeof fileName === 'string') {
      const lowerName = fileName.toLowerCase();
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.vbs', '.scr', '.ps1'];
      const hasDangerousExt = dangerousExtensions.some((ext) => lowerName.endsWith(ext));
      const hasPathTraversal = fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0');

      if (hasDangerousExt || hasPathTraversal) {
        auditLoggerService.logEvent({
          userId: 'ANONYMOUS_UPLOAD',
          userRole: 'UNVERIFIED',
          action: 'SECURITY_VIOLATION',
          resource: 'FileUpload',
          ipAddress: req.ip || '127.0.0.1',
          details: `Blocked malicious file upload attempt: ${fileName}`,
          status: 'BLOCKED'
        });

        res.status(400).json({
          success: false,
          error: 'Security Error: Disallowed filename or dangerous extension detected.'
        });
        return;
      }
    }

    // 2. MIME Type Whitelist
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      res.status(400).json({
        success: false,
        error: `Invalid file format: ${mimeType}. Only JPEG, PNG, WEBP, and PDF medical documents are permitted.`
      });
      return;
    }

    // 3. File Size Ceiling
    if (fileSizeBytes && fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      res.status(400).json({
        success: false,
        error: `File size exceeds the 10MB limit (Uploaded size: ${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB).`
      });
      return;
    }

    next();
  },

  auditPhiAccess: (resourceName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user || { id: 'usr-pat-001', role: 'PATIENT' };
      auditLoggerService.logEvent({
        userId: user.id,
        userRole: user.role,
        action: 'PHI_VIEW',
        resource: resourceName,
        ipAddress: req.ip || '127.0.0.1',
        details: `Access to protected health information (${resourceName}) requested.`,
        status: 'SUCCESS'
      });
      next();
    };
  }
};
