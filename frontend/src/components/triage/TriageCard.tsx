import React from 'react';
import { UrgencyBadge } from '../common/Badge';
import { AlertCircle, ArrowRight, Stethoscope } from 'lucide-react';
import { UrgencyLevel } from '@mediflow/shared';

interface TriageCardProps {
  urgency: UrgencyLevel;
  department: string;
  chiefComplaint: string;
  rationale: string;
  onBookAppointment: () => void;
}

export const TriageCard: React.FC<TriageCardProps> = ({
  urgency,
  department,
  chiefComplaint,
  rationale,
  onBookAppointment
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        border:
          urgency === UrgencyLevel.EMERGENCY
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : '1px solid rgba(14, 165, 233, 0.3)'
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div className="flex items-center gap-2">
          <Stethoscope size={20} color="#38bdf8" />
          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem' }}>
            Clinical Triage Classification
          </span>
        </div>
        <UrgencyBadge level={urgency} />
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reason for Visit:</div>
        <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500, marginTop: '2px' }}>
          "{chiefComplaint}"
        </div>
        <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '8px' }}>
          Recommended Department: <strong>{department}</strong>
        </div>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.25rem' }}>
        {rationale}
      </p>

      {urgency !== UrgencyLevel.EMERGENCY && (
        <button onClick={onBookAppointment} className="btn btn-primary" style={{ width: '100%' }}>
          <span>View Available Specialists</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};
