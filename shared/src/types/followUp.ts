import { EscalationSeverity, FollowUpStatus } from '../enums';

export interface DailyFollowUpEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  status: FollowUpStatus;
  patientReportedStatus: string; // Transcribed voice or text response
  painLevelScore: number; // 0 - 10
  temperature?: number;
  symptomsReported: string[];
  medicationAdherenceReported: boolean;
  dietAdherenceReported: boolean;
  activityCompletedReported: boolean;
  aiSentiment: 'POSITIVE' | 'NEUTRAL' | 'CONCERNED' | 'CRITICAL';
  requiresStaffReview: boolean;
  staffReviewNotes?: string;
  createdAt: string;
  // UI aliases
  painScale?: number;
  redFlagDetected?: boolean;
  generalWellness?: string;
  reportedSymptoms?: string[];
  vitals?: any;
}

export type FollowUpLog = DailyFollowUpEntry;

export interface EscalationAlert {
  id: string;
  patientId: string;
  patientName: string;
  roomOrBedNumber?: string;
  severity: EscalationSeverity;
  triggerReason: string;
  reportedSymptoms: string[];
  sourceAgent: string; // e.g. "TriageAgent", "FollowUpAgent", "OCRValidationAgent"
  isResolved: boolean;
  assignedStaffId?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}
