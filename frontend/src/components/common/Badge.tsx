import React from 'react';
import { UrgencyLevel } from '@mediflow/shared';

export const UrgencyBadge: React.FC<{ level: UrgencyLevel | string }> = ({ level }) => {
  if (level === UrgencyLevel.EMERGENCY || level === 'EMERGENCY') {
    return <span className="badge badge-emergency">● Emergency</span>;
  }
  if (level === UrgencyLevel.URGENT || level === 'URGENT') {
    return <span className="badge badge-urgent">● Urgent</span>;
  }
  return <span className="badge badge-routine">● Routine</span>;
};

export const StatusBadge: React.FC<{ status: string; variant?: 'success' | 'warning' | 'danger' | 'neutral' }> = ({
  status,
  variant = 'neutral'
}) => {
  const getStyle = () => {
    switch (variant) {
      case 'success':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'danger':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.12)' };
    }
  };

  return (
    <span className="badge" style={getStyle()}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
