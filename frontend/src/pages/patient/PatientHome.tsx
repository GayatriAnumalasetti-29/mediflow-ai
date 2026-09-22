import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Stethoscope,
  Bot,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Building2
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const PatientHome: React.FC<Props> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { languageDetails } = useLanguage();

  const patientDisplayName = user?.fullName || 'Patient';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto', padding: '0.5rem 0 3rem 0' }}>
      {/* 1. WELCOME SECTION (With Patient Name and MediFlow AI at bottom) */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.85) 0%, rgba(240, 253, 244, 0.82) 50%, rgba(237, 233, 254, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(186, 230, 253, 0.9)',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 12px 30px rgba(14, 165, 233, 0.12)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.35rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #7dd3fc',
            marginBottom: '1rem',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Sparkles size={16} color="#0284c7" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', letterSpacing: '0.04em' }}>
            PATIENT CARE HUB • {languageDetails.label.toUpperCase()} ({languageDetails.nativeName})
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          WELCOME TO MEDIFLOW AI
        </h1>

        <p style={{ fontSize: '1.25rem', color: '#334155', marginTop: '0.65rem', fontWeight: 600 }}>
          Welcome, <span style={{ color: '#0284c7', fontWeight: 800 }}>{patientDisplayName}</span>!
        </p>

        <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '0.25rem' }}>
          How can we help you today?
        </p>

        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {user?.uhid && (
            <span className="badge badge-routine" style={{ fontSize: '0.85rem', padding: '4px 14px' }}>
              UHID: {user.uhid}
            </span>
          )}
          <button
            onClick={() => onNavigateTab('op_form')}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              cursor: 'pointer'
            }}
            title="Complete or Update Outpatient Registration (OP Form)"
          >
            <span>📝 Outpatient OP Card</span>
            <span style={{ fontSize: '0.68rem', color: '#0284c7' }}>• View/Edit →</span>
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          MediFlow AI Healthcare Intelligence
        </div>
      </div>

      {/* 2. ONLY TWO PRIMARY OPTIONS (OPTION 1: Book an Appointment | OPTION 2: AI Medical Suggestion) */}
      <section>
        <div className="grid-cols-2" style={{ gap: '2rem' }}>
          {/* OPTION 1: BOOK AN APPOINTMENT */}
          <div
            onClick={() => onNavigateTab('appointments')}
            className="glass-card"
            style={{
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              border: '2px solid rgba(125, 211, 252, 0.9)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 249, 255, 0.84) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '2rem',
              boxShadow: '0 12px 30px rgba(14, 165, 233, 0.15)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
                  marginBottom: '1.5rem'
                }}
              >
                <Stethoscope size={34} color="#ffffff" />
              </div>

              <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                  Option 1
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Virtual Video Meet or Hospital Visit</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                🩺 Book an Appointment
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginTop: '12px' }}>
                Consult with our specialized doctors. Choose between a <strong>🎥 Virtual Meet</strong> (HD video call from home) or a <strong>🏥 Direct Visit</strong> (in-person hospital consultation).
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)'
              }}
            >
              <span>Book an Appointment</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* OPTION 2: AI MEDICAL SUGGESTION */}
          <div
            onClick={() => onNavigateTab('chat')}
            className="glass-card"
            style={{
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              border: '2px solid rgba(192, 132, 252, 0.9)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(250, 245, 255, 0.84) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '2rem',
              boxShadow: '0 12px 30px rgba(124, 58, 237, 0.15)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
                  marginBottom: '1.5rem'
                }}
              >
                <Bot size={34} color="#ffffff" />
              </div>

              <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce', fontWeight: 800 }}>
                  Option 2
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Voice 🎤 • Text 💬 • Camera 📷</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                🤖 AI Medical Suggestion
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginTop: '12px' }}>
                Communicate naturally in <strong>Telugu, Hindi, or English</strong>. Ask general medical questions, describe your symptoms, or scan documents with your camera for safe clinical guidance.
              </p>
            </div>

            <button
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 800,
                justifyContent: 'center',
                borderColor: '#c084fc',
                color: '#7c3aed',
                background: '#ffffff'
              }}
            >
              <span>AI Medical Suggestion</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
