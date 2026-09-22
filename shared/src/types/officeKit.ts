export interface DeviceTelemetry {
  heartRateBpm: number | null;
  ppgConfidence: number; // 0.0 to 1.0
  pulseWaveform?: number[]; // Recent PPG optical waveform samples
  fallDetected: boolean;
  tremorIndex: number; // 0.0 to 10.0 score from accelerometer variance
  motionMagnitude: number; // m/s^2
  batteryLevel: number | null; // percentage 0-100
  isCharging: boolean;
  ambientLightLux: number | null;
  timestamp: string;
}

export interface PatientHandoffPayload {
  sessionId: string;
  patientId: string;
  patientName: string;
  messages: any[]; // ChatMessage array
  activeAppointment?: any;
  uploadedDocumentUrl?: string | null;
  prescriptionImage?: string | null;
  prescriptionData?: any;
  triageLevel?: string;
  symptomSummary?: string;
  language?: string;
  updatedAt: string;
}

export interface BridgeSession {
  sessionId: string;
  pinCode: string; // 6-digit PIN code
  patientId: string;
  patientName: string;
  doctorName?: string;
  sessionType?: 'DOCTOR_TELEMETRY' | 'PATIENT_HANDOFF';
  connectedDevice: string | null;
  status: 'WAITING' | 'CONNECTED' | 'STREAMING' | 'DISCONNECTED';
  createdAt: string;
  expiresAt?: string; // ISO string 10-minute TTL for secure handoff
  handoffData?: PatientHandoffPayload;
  authorizedDevices?: string[];
  isRevoked?: boolean;
}

export interface RemoteScanPayload {
  sessionId: string;
  imageDataUrl: string;
  scanType: 'PRESCRIPTION' | 'WOUND' | 'BARCODE' | 'MEDICINE_BOX';
  capturedAt: string;
  notes?: string;
}

export interface NurseCallAlert {
  sessionId: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY_SOS';
  triggeredAt: string;
}
