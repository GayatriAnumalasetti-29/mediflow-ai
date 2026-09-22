import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  Mic,
  Calendar,
  Camera,
  FileCheck,
  BedDouble,
  Receipt,
  Apple,
  Activity,
  HeartPulse,
  Bell,
  ShieldAlert,
  TrendingUp,
  Volume2,
  Clock
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

interface StepInfo {
  step: number;
  title: string;
  category: string;
  description: string;
  patientAction: string;
  aiResponse: string;
  targetTab: string;
  icon: any;
}

const JOURNEY_STEPS: StepInfo[] = [
  {
    step: 1,
    title: '1. Patient opens MediFlow AI',
    category: 'Intake & Onboarding',
    description: 'Patient lands on the hospital AI portal. Ambient voice recognition and multilingual sensors are active.',
    patientAction: 'Opens MediFlow AI on smartphone or web browser.',
    aiResponse: 'Displays personalized welcome greeting with UHID #MF-2026-8812 and active care status.',
    targetTab: 'overview',
    icon: Sparkles
  },
  {
    step: 2,
    title: '2. Patient speaks naturally',
    category: 'Intake & Voice',
    description: 'Patient taps microphone or speaks hands-free in their native dialect.',
    patientAction: '"నాకు ఉదయం నుండి గుండెల్లో కొద్దిగా నొప్పిగా ఉంది" (Telugu: I have slight chest discomfort since morning)',
    aiResponse: 'Streams real-time audio waveform and transcribes speech stream.',
    targetTab: 'chat',
    icon: Mic
  },
  {
    step: 3,
    title: '3. System automatically detects language',
    category: 'Multilingual NLP',
    description: 'Zero-prompt NLP analyzer identifies native Telugu script with 99.4% confidence.',
    patientAction: 'Speaks in Telugu without needing to select any language dropdown.',
    aiResponse: 'Language indicator dynamically updates to "తెలుగు (Telugu)".',
    targetTab: 'chat',
    icon: Volume2
  },
  {
    step: 4,
    title: '4. Agent responds in detected language (Text + Voice)',
    category: 'Multilingual Speech',
    description: 'Central orchestrator synthesizes spoken audio and empathetic Telugu response text.',
    patientAction: 'Listens to spoken Telugu response through speakers/headphones.',
    aiResponse: '"నమస్కారం రాజేష్ గారు, మీ లక్షణాలను అర్థం చేసుకున్నాను. నేను వెంటనే కార్డియాలజీ నిపుణులను సంప్రదించడానికి సహాయం చేస్తాను."',
    targetTab: 'chat',
    icon: Volume2
  },
  {
    step: 5,
    title: '5. Patient provides clinical concern',
    category: 'Triage',
    description: 'Patient elaborates on duration, pain intensity, and exertion sensations.',
    patientAction: '"నడవడం లేదా మెట్లు ఎక్కేటప్పుడు ఆయాసం మరియు బరువుగా అనిపిస్తోంది."',
    aiResponse: 'Evaluates red-flag matrix (mild exertional angina; non-critical, routed to Cardiology OPD).',
    targetTab: 'chat',
    icon: Activity
  },
  {
    step: 6,
    title: '6. Agent collects relevant information',
    category: 'Triage',
    description: 'AI queries EHR history, known drug allergies (Penicillin), and chronic conditions.',
    patientAction: 'Confirms personal UHID and current medications.',
    aiResponse: 'Prepares structured clinical intake summary for the attending cardiologist.',
    targetTab: 'profile',
    icon: FileCheck
  },
  {
    step: 7,
    title: '7. Agent routes patient appropriately',
    category: 'Routing',
    description: 'Orchestrator invokes tool `findDoctor` filtering by Interventional Cardiology.',
    patientAction: 'Views recommended specialist: Dr. Priya Varma, MD, DM (Cardiology).',
    aiResponse: 'Presents interactive Doctor Selection action card with available consultation slots.',
    targetTab: 'appointments',
    icon: ChevronRight
  },
  {
    step: 8,
    title: '8. Patient books doctor appointment',
    category: 'Operations',
    description: 'Invokes tool `bookAppointment` for Tomorrow at 10:30 AM in OPD Room 104.',
    patientAction: 'Selects 10:30 AM slot and confirms booking.',
    aiResponse: 'Generates confirmed appointment with digital pass and sequential token #.',
    targetTab: 'appointments',
    icon: Calendar
  },
  {
    step: 9,
    title: '9. Patient receives appointment & queue info',
    category: 'Operations',
    description: 'Live OPD Queue widget tracks Token #12 (Currently serving #10; wait ~14 mins).',
    patientAction: 'Monitors real-time queue countdown on dashboard.',
    aiResponse: 'Dispatches in-app and browser push notifications as queue advances.',
    targetTab: 'appointments',
    icon: Clock
  },
  {
    step: 10,
    title: '10. Doctor performs check-up',
    category: 'Clinical',
    description: 'Specialist conducts consultation (in-person or via Telehealth Video Room with live captions).',
    patientAction: 'Consults with Dr. Priya Varma; reviews resting ECG Doppler.',
    aiResponse: 'AI Clinical Scribe transcribes consultation and drafts clinical summary note.',
    targetTab: 'video_consult',
    icon: HeartPulse
  },
  {
    step: 11,
    title: '11. Patient receives physical/digital prescription',
    category: 'Clinical',
    description: 'Physician issues post-procedure medical prescription with 3 verified medications.',
    patientAction: 'Receives signed prescription document.',
    aiResponse: 'Prompts patient to capture photo via camera or upload scan.',
    targetTab: 'camera_rx',
    icon: Camera
  },
  {
    step: 12,
    title: '12. Patient photographs & uploads prescription',
    category: 'Multimodal Vision',
    description: 'Browser camera opens with framing guidelines; captures high-res snapshot.',
    patientAction: 'Snaps photo of prescription and clicks "Process with OCR".',
    aiResponse: 'Validates image format and uploads to secure processing pipeline.',
    targetTab: 'camera_rx',
    icon: Camera
  },
  {
    step: 13,
    title: '13. OCR extracts prescription fields',
    category: 'Multimodal Vision',
    description: 'Vision engine extracts Medicine, Dosage, Frequency (1-0-1), and Timing (After Meals).',
    patientAction: 'Inspects side-by-side extracted table.',
    aiResponse: 'Flags ambiguous handwritten notes with `isAmbiguous: true` (Zero guessing).',
    targetTab: 'camera_rx',
    icon: Sparkles
  },
  {
    step: 14,
    title: '14. Patient / Authorized staff verifies extracted Rx',
    category: 'Clinical Safety',
    description: 'Human-in-the-loop review ensures 100% accuracy before reminder creation.',
    patientAction: 'Validates Atorvastatin 20mg, Metoprolol ER 25mg, and Ecosprin 75mg.',
    aiResponse: 'Signs off prescription status as `VERIFIED_BY_PATIENT`.',
    targetTab: 'camera_rx',
    icon: CheckCircle2
  },
  {
    step: 15,
    title: '15. Agent creates verified medication schedule',
    category: 'Care Plan',
    description: 'Automatically creates active daily reminder schedules from verified prescription.',
    patientAction: 'Views chronological medication schedule in patient timeline.',
    aiResponse: 'Invokes tool `createMedicationSchedule` registering morning and evening doses.',
    targetTab: 'medication',
    icon: Clock
  },
  {
    step: 16,
    title: '16. Autonomous daily medication reminders begin',
    category: 'Follow-Up',
    description: 'Scheduler dispatches timed prompts at 08:30 AM and 09:00 PM with voice readback.',
    patientAction: 'Receives evening toast reminder with audio chime.',
    aiResponse: 'Speaks: "Hello Rajesh, time for your evening Metoprolol 25mg tablet."',
    targetTab: 'overview',
    icon: Bell
  },
  {
    step: 17,
    title: '17. Hospital accommodation allocated (if required)',
    category: 'Operations',
    description: 'For post-procedure observation, patient is allocated Semi-Private Ward SP-201 (Bed 1).',
    patientAction: 'Checks room details, amenities, and daily tariff (₹3,500/day).',
    aiResponse: 'Invokes tool `allocateAccommodation` and updates bed matrix.',
    targetTab: 'accommodation',
    icon: BedDouble
  },
  {
    step: 18,
    title: '18. Authorized hospital services added to billing',
    category: 'Billing',
    description: 'Consultations, 2 bed days, ECG tests, and verified pharmacy items are itemized.',
    patientAction: 'Reviews service line items ledger.',
    aiResponse: 'Calculates approved standard hospital tariffs with zero price hallucination.',
    targetTab: 'billing',
    icon: Receipt
  },
  {
    step: 19,
    title: '19. Official itemized bill generated & PDF exported',
    category: 'Billing',
    description: 'Invoice #INV-2026-8812 (Total ₹9,527.50; Paid ₹5,000; Due ₹4,527.50) is compiled.',
    patientAction: 'Generates printable official PDF tax invoice or settles balance via UPI.',
    aiResponse: 'Invokes tool `generateBill` and generates official digital receipt.',
    targetTab: 'billing',
    icon: Receipt
  },
  {
    step: 20,
    title: '20. Clinician/Dietitian approved instructions added',
    category: 'Care Plan',
    description: 'Authorizing doctor and clinical dietitian attach low-sodium cardiac nutrition protocol.',
    patientAction: 'Views calorie target (1,800 kcal) and sodium limit (< 2g/day).',
    aiResponse: 'Displays prominent "🩺 Clinician Authorized" badges.',
    targetTab: 'diet',
    icon: Apple
  },
  {
    step: 21,
    title: '21. Patient receives Diet, Activity & Therapy schedules',
    category: 'Care Plan',
    description: 'Unified Care Plan coordinates meals, 15-min gentle walking, and physio rehab.',
    patientAction: 'Reviews today\'s 5-pillar daily care timeline.',
    aiResponse: 'Combines all daily milestones with live compliance progress bar.',
    targetTab: 'care_timeline',
    icon: Activity
  },
  {
    step: 22,
    title: '22. Agent follows up every day',
    category: 'Follow-Up',
    description: 'Daily wellness check-in prompts patient for pain rating (0-10) and sensation notes.',
    patientAction: 'Logs morning BP (122/78 mmHg) and rating 2/10 (Comfortable).',
    aiResponse: 'Maintains 5-Day Adherence Streak at 94% verified compliance.',
    targetTab: 'followup',
    icon: HeartPulse
  },
  {
    step: 23,
    title: '23. Patient answers using natural voice or text',
    category: 'Voice & NLP',
    description: 'Patient speaks naturally: "Nenu morning tablet vesukunnanu" (I took morning dose).',
    patientAction: 'Speaks affirmation in Telugu/English.',
    aiResponse: 'Adherence parser registers dose as `COMPLETED` in database.',
    targetTab: 'chat',
    icon: Mic
  },
  {
    step: 24,
    title: '24. Agent responds in patient\'s language',
    category: 'Multilingual',
    description: 'Agent returns spoken confirmation in Telugu with empathetic audio feedback.',
    patientAction: 'Hears audio confirmation in native dialect.',
    aiResponse: '"చాలా మంచిది రాజేష్ గారు! మీ మందుల డోస్ విజయవంతంగా నమోదయింది."',
    targetTab: 'chat',
    icon: Volume2
  },
  {
    step: 25,
    title: '25. Clinical follow-up appointment scheduled',
    category: 'Operations',
    description: 'Post-procedure review scheduled with Dr. Priya Varma for ECG Doppler check.',
    patientAction: 'Confirms follow-up consultation date.',
    aiResponse: 'Invokes tool `scheduleFollowUp` and issues advance appointment pass.',
    targetTab: 'appointments',
    icon: Calendar
  },
  {
    step: 26,
    title: '26. Concerning responses escalated to healthcare staff',
    category: 'Safety & Emergency',
    description: 'If red-flag chest pain is reported, system immediately alerts nurse station.',
    patientAction: 'Safety test: reports acute severe chest heaviness.',
    aiResponse: 'Triggers tool `createEscalation` and dispatches red-flag alert to Staff Command.',
    targetTab: 'staff_escalations',
    icon: ShieldAlert
  },
  {
    step: 27,
    title: '27. Patient views complete recovery timeline',
    category: 'Recovery Hub',
    description: 'Patient tracks entire 4-phase recovery roadmap from inpatient stent to graduation.',
    patientAction: 'Inspects Phase 2 Home Recovery progress, therapy notes, and milestones.',
    aiResponse: 'Displays comprehensive multi-week recovery roadmap with clinical attribution.',
    targetTab: 'recovery',
    icon: TrendingUp
  }
];

export const Interactive27StepJourney: React.FC<Props> = ({ onNavigateTab }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentStep = JOURNEY_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < JOURNEY_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigateTab(JOURNEY_STEPS[nextIndex].targetTab);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigateTab(JOURNEY_STEPS[prevIndex].targetTab);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    onNavigateTab(JOURNEY_STEPS[index].targetTab);
  };

  const StepIcon = currentStep.icon;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        border: '1.5px solid rgba(14, 165, 233, 0.4)',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '1.5rem'
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)'
            }}
          >
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Complete 27-Step Patient Lifecycle Walkthrough
              </span>
              <span className="badge badge-routine">
                Step {currentStep.step} of 27
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Interactive End-to-End Demonstration Controller for MediFlow AI
            </p>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepClick(0)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="btn btn-secondary flex items-center gap-1"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === JOURNEY_STEPS.length - 1}
            className="btn btn-primary flex items-center gap-1"
            style={{ padding: '0.4rem 1.1rem', fontSize: '0.78rem' }}
          >
            <span>Next Step</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Active Step Showcase Card */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          background: 'rgba(11, 15, 25, 0.7)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          marginBottom: '1rem'
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(14, 165, 233, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StepIcon size={20} color="#38bdf8" />
            </div>
            <div>
              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontSize: '0.7rem' }}>
                {currentStep.category}
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab(currentStep.targetTab)}
            className="btn btn-emerald flex items-center gap-1.5"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
          >
            <span>Jump to View ({currentStep.targetTab})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.75rem', lineHeight: '1.5' }}>
          {currentStep.description}
        </p>

        {/* Live Exchange Box */}
        <div className="grid-cols-2" style={{ gap: '0.75rem', marginTop: '0.85rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Patient Action / Input:
            </div>
            <p style={{ fontSize: '0.82rem', color: '#f8fafc', marginTop: '4px', fontStyle: 'italic' }}>
              "{currentStep.patientAction}"
            </p>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
              MediFlow AI Action & Response:
            </div>
            <p style={{ fontSize: '0.82rem', color: '#f8fafc', marginTop: '4px' }}>
              {currentStep.aiResponse}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Dots Bar */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        {JOURNEY_STEPS.map((s, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          return (
            <button
              key={s.step}
              onClick={() => handleStepClick(idx)}
              style={{
                flex: 1,
                minWidth: '28px',
                height: '8px',
                borderRadius: '4px',
                background: isCurrent ? '#0ea5e9' : isPassed ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={`Step ${s.step}: ${s.title}`}
            />
          );
        })}
      </div>
    </div>
  );
};
