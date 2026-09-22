import { FoodTiming, MedicationFrequency, VerificationStatus } from '../enums';

export interface ExtractedPrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg"
  form: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'DROPS' | 'OINTMENT';
  frequency: MedicationFrequency;
  frequencyLabel: string; // e.g. "1-0-1 (Twice a day)"
  timing: FoodTiming;
  durationDays: number;
  instructions?: string;
  confidence: number; // 0.0 to 1.0
  isAmbiguous: boolean; // Flagged if handwriting or OCR is uncertain
}

export type PrescriptionItem = ExtractedPrescriptionItem;

export interface Prescription {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  imageUrl?: string;
  extractedItems: ExtractedPrescriptionItem[];
  verificationStatus: VerificationStatus;
  verifiedByUserId?: string;
  verifiedAt?: string;
  ocrConfidence: number;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
}
