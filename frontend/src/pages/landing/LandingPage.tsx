import React from 'react';
import {
  Stethoscope,
  Bot,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Video,
  Building2,
  Mic,
  Camera
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onStartChat: () => void;
  onBookAppointment: () => void;
  onOpenStaff: () => void;
  onOpenOverview: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onBookAppointment
}) => {
  const { languageDetails } = useLanguage();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        maxWidth: '980px',
        margin: '0 auto',
        padding: '1rem 0 3.5rem 0'
      }}
    >
      {/* 1. Welcoming Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.75rem 2rem',
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
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #7dd3fc',
            marginBottom: '1rem',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Sparkles size={16} color="#0284c7" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', letterSpacing: '0.04em' }}>
            HOSPITAL CARE HUB • {languageDetails.label.toUpperCase()} ({languageDetails.nativeName})
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 4.5vw, 3rem)',
            fontWeight: 900,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}
        >
          WELCOME TO MEDIFLOW AI
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#334155',
            marginTop: '0.75rem',
            fontWeight: 600
          }}
        >
          How can we help you today?
        </p>

        <p
          style={{
            fontSize: '0.95rem',
            color: '#64748b',
            maxWidth: '620px',
            margin: '0.4rem auto 0 auto',
            lineHeight: 1.5
          }}
        >
          Select an option below to schedule a doctor consultation or receive instant multilingual medical guidance from our clinical AI coordinator.
        </p>
      </div>

      {/* 2. STRICTLY TWO PRIMARY LANDING PAGE OPTIONS */}
      <section>
        <div
          className="grid-cols-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}
        >
          {/* OPTION 1: BOOK AN APPOINTMENT */}
          <div
            onClick={onBookAppointment}
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
                  width: '68px',
                  height: '68px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 22px rgba(14, 165, 233, 0.35)',
                  marginBottom: '1.5rem'
                }}
              >
                <Stethoscope size={36} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.78rem' }}>
                  Option 1
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  Virtual Video Meet or Hospital Visit
                </span>
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                🩺 Book an Appointment
              </h2>

              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: '1.65', marginTop: '14px' }}>
                Schedule a consultation with our specialist doctors. Choose between an <strong>HD Virtual Video Meet</strong> from home or an in-person <strong>Direct Hospital Visit</strong>.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.35rem 0.75rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0369a1'
                  }}
                >
                  <Video size={14} />
                  <span>Virtual Video Meet</span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.35rem 0.75rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0369a1'
                  }}
                >
                  <Building2 size={14} />
                  <span>Direct Hospital Visit</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)'
              }}
            >
              <span>Book an Appointment</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* OPTION 2: AI MEDICAL SUGGESTION */}
          <div
            onClick={onStartChat}
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
                  width: '68px',
                  height: '68px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 22px rgba(124, 58, 237, 0.35)',
                  marginBottom: '1.5rem'
                }}
              >
                <Bot size={36} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce', fontWeight: 800, fontSize: '0.78rem' }}>
                  Option 2
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  Voice 🎤 • Text 💬 • Camera 📷
                </span>
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                🤖 AI Medical Suggestion
              </h2>

              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: '1.65', marginTop: '14px' }}>
                Communicate naturally in <strong>Telugu, Hindi, or English</strong>. Describe your symptoms, ask medical questions, or scan documents with your camera for safe clinical guidance.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.35rem 0.75rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#7e22ce'
                  }}
                >
                  <Mic size={14} />
                  <span>Multilingual Voice</span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.35rem 0.75rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#7e22ce'
                  }}
                >
                  <Camera size={14} />
                  <span>Camera Vision OCR</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderColor: '#c084fc',
                color: '#7c3aed',
                background: '#ffffff'
              }}
            >
              <span>Get AI Medical Suggestion</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Reassuring Clinical Boundaries Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '14px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          fontSize: '0.85rem',
          color: '#334155',
          textAlign: 'center'
        }}
      >
        <ShieldCheck size={18} color="#16a34a" />
        <span>
          <strong>Clinical Safety Guardrails:</strong> MediFlow AI provides supportive guidance and scheduling. Specialized medical diagnosis and prescriptions are confirmed by licensed doctors.
        </span>
      </div>
    </div>
  );
};
