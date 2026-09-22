import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  X,
  UserCheck,
  Building2,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@mediflow/shared';

interface DoctorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const DoctorLoginModal: React.FC<DoctorLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('priya.varma@mediflow.hospital');
  const [password, setPassword] = useState('DoctorPass2026!');
  const [selectedDoctor, setSelectedDoctor] = useState('doc-1');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const staffProfiles = [
    {
      id: 'doc-1',
      name: 'Dr. Priya Varma, MD, DM',
      role: UserRole.DOCTOR,
      dept: 'Cardiology (OPD-204)',
      email: 'priya.varma@mediflow.hospital'
    },
    {
      id: 'doc-2',
      name: 'Dr. Ananya Reddy, MS, MCh',
      role: UserRole.DOCTOR,
      dept: 'Orthopedics (OPD-108)',
      email: 'ananya.reddy@mediflow.hospital'
    },
    {
      id: 'doc-3',
      name: 'Dr. Vikramaditya Sen, MD',
      role: UserRole.DOCTOR,
      dept: 'General Medicine (OPD-102)',
      email: 'vikramaditya.sen@mediflow.hospital'
    },
    {
      id: 'nurse-1',
      name: 'Cardiology Triage Nurse Station',
      role: UserRole.NURSE,
      dept: 'Emergency & Inpatient Care',
      email: 'nurse.station@mediflow.hospital'
    }
  ];

  const handleSelectStaff = (profile: (typeof staffProfiles)[0]) => {
    setSelectedDoctor(profile.id);
    setEmail(profile.email);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const activeProfile = staffProfiles.find((p) => p.id === selectedDoctor) || staffProfiles[0];

    setTimeout(() => {
      login({
        fullName: activeProfile.name,
        role: activeProfile.role,
        email: activeProfile.email,
        department: activeProfile.dept
      });
      setIsLoggingIn(false);
      onClose();
      onLoginSuccess();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.25rem 2rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(14, 165, 233, 0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              marginBottom: '0.75rem'
            }}
          >
            <Stethoscope size={28} color="#ffffff" />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Doctor & Healthcare Staff Portal
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Authorized clinical access for OPD queue, bed admissions & prescriptions
          </p>
        </div>

        {/* 1-Click Fast Doctor Profiles */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
            Select Staff Account
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {staffProfiles.map((p) => {
              const isSelected = selectedDoctor === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectStaff(p)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? '#0284c7' : 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <UserCheck size={16} color={isSelected ? '#ffffff' : '#94a3b8'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {p.dept}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#38bdf8' : '#64748b'
                    }}
                  >
                    {p.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Credentials Form */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
              Staff ID / Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
              Clinical Security Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={18} />
            <span>{isLoggingIn ? 'Authenticating Staff...' : 'Enter Staff Command Center'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
