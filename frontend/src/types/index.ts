export * from '@mediflow/shared';

export interface UIState {
  activeTab: 'overview' | 'chat' | 'appointments' | 'medication' | 'diet' | 'billing' | 'followup' | 'staff_queue';
  isVoiceActive: boolean;
  isCameraActive: boolean;
  selectedPrescriptionId?: string;
  theme: 'dark' | 'light';
}
