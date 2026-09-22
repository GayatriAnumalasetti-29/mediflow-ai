import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PatientHome } from './PatientHome';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { CameraCapture } from '../../components/camera/CameraCapture';
import { DocumentUploader } from '../../components/camera/DocumentUploader';
import { AppointmentFlow } from '../../components/appointments/AppointmentFlow';
import { MedicationTimeline } from '../../components/medication/MedicationTimeline';
import { DietPlanCard } from '../../components/diet/DietPlanCard';
import { ItemizedInvoice } from '../../components/billing/ItemizedInvoice';
import { RecoveryTracker } from '../../components/followUp/RecoveryTracker';
import { BedMatrix } from '../../components/accommodation/BedMatrix';
import { PatientProfile } from './PatientProfile';
import { VideoConsultation } from '../../components/video/VideoConsultation';
import { UnifiedCareTimeline } from '../../components/careplan/UnifiedCareTimeline';
import { RecoveryHub } from '../../components/recovery/RecoveryHub';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { PatientOpForm } from '../../components/op/PatientOpForm';
import { ArrowLeft, BedDouble, Receipt, Pill, AlertTriangle } from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMyAppointments?: () => void;
}

export const PatientDashboard: React.FC<Props> = ({ activeTab, onTabChange, onOpenMyAppointments }) => {
  const { user } = useAuth();
  const isSubPage = activeTab !== 'overview';

  // Strict Context-Aware Flags
  const isAdmitted = !!user?.isAdmitted || (!!user?.department && user.department.includes('Ward'));
  const hasBill = !!user?.hasBill;
  const hasPrescription = !!user?.hasPrescription;
  const hasMissedAppointment =
    !!user?.hasMissedAppointment ||
    user?.activeAppointment?.status === 'MISSED' ||
    user?.activeAppointment?.status === 'NO_SHOW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ⚠️ Context-Aware Missed Appointment Banner (Rule: MISSED APPOINTMENT -> Notify patient and offer rescheduling) */}
      {hasMissedAppointment && (
        <div
          style={{
            padding: '1.1rem 1.4rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
            border: '1.5px solid #f87171',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#991b1b' }}>
                Notice: Missed Appointment Consultation
              </div>
              <div style={{ fontSize: '0.84rem', color: '#7f1d1d', marginTop: '2px' }}>
                You missed your scheduled consultation with {user?.activeAppointment?.doctor?.fullName || 'the consulting specialist'}. Would you like to check doctor availability and choose a new time?
              </div>
            </div>
          </div>

          <button
            onClick={() => (onOpenMyAppointments ? onOpenMyAppointments() : onTabChange('appointments'))}
            className="btn"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
            }}
          >
            Reschedule Appointment
          </button>
        </div>
      )}

      {/* 🔙 Universal Back Arrow Key Bar (Visible on all sub-pages) */}
      {isSubPage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            marginBottom: '0.25rem'
          }}
        >
          <button
            onClick={() => onTabChange('overview')}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.55rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              background: '#ffffff',
              border: '1.5px solid #7dd3fc',
              color: '#0284c7',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.12)',
              cursor: 'pointer'
            }}
            title="Return to Patient Care Hub (← Back)"
          >
            <ArrowLeft size={18} />
            <span>← Back to Main Menu</span>
          </button>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            MediFlow AI • Patient Care Flow
          </span>
        </div>
      )}

      {/* 0. Outpatient OP Registration Form */}
      {activeTab === 'op_form' && (
        <ErrorBoundary fallbackTitle="Outpatient Registration Error" onReset={() => onTabChange('overview')}>
          <PatientOpForm
            onSubmitSuccess={() => {
              onTabChange('overview');
            }}
          />
        </ErrorBoundary>
      )}

      {/* 1. Overview Tab (Welcome + Two Primary Options) */}
      {activeTab === 'overview' && (
        <ErrorBoundary fallbackTitle="Patient Home Hub Error" onReset={() => onTabChange('overview')}>
          <PatientHome onNavigateTab={onTabChange} />
        </ErrorBoundary>
      )}

      {/* 2. Unified Master Care Timeline */}
      {activeTab === 'care_timeline' && (
        <ErrorBoundary fallbackTitle="Care Plan Timeline Error" onReset={() => onTabChange('overview')}>
          <UnifiedCareTimeline />
        </ErrorBoundary>
      )}

      {/* 3. Multimodal AI Medical Suggestion / Chat */}
      {activeTab === 'chat' && (
        <ErrorBoundary fallbackTitle="Medical Suggestion Interface Error" onReset={() => onTabChange('overview')}>
          <ChatInterface onNavigateTab={onTabChange} />
        </ErrorBoundary>
      )}

      {/* 4. Telehealth Video Consultation (Virtual Meet Room) */}
      {activeTab === 'video_consult' && (
        <ErrorBoundary fallbackTitle="Telehealth Consultation Error" onReset={() => onTabChange('overview')}>
          <VideoConsultation />
        </ErrorBoundary>
      )}

      {/* 5. Appointments Flow (Virtual Meet vs Direct Visit) */}
      {activeTab === 'appointments' && (
        <ErrorBoundary fallbackTitle="Appointment System Error" onReset={() => onTabChange('overview')}>
          <AppointmentFlow
            onJoinVirtualMeet={() => onTabChange('video_consult')}
            onTrackQueue={() => onTabChange('overview')}
            onOpenAccommodation={() => onTabChange('accommodation')}
            onBackToHome={() => onTabChange('overview')}
          />
        </ErrorBoundary>
      )}

      {/* 6. Room & Bed Matrix (Contextual Guard: NOT ADMITTED -> No accommodation) */}
      {activeTab === 'accommodation' && (
        <ErrorBoundary fallbackTitle="Accommodation System Error" onReset={() => onTabChange('overview')}>
          {isAdmitted ? (
            <BedMatrix />
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '640px',
                margin: '2rem auto',
                borderRadius: '24px',
                border: '1.5px solid #c4b5fd',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 30px rgba(124, 58, 237, 0.08)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <BedDouble size={32} />
              </div>
              <span
                className="badge"
                style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 800, marginBottom: '0.75rem' }}
              >
                Rule Enforced: Not Admitted → No Accommodation
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0' }}>
                Inpatient Room & Bed Accommodation Restricted
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  margin: '0.75rem auto 1.75rem auto'
                }}
              >
                Hospital room and bed allotments are strictly reserved for admitted inpatient cases. Outpatients and non-admitted individuals do not have room bookings. If you require inpatient admission, please consult with your treating physician.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => onTabChange('overview')}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}
                >
                  ← Return to Main Menu
                </button>
                <button
                  onClick={() => onTabChange('appointments')}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}
                >
                  Book Doctor Appointment
                </button>
              </div>
            </div>
          )}
        </ErrorBoundary>
      )}

      {/* 7. Camera Prescription OCR */}
      {activeTab === 'camera_rx' && (
        <ErrorBoundary fallbackTitle="Prescription Scanner Error" onReset={() => onTabChange('overview')}>
          <CameraCapture />
        </ErrorBoundary>
      )}

      {/* 8. Medical Document Vault */}
      {activeTab === 'documents' && (
        <ErrorBoundary fallbackTitle="Medical Document Vault Error" onReset={() => onTabChange('overview')}>
          <DocumentUploader />
        </ErrorBoundary>
      )}

      {/* 9. Medication Schedule & Adherence (Contextual Guard: NO PRESCRIPTION -> No prescription workflow) */}
      {activeTab === 'medication' && (
        <ErrorBoundary fallbackTitle="Medication System Error" onReset={() => onTabChange('overview')}>
          {hasPrescription ? (
            <MedicationTimeline />
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '640px',
                margin: '2rem auto',
                borderRadius: '24px',
                border: '1.5px solid #86efac',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 30px rgba(22, 163, 74, 0.08)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <Pill size={32} />
              </div>
              <span
                className="badge"
                style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, marginBottom: '0.75rem' }}
              >
                Rule Enforced: No Prescription → No Prescription Workflow
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0' }}>
                No Active Digital Prescriptions
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  margin: '0.75rem auto 1.75rem auto'
                }}
              >
                There are currently no active digital prescriptions recorded in your patient file. Prescriptions are issued by doctors following a consultation or digitized by scanning an external paper prescription.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => onTabChange('overview')}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}
                >
                  ← Return to Main Menu
                </button>
                <button
                  onClick={() => onTabChange('camera_rx')}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}
                >
                  Scan Prescription via Camera
                </button>
              </div>
            </div>
          )}
        </ErrorBoundary>
      )}

      {/* 10. Diet & Nutrition Plan */}
      {activeTab === 'diet' && (
        <ErrorBoundary fallbackTitle="Diet Plan Error" onReset={() => onTabChange('overview')}>
          <DietPlanCard />
        </ErrorBoundary>
      )}

      {/* 11. Recovery & Physical Therapy Hub */}
      {activeTab === 'recovery' && (
        <ErrorBoundary fallbackTitle="Recovery Hub Error" onReset={() => onTabChange('overview')}>
          <RecoveryHub />
        </ErrorBoundary>
      )}

      {/* 12. Billing & Itemized Invoice (Contextual Guard: NO RELEVANT BILL -> No billing information) */}
      {activeTab === 'billing' && (
        <ErrorBoundary fallbackTitle="Billing Statement Error" onReset={() => onTabChange('overview')}>
          {hasBill ? (
            <ItemizedInvoice />
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '640px',
                margin: '2rem auto',
                borderRadius: '24px',
                border: '1.5px solid #bae6fd',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 30px rgba(14, 165, 233, 0.08)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <Receipt size={32} />
              </div>
              <span
                className="badge"
                style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800, marginBottom: '0.75rem' }}
              >
                Rule Enforced: No Relevant Bill → No Billing Information
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0' }}>
                No Outstanding Hospital Invoices
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  margin: '0.75rem auto 1.75rem auto'
                }}
              >
                You currently have no pending hospital bills, pharmacy invoices, or unpaid charges on record. Itemized statements are generated automatically only after confirmed clinical consultations, laboratory orders, or inpatient discharge.
              </p>
              <button
                onClick={() => onTabChange('overview')}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}
              >
                ← Return to Main Menu
              </button>
            </div>
          )}
        </ErrorBoundary>
      )}

      {/* 13. Daily Check-in Follow-up */}
      {activeTab === 'followup' && (
        <ErrorBoundary fallbackTitle="Recovery Tracker Error" onReset={() => onTabChange('overview')}>
          <RecoveryTracker />
        </ErrorBoundary>
      )}

      {/* 14. Patient Profile & Digital ID */}
      {activeTab === 'profile' && (
        <ErrorBoundary fallbackTitle="Patient Profile Error" onReset={() => onTabChange('overview')}>
          <PatientProfile />
        </ErrorBoundary>
      )}
    </div>
  );
};
