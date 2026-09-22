import { UrgencyLevel } from '../enums';

export interface Patient {
  id: string;
  userId: string;
  uhid: string; // Unique Healthcare Identifier (e.g. "MF-2026-8812")
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  contactNumber: string;
  emergencyContact?: string;
  address?: string;
  allergies: string[];
  chronicConditions: string[];
  currentUrgency?: UrgencyLevel;
  primaryLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientIntakePayload {
  patientId?: string;
  fullName?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  chiefComplaint: string;
  symptomDuration?: string;
  severityScale?: number; // 1-10
  existingMedications?: string[];
  allergies?: string[];
  language?: string;
}

export interface IntakeSummary {
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
  };
  recommendedDepartment: string;
  urgencyLevel: UrgencyLevel;
  triageRationale: string;
  timestamp: string;
}
