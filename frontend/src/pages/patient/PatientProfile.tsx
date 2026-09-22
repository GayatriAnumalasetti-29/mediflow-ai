import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Patient } from '@mediflow/shared';
import { User, ShieldCheck, Heart, AlertTriangle, Phone, MapPin, Globe, Award, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PatientProfile: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { currentLanguage, setLanguage } = useLanguage();

  useEffect(() => {
    api.getPatient('pat-001').then(setPatient).catch(console.error);
  }, []);

  if (!patient) {
    return <div className="glass-panel" style={{ padding: '1.5rem' }}>Loading patient profile...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Digital Health Identity Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.25))',
          border: '1px solid rgba(14, 165, 233, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
              }}
            >
              <User size={38} color="#ffffff" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                  {patient.fullName}
                </span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                  Verified Patient
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                Age: {patient.age} yrs • Gender: {patient.gender} • Blood Group: <strong style={{ color: '#f43f5e' }}>{patient.bloodGroup}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                UHID: {patient.uhid}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ABDM & Hospital Network ID</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.05em' }}>
              MF-HYD-8812
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Demographics & Safety Alerts */}
      <div className="grid-cols-2">
        {/* Allergies & Chronic Conditions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>Clinical Alerts & Allergies</span>
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Drug & Substance Allergies:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {patient.allergies.map((a, i) => (
                <span key={i} className="badge badge-emergency">
                  ✕ {a}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Chronic Medical Conditions:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {patient.chronicConditions.map((c, i) => (
                <span key={i} className="badge badge-pill">
                  ● {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Emergency Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} color="#38bdf8" />
            <span>Emergency Contacts & Location</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div className="flex justify-between glass-card" style={{ padding: '0.65rem 0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Primary Phone:</span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{patient.contactNumber}</span>
            </div>

            <div className="flex justify-between glass-card" style={{ padding: '0.65rem 0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Emergency Contact:</span>
              <span style={{ color: '#f87171', fontWeight: 600 }}>{patient.emergencyContact}</span>
            </div>

            <div className="flex justify-between glass-card" style={{ padding: '0.65rem 0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Residential Address:</span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{patient.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
