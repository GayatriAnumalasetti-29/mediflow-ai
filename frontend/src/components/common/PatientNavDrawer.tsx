import React from 'react';
import {
  X,
  User,
  CalendarDays,
  History,
  BedDouble,
  FileText,
  Receipt,
  Bell,
  Globe,
  Settings,
  LogOut,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Zap,
  Trophy,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface PatientNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenMyAppointments: () => void;
  onOpenOfficeKitBridge?: () => void;
  onOpenOfficeKitShowcase?: () => void;
  onStartDemo?: () => void;
}

export const PatientNavDrawer: React.FC<PatientNavDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenMyAppointments,
  onOpenOfficeKitBridge,
  onOpenOfficeKitShowcase,
  onStartDemo
}) => {
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage, languageDetails } = useLanguage();

  if (!isOpen) return null;

  // Strict Contextual checks based on clinical rules:
  // 1. NOT ADMITTED -> No accommodation
  const isAdmitted = !!user?.isAdmitted || (!!user?.department && user.department.includes('Ward'));
  // 2. NO RELEVANT BILL -> No billing information
  const hasBill = !!user?.hasBill;
  // 3. NO REMINDER REQUEST -> No reminder
  const hasReminders = !!user?.hasReminderRequest || !!user?.activeAppointment?.reminderEnabled;
  // 4. NO PRESCRIPTION -> No prescription workflow
  const hasPrescription = !!user?.hasPrescription;
  // 5. MISSED APPOINTMENT -> Notify patient and offer rescheduling
  const hasMissedAppointment = !!user?.hasMissedAppointment || user?.activeAppointment?.status === 'MISSED' || user?.activeAppointment?.status === 'NO_SHOW';
  const hasActiveAppointment = !!user?.activeAppointment && ['CONFIRMED', 'SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'].includes(user.activeAppointment?.status);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '320px',
          maxWidth: '85vw',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          borderRight: '1.5px solid #bae6fd',
          boxShadow: '10px 0 35px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1.25rem',
          animation: 'slideInLeft 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top: Header & Profile Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
                }}
              >
                <Stethoscope size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  MediFlow <span style={{ color: '#0284c7' }}>AI</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Patient Portal Menu</div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
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
          </div>

          {/* Patient Profile Card */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}
              >
                {user?.fullName ? user.fullName[0] : 'P'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || 'Registered Patient'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 700 }}>
                  UHID: {user?.uhid || 'MF-2026-8812'}
                </div>
              </div>
            </div>
          </div>

          {/* Context-Aware Navigation List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* MISSED APPOINTMENT ALERT (Rule: Notify patient and offer rescheduling) */}
            {hasMissedAppointment && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: '#fef2f2',
                  border: '1.5px solid #f87171',
                  marginBottom: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 800, fontSize: '0.84rem' }}>
                  <AlertTriangle size={16} />
                  <span>Missed Appointment Notice</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.4 }}>
                  You missed your scheduled consultation. Would you like to check doctor availability and reschedule?
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMyAppointments();
                  }}
                  className="btn"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px',
                    width: '100%'
                  }}
                >
                  Reschedule Appointment
                </button>
              </div>
            )}

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.25rem 0.5rem' }}>
              Essential Actions
            </div>

            {/* 🎬 3-Minute Live Guided Clinical Demo Launcher */}
            {onStartDemo && (
              <button
                onClick={() => {
                  onClose();
                  onStartDemo();
                }}
                style={{
                  width: '100%',
                  padding: '0.8rem 0.9rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Play size={18} fill="#ffffff" />
                  <span>🎬 Start 3-Min Live Demo</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.25)', padding: '2px 7px', borderRadius: '999px' }}>
                  20 Steps
                </span>
              </button>
            )}

            {/* 1. My Appointments (Upcoming & Past) */}
            <button
              onClick={() => {
                onClose();
                onOpenMyAppointments();
              }}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarDays size={18} color="#0284c7" />
                <span>My Appointments</span>
              </div>
              {hasActiveAppointment && (
                <span className="badge badge-urgent" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                  Active
                </span>
              )}
            </button>

            {/* 2. Outpatient OP Card */}
            <button
              onClick={() => {
                onClose();
                onNavigateTab('op_form');
              }}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="#0284c7" />
                <span>Outpatient OP Card</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {user?.uhid ? 'Registered' : 'New Intake'}
              </span>
            </button>

            {/* 2. Patient Profile */}
            <button
              onClick={() => {
                onClose();
                onNavigateTab('profile');
              }}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <User size={18} color="#64748b" />
              <span>Patient Profile & ID</span>
            </button>

            {/* 3. Accommodation (Rule: NOT ADMITTED -> No accommodation) */}
            {isAdmitted && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('accommodation');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  border: '1px solid #c4b5fd',
                  color: '#6d28d9',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BedDouble size={18} color="#6d28d9" />
                <span>Room & Bed Accommodation</span>
              </button>
            )}

            {/* 4. Reminders (Rule: NO REMINDER REQUEST -> No reminder) */}
            {hasReminders && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('care_timeline');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  color: '#b45309',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Bell size={18} color="#b45309" />
                <span>Active Reminders</span>
              </button>
            )}

            {/* 5. Prescriptions (Rule: NO PRESCRIPTION -> No prescription workflow) */}
            {hasPrescription && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('medication');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#166534',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Pill size={18} color="#16a34a" />
                <span>Prescriptions & Medication</span>
              </button>
            )}

            {/* 6. Billing (Rule: NO RELEVANT BILL -> No billing information) */}
            {hasBill && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('billing');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  color: '#0369a1',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Receipt size={18} color="#0284c7" />
                <span>Hospital Invoices & Billing</span>
              </button>
            )}

            {/* 6. Language Preference */}
            <div style={{ marginTop: '0.5rem', padding: '0.75rem 0.85rem', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.84rem', fontWeight: 600 }}>
                <Globe size={16} color="#0284c7" />
                <span>Language:</span>
              </div>
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom: Device Bridge + Logout */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {onOpenOfficeKitBridge && (
            <button
              onClick={() => {
                onClose();
                onOpenOfficeKitBridge();
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                background: '#e0f2fe',
                border: '1px solid #7dd3fc',
                color: '#0284c7',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Zap size={14} color="#0284c7" />
              <span>Office Kit Phone-Laptop Bridge</span>
            </button>
          )}



          <button
            onClick={() => {
              logout();
              onClose();
              onNavigateTab('landing');
            }}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>End Patient Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
