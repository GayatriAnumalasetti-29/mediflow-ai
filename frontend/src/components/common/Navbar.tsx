import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import {
  HeartPulse,
  Globe,
  Bell,
  User,
  VolumeX,
  LogOut,
  Stethoscope,
  Menu,
  Trophy,
  Zap,
  Play,
  Sparkles
} from 'lucide-react';
import { UserRole } from '@mediflow/shared';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onToggleNotifications: () => void;
  onToggleMenu?: () => void;
  unreadCount?: number;
  onOpenOfficeKitShowcase?: () => void;
  onOpenOfficeKitBridge?: () => void;
  onStartDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onToggleNotifications,
  onToggleMenu,
  unreadCount = 2,
  onOpenOfficeKitShowcase,
  onOpenOfficeKitBridge,
  onStartDemo
}) => {
  const { user, switchRole } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { isSpeaking, stopSpeaking } = useVoice();

  const isStaff = user?.role === UserRole.DOCTOR || user?.role === UserRole.ADMIN || user?.role === UserRole.NURSE;

  const handleDoctorLogout = () => {
    switchRole(UserRole.PATIENT);
    onNavigate('landing');
  };

  return (
    <header
      className="glass-panel flex items-center justify-between"
      style={{
        padding: '0.85rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem',
        background: 'rgba(255, 255, 255, 0.84)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(186, 230, 253, 0.85)',
        boxShadow: '0 8px 30px rgba(14, 165, 233, 0.12)'
      }}
    >
      {/* Left: ☰ Menu Icon + Brand Logo */}
      <div className="flex items-center gap-3">
        {/* ☰ Navigation Menu Icon (Opens Context-Aware Drawer) */}
        {!isStaff && onToggleMenu && (
          <button
            onClick={onToggleMenu}
            style={{
              padding: '0.55rem',
              borderRadius: '10px',
              border: '1.5px solid #7dd3fc',
              background: '#e0f2fe',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.15)'
            }}
            title="Open Patient Portal Menu (☰)"
          >
            <Menu size={20} />
          </button>
        )}

        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3"
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
            }}
          >
            <HeartPulse size={22} color="#ffffff" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                MediFlow <span style={{ color: '#0284c7' }}>AI</span>
              </span>
              <span
                className="badge"
                style={{
                  fontSize: '0.68rem',
                  background: isStaff ? '#d1fae5' : '#e0f2fe',
                  color: isStaff ? '#047857' : '#0369a1',
                  fontWeight: 800
                }}
              >
                {isStaff ? 'Doctor / Staff Station' : 'Patient Portal'}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>Multimodal Hospital Patient Lifecycle Agent</p>
          </div>
        </div>
      </div>

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-3">
        {/* Voice Playback Active Mute */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1.5 glass-card"
            style={{ padding: '0.35rem 0.75rem', color: '#7c3aed', fontSize: '0.78rem', background: '#f5f3ff', border: '1px solid #c4b5fd' }}
            title="Mute AI Voice Speech"
          >
            <VolumeX size={15} />
            <span>Mute Speech</span>
          </button>
        )}

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1.5 glass-card" style={{ padding: '0.35rem 0.65rem', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
          <Globe size={15} color="#0284c7" />
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} style={{ background: '#ffffff', color: '#0f172a' }}>
                {lang.label} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>



        {/* 📱 Office Kit Bridge Button (Visible to Staff / Doctors) */}
        {isStaff && onOpenOfficeKitBridge && (
          <button
            onClick={onOpenOfficeKitBridge}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #7dd3fc',
              cursor: 'pointer'
            }}
            title="Open Office Kit Phone-to-Laptop Bridge"
          >
            <Zap size={14} color="#0284c7" />
            <span>Office Kit Bridge</span>
          </button>
        )}

        {/* 🎬 Live 3-5 Minute Clinical Demo Trigger */}
        {onStartDemo && (
          <button
            onClick={onStartDemo}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease'
            }}
            title="Launch 3-5 Minute Live End-to-End Clinical Demonstration"
          >
            <Play size={13} fill="#ffffff" />
            <span>🎬 Live Demo (3-5 Min)</span>
          </button>
        )}

        {/* Notifications Trigger */}
        <button
          onClick={onToggleNotifications}
          className="glass-card"
          style={{ padding: '0.5rem', position: 'relative', cursor: 'pointer', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}
          title="Care Notifications"
        >
          <Bell size={18} color="#334155" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#dc2626',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5)'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 glass-card" style={{ padding: '0.35rem 0.75rem', background: '#f0f9ff', border: '1.5px solid #bae6fd' }}>
          {isStaff ? <Stethoscope size={15} color="#059669" /> : <User size={15} color="#0284c7" />}
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
            {user?.fullName || 'Patient'}
          </span>
        </div>

        {/* Doctor Logout Button (Only shown when staff is logged in) */}
        {isStaff && (
          <button
            onClick={handleDoctorLogout}
            className="flex items-center gap-1.5"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Log out of Staff Command Center"
          >
            <LogOut size={14} />
            <span>Doctor Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
