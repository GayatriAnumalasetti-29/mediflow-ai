import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@mediflow/shared';
import { Activity, User, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
  const [email, setEmail] = useState('rajesh.sharma@example.com');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === UserRole.PATIENT) {
      setEmail('rajesh.sharma@example.com');
    } else {
      setEmail('priya.varma@mediflow.org');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      role: selectedRole,
      email,
      fullName: selectedRole === UserRole.PATIENT ? 'Rajesh Sharma' : 'Dr. Priya Varma, MD, DM'
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(14, 165, 233, 0.5)',
              marginBottom: '1rem'
            }}
          >
            <Activity size={36} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
            MediFlow <span style={{ color: '#38bdf8' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
            Multimodal Hospital Patient Lifecycle Agent
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange(UserRole.PATIENT)}
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: selectedRole === UserRole.PATIENT ? '#0ea5e9' : 'transparent',
              color: selectedRole === UserRole.PATIENT ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} />
            <span>Patient Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange(UserRole.DOCTOR)}
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: selectedRole === UserRole.DOCTOR ? '#0ea5e9' : 'transparent',
              color: selectedRole === UserRole.DOCTOR ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Hospital Staff</span>
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value="••••••••••••"
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(17, 24, 39, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#64748b',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', borderRadius: '12px' }}
          >
            <span>Enter MediFlow AI Hub</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
