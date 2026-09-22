import React, { useState, useEffect } from 'react';
import { Clock, Users, ArrowRight, CheckCircle2, Ticket, Activity, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface QueueTrackerProps {
  department?: string;
  currentToken?: number;
  myToken?: number;
  waitingCount?: number;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({
  department = 'Cardiology OPD',
  currentToken: initialCurrent = 10,
  myToken: initialMyToken = 12,
  waitingCount: initialWaiting = 2
}) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [myToken, setMyToken] = useState(initialMyToken);
  const [waiting, setWaiting] = useState(initialWaiting);
  const [selectedDept, setSelectedDept] = useState(department);

  useEffect(() => {
    api.getLiveQueue(selectedDept).then((data) => {
      setCurrent(data.currentToken);
      setMyToken(data.myToken);
      setWaiting(data.waitingCount);
    });
  }, [selectedDept]);

  const waitTimeEstimate = Math.max(0, (myToken - current) * 7);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.1))',
        border: '1px solid rgba(14, 165, 233, 0.3)'
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Ticket size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
              Live OPD Queue & Token Tracker
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Real-time consultation status • {selectedDept}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['Cardiology', 'Neurology', 'Orthopedics'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(`${dept} OPD`)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: selectedDept.includes(dept) ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
                color: selectedDept.includes(dept) ? '#ffffff' : '#94a3b8',
                border: selectedDept.includes(dept) ? '1px solid #38bdf8' : '1px solid transparent'
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid-cols-3" style={{ gap: '1rem' }}>
        {/* Currently Serving */}
        <div className="glass-card flex flex-col items-center justify-center text-center" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Now In Consultation
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            #{current}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> Active with Doctor
          </span>
        </div>

        {/* Your Token */}
        <div
          className="glass-card flex flex-col items-center justify-center text-center"
          style={{
            padding: '1.25rem',
            border: '1.5px solid #0ea5e9',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.1))'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Token Number
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            #{myToken}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
            {myToken - current === 0 ? 'Your Turn Now!' : `${myToken - current} Patients Ahead`}
          </span>
        </div>

        {/* Estimated Wait */}
        <div className="glass-card flex flex-col items-center justify-center text-center" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Wait Time
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            ~{waitTimeEstimate}m
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Estimated ~7 mins per patient
          </span>
        </div>
      </div>
    </div>
  );
};
