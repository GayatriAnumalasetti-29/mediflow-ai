import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const DemoDataNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.15), rgba(16, 185, 129, 0.15))',
        borderBottom: '1px solid rgba(14, 165, 233, 0.25)',
        padding: '0.45rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: '#cbd5e1'
      }}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} color="#34d399" />
        <span>
          <strong style={{ color: '#38bdf8' }}>Clinical Simulation & Demo Mode:</strong> All patient records, prescriptions, and tariffs are synthetic demonstration data adhering to strict security and privacy standards.
        </span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        title="Dismiss notice"
      >
        <X size={14} />
      </button>
    </div>
  );
};
