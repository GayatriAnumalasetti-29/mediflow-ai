import { DoseStatus, FoodTiming, MedicationFrequency } from '../enums';

export interface MedicationSchedule {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: MedicationFrequency;
  timing: FoodTiming;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  instructions?: string;
  isActive: boolean;
}

export interface MedicationDose {
  id: string;
  scheduleId: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // ISO DateTime
  status: DoseStatus;
  confirmedAt?: string;
  snoozedUntil?: string;
  timingNote: string;
}

export interface AdherenceSummary {
  patientId: string;
  totalDosesPrescribed: number;
  totalDosesTaken: number;
  totalDosesSkipped: number;
  adherencePercentage: number; // e.g. 92.5
  currentStreakDays: number;
}
