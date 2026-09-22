import { RoomCategory, BedStatus } from '../enums';

export interface Bed {
  id: string;
  bedNumber: string; // e.g. "B-104"
  roomId: string;
  roomNumber: string;
  category: RoomCategory;
  floor: number;
  dailyRate: number;
  status: BedStatus;
  currentPatientId?: string;
  admissionDate?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  category: RoomCategory;
  floor: number;
  totalBeds: number;
  availableBeds: number;
  dailyRate: number;
  amenities: string[];
  beds?: Bed[];
}

export interface AdmissionRecord {
  id: string;
  patientId: string;
  bedId: string;
  roomNumber: string;
  category: RoomCategory;
  admittedAt: string;
  dischargedAt?: string;
  expectedStayDays: number;
  attendingDoctorId: string;
  totalCharges: number;
}
