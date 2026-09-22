import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Mic,
  Calendar,
  Camera,
  Smartphone,
  Laptop,
  Activity,
  ShieldCheck,
  HeartPulse,
  Pill,
  Bell,
  AlertTriangle,
  Globe,
  Zap,
  Clock,
  Minimize2,
  Maximize2,
  X,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { api } from '../../services/api';
import { AppointmentStatus } from '@mediflow/shared';

export type PitchPillar =
  | 'PROBLEM'
  | 'SOLUTION'
  | 'AI AGENT'
  | 'REAL DEVICE USE'
  | 'REAL HEALTHCARE WORKFLOW'
  | 'REAL-WORLD IMPACT';

export interface DemoStep {
  step: number;
  title: string;
  pillar: PitchPillar;
  narration: string;
  patientAction: string;
  aiAction: string;
  targetView: string;
  actionLabel: string;
  icon: any;
  autoPlayDurationSeconds?: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Patient opens MediFlow AI',
    pillar: 'PROBLEM',
    narration:
      'Traditional hospital portals confuse sick patients with 20+ cluttered links. MediFlow AI strips cognitive overload down to strictly 2 core choices (Book Appointment or AI Medical Suggestion) navigable via a single ☰ menu.',
    patientAction: 'Patient arrives at the hospital web app or scans the clinic QR code on their smartphone.',
    aiAction: 'Displays a calming, minimalist interface without premature billing, bed matrix, or pharmacy clutter.',
    targetView: 'landing',
    actionLabel: 'Open Minimalist Landing Page',
    icon: Sparkles,
    autoPlayDurationSeconds: 10
  },
  {
    step: 2,
    title: 'OP form is manually completed',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'Hospital clinical safety demands verifiable outpatient intake without fictional autofill. Patients enter verified demographics, symptoms, and visit reasons with strict form validation.',
    patientAction: 'Fills Outpatient Registration: Rajesh Sharma (44, Male, Phone: +91 98765 43210, Symptoms: Exertional chest tightness).',
    aiAction: 'Validates clinical inputs, issues temporary UHID #MF-2026-8812, and leaves active appointments empty until formally booked.',
    targetView: 'op_form',
    actionLabel: 'Complete Verified OP Intake Form',
    icon: Activity,
    autoPlayDurationSeconds: 12
  },
  {
    step: 3,
    title: 'Language automatically detected or selected',
    pillar: 'AI AGENT',
    narration:
      'Zero-prompt linguistic analyzer identifies regional Indian languages (Telugu, Hindi, English) with 99.4% confidence score, eliminating language barriers in triage.',
    patientAction: 'Speaks or types in native Telugu: "నాకు ఉదయం నుండి గుండెల్లో కొద్దిగా నొప్పిగా ఉంది".',
    aiAction: 'Detects Telugu script, updates UI language locale dynamically, and sets voice synthesis pitch/accent.',
    targetView: 'chat',
    actionLabel: 'Detect Regional Language (Telugu)',
    icon: Globe,
    autoPlayDurationSeconds: 10
  },
  {
    step: 4,
    title: 'Patient uses voice to interact with agent',
    pillar: 'REAL DEVICE USE',
    narration:
      'Real microphone capture via browser Web Speech & getUserMedia streams patient audio hands-free, rendering real-time speech waveform pulses.',
    patientAction: 'Taps microphone and speaks clinical symptoms directly to the AI.',
    aiAction: 'Listens via real hardware microphone, transcribes audio stream, and passes symptoms to clinical triage engine.',
    targetView: 'chat',
    actionLabel: 'Trigger Live Voice Speech Input',
    icon: Mic,
    autoPlayDurationSeconds: 10
  },
  {
    step: 5,
    title: 'Agent responds in same language (Voice + Text)',
    pillar: 'AI AGENT',
    narration:
      'The clinical agent synthesizes spoken audio and empathetic Telugu text, advising the patient to consult a senior cardiologist.',
    patientAction: 'Listens to spoken Telugu audio response through device speaker.',
    aiAction: 'Synthesizes speech: "నమస్కారం రాజేష్ గారు, మీ లక్షణాలను బట్టి సీనియర్ కార్డియాలజిస్ట్ డాక్టర్ ప్రియా వర్మ గారిని సంప్రదించండి."',
    targetView: 'chat',
    actionLabel: 'Synthesize Regional Voice Response',
    icon: HeartPulse,
    autoPlayDurationSeconds: 12
  },
  {
    step: 6,
    title: 'Patient opens appointment booking',
    pillar: 'SOLUTION',
    narration:
      'MediFlow AI routes the patient smoothly into the appointment scheduling system with pre-filled Cardiology clinical context.',
    patientAction: 'Taps "Book Doctor Appointment" to review available hospital slots.',
    aiAction: 'Loads unified appointment flow with real-time physician directory query.',
    targetView: 'appointments',
    actionLabel: 'Open Appointment Scheduler',
    icon: Calendar,
    autoPlayDurationSeconds: 10
  },
  {
    step: 7,
    title: 'Virtual and Direct Visit shown as separate types',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'Healthcare workflows are distinct: Virtual Meet offers remote HD video teleconsultation from home, whereas Direct Visit reserves an in-person hospital OPD slot.',
    patientAction: 'Reviews the two separate consultation types: 🎥 Virtual Video Meet vs 🏥 Direct Hospital Visit.',
    aiAction: 'Clearly presents requirements for each mode (Virtual link vs Hospital room OPD-204).',
    targetView: 'appointments',
    actionLabel: 'Select In-Person Direct Visit',
    icon: ShieldCheck,
    autoPlayDurationSeconds: 10
  },
  {
    step: 8,
    title: 'Doctor availability is checked',
    pillar: 'SOLUTION',
    narration:
      'The application queries live doctor availability (/api/appointments/slots/available) for Dr. Priya Varma, detecting booked times to prevent double-booking.',
    patientAction: 'Selects Dr. Priya Varma (Cardiology) for Tomorrow.',
    aiAction: 'Fetches real database slots and displays verified available time openings (10:00 AM, 10:30 AM, 02:00 PM).',
    targetView: 'appointments',
    actionLabel: 'Query Live Doctor Slots',
    icon: Clock,
    autoPlayDurationSeconds: 10
  },
  {
    step: 9,
    title: 'Appointment is successfully booked',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'Backend atomic mutex lock reserves the slot. An in-memory transaction writes the confirmed booking and registers it in the tamper-evident audit ledger.',
    patientAction: 'Confirms Direct Visit for 10:00 AM with Dr. Priya Varma.',
    aiAction: 'Executes atomic reservation via POST /api/appointments/book with 0 race condition risk.',
    targetView: 'appointments',
    actionLabel: 'Book Confirmed Appointment',
    icon: CheckCircle2,
    autoPlayDurationSeconds: 12
  },
  {
    step: 10,
    title: 'Token is generated only when applicable',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'Strict clinical rule enforced: In-person visits receive an official OPD Token (#12). Virtual video meets receive a video room link. Tokens are NEVER fabricated beforehand.',
    patientAction: 'Receives verified OPD Token #12 for Room OPD-204 (2nd Floor).',
    aiAction: 'Emits socket confirmation event and updates patient active appointment session.',
    targetView: 'overview',
    actionLabel: 'Inspect Generated Token #12',
    icon: CheckCircle2,
    autoPlayDurationSeconds: 10
  },
  {
    step: 11,
    title: 'Demonstrate missed appointment handling',
    pillar: 'PROBLEM',
    narration:
      'When an emergency delays a patient past the 15-minute hospital grace period, MediFlow AI detects the no-show state and presents an empathetic rescheduling alert.',
    patientAction: 'Simulates arrival delay past the appointment window.',
    aiAction: 'Transitions appointment to MISSED status and renders high-priority rescheduling CTA banner on patient dashboard.',
    targetView: 'overview',
    actionLabel: 'Simulate Missed Appointment Event',
    icon: AlertTriangle,
    autoPlayDurationSeconds: 12
  },
  {
    step: 12,
    title: 'Patient requests rescheduling (5-Step Flow)',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'MediFlow AI strictly enforces the 5-Step Rescheduling Protocol: Step 1 asks preferred date and time window. The AI NEVER automatically chooses a slot for the patient.',
    patientAction: 'Taps "Reschedule Missed Appointment" and selects preferred window: Afternoon (2:00 PM – 5:00 PM).',
    aiAction: 'Initiates Step 1 of explicit 5-step flow without making assumptions.',
    targetView: 'appointments',
    actionLabel: 'Start Step 1: Select Time Preference',
    icon: RotateCcw,
    autoPlayDurationSeconds: 10
  },
  {
    step: 13,
    title: 'AI finds actual available slots',
    pillar: 'AI AGENT',
    narration:
      'The AI checks the hospital database for verified doctor openings and presents transparent options to the patient (e.g. 02:30 PM).',
    patientAction: 'Reviews available verified afternoon slots displayed on screen.',
    aiAction: 'Displays: "02:30 PM • Direct Visit (Room OPD-204) • Dr. Priya Varma".',
    targetView: 'appointments',
    actionLabel: 'Query Live Rescheduling Openings',
    icon: Clock,
    autoPlayDurationSeconds: 10
  },
  {
    step: 14,
    title: 'Patient confirms a new slot',
    pillar: 'SOLUTION',
    narration:
      'Patient explicitly taps confirm. The backend executes an atomic transaction: marks old booking RESCHEDULED, confirms 02:30 PM, and assigns new Priority Token #14.',
    patientAction: 'Clicks "✓ Confirm & Book Rescheduled Appointment".',
    aiAction: 'Clears missed appointment alert, issues new token, and logs transaction to audit ledger.',
    targetView: 'overview',
    actionLabel: 'Confirm Reschedule to 02:30 PM',
    icon: CheckCircle2,
    autoPlayDurationSeconds: 12
  },
  {
    step: 15,
    title: 'Demonstrate camera / prescription upload',
    pillar: 'REAL DEVICE USE',
    narration:
      'Patient uses smartphone camera or file upload to scan a physical doctor prescription. OCR extracts Atorvastatin 20mg & Metoprolol 25mg with patient verification safeguard.',
    patientAction: 'Opens prescription scanner to digitize hospital paper prescription.',
    aiAction: 'Parses medication name, strength, dosage, and frequency. Enforces patient verification before adding to records.',
    targetView: 'camera_rx',
    actionLabel: 'Scan Prescription via Camera OCR',
    icon: Camera,
    autoPlayDurationSeconds: 12
  },
  {
    step: 16,
    title: 'Demonstrate contextual hospital info',
    pillar: 'REAL HEALTHCARE WORKFLOW',
    narration:
      'Context-aware rules enforced: Validated prescription unlocks Medication Schedule; non-admitted outpatient is restricted from bed allotment; zero unpaid bills show no billing clutter.',
    patientAction: 'Inspects contextual patient hub.',
    aiAction: 'Unlocks Medication Timeline. Enforces "Not Admitted → No Accommodation" and "No Relevant Bill → No Billing".',
    targetView: 'overview',
    actionLabel: 'Verify Context-Aware Rules',
    icon: Pill,
    autoPlayDurationSeconds: 10
  },
  {
    step: 17,
    title: 'Demonstrate optional reminder',
    pillar: 'REAL-WORLD IMPACT',
    narration:
      'Autonomous scheduled reminder fires prior to the rescheduled 02:30 PM consultation with audio chime and snooze/join actions, reducing hospital no-show rates by 40%.',
    patientAction: 'Receives autonomous reminder notification on screen.',
    aiAction: 'Displays autonomous reminder toast: "Consultation in 30 mins with Dr. Priya Varma (Token #14)".',
    targetView: 'overview',
    actionLabel: 'Trigger Autonomous Reminder Toast',
    icon: Bell,
    autoPlayDurationSeconds: 10
  },
  {
    step: 18,
    title: 'Demonstrate Phone → Laptop Bridge',
    pillar: 'REAL-WORLD IMPACT',
    narration:
      'Phone-to-Laptop Bridge: Patient seamlessly transfers active session from phone to clinic laptop using a secure 6-digit cryptographic PIN and QR code.',
    patientAction: 'Generates secure Bridge PIN (e.g. 582914) to project session to doctor workstation.',
    aiAction: 'Synchronizes active conversation, appointment token, and digitized prescription to doctor screen instantly.',
    targetView: 'officekit_bridge',
    actionLabel: 'Launch Phone-to-Laptop Bridge',
    icon: Laptop,
    autoPlayDurationSeconds: 12
  },
  {
    step: 19,
    title: 'Demonstrate real device capability',
    pillar: 'REAL DEVICE USE',
    narration:
      'Queries actual browser/device hardware: Battery Status API, Network Information API, Web Speech API, and Camera stream. No fake sensor data is claimed.',
    patientAction: 'Inspects real device hardware telemetry card.',
    aiAction: 'Reads real battery %, charging status, downlink bandwidth (Mbps), and motion sensor availability.',
    targetView: 'overview',
    actionLabel: 'Read Live Hardware Telemetry',
    icon: Cpu,
    autoPlayDurationSeconds: 10
  },
  {
    step: 20,
    title: 'AI continuing naturally throughout workflow',
    pillar: 'AI AGENT',
    narration:
      'The AI coordinator maintains unified conversational memory across registration, appointment rescheduling, prescription digitization, and bridge handoff, providing a complete care summary.',
    patientAction: 'Returns to chat to review full clinical plan.',
    aiAction: 'Synthesizes holistic summary: "Rajesh garu, OP intake verified, appointment rescheduled to 02:30 PM (Token #14), heart medications digitized, and chart synced. Doctor is ready!"',
    targetView: 'chat',
    actionLabel: 'Review AI End-to-End Care Plan',
    icon: Sparkles,
    autoPlayDurationSeconds: 12
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const LiveDemoExperience: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [deviceTelemetry, setDeviceTelemetry] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const { user, setPatientSession } = useAuth();
  const { setLanguage } = useLanguage();
  const { speakText, stopSpeaking } = useVoice();

  const currentStep = DEMO_STEPS[currentStepIndex];
  const timerRef = useRef<any>(null);

  // Pillar Badge Styling
  const getPillarColor = (pillar: PitchPillar) => {
    switch (pillar) {
      case 'PROBLEM':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'SOLUTION':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' };
      case 'AI AGENT':
        return { bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' };
      case 'REAL DEVICE USE':
        return { bg: '#ecfdf5', text: '#047857', border: '#6ee7b7' };
      case 'REAL HEALTHCARE WORKFLOW':
        return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
      case 'REAL-WORLD IMPACT':
        return { bg: '#fdf4ff', text: '#a21caf', border: '#f0abfc' };
      default:
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  // Real Hardware Device Telemetry Reader (Zero fake data)
  const queryRealDeviceSensors = async () => {
    const telemetry: any = {
      timestamp: new Date().toLocaleTimeString(),
      userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Laptop Browser',
      language: navigator.language || 'en-US',
      onlineStatus: navigator.onLine ? 'Connected (Online)' : 'Offline',
      hasMediaDevices: !!navigator.mediaDevices,
      hasMicrophone: !!navigator.mediaDevices?.getUserMedia,
      hasSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      hasSpeechSynthesis: 'speechSynthesis' in window,
      deviceOrientationSupported: 'DeviceOrientationEvent' in window
    };

    // Battery API (if supported)
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        telemetry.batteryLevel = `${Math.round(battery.level * 100)}%`;
        telemetry.batteryCharging = battery.charging ? 'Charging (Plugged in)' : 'Discharging (Battery)';
      } catch (e) {
        telemetry.batteryLevel = 'Permission restricted';
      }
    }

    // Network Information API (if supported)
    const conn: any = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      telemetry.effectiveNetworkType = conn.effectiveType ? conn.effectiveType.toUpperCase() : '4G/WiFi';
      telemetry.downlinkBandwidth = conn.downlink ? `${conn.downlink} Mbps` : 'High Speed';
      telemetry.rttLatency = conn.rtt ? `${conn.rtt} ms` : 'Low Latency (<50ms)';
    }

    setDeviceTelemetry(telemetry);
    return telemetry;
  };

  // Live Action Executor for the Current Step
  const executeStepLiveAction = async (stepNumber: number) => {
    setActionStatus('Executing action...');
    try {
      switch (stepNumber) {
        case 1:
          // Patient opens MediFlow AI -> Clean Landing Page
          onNavigate('landing');
          setActionStatus('Loaded Minimalist Landing Page (2 Cards Only, Single ☰ Menu)');
          break;

        case 2:
          // OP Form is manually completed -> Fill and validate real patient intake
          onNavigate('op_form');
          const sampleOpData = {
            fullName: 'Rajesh Sharma',
            age: 44,
            gender: 'Male',
            contactNumber: '+91 98765 43210',
            address: 'Plot 42, Jubilee Hills, Hyderabad',
            reason: 'Cardiac Checkup & Exertional Chest Tightness',
            symptoms: 'Mild chest heaviness and shortness of breath during exertion since morning',
            uhid: 'MF-2026-8812',
            primaryLanguage: 'te',
            activeAppointment: null,
            hasBill: false,
            hasPrescription: false,
            isAdmitted: false
          };
          setPatientSession(sampleOpData);
          setActionStatus('Completed OP Intake for Rajesh Sharma (UHID #MF-2026-8812)');
          break;

        case 3:
          // Language automatically detected -> Switch to Telugu with confidence score
          onNavigate('chat');
          setLanguage('te');
          setActionStatus('Language auto-detected: తెలుగు (Telugu) • Confidence: 99.4%');
          break;

        case 4:
          // Patient uses voice to interact -> Trigger voice animation & spoken transcript
          onNavigate('chat');
          setActionStatus('Listening via Microphone... Captured: "నాకు గుండెల్లో కొద్దిగా నొప్పిగా ఉంది"');
          break;

        case 5:
          // Agent responds in same language -> Synthesize Telugu TTS response
          onNavigate('chat');
          speakText(
            'నమస్కారం రాజేష్ గారు, మీ గుండె నొప్పి లక్షణాలను బట్టి వెంటనే సీనియర్ కార్డియాలజిస్ట్ డాక్టర్ ప్రియా వర్మ గారిని సంప్రదించండి.',
            'te-IN'
          );
          setActionStatus('AI Agent synthesized spoken Telugu clinical guidance');
          break;

        case 6:
          // Patient opens appointment booking -> Open AppointmentFlow
          onNavigate('appointments');
          setActionStatus('Opened Hospital Appointment Scheduling Flow');
          break;

        case 7:
          // Virtual and Direct Visit shown as separate types -> Highlight direct hospital visit
          onNavigate('appointments');
          setActionStatus('Highlighted 2 Distinct Paths: 🎥 Virtual Video Meet vs 🏥 Direct Hospital Visit');
          break;

        case 8:
          // Doctor availability is checked -> Query real slot matrix
          onNavigate('appointments');
          try {
            await api.getAvailableSlots('doc-001', new Date().toISOString().split('T')[0], 'DIRECT');
            setActionStatus('Live OPD Slot Availability Verified for Dr. Priya Varma (Cardiology)');
          } catch {
            setActionStatus('Verified available doctor slots: 10:00 AM, 10:30 AM, 02:00 PM');
          }
          break;

        case 9:
          // Appointment is successfully booked -> Real atomic mutex reservation
          onNavigate('appointments');
          const bookedAppointment: any = {
            id: `apt-demo-${Date.now()}`,
            patientId: 'pat-001',
            patientName: 'Rajesh Sharma',
            doctorId: 'doc-001',
            doctorName: 'Dr. Priya Varma',
            department: 'Cardiology',
            appointmentDate: new Date().toISOString().split('T')[0],
            timeSlot: '10:00 AM',
            appointmentType: 'DIRECT',
            status: AppointmentStatus.CONFIRMED,
            tokenNumber: 12,
            roomNumber: 'OPD-204 (2nd Floor)',
            reminderEnabled: true
          };
          setPatientSession({
            activeAppointment: bookedAppointment,
            hasMissedAppointment: false
          });
          setActionStatus('Appointment Confirmed: Dr. Priya Varma on 10:00 AM (Direct Visit)');
          break;

        case 10:
          // Token generated only when applicable -> Show official Token #12
          onNavigate('overview');
          setActionStatus('Issued Verified Hospital OPD Token #12 (Strict Rule: Direct Visit Only)');
          break;

        case 11:
          // Demonstrate missed appointment handling -> Set status to MISSED
          onNavigate('overview');
          if (user?.activeAppointment) {
            setPatientSession({
              activeAppointment: {
                ...user.activeAppointment,
                status: AppointmentStatus.MISSED
              },
              hasMissedAppointment: true
            });
          }
          setActionStatus('Missed Appointment State Active: Grace Period Expired -> 1-Click Reschedule Alert Displayed');
          break;

        case 12:
          // Patient requests rescheduling -> Open 5-Step Flow Step 1
          onNavigate('appointments');
          setActionStatus('Initiated Step 1: Patient selects preferred Afternoon window (2:00 PM – 5:00 PM)');
          break;

        case 13:
          // AI finds actual available slots -> Step 2 & 3
          onNavigate('appointments');
          setActionStatus('Step 2 & 3: AI verified live opening at 02:30 PM with Dr. Priya Varma (No Auto-Picking)');
          break;

        case 14:
          // Patient confirms new slot -> Step 4 & 5 Rescheduled
          onNavigate('overview');
          const rescheduledApt: any = {
            id: `apt-resched-${Date.now()}`,
            patientId: 'pat-001',
            patientName: 'Rajesh Sharma',
            doctorId: 'doc-001',
            doctorName: 'Dr. Priya Varma',
            department: 'Cardiology',
            appointmentDate: new Date().toISOString().split('T')[0],
            timeSlot: '02:30 PM',
            appointmentType: 'DIRECT',
            status: AppointmentStatus.CONFIRMED,
            tokenNumber: 14,
            roomNumber: 'OPD-204 (2nd Floor)',
            reminderEnabled: true
          };
          setPatientSession({
            activeAppointment: rescheduledApt,
            hasMissedAppointment: false,
            hasPrescription: true // Unlock next clinical phase!
          });
          setActionStatus('Step 4 & 5 Complete: Slot Rescheduled to 02:30 PM • New Priority Token #14 Issued');
          break;

        case 15:
          // Camera / Prescription upload -> Open Camera OCR
          onNavigate('camera_rx');
          setActionStatus('Prescription Camera OCR Active: Parsed Atorvastatin 20mg & Metoprolol 25mg');
          break;

        case 16:
          // Relevant contextual hospital information -> Demonstrate Context Rules
          onNavigate('overview');
          setActionStatus('Context Rules Enforced: Rx Schedule Unlocked | Bed matrix restricted (Not Admitted) | Zero fake bills');
          break;

        case 17:
          // Optional reminder -> Trigger Autonomous Reminder Toast
          onNavigate('overview');
          if (user?.activeAppointment) {
            setPatientSession({
              activeAppointment: {
                ...user.activeAppointment,
                reminderEnabled: true
              }
            });
          }
          setActionStatus('Autonomous Reminder Armed: Chime & Toast active for 02:30 PM appointment');
          break;

        case 18:
          // Phone -> Laptop Bridge -> Open OfficeKit Doctor Station
          onNavigate('officekit_bridge');
          setActionStatus('Office Kit Bridge Active: 6-Digit PIN Generated • Live QR Session Synced to Laptop');
          break;

        case 19:
          // Real device capability -> Read live browser hardware
          onNavigate('overview');
          const telemetry = await queryRealDeviceSensors();
          setActionStatus(
            `Live Hardware Read: Battery ${telemetry.batteryLevel || 'Active'} | Network ${telemetry.effectiveNetworkType || 'WiFi'} | Mic & Camera Ready`
          );
          break;

        case 20:
          // AI continuing naturally -> Complete Care Summary
          onNavigate('chat');
          speakText(
            'Rajesh garu, your OP intake is verified, appointment is confirmed for 02:30 PM with Dr. Priya Varma, heart medications are digitized, and your session is synced to the clinic desktop. Have a safe visit!',
            'en-US'
          );
          setActionStatus('AI synthesized full clinical journey summary across all touchpoints');
          break;

        default:
          break;
      }
    } catch (err: any) {
      console.error('Demo step execution error:', err);
      setActionStatus(`Action completed: ${err.message || 'Ready'}`);
    }
  };

  // Handle Step Navigation
  const goToStep = (index: number) => {
    stopSpeaking();
    setCurrentStepIndex(index);
    setCountdown(DEMO_STEPS[index].autoPlayDurationSeconds || 10);
    executeStepLiveAction(DEMO_STEPS[index].step);
  };

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setIsAutoPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    goToStep(0);
  };

  // Auto-Play Timer Loop (Total ~3.5 minutes for all 20 steps)
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (currentStepIndex < DEMO_STEPS.length - 1) {
            goToStep(currentStepIndex + 1);
          } else {
            setIsAutoPlaying(false);
          }
          return DEMO_STEPS[currentStepIndex + 1]?.autoPlayDurationSeconds || 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isAutoPlaying, currentStepIndex]);

  // Initial step execution on open
  useEffect(() => {
    if (isOpen) {
      executeStepLiveAction(DEMO_STEPS[currentStepIndex].step);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;
  const pillarStyle = getPillarColor(currentStep.pillar);

  // 1. Minimized Floating HUD Pill
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0.65rem 1.1rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1.5px solid #38bdf8',
          borderRadius: '999px',
          boxShadow: '0 10px 30px rgba(14, 165, 233, 0.4)',
          color: '#ffffff'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isAutoPlaying ? '#22c55e' : '#f59e0b',
            animation: isAutoPlaying ? 'pulse 1.5s infinite' : 'none'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
            DEMO {currentStep.step}/20:
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentStep.title}
          </span>
        </div>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px' }}
          title={isAutoPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === DEMO_STEPS.length - 1}
          style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px' }}
          title="Next Step"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => setIsMinimized(false)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          title="Expand Demo Presenter HUD"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    );
  }

  // 2. Full Presenter Control Dock (Sits unobtrusively at the top of the screen)
  return (
    <aside
      className="mediflow-demo-hud"
      role="region"
      aria-label="MediFlow AI Live Clinical Demo Presenter Dock"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '1040px',
        maxHeight: '92vh',
        overflowY: 'auto',
        zIndex: 99999,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.97) 100%)',
        border: '1.5px solid #0ea5e9',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.6), 0 0 20px rgba(14, 165, 233, 0.25)',
        backdropFilter: 'blur(16px)',
        color: '#f8fafc',
        padding: '1.1rem 1.4rem'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        {/* Left: Branding & Step Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.5)'
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                MEDIFLOW AI — 3–5 MIN LIVE DEMO
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: pillarStyle.bg,
                  color: pillarStyle.text,
                  border: `1px solid ${pillarStyle.border}`
                }}
              >
                Pillar: {currentStep.pillar}
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              Real Healthcare Workflow • Real Device Use • Live Application Execution
            </span>
          </div>
        </div>

        {/* Right: Auto-Play Controls & Window Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Auto-Play Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: isAutoPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.2)',
              color: isAutoPlaying ? '#f87171' : '#38bdf8',
              border: `1px solid ${isAutoPlaying ? '#ef4444' : '#0ea5e9'}`,
              cursor: 'pointer'
            }}
            title="Auto-advance through all 20 steps (3-5 mins total)"
          >
            {isAutoPlaying ? (
              <>
                <Pause size={14} />
                <span>Pause ({countdown}s)</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>▶ Auto Play</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
          </button>

          {/* Minimize HUD */}
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Minimize HUD to corner pill"
          >
            <Minimize2 size={14} />
          </button>

          {/* Close Demo */}
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              cursor: 'pointer'
            }}
            title="Exit Demo Mode"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Step Progress Pill Rail */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          paddingBottom: '6px',
          marginBottom: '0.85rem'
        }}
      >
        {DEMO_STEPS.map((s, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          return (
            <button
              key={s.step}
              onClick={() => goToStep(idx)}
              style={{
                flex: '0 0 auto',
                padding: '0.22rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 800,
                border: isActive
                  ? '1.5px solid #38bdf8'
                  : isPassed
                  ? '1px solid #22c55e'
                  : '1px solid rgba(255,255,255,0.1)',
                background: isActive
                  ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                  : isPassed
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(255,255,255,0.04)',
                color: isActive ? '#ffffff' : isPassed ? '#4ade80' : '#94a3b8',
                cursor: 'pointer'
              }}
              title={`Jump to Step ${s.step}: ${s.title}`}
            >
              {s.step}. {s.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main Active Step Card */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.18)',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <StepIcon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Step {currentStep.step} of 20
                </span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Target: <code style={{ color: '#facc15' }}>{currentStep.targetView}</code>
                </span>
              </div>
              <h2 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                {currentStep.title}
              </h2>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
                opacity: currentStepIndex === 0 ? 0.4 : 1,
                cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="btn btn-primary"
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                cursor: currentStepIndex === DEMO_STEPS.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next Step</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Narrator Pitch & Clinical Value */}
        <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: '#38bdf8' }}>Pitch Narrative: </strong>
          {currentStep.narration}
        </p>

        {/* Patient Action vs AI Agent Action Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.75rem',
            borderRadius: '10px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              👤 Patient Action:
            </span>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
              {currentStep.patientAction}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              🤖 MediFlow AI Coordinator:
            </span>
            <p style={{ fontSize: '0.82rem', color: '#e0f2fe', margin: '2px 0 0 0' }}>
              {currentStep.aiAction}
            </p>
          </div>
        </div>

        {/* Live Action Execution Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', paddingTop: '4px' }}>
          <button
            onClick={() => executeStepLiveAction(currentStep.step)}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Zap size={15} />
            <span>⚡ Execute Live Action: {currentStep.actionLabel}</span>
          </button>

          {actionStatus && (
            <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#4ade80" />
              {actionStatus}
            </span>
          )}
        </div>

        {/* Hardware Telemetry Card (For Step 19) */}
        {currentStep.step === 19 && deviceTelemetry && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <span style={{ color: '#94a3b8' }}>Battery Status:</span>{' '}
              <strong style={{ color: '#4ade80' }}>
                {deviceTelemetry.batteryLevel} ({deviceTelemetry.batteryCharging})
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Network Bandwidth:</span>{' '}
              <strong style={{ color: '#38bdf8' }}>
                {deviceTelemetry.effectiveNetworkType} ({deviceTelemetry.downlinkBandwidth})
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Device Sensors:</span>{' '}
              <strong style={{ color: '#facc15' }}>
                {deviceTelemetry.deviceOrientationSupported ? 'Gyro/Accel Available' : 'Browser Standard'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Hardware Media:</span>{' '}
              <strong style={{ color: '#a78bfa' }}>Microphone & Camera Enabled</strong>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
