import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { followUpSchedulerService } from '../services/followUpSchedulerService';
import { EscalationSeverity } from '@mediflow/shared';
import { socketService } from '../services/socketService';

export const followUpController = {
  getFollowUpLogs: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const logs = mockDataService.followUpLogs.filter((l) => l.patientId === patientId);
    res.json({ success: true, data: logs });
  },

  createFollowUpLog: async (req: Request, res: Response): Promise<void> => {
    const { patientId, reportedSymptoms, painScale, vitals, generalWellness, redFlagDetected } = req.body;

    const newLog: any = {
      id: `log-${Date.now()}`,
      patientId: patientId || 'pat-001',
      date: new Date().toISOString().split('T')[0],
      reportedSymptoms: reportedSymptoms || [],
      painScale: painScale || 2,
      vitals: vitals || { systolic: 122, diastolic: 78, heartRate: 74, temperatureF: 98.4 },
      generalWellness: generalWellness || 'Feeling well, recovering on schedule',
      redFlagDetected: redFlagDetected || false,
      createdAt: new Date().toISOString()
    };

    mockDataService.followUpLogs.unshift(newLog);

    if (redFlagDetected || (painScale && painScale >= 7)) {
      const escalation = {
        id: `esc-${Date.now()}`,
        patientId: newLog.patientId,
        patientName: 'Rajesh Sharma',
        roomOrBedNumber: 'Room SP-201',
        severity: (painScale && painScale >= 8 ? EscalationSeverity.CRITICAL : EscalationSeverity.HIGH) as any,
        triggerReason: `High Pain Score (${painScale}/10) or Red-Flag Symptom reported during daily follow-up`,
        reportedSymptoms: newLog.reportedSymptoms,
        sourceAgent: 'DAILY_FOLLOWUP_AGENT',
        isResolved: false,
        createdAt: new Date().toISOString()
      };
      mockDataService.escalations.unshift(escalation as any);
      socketService.emitToStaff('emergency_escalation_alert', escalation);
    }

    res.status(201).json({
      success: true,
      message: 'Follow-up health log recorded',
      data: newLog
    });
  },

  confirmDose: async (req: Request, res: Response): Promise<void> => {
    const { reminderId, patientId } = req.body;
    followUpSchedulerService.recordResponse(reminderId || 'rem-1', 'COMPLETED');

    res.json({
      success: true,
      message: 'Medication dose confirmed as Taken',
      data: { status: 'COMPLETED', complianceStreak: 5 }
    });
  },

  snoozeReminder: async (req: Request, res: Response): Promise<void> => {
    const { reminderId, snoozeMinutes } = req.body;
    followUpSchedulerService.recordResponse(reminderId || 'rem-1', 'SNOOZED');

    res.json({
      success: true,
      message: `Reminder snoozed for ${snoozeMinutes || 15} minutes`,
      data: { status: 'SNOOZED', snoozeUntil: new Date(Date.now() + 15 * 60000).toISOString() }
    });
  },

  getAdherenceStats: async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        streakDays: 5,
        complianceRate: 94,
        totalDosesScheduled: 18,
        totalDosesTaken: 17,
        totalDosesMissed: 1
      }
    });
  },

  getEscalations: async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: mockDataService.escalations });
  },

  resolveEscalation: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const alert = mockDataService.escalations.find((e) => e.id === id);
    if (!alert) {
      res.status(404).json({ success: false, error: 'Escalation alert not found' });
      return;
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolutionNotes = resolutionNotes || 'Clinical staff attended and reviewed patient';

    res.json({
      success: true,
      message: 'Escalation marked resolved',
      data: alert
    });
  }
};
