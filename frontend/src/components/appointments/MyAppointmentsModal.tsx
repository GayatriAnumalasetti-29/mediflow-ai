import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Building2,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Bell,
  Sparkles,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Appointment, AppointmentStatus, AppointmentType } from '@mediflow/shared';
import { useAuth } from '../../context/AuthContext';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinVirtualMeet: () => void;
}

interface RescheduleOption {
  id: string;
  timeSlot: string;
  date: string;
  type: 'VIRTUAL' | 'DIRECT';
  roomOrLink: string;
  fee: number;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  onJoinVirtualMeet
}) => {
  const { user, updateContextFlags } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');

  // 5-Step Rescheduling State Machine
  // 1: Ask preferred date/time
  // 2: Check actual availability
  // 3: Show available options
  // 4: Patient confirms
  // 5: Book
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleStep, setRescheduleStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [prefMode, setPrefMode] = useState<'VIRTUAL' | 'DIRECT'>('VIRTUAL');
  const [prefDate, setPrefDate] = useState('Tomorrow (2026-09-02)');
  const [prefWindow, setPrefWindow] = useState<'MORNING' | 'AFTERNOON'>('MORNING');
  const [availableOptions, setAvailableOptions] = useState<RescheduleOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<RescheduleOption | null>(null);
  const [bookedResult, setBookedResult] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAppointments();
    }
  }, [isOpen]);

  // Accessibility: Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (e) {
      console.error('Error fetching appointments', e);
    }
  };

  if (!isOpen) return null;

  const upcomingApts = appointments.filter((a) =>
    [AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.SCHEDULED].includes(a.status)
  );

  const pastApts = appointments.filter((a) =>
    [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.MISSED, AppointmentStatus.NO_SHOW, AppointmentStatus.RESCHEDULED].includes(a.status)
  );

  // Initialize Reschedule Workflow
  const startReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setRescheduleStep(1);
    setPrefMode((apt.appointmentType as any) || 'VIRTUAL');
    setPrefDate('Tomorrow (2026-09-02)');
    setPrefWindow('MORNING');
    setSelectedOption(null);
    setBookedResult(null);
  };

  // Step 1 -> Step 2 -> Step 3: Check Actual Availability & Show Options
  const handleCheckAvailability = () => {
    setRescheduleStep(2);

    // Simulate real doctor availability query across hospital database
    setTimeout(() => {
      const docName = rescheduleApt?.doctor?.fullName || 'Dr. Priya Varma';
      const isCardio = (rescheduleApt?.department || '').includes('Cardio');

      const options: RescheduleOption[] = [
        {
          id: 'opt-1',
          timeSlot: prefWindow === 'MORNING' ? '10:00 AM' : '02:30 PM',
          date: prefDate,
          type: prefMode,
          roomOrLink: prefMode === 'VIRTUAL' ? 'HD Telehealth Room #4' : (rescheduleApt?.doctor?.roomNumber || 'OPD-204'),
          fee: rescheduleApt?.consultationFee || 800
        },
        {
          id: 'opt-2',
          timeSlot: prefWindow === 'MORNING' ? '11:15 AM' : '03:45 PM',
          date: prefDate,
          type: prefMode,
          roomOrLink: prefMode === 'VIRTUAL' ? 'HD Telehealth Room #2' : (rescheduleApt?.doctor?.roomNumber || 'OPD-204'),
          fee: rescheduleApt?.consultationFee || 800
        },
        {
          id: 'opt-3',
          timeSlot: prefWindow === 'MORNING' ? '12:00 PM' : '04:30 PM',
          date: prefDate,
          type: prefMode === 'VIRTUAL' ? 'DIRECT' : 'VIRTUAL',
          roomOrLink: prefMode === 'VIRTUAL' ? (rescheduleApt?.doctor?.roomNumber || 'OPD-204') : 'HD Telehealth Room #1',
          fee: rescheduleApt?.consultationFee || 800
        }
      ];

      setAvailableOptions(options);
      setSelectedOption(null); // Never auto-select for patient
      setRescheduleStep(3);
    }, 600);
  };

  // Step 3 -> Step 4: Patient Confirms Selection
  const handleSelectOption = (option: RescheduleOption) => {
    setSelectedOption(option);
  };

  const handleProceedToConfirm = () => {
    if (selectedOption) {
      setRescheduleStep(4);
    }
  };

  // Step 4 -> Step 5: Book Rescheduled Appointment
  const handleFinalBook = async () => {
    if (!rescheduleApt || !selectedOption) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/reschedule/${rescheduleApt.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: selectedOption.date,
          newTimeSlot: selectedOption.timeSlot,
          newAppointmentType: selectedOption.type
        })
      });

      if (response.ok) {
        const json = await response.json();
        setBookedResult(json.data);
        setRescheduleStep(5);
        updateContextFlags({ hasMissedAppointment: false });
        loadAppointments();
      } else {
        const err = await response.json();
        alert(err.error || 'Conflict occurred during reschedule.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error communicating with hospital booking engine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Direct Visit Hospital Check-In
  const handleCheckIn = async (aptId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/check-in/${aptId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setStatusMessage('✓ Checked in successfully at the hospital desk!');
        loadAppointments();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate marking as missed (for testing grace period flow)
  const handleSimulateMissed = async (aptId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/missed/${aptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gracePeriodMinutes: 15 })
      });
      if (response.ok) {
        setStatusMessage('Appointment marked as missed (Grace period elapsed).');
        updateContextFlags({ hasMissedAppointment: true });
        loadAppointments();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointments-modal-title"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1.5px solid #bae6fd',
          boxShadow: '0 20px 45px rgba(14, 165, 233, 0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close My Appointments Modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#0284c7" />
            <h2 id="appointments-modal-title" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              My Appointments
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
            Manage upcoming consultations, join virtual meets, check in at the hospital, and reschedule missed appointments.
          </p>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            5-STEP INTERACTIVE RESCHEDULING WIZARD
            Rules:
            Ask preferred date/time -> Check actual availability ->
            Show available options -> Patient confirms -> Book.
            Do not automatically choose for the patient.
           ═══════════════════════════════════════════════════════════════════════ */}
        {rescheduleApt && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '18px',
              background: '#f8fafc',
              border: '2px solid #38bdf8',
              marginBottom: '1.75rem',
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.1)'
            }}
          >
            {/* Header + Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-urgent" style={{ fontSize: '0.72rem' }}>
                  Rescheduling Flow • Step {rescheduleStep} of 5
                </span>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', marginTop: '4px' }}>
                  Reschedule with {rescheduleApt.doctor?.fullName || 'Consulting Specialist'}
                </div>
              </div>

              <button
                onClick={() => setRescheduleApt(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.35rem 0.75rem', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem' }}>
              {[
                { num: 1, label: '1. Preference' },
                { num: 2, label: '2. Checking' },
                { num: 3, label: '3. Choose Option' },
                { num: 4, label: '4. Confirm' },
                { num: 5, label: '5. Booked' }
              ].map((s) => (
                <div
                  key={s.num}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.25rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    background: rescheduleStep === s.num ? '#0284c7' : rescheduleStep > s.num ? '#e0f2fe' : '#f1f5f9',
                    color: rescheduleStep === s.num ? '#ffffff' : rescheduleStep > s.num ? '#0369a1' : '#94a3b8',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* STEP 1: ASK PREFERRED DATE & TIME */}
            {rescheduleStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    1. Preferred Consultation Mode:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrefMode('VIRTUAL')}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        border: prefMode === 'VIRTUAL' ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                        background: prefMode === 'VIRTUAL' ? '#e0f2fe' : '#ffffff',
                        color: prefMode === 'VIRTUAL' ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Video size={16} />
                      <span>🎥 Virtual Video Meet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrefMode('DIRECT')}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        border: prefMode === 'DIRECT' ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                        background: prefMode === 'DIRECT' ? '#e0f2fe' : '#ffffff',
                        color: prefMode === 'DIRECT' ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Building2 size={16} />
                      <span>🏥 Direct Hospital Visit</span>
                    </button>
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      2. Preferred Consultation Date:
                    </label>
                    <select
                      value={prefDate}
                      onChange={(e) => setPrefDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '0.86rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="Tomorrow (2026-09-02)">Tomorrow (2026-09-02)</option>
                      <option value="Day After (2026-09-03)">Day After (2026-09-03)</option>
                      <option value="Friday (2026-09-05)">Friday (2026-09-05)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      3. Preferred Time Window:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPrefWindow('MORNING')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: prefWindow === 'MORNING' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                          background: prefWindow === 'MORNING' ? '#f0f9ff' : '#ffffff',
                          color: prefWindow === 'MORNING' ? '#0369a1' : '#64748b',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        🌅 Morning
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrefWindow('AFTERNOON')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: prefWindow === 'AFTERNOON' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                          background: prefWindow === 'AFTERNOON' ? '#f0f9ff' : '#ffffff',
                          color: prefWindow === 'AFTERNOON' ? '#0369a1' : '#64748b',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ☀️ Afternoon
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end', marginTop: '0.5rem', padding: '0.65rem 1.4rem' }}
                >
                  <span>Check Actual Availability →</span>
                  <Search size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: CHECK ACTUAL AVAILABILITY (LIVE QUERY ANIMATION) */}
            {rescheduleStep === 2 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '3px solid #bae6fd',
                    borderTopColor: '#0284c7',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem auto'
                  }}
                />
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Querying Hospital OPD Database...
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                  Checking live calendar and slot availability for {rescheduleApt.doctor?.fullName || 'the doctor'} on {prefDate}...
                </div>
              </div>
            )}

            {/* STEP 3: SHOW AVAILABLE OPTIONS (USER MUST CHOOSE) */}
            {rescheduleStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e40af' }}>
                  💡 <strong>Rule Enforced:</strong> MediFlow AI will never automatically choose a slot for you. Please inspect the available options below and select your preferred consultation time.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {availableOptions.map((opt) => {
                    const isSelected = selectedOption?.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt)}
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(14, 165, 233, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #0284c7' : '2px solid #cbd5e1',
                              background: isSelected ? '#0284c7' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff'
                            }}
                          >
                            {isSelected && <Check size={14} />}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                {opt.timeSlot}
                              </span>
                              <span
                                className="badge"
                                style={{
                                  background: opt.type === 'VIRTUAL' ? '#e0f2fe' : '#dcfce7',
                                  color: opt.type === 'VIRTUAL' ? '#0369a1' : '#15803d',
                                  fontWeight: 700,
                                  fontSize: '0.74rem'
                                }}
                              >
                                {opt.type === 'VIRTUAL' ? '🎥 Virtual Meet' : '🏥 Hospital Visit'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                              {opt.date} • {opt.roomOrLink} • Fee: ₹{opt.fee}
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: isSelected ? '#0284c7' : '#94a3b8', fontWeight: 700 }}>
                          {isSelected ? '✓ Selected' : 'Tap to Choose'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRescheduleStep(1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
                  >
                    ← Change Preferences
                  </button>

                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={handleProceedToConfirm}
                    className="btn btn-primary"
                    style={{
                      padding: '0.65rem 1.4rem',
                      opacity: selectedOption ? 1 : 0.5,
                      cursor: selectedOption ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <span>Proceed to Confirmation →</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PATIENT CONFIRMS (SUMMARY REVIEW) */}
            {rescheduleStep === 4 && selectedOption && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1.5px solid #bae6fd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Review Selected Rescheduled Details
                  </div>

                  <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Consulting Doctor:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {rescheduleApt.doctor?.fullName || 'Specialist'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>{rescheduleApt.department}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Date & Time:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {selectedOption.date}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                        {selectedOption.timeSlot}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Consultation Mode:</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedOption.type === 'VIRTUAL' ? '🎥 Virtual Video Meet' : '🏥 Hospital Direct Visit'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Location / Channel:</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedOption.roomOrLink}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#047857' }}>
                    <ShieldCheck size={16} color="#059669" />
                    <span>A new queue token & confirmed booking will be issued immediately upon confirmation.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setRescheduleStep(3)}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
                  >
                    ← Choose Different Slot
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalBook}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
                  >
                    <span>{isSubmitting ? 'Reserving...' : '✓ Confirm & Book Rescheduled Appointment'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: BOOKED SUCCESSFULLY (TOKEN ISSUED) */}
            {rescheduleStep === 5 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Appointment Rescheduled & Confirmed!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: '460px', margin: '0 auto 1.25rem auto' }}>
                  Your appointment with <strong>{rescheduleApt.doctor?.fullName}</strong> has been updated.
                  {bookedResult?.tokenNumber && (
                    <span style={{ display: 'block', marginTop: '6px', fontWeight: 800, color: '#0284c7' }}>
                      🎟️ Your Assigned Token Number: #{bookedResult.tokenNumber}
                    </span>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setRescheduleApt(null);
                      setActiveTab('UPCOMING');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.4rem' }}
                  >
                    View in Upcoming Appointments
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('UPCOMING')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: activeTab === 'UPCOMING' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'UPCOMING' ? '#0284c7' : '#64748b',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Upcoming Consultations ({upcomingApts.length})
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: activeTab === 'HISTORY' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'HISTORY' ? '#0284c7' : '#64748b',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            History & Missed ({pastApts.length})
          </button>
        </div>

        {/* Tab 1: UPCOMING APPOINTMENTS */}
        {activeTab === 'UPCOMING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingApts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No upcoming appointments scheduled.</p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                  Use "Book an Appointment" from the main menu to schedule a consultation.
                </p>
              </div>
            ) : (
              upcomingApts.map((apt) => {
                const isVirtual = apt.appointmentType === 'VIRTUAL';
                return (
                  <div
                    key={apt.id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isVirtual ? <Video size={18} color="#0284c7" /> : <Building2 size={18} color="#16a34a" />}
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {apt.doctor?.fullName || 'Dr. Priya Varma, MD, DM'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {apt.status === AppointmentStatus.CHECKED_IN ? (
                          <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="badge badge-routine">
                            {apt.status}
                          </span>
                        )}
                        {/* NO SUCCESSFUL APPOINTMENT -> No token. Here apt is confirmed, so token is valid */}
                        {apt.tokenNumber && (
                          <span className="badge badge-urgent">Token #{apt.tokenNumber}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      {apt.department} • Scheduled for: <strong style={{ color: '#0f172a' }}>{apt.appointmentDate} at {apt.timeSlot}</strong>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {isVirtual ? (
                        <button
                          onClick={() => {
                            onClose();
                            onJoinVirtualMeet();
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                        >
                          <Video size={14} />
                          <span>Join Virtual Meet</span>
                        </button>
                      ) : (
                        apt.status !== AppointmentStatus.CHECKED_IN && (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                          >
                            <UserCheck size={14} />
                            <span>Check In at Hospital Desk</span>
                          </button>
                        )
                      )}

                      <button
                        onClick={() => startReschedule(apt)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                      >
                        <RotateCcw size={14} />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleSimulateMissed(apt.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', marginLeft: 'auto' }}
                        title="Simulate passing grace period without attendance"
                      >
                        [Simulate Missed Grace Period]
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: HISTORY & MISSED APPOINTMENTS */}
        {activeTab === 'HISTORY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastApts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No past appointment history.</p>
              </div>
            ) : (
              pastApts.map((apt) => {
                const isMissed = apt.status === AppointmentStatus.MISSED || apt.status === AppointmentStatus.NO_SHOW;
                return (
                  <div
                    key={apt.id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isMissed ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                      background: isMissed ? '#fef2f2' : '#ffffff',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        {apt.doctor?.fullName || 'Consulting Specialist'}
                      </span>
                      <span className={`badge ${isMissed ? 'badge-urgent' : 'badge-routine'}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {apt.department} • {apt.appointmentDate} at {apt.timeSlot}
                    </div>

                    {/* MISSED APPOINTMENT NOTIFICATION & EXPLICIT RESCHEDULING OFFER */}
                    {isMissed && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1.5px solid #fca5a5',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 800, fontSize: '0.86rem' }}>
                          <AlertTriangle size={16} />
                          <span>Consultation Missed (Grace Period Elapsed)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                          You were unable to attend your scheduled consultation on {apt.appointmentDate} at {apt.timeSlot}. Would you like to check doctor availability and reschedule?
                        </p>
                        <button
                          onClick={() => startReschedule(apt)}
                          className="btn"
                          style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.82rem',
                            padding: '0.45rem 1rem',
                            marginTop: '4px',
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Reschedule This Appointment</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
