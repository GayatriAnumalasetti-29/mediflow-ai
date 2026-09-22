export type AuditAction =
  | 'USER_LOGIN'
  | 'PHI_VIEW'
  | 'PRESCRIPTION_UPLOADED'
  | 'PRESCRIPTION_VERIFIED'
  | 'MEDICATION_DOSE_CONFIRMED'
  | 'DISCOUNT_AUTHORIZED'
  | 'EMERGENCY_ESCALATION_TRIGGERED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_CHECKED_IN'
  | 'BED_ALLOCATED'
  | 'SECURITY_VIOLATION'
  | 'BRIDGE_SESSION_CREATED'
  | 'BRIDGE_SESSION_SEVERED';

export interface AuditEvent {
  id: string;
  userId: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
  beforeState?: any;
  afterState?: any;
}

let mockAuditLogs: AuditEvent[] = [
  {
    id: 'aud-001',
    userId: 'usr-pat-001',
    userRole: 'PATIENT',
    action: 'MEDICATION_DOSE_CONFIRMED',
    resource: 'MedicationSchedule:sched-002',
    ipAddress: '192.168.1.45',
    timestamp: '2026-08-31T18:40:00Z',
    details: 'Patient confirmed dose of Metoprolol Succinate ER 25mg as Taken via Voice STT affirmation.',
    status: 'SUCCESS'
  },
  {
    id: 'aud-002',
    userId: 'usr-doc-001',
    userRole: 'DOCTOR',
    action: 'PRESCRIPTION_VERIFIED',
    resource: 'Prescription:rx-001',
    ipAddress: '10.0.4.12',
    timestamp: '2026-08-31T18:30:00Z',
    details: 'Dr. Priya Varma signed off on OCR extracted medicines (3 items verified, 0 ambiguous flags).',
    status: 'SUCCESS'
  },
  {
    id: 'aud-003',
    userId: 'usr-doc-001',
    userRole: 'DOCTOR',
    action: 'PHI_VIEW',
    resource: 'PatientRecord:MF-2026-8812',
    ipAddress: '10.0.4.12',
    timestamp: '2026-08-31T18:15:00Z',
    details: 'Authorized cardiologist accessed full EHR record for Rajesh Sharma in Cardiology OPD.',
    status: 'SUCCESS'
  },
  {
    id: 'aud-004',
    userId: 'usr-pat-001',
    userRole: 'PATIENT',
    action: 'USER_LOGIN',
    resource: 'AuthService:JWT',
    ipAddress: '192.168.1.45',
    timestamp: '2026-08-31T18:00:00Z',
    details: 'Secure patient session authenticated with signed JWT token.',
    status: 'SUCCESS'
  }
];

export const auditLoggerService = {
  logEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    mockAuditLogs.unshift(newLog);
    return newLog;
  },

  getAuditLogs: (): AuditEvent[] => {
    return mockAuditLogs;
  }
};
