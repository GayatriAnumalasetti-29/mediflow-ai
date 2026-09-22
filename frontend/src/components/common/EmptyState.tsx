import React, { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction
}) => {
  return (
    <div
      className="glass-card flex flex-col items-center justify-center text-center"
      style={{
        padding: '3rem 2rem',
        border: '1px dashed rgba(255, 255, 255, 0.15)',
        borderRadius: '16px'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(14, 165, 233, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        {icon || <FileQuestion size={28} color="#0ea5e9" />}
      </div>

      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '380px', marginTop: '4px', lineHeight: '1.5' }}>
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{ marginTop: '1.25rem', fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
