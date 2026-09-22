import React, { useState, useEffect } from 'react';
import { Pill, Bell, CheckCircle2, Clock, Volume2, VolumeX, X, Mic } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';

export const AutonomousReminderToast: React.FC = () => {
  const { speakText, isSpeaking, stopSpeaking } = useVoice();
  const { currentLanguage, detectedLanguage } = useLanguage();

  const [isVisible, setIsVisible] = useState(true);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const reminder = {
    id: 'rem-evening',
    medicine: 'Metoprolol Succinate ER 25mg',
    dosage: '1 Tablet',
    timing: '09:00 PM (After Dinner)',
    instructions: 'Take with full glass of water. Swallow whole.',
    ttsPromptEn: 'Hello Rajesh, it is 09:00 PM. Time for your evening Metoprolol 25mg tablet. Have you taken it?',
    ttsPromptTe: 'నమస్కారం రాజేష్ గారు, రాత్రి 9 గంటల మెటోప్రోలాల్ 25 ఎంజీ టాబ్లెట్ సమయం అయింది. మీరు వేసుకున్నారా?',
    ttsPromptHi: 'नमस्ते राजेश जी, रात के 9 बजे की मेटोप्रोलोल 25 मिलीग्राम दवा का समय हो गया है। क्या आपने इसे ले लिया है?'
  };

  const handleSpeakReminder = () => {
    const prompt =
      currentLanguage.startsWith('te')
        ? reminder.ttsPromptTe
        : currentLanguage.startsWith('hi')
        ? reminder.ttsPromptHi
        : reminder.ttsPromptEn;

    speakText(prompt, currentLanguage);
  };

  const handleMarkCompleted = () => {
    setIsCompleted(true);
    setTimeout(() => setIsVisible(false), 2500);
  };

  const handleSnooze = () => {
    setIsSnoozed(true);
    setTimeout(() => setIsVisible(false), 2500);
  };

  if (!isVisible) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px',
        maxWidth: 'calc(100vw - 48px)',
        zIndex: 1500,
        padding: '1.25rem 1.5rem',
        background: isCompleted
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2))'
          : 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(139, 92, 246, 0.2))',
        border: isCompleted
          ? '1.5px solid #10b981'
          : '1.5px solid rgba(14, 165, 233, 0.4)',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      {/* Toast Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '0.65rem' }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={15} color="#ffffff" />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scheduled Care Reminder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakReminder}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
            title="Read Reminder Aloud"
          >
            <Volume2 size={16} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isCompleted && !isSnoozed ? (
        <>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            {reminder.medicine} ({reminder.dosage})
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
            {reminder.timing} • {reminder.instructions}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
            <button
              onClick={handleMarkCompleted}
              className="btn btn-emerald flex items-center justify-center gap-1.5"
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}
            >
              <CheckCircle2 size={15} />
              <span>I Took It</span>
            </button>

            <button
              onClick={handleSnooze}
              className="btn btn-secondary flex items-center justify-center gap-1.5"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Clock size={14} />
              <span>Snooze 15m</span>
            </button>
          </div>
        </>
      ) : isCompleted ? (
        <div className="flex items-center gap-2" style={{ color: '#34d399', fontWeight: 600, fontSize: '0.92rem' }}>
          <CheckCircle2 size={18} />
          <span>Dose confirmed as Taken! 5-Day Adherence Streak: 94%</span>
        </div>
      ) : (
        <div className="flex items-center gap-2" style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.92rem' }}>
          <Clock size={18} />
          <span>Reminder snoozed for 15 minutes.</span>
        </div>
      )}
    </div>
  );
};
