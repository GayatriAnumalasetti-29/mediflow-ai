import React from 'react';
import { Loader2 } from 'lucide-react';

export const ShimmerCard: React.FC<{ height?: string; count?: number }> = ({
  height = '80px',
  count = 1
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-card"
          style={{
            height,
            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.4) 25%, rgba(51, 65, 85, 0.6) 50%, rgba(30, 41, 59, 0.4) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Processing clinical data...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 1rem' }}>
      <Loader2 size={32} color="#0ea5e9" className="animate-spin" />
      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
};
