import React from 'react';
import { Activity, ShieldCheck, Lock, Globe, Stethoscope, ArrowRight } from 'lucide-react';

interface FooterProps {
  onOpenDoctorLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDoctorLogin }) => {
  return (
    <footer
      style={{
        marginTop: '3.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '2.5rem',
        paddingBottom: '2rem',
        background: 'rgba(11, 15, 25, 0.4)'
      }}
    >
      <div className="landing-container">
        {/* DOCTOR / STAFF LOGIN PORTAL BUTTON IN FOOTER (As requested in Task 2) */}
        <div
          style={{
            marginBottom: '2.5rem',
            padding: '1.25rem 1.75rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Stethoscope size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Are you a Doctor, Specialist, or Hospital Staff?
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Access the clinical OPD queue desk, bed allocation matrix, and prescription verification console.
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDoctorLogin}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              background: '#10b981',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <ShieldCheck size={17} />
            <span>Doctor / Staff Login</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          {/* Col 1: Brand & Purpose */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                MediFlow <span style={{ color: '#38bdf8' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.6' }}>
              Next-generation multimodal hospital patient lifecycle agent. Coordinating outpatient registration, clinical triage, prescription OCR, medication follow-ups, and post-discharge recovery.
            </p>
          </div>

          {/* Col 2: Patient Journey */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.85rem' }}>
              Patient Lifecycle
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Patient OP Registration Form</li>
              <li>Multilingual Voice Triage (Telugu/Hindi)</li>
              <li>Live OPD Token Queue Tracking</li>
              <li>Prescription Camera & OCR</li>
              <li>Automated Medication Schedule</li>
              <li>Post-Discharge Daily Check-In</li>
            </ul>
          </div>

          {/* Col 3: Hospital Administration */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.85rem' }}>
              Clinical Management
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Doctor OPD Caller Desk</li>
              <li>Prescription Verification Desk</li>
              <li>Bed & Ward Matrix (General/ICU)</li>
              <li>Emergency Nurse Escalation Alerts</li>
              <li>Itemized Hospital Billing Ledger</li>
              <li>ABDM / HIPAA Audit Logging</li>
            </ul>
          </div>

          {/* Col 4: Safety & Compliance */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.85rem' }}>
              Safety & Standards
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} color="#10b981" />
                <span>Human-in-the-Loop Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} color="#38bdf8" />
                <span>HIPAA & ABDM Security Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} color="#a78bfa" />
                <span>Telugu, Hindi & English Native NLP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            © 2026 MediFlow AI Healthcare Systems. All rights reserved.
          </div>
          <div style={{ maxWidth: '600px', lineHeight: '1.4', textAlign: 'right' }}>
            ⚠️ <em>Clinical Disclaimer:</em> MediFlow AI assists hospital workflow coordination. Definitive clinical diagnoses and prescriptions are strictly issued by licensed healthcare professionals.
          </div>
        </div>
      </div>
    </footer>
  );
};
