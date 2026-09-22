import { AppointmentStatus, AppointmentType } from '../enums';

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  department: string;
  roomNumber: string;
  consultationFee: number;
  availableDays: string[];
  virtualSlots: string[]; // e.g. ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
  directSlots: string[];  // e.g. ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"]
  availableTimeSlots?: string[];
  languagesSpoken: string[];
  rating?: number;
  qualification?: string;
  experienceYears?: number;
  availableSlots?: string[];
  breakPeriods?: string[];
  onLeave?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  department: string;
  appointmentType: 'VIRTUAL' | 'DIRECT' | AppointmentType;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  tokenNumber?: number; // Queue Token (assigned only upon confirmation)
  status: AppointmentStatus;
  reasonForVisit: string;
  doctorNotes?: string;
  consultationFee: number;
  bookingTimestamp?: string;
  checkInTimestamp?: string;
  consultationStartTimestamp?: string;
  consultationEndTimestamp?: string;
  missedAt?: string;
  rescheduledFrom?: string;
  rescheduledTo?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  doctorName?: string; // Denormalized fallback when doctor relation is not populated
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

export interface QueueStatus {
  department: string;
  currentToken: number;
  totalWaiting: number;
  estimatedWaitMinutes: number;
  lastUpdated: string;
}
