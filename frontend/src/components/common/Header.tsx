import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { Activity, Globe, Volume2, VolumeX, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { LanguageCode } from '@mediflow/shared';

export const Header: React.FC<{ activeView: string; onViewChange: (view: any) => void }> = ({
  activeView,
  onViewChange
}) => {
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { isSpeaking, stopSpeaking } = useVoice();

  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Brand Identity */}
      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => onViewChange('overview')}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)'
        }}>
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            MediFlow <span style={{ color: '#38bdf8', fontWeight: 400 }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Multimodal Hospital Lifecycle Orchestrator</p>
        </div>
      </div>

      {/* Center Controls & Language Switcher */}
      <div className="flex items-center gap-3">
        {/* Dynamic Voice TTS Indicator */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="btn btn-secondary flex items-center gap-2"
            style={{ padding: '0.4rem 0.8rem', borderColor: '#38bdf8', color: '#38bdf8', fontSize: '0.8rem' }}
          >
            <VolumeX size={16} />
            <span>Stop Audio</span>
          </button>
        )}

        {/* Multilingual Selector with Auto Detection Badge */}
        <div className="flex items-center gap-2 glass-card" style={{ padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
          <Globe size={16} color="#38bdf8" />
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value={LanguageCode.ENGLISH} style={{ background: '#111827' }}>English (EN)</option>
            <option value={LanguageCode.TELUGU} style={{ background: '#111827' }}>తెలుగు (Telugu)</option>
            <option value={LanguageCode.HINDI} style={{ background: '#111827' }}>हिन्दी (Hindi)</option>
            <option value="te-en" style={{ background: '#111827' }}>Telugu + English</option>
            <option value="hi-en" style={{ background: '#111827' }}>Hindi + English</option>
          </select>
        </div>
      </div>

      {/* User Session & Role Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onViewChange(user?.role === 'PATIENT' ? 'staff_queue' : 'overview')}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
        >
          <ShieldCheck size={16} color="#10b981" />
          <span>Switch to {user?.role === 'PATIENT' ? 'Staff Portal' : 'Patient Portal'}</span>
        </button>

        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user?.fullName || (user as any)?.name || 'Rajesh Sharma'}</div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            title="Log Out"
            style={{ padding: '0.45rem', borderRadius: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
