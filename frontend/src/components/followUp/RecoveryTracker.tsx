import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FollowUpLog } from '@mediflow/shared';
import {
  HeartPulse,
  Send,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Award,
  Sparkles,
  Calendar,
  Mic
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';

export const RecoveryTracker: React.FC = () => {
  const { startListening, isListening, stopListening, transcript } = useVoice();
  const { currentLanguage } = useLanguage();

  const [logs, setLogs] = useState<FollowUpLog[]>([]);
  const [painScale, setPainScale] = useState<number>(2);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mild Exertional Fatigue']);
  const [generalWellness, setGeneralWellness] = useState<string>(
    'Feeling much better today. Walked for 15 minutes without chest discomfort.'
  );
  const [systolic, setSystolic] = useState<number>(122);
  const [diastolic, setDiastolic] = useState<number>(78);
  const [heartRate, setHeartRate] = useState<number>(74);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getFollowUpLogs('pat-001').then(setLogs).catch(console.error);
  }, []);

  useEffect(() => {
    if (transcript) {
      setGeneralWellness(transcript);
    }
  }, [transcript]);

  const commonSymptoms = [
    'Mild Exertional Fatigue',
    'Catheter Site Tenderness',
    'Mild Dizziness',
    'Morning Muscle Stiffness',
    'Severe Chest Pain (Red Flag)',
    'Shortness of Breath (Red Flag)',
    'Blood in Cough (Red Flag)'
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms((prev) => [...prev, sym]);
    }
  };

  const handleLogDailyCheckIn = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    const hasRedFlag =
      selectedSymptoms.some((s) => s.includes('Red Flag')) || painScale >= 7;

    try {
      const newLog = await api.createFollowUpLog({
        patientId: 'pat-001',
        reportedSymptoms: selectedSymptoms,
        painScale,
        vitals: { systolic, diastolic, heartRate, temperatureF: 98.4 },
        generalWellness,
        redFlagDetected: hasRedFlag
      });

      setLogs((prev) => [newLog, ...prev]);
      setSuccessMessage(
        hasRedFlag
          ? '⚠️ Red-flag symptom alert recorded and escalated to cardiology nursing station.'
          : '✓ Daily recovery check-in successfully recorded.'
      );
    } catch (err) {
      console.error('Failed to log check-in', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Adherence Streak & Recovery Overview */}
      <div className="grid-cols-3">
        <div className="glass-card flex items-center gap-3">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Flame size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Care Adherence Streak</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              5 Days Active
            </div>
          </div>
        </div>

        <div className="glass-card flex items-center gap-3">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Award size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Compliance Score</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
              94% Verified
            </div>
          </div>
        </div>

        <div className="glass-card flex items-center gap-3">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Activity size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Resting Vitals</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              122/78 mmHg • 74 bpm
            </div>
          </div>
        </div>
      </div>

      {/* Daily Health Check-In Form */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              Daily Recovery & Symptom Check-In
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Report pain levels, recovery sensations, and vitals. AI evaluates red-flag symptoms in real time.
            </p>
          </div>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            Day 5 Post-Procedure
          </span>
        </div>

        {successMessage && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: successMessage.includes('⚠️')
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(16, 185, 129, 0.15)',
              border: successMessage.includes('⚠️')
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.3)',
              color: successMessage.includes('⚠️') ? '#f87171' : '#34d399',
              fontSize: '0.88rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}
          >
            {successMessage}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pain Scale Slider (0-10) */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                Current Discomfort / Pain Level (0 = No Pain, 10 = Severe)
              </span>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: painScale <= 3 ? '#34d399' : painScale <= 6 ? '#fbbf24' : '#ef4444'
                }}
              >
                {painScale} / 10
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={painScale}
              onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: painScale >= 7 ? '#ef4444' : '#0ea5e9' }}
            />

            <div className="flex justify-between" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              <span>0 (Comfortable)</span>
              <span>3 (Mild)</span>
              <span>6 (Moderate)</span>
              <span>10 (Emergency)</span>
            </div>
          </div>

          {/* Reported Symptoms Checklist */}
          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Select any experienced sensations or symptoms:
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                const isRedFlag = sym.includes('Red Flag');
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      background: isSelected
                        ? isRedFlag
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(14, 165, 233, 0.25)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected
                        ? isRedFlag
                          ? '#f87171'
                          : '#38bdf8'
                        : '#94a3b8',
                      border: isSelected
                        ? isRedFlag
                          ? '1px solid #ef4444'
                          : '1px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Natural Voice / Text Wellness Note */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                How are you feeling today? (Type or speak in English, Telugu, or Hindi):
              </label>
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className="flex items-center gap-1"
                style={{ fontSize: '0.78rem', color: isListening ? '#f87171' : '#38bdf8', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Mic size={14} />
                <span>{isListening ? 'Listening...' : 'Speak Check-In'}</span>
              </button>
            </div>

            <textarea
              value={generalWellness}
              onChange={(e) => setGeneralWellness(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Vitals Input Row */}
          <div className="grid-cols-3" style={{ gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleLogDailyCheckIn}
            disabled={isSubmitting}
            className="btn btn-primary flex items-center justify-center gap-2"
            style={{ padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}
          >
            <HeartPulse size={18} />
            <span>{isSubmitting ? 'Logging...' : 'Submit Daily Health & Vitals Check-In'}</span>
          </button>
        </div>
      </div>

      {/* Historical Check-In Logs */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>
          Historical Follow-Up Logs & Vitals Trends
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {logs.map((log) => (
            <div key={log.id} className="glass-card flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                    {log.date}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: ((log as any).painScale ?? log.painLevelScore ?? 2) >= 7 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: ((log as any).painScale ?? log.painLevelScore ?? 2) >= 7 ? '#f87171' : '#34d399'
                    }}
                  >
                    Pain: {(log as any).painScale ?? log.painLevelScore ?? 2}/10
                  </span>
                  {(log as any).redFlagDetected && (
                    <span className="badge badge-emergency">⚠️ Red Flag Alert</span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '4px' }}>
                  "{(log as any).generalWellness || log.patientReportedStatus || 'Recovering well'}"
                </p>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Symptoms: {((log as any).reportedSymptoms || log.symptomsReported || []).join(', ') || 'None'} • Vitals: {(log as any).vitals?.systolic || 120}/{(log as any).vitals?.diastolic || 80} mmHg ({(log as any).vitals?.heartRate || 72} bpm)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
