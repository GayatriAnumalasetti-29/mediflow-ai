import { Request, Response } from 'express';
import { auditLoggerService } from '../services/auditLoggerService';

export const auditController = {
  getAuditLogs: async (req: Request, res: Response): Promise<void> => {
    const logs = auditLoggerService.getAuditLogs();
    res.json({
      success: true,
      data: logs
    });
  },

  recordCustomEvent: async (req: Request, res: Response): Promise<void> => {
    const { action, resource, details, status } = req.body;
    const user = (req as any).user || { id: 'usr-pat-001', role: 'PATIENT' };

    const newLog = auditLoggerService.logEvent({
      userId: user.id,
      userRole: user.role,
      action: action || 'PHI_VIEW',
      resource: resource || 'Unknown',
      ipAddress: req.ip || '127.0.0.1',
      details: details || 'Action recorded',
      status: status || 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      data: newLog
    });
  }
};
