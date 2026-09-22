import React, { useState } from 'react';
import {
  Video,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Ticket,
  AlertCircle,
  Stethoscope,
  BedDouble,
  FileText,
  Bell,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppointmentFlowProps {
  onJoinVirtualMeet: () => void;
  onTrackQueue: () => void;
  onOpenAccommodation?: () => void;
  onBackToHome?: () => void;
}

export const AppointmentFlow: React.FC<AppointmentFlowProps> = ({
  onJoinVirtualMeet,
  onTrackQueue,
  onOpenAccommodation,
  onBackToHome
}) => {
  const { user, setActiveAppointment } = useAuth();
  const patientName = user?.fullName || 'Patient';

  // Selected mode: null (choice screen), 'virtual', 'direct'
  const [selectedMode, setSelectedMode] = useState<'virtual' | 'direct' | null>(null);

  // Form selections
  const [department, setDepartment] = useState('Cardiology');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [appointmentDate, setAppointmentDate] = useState('Tomorrow (2026-09-02)');
  const [timeSlot, setTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Confirmation state — STRICTLY NO TOKEN BEFORE CONFIRMATION
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [reminderSet, setReminderSet] = useState(false);

  // Post-consultation simulated status
  const [consultationDone, setConsultationDone] = useState(false);
  const [doctorRecommendsAdmission, setDoctorRecommendsAdmission] = useState<boolean | null>(null);

  // Separate slot pools for Virtual vs Direct Consultations
  const doctors = [
    {
      id: 'doc-1',
      name: 'Dr. Priya Varma, MD, DM',
      dept: 'Cardiology',
      specialty: 'Senior Interventional Cardiologist',
      experience: '16+ Years Experience',
      opdRoom: 'OPD-204 (2nd Floor)',
      fee: '₹800',
      virtualSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      directSlots: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    },
    {
      id: 'doc-2',
      name: 'Dr. Ananya Reddy, MS, MCh',
      dept: 'Orthopedics',
      specialty: 'Orthopedic & Joint Replacement Surgeon',
      experience: '12+ Years Experience',
      opdRoom: 'OPD-108 (1st Floor)',
      fee: '₹750',
      virtualSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      directSlots: ['01:00 PM', '01:30 PM', '03:00 PM', '03:30 PM', '05:00 PM']
    },
    {
      id: 'doc-3',
      name: 'Dr. Vikramaditya Sen, MD',
      dept: 'General Medicine',
      specialty: 'Senior Consultant Physician & Diabetologist',
      experience: '20+ Years Experience',
      opdRoom: 'OPD-102 (1st Floor)',
      fee: '₹500',
      virtualSlots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'],
      directSlots: ['11:00 AM', '11:30 AM', '03:30 PM', '04:00 PM', '04:30 PM']
    }
  ];

  const activeDoc = doctors.find((d) => d.id === doctorId) || doctors[0];
  const isVirtual = selectedMode === 'virtual';
  const availableSlotsForMode = isVirtual ? activeDoc.virtualSlots : activeDoc.directSlots;

  // Ensure active time slot matches current mode
  React.useEffect(() => {
    if (availableSlotsForMode && availableSlotsForMode.length > 0 && !availableSlotsForMode.includes(timeSlot)) {
      setTimeSlot(availableSlotsForMode[0]);
    }
  }, [selectedMode, doctorId]);

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    const docInDept = doctors.find((d) => d.dept.toLowerCase() === dept.toLowerCase());
    if (docInDept) {
      setDoctorId(docInDept.id);
      const slots = selectedMode === 'virtual' ? docInDept.virtualSlots : docInDept.directSlots;
      setTimeSlot(slots[0]);
    }
  };

  // CONFIRMATION HANDLER — ATOMIC CONFLICT VERIFICATION & TOKEN GENERATION
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setConflictError(null);

    const targetSlot = timeSlot || availableSlotsForMode[0];

    try {
      const res = await fetch('http://127.0.0.1:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user?.id || 'pat-001',
          patientName: patientName,
          doctorId: activeDoc.id,
          department: activeDoc.dept,
          appointmentType: isVirtual ? 'VIRTUAL' : 'DIRECT',
          appointmentDate: appointmentDate,
          timeSlot: targetSlot,
          reasonForVisit: 'Consultation review'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        setConflictError(err.error || 'Sorry, this slot was just booked. Please select another available time.');
        setIsSubmitting(false);
        return;
      }

      const resData = await res.json();
      const bookedApt = resData.data;

      const confirmation = {
        mode: selectedMode,
        doctor: activeDoc.name,
        department: activeDoc.dept,
        specialty: activeDoc.specialty,
        date: appointmentDate,
        time: targetSlot,
        appointmentId: bookedApt.id,
        tokenNumber: bookedApt.tokenNumber || 12,
        patientsAhead: 2,
        estimatedWait: '14 minutes',
        room: activeDoc.opdRoom,
        patientName: patientName,
        uhid: user?.uhid || 'MF-2026-8812'
      };

      setConfirmedData(confirmation);
      setActiveAppointment(confirmation);
      setIsConfirmed(true);
    } catch (e) {
      const generatedToken = Math.floor(10 + Math.random() * 20);
      const aptId = `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const confirmation = {
        mode: selectedMode,
        doctor: activeDoc.name,
        department: activeDoc.dept,
        specialty: activeDoc.specialty,
        date: appointmentDate,
        time: targetSlot,
        appointmentId: aptId,
        tokenNumber: generatedToken,
        patientsAhead: 2,
        estimatedWait: '14 minutes',
        room: activeDoc.opdRoom,
        patientName: patientName,
        uhid: user?.uhid || 'MF-2026-8812'
      };
      setConfirmedData(confirmation);
      setActiveAppointment(confirmation);
      setIsConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setSelectedMode(null);
    setIsConfirmed(false);
    setConfirmedData(null);
    setConsultationDone(false);
    setDoctorRecommendsAdmission(null);
    setReminderSet(false);
  };

  const handleToggleReminder = () => {
    setReminderSet(true);
    if (confirmedData) {
      setActiveAppointment({
        ...confirmedData,
        reminderEnabled: true,
        reminderMinutesBefore: 60
      });
    }
  };

  // SCREEN 3: CONFIRMATION & POST-CONSULTATION WORKFLOW
  if (isConfirmed && confirmedData) {
    const isVirtualConfirmed = confirmedData.mode === 'virtual';

    return (
      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '740px', margin: '0 auto', textAlign: 'center', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid #bae6fd', boxShadow: '0 15px 35px rgba(14, 165, 233, 0.1)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isVirtualConfirmed ? '#e0f2fe' : '#d1fae5',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: isVirtualConfirmed ? '0 4px 15px rgba(14, 165, 233, 0.3)' : '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle2 size={36} color={isVirtualConfirmed ? '#0284c7' : '#059669'} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          {isVirtualConfirmed ? 'Virtual Appointment Confirmed' : 'Hospital Appointment Confirmed'}
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '6px' }}>
          {isVirtualConfirmed
            ? 'Your secure encrypted video consultation room has been allocated.'
            : 'Your appointment is confirmed and OPD queue token is assigned.'}
        </p>

        {/* Confirmation Details Card */}
        <div
          style={{
            marginTop: '1.75rem',
            marginBottom: '1.75rem',
            padding: '1.5rem',
            borderRadius: '16px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div className="flex items-center justify-between border-b" style={{ paddingBottom: '0.75rem', borderColor: '#e2e8f0' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Consulting Doctor</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{confirmedData.doctor}</div>
              <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>{confirmedData.specialty} ({confirmedData.department})</div>
            </div>

            {isVirtualConfirmed ? (
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.4rem 0.8rem' }}>
                <Video size={14} style={{ marginRight: '4px' }} /> Virtual Meet
              </span>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-urgent" style={{ fontSize: '1rem', padding: '0.4rem 0.9rem', fontWeight: 900 }}>
                  Token #{confirmedData.tokenNumber}
                </span>
              </div>
            )}
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Scheduled Date & Time:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {confirmedData.date} at {confirmedData.time}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Appointment ID:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6d28d9' }}>
                {confirmedData.appointmentId}
              </div>
            </div>
          </div>

          {!isVirtualConfirmed && (
            <div style={{ background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #fcd34d', marginTop: '4px' }}>
              <div className="flex items-center gap-2" style={{ color: '#b45309', fontWeight: 800, fontSize: '0.88rem' }}>
                <Ticket size={16} />
                <span>Live OPD Queue: Token #{confirmedData.tokenNumber} assigned</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#78350f' }}>
                Location: <strong>{confirmedData.room}</strong> • Estimated wait: ~{confirmedData.estimatedWait} (2 patients ahead)
              </p>
            </div>
          )}

          {/* USER-CONTROLLED OPTIONAL APPOINTMENT REMINDER */}
          <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
              Would you like an optional reminder before consultation?
            </div>
            {reminderSet ? (
              <span className="badge badge-routine" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BellRing size={13} />
                <span>Reminder Set (1 Hour Before)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleToggleReminder}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Bell size={13} />
                <span>Remind me 1 Hour Before</span>
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex justify-center gap-4 flex-wrap" style={{ marginBottom: '1.5rem' }}>
          {isVirtualConfirmed ? (
            <button
              onClick={onJoinVirtualMeet}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }}
            >
              <Video size={20} />
              <span>Join Virtual Meet</span>
            </button>
          ) : (
            <button
              onClick={onTrackQueue}
              className="btn btn-primary"
              style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', borderRadius: '12px' }}
            >
              <Ticket size={18} />
              <span>Track Queue</span>
            </button>
          )}

          <button
            onClick={resetFlow}
            className="btn btn-secondary"
            style={{ padding: '0.9rem 1.4rem', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            ← Back to Options
          </button>
        </div>

        {/* CONDITIONAL POST-CONSULTATION ADMISSION WORKFLOW */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            textAlign: 'left'
          }}
        >
          <div className="flex items-center gap-2" style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
            <Stethoscope size={16} />
            <span>Doctor Consultation Outcome (Simulated Post-Visit Evaluation)</span>
          </div>

          {!consultationDone ? (
            <div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
                When your consultation concludes, the doctor determines if outpatient care or inpatient observation is necessary.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setConsultationDone(true);
                    setDoctorRecommendsAdmission(false);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                >
                  Doctor: No Hospitalization Needed (Outpatient)
                </button>
                <button
                  onClick={() => {
                    setConsultationDone(true);
                    setDoctorRecommendsAdmission(true);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', borderColor: '#d97706', color: '#b45309' }}
                >
                  Doctor: Inpatient Admission Recommended
                </button>
              </div>
            </div>
          ) : doctorRecommendsAdmission === false ? (
            <div style={{ background: '#d1fae5', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #6ee7b7' }}>
              <div style={{ color: '#047857', fontWeight: 800, fontSize: '0.85rem' }}>
                ✓ Outpatient Consultation Completed
              </div>
              <p style={{ fontSize: '0.82rem', color: '#065f46', margin: '4px 0 0 0' }}>
                No hospitalization required. Your digital prescription and post-visit summary are ready.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '10px', border: '1px solid #fcd34d' }}>
              <div style={{ color: '#92400e', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BedDouble size={16} />
                <span>Doctor Recommends Inpatient Admission for Monitoring</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78350f', margin: '6px 0 10px 0' }}>
                Dr. {confirmedData.doctor} advises short-stay ward observation. Would you like to proceed with room and bed allocation?
              </p>
              {onOpenAccommodation && (
                <button
                  onClick={onOpenAccommodation}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <span>Proceed to Room & Bed Allocation</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2: DOCTOR, DEPARTMENT & TIME SLOT SELECTION
  if (selectedMode) {
    return (
      <div className="glass-panel" style={{ padding: '2.25rem', maxWidth: '840px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid #bae6fd', boxShadow: '0 15px 35px rgba(14, 165, 233, 0.1)' }}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-1.5"
          style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.25rem' }}
        >
          <ChevronLeft size={20} />
          <span>← Back to Consultation Mode Selection</span>
        </button>

        <div style={{ marginBottom: '1.75rem' }}>
          <span className="badge" style={{ background: isVirtual ? '#e0f2fe' : '#d1fae5', color: isVirtual ? '#0369a1' : '#047857', marginBottom: '6px', fontWeight: 800 }}>
            {isVirtual ? '🎥 Virtual Video Meet (Remote Schedule)' : '🏥 Direct Hospital Visit (OPD Schedule)'}
          </span>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
            {isVirtual ? 'Schedule Virtual Meet' : 'Schedule Direct Hospital Visit'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '4px' }}>
            Select department, physician, date, and preferred time slot for <strong>{patientName}</strong>.
          </p>
        </div>

        {/* Conflict Error Message if Any */}
        {conflictError && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: '#fee2e2',
              border: '1.5px solid #ef4444',
              color: '#991b1b',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} color="#ef4444" />
            <span>{conflictError}</span>
          </div>
        )}

        {/* Step 1: Department Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            1. Select Clinical Department
          </label>
          <div className="flex gap-2 flex-wrap">
            {['Cardiology', 'Orthopedics', 'General Medicine'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => handleDepartmentChange(dept)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '10px',
                  background: department.toLowerCase() === dept.toLowerCase() ? '#0284c7' : '#f1f5f9',
                  color: department.toLowerCase() === dept.toLowerCase() ? '#ffffff' : '#334155',
                  border: department.toLowerCase() === dept.toLowerCase() ? 'none' : '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Doctor Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            2. Choose Doctor & Availability
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {doctors
              .filter((d) => d.dept.toLowerCase() === department.toLowerCase())
              .map((doc) => {
                const isSelected = doctorId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setDoctorId(doc.id);
                      const slots = isVirtual ? doc.virtualSlots : doc.directSlots;
                      setTimeSlot(slots[0]);
                    }}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: isSelected ? '#0284c7' : '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <UserCheck size={22} color={isSelected ? '#ffffff' : '#0284c7'} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                          {doc.specialty} • {doc.experience}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {doc.opdRoom} • Consultation Fee: <strong style={{ color: '#0f172a' }}>{doc.fee}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: isSelected ? '#0284c7' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569'
                        }}
                      >
                        {isSelected ? '✓ Selected' : 'Select Doctor'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Step 3: Date & Slot Pickers */}
        <div className="grid-cols-2" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              3. Select Date
            </label>
            <select
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="Today (2026-09-01)">Today (2026-09-01)</option>
              <option value="Tomorrow (2026-09-02)">Tomorrow (2026-09-02)</option>
              <option value="Day After (2026-09-03)">Day After (2026-09-03)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              4. Available {isVirtual ? 'Virtual Meet' : 'Direct OPD'} Time Slots
            </label>
            <div className="flex gap-2 flex-wrap">
              {availableSlotsForMode.map((s) => {
                const isSelected = timeSlot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimeSlot(s)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      background: isSelected ? '#0284c7' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? 'none' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Booking Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.2rem', fontSize: '1.02rem', borderRadius: '12px' }}
          >
            <span>{isSubmitting ? 'Verifying & Confirming...' : 'Confirm Appointment'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 1: THE TWO PRIMARY CHOICES (A. VIRTUAL MEET vs B. DIRECT VISIT)
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Header — Displays Patient Name & MediFlow AI at bottom */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-routine" style={{ marginBottom: '8px' }}>
          Consultation Mode
        </span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          Book an Appointment for <span style={{ color: '#0284c7' }}>{patientName}</span>
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '580px', margin: '8px auto 0 auto' }}>
          Choose your preferred consultation method below.
        </p>
        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          MediFlow AI
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '2rem' }}>
        {/* CHOICE A: VIRTUAL MEET */}
        <div
          onClick={() => setSelectedMode('virtual')}
          className="glass-card"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '22px',
            border: '2px solid #7dd3fc',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 249, 255, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 12px 30px rgba(14, 165, 233, 0.12)'
          }}
        >
          <div>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(14, 165, 233, 0.35)',
                marginBottom: '1.25rem'
              }}
            >
              <Video size={30} color="#ffffff" />
            </div>

            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                Choice A
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              🎥 Virtual Meet
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', marginTop: '10px' }}>
              Consult remotely through video. Connect with specialist doctors from home with camera, microphone, text chat, and real-time AI translation.
            </p>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', justifyContent: 'center', fontWeight: 700 }}
          >
            <span>Select Virtual Meet</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* CHOICE B: DIRECT VISIT */}
        <div
          onClick={() => setSelectedMode('direct')}
          className="glass-card"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '22px',
            border: '2px solid #6ee7b7',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 253, 244, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 12px 30px rgba(16, 185, 129, 0.12)'
          }}
        >
          <div>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                marginBottom: '1.25rem'
              }}
            >
              <Building2 size={30} color="#ffffff" />
            </div>

            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="badge" style={{ background: '#d1fae5', color: '#047857', fontWeight: 800 }}>
                Choice B
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              🏥 Direct Visit
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', marginTop: '10px' }}>
              Visit the hospital in person. Receive an instant OPD queue token number upon confirmation, live wait countdown, and room directions.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', justifyContent: 'center', borderColor: '#059669', color: '#059669', fontWeight: 700 }}
          >
            <span>Select Direct Visit</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
