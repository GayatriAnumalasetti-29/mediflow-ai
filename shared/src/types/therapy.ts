export interface ExerciseInstruction {
  id: string;
  name: string;
  category: 'MOBILITY' | 'STRENGTHENING' | 'BREATHING' | 'BALANCE';
  repetitions: string; // e.g. "10 reps x 3 sets"
  frequencyPerDay: number;
  videoGuideUrl?: string;
  precautions: string[];
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  therapyType: 'PHYSIOTHERAPY' | 'RESPIRATORY_THERAPY' | 'OCCUPATIONAL_THERAPY' | 'CARDIAC_REHAB';
  scheduledDate: string;
  timeSlot: string;
  attended: boolean;
  therapistNotes?: string;
  patientFeedback?: string;
  exercisesPrescribed: ExerciseInstruction[];
  nextFollowUpDate?: string;
}

export interface RecoveryMilestone {
  id: string;
  patientId: string;
  dayNumber: number; // Day 1, Day 3, Day 7 post-op
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  clinicianVerified: boolean;
}
