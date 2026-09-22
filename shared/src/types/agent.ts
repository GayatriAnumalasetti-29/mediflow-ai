import { LanguageCode, UrgencyLevel } from '../enums';

export type AgentRoleType =
  | 'INTAKE'
  | 'TRIAGE'
  | 'APPOINTMENT'
  | 'ACCOMMODATION'
  | 'PRESCRIPTION_OCR'
  | 'MEDICATION'
  | 'DIET'
  | 'RECOVERY'
  | 'THERAPY'
  | 'BILLING'
  | 'FOLLOWUP'
  | 'ESCALATION'
  | 'DEVICE_ASSISTANCE';

export interface ChatMessage {
  id: string;
  sender: 'PATIENT' | 'AGENT' | 'SYSTEM' | 'STAFF';
  text: string;
  translatedText?: string;
  detectedLanguage?: LanguageCode | string;
  audioUrl?: string;
  actionCard?: AgentActionCard;
  timestamp: string;
}

export interface DeviceAssistanceTelemetry {
  motionMagnitude: number; // m/s^2 from DeviceMotionEvent
  stabilityIndex: number; // 0-100% steadiness
  motionState?: 'STATIONARY' | 'SLIGHT_MOVEMENT' | 'ACTIVE_WALKING' | 'UNSTEADY';
  tilt?: {
    alpha: number | null; // yaw
    beta: number | null; // pitch (-180 to 180)
    gamma: number | null; // roll (-90 to 90)
  };
  battery?: {
    level: number; // percentage 0-100
    charging: boolean;
  };
  network?: {
    online: boolean;
    effectiveType?: string; // 4g, 3g, wifi, etc.
    downlinkMbps?: number;
    rttMs?: number;
  };
  isRealHardware: boolean;
  timestamp: string;
}

export interface AgentActionCard {
  cardType:
    | 'TRIAGE_RESULT'
    | 'DOCTOR_SELECTION'
    | 'APPOINTMENT_TOKEN'
    | 'BED_CONFIRMATION'
    | 'PRESCRIPTION_VERIFY'
    | 'MEDICATION_REMINDER'
    | 'DIET_PLAN'
    | 'BILL_BREAKDOWN'
    | 'EMERGENCY_ALERT'
    | 'CLINICAL_GUIDANCE'
    | 'REMINDER_CONFIRMED'
    | 'RESCHEDULE_OPTIONS'
    | 'DEVICE_PERMISSION_REQUEST'
    | 'DEVICE_CONTEXT_SUMMARY';
  data: Record<string, any>;
}

export interface AgentQueryRequest {
  patientId?: string;
  message: string;
  languageOverride?: LanguageCode;
  context?: {
    currentDepartment?: string;
    activeAdmissionId?: string;
    lastAgent?: AgentRoleType;
    voiceMode?: boolean;
    deviceContext?: DeviceAssistanceTelemetry;
    devicePermissionStatus?: 'requested' | 'granted' | 'denied';
  };
  audioBase64?: string;
}

export interface AgentQueryResponse {
  responseMessage: string;
  audioBase64?: string;
  detectedLanguage: string;
  isCodeMixed: boolean;
  activeAgent: AgentRoleType;
  actionCard?: AgentActionCard;
  urgencyClassification: string;
  requiresStaffEscalation: boolean;
  contextUpdated: Record<string, any>;
}
