import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: Array<'PATIENT' | 'DOCTOR' | 'NURSE' | 'ADMIN' | 'STAFF'>;
  children: React.ReactNode;
  fallbackRedirect?: () => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackRedirect
}) => {
  const { user } = useAuth();
  const userRole = user?.role || 'PATIENT';

  if (!allowedRoles.includes(userRole as any)) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '580px',
          margin: '2rem auto',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          background: 'rgba(239, 68, 68, 0.08)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <Lock size={32} color="#f87171" />
        </div>

        <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
          Access Restricted: Healthcare Staff Only
        </h3>

        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
          You are currently logged in as a <strong>Patient ({user?.fullName || 'Rajesh Sharma'})</strong>. Access to the clinical command center, doctor calling station, prescription OCR sign-off, and financial waivers requires authorized staff credentials.
        </p>

        <div className="flex items-center justify-center gap-3" style={{ marginTop: '1.5rem' }}>
          {fallbackRedirect && (
            <button onClick={fallbackRedirect} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Return to Patient Portal</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
