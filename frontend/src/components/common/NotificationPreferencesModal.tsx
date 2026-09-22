import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from './Modal';
import {
  Bell,
  Volume2,
  Globe,
  Moon,
  CheckCircle2,
  Shield,
  Smartphone,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    preferences,
    updatePreferences,
    requestBrowserPushPermission,
    browserPushPermission,
    triggerDemoNotification
  } = useNotification();

  const [inApp, setInApp] = useState(preferences.enableInApp);
  const [browserPush, setBrowserPush] = useState(preferences.enableBrowserPush);
  const [voiceTTS, setVoiceTTS] = useState(preferences.enableVoiceTTS);
  const [channels, setChannels] = useState(preferences.channels);
  const [quietHours, setQuietHours] = useState(preferences.quietHours);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableBrowserPush = async () => {
    const granted = await requestBrowserPushPermission();
    setBrowserPush(granted);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updatePreferences({
      enableInApp: inApp,
      enableBrowserPush: browserPush,
      enableVoiceTTS: voiceTTS,
      channels,
      quietHours
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification & Alert Preferences" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Delivery Channels */}
        <div>
          <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600, marginBottom: '8px' }}>
            Delivery Channels
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="glass-card flex items-center justify-between" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex items-center gap-2.5">
                <Bell size={18} color="#0ea5e9" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>In-App Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time drawer & interactive toast badges</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={inApp}
                onChange={(e) => setInApp(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
            </div>

            <div className="glass-card flex items-center justify-between" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex items-center gap-2.5">
                <Smartphone size={18} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>Browser Push Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Status: {browserPushPermission === 'granted' ? 'Granted' : 'Permission Required'}
                  </div>
                </div>
              </div>
              {browserPushPermission !== 'granted' ? (
                <button
                  onClick={handleEnableBrowserPush}
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                >
                  Enable Push
                </button>
              ) : (
                <input
                  type="checkbox"
                  checked={browserPush}
                  onChange={(e) => setBrowserPush(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
              )}
            </div>

            <div className="glass-card flex items-center justify-between" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex items-center gap-2.5">
                <Volume2 size={18} color="#a78bfa" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>Voice TTS Audio Readback</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Speak medication & queue alerts in your language</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceTTS}
                onChange={(e) => setVoiceTTS(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#a78bfa' }}
              />
            </div>
          </div>
        </div>

        {/* Category Subscriptions */}
        <div>
          <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600, marginBottom: '8px' }}>
            Subscribed Care Categories
          </h4>
          <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
            {[
              { id: 'medication', label: 'Medication Reminders' },
              { id: 'diet', label: 'Diet & Meal Schedules' },
              { id: 'activity', label: 'Physical Activity Logs' },
              { id: 'therapy', label: 'Rehabilitation Sessions' },
              { id: 'appointments', label: 'Doctor Appointments' },
              { id: 'queue', label: 'Live Queue Updates' },
              { id: 'billing', label: 'Billing Invoices & Receipts' },
              { id: 'escalations', label: 'Emergency Alerts' }
            ].map((cat) => (
              <label
                key={cat.id}
                className="glass-card flex items-center justify-between"
                style={{ padding: '0.65rem 0.85rem', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{cat.label}</span>
                <input
                  type="checkbox"
                  checked={(channels as any)[cat.id]}
                  onChange={() => handleToggleChannel(cat.id as any)}
                  style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
            <div className="flex items-center gap-2">
              <Moon size={16} color="#fbbf24" />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                Quiet Hours (Do Not Disturb)
              </span>
            </div>
            <input
              type="checkbox"
              checked={quietHours.enabled}
              onChange={(e) => setQuietHours((prev) => ({ ...prev, enabled: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: '#fbbf24' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Mutes audio chimes and voice readouts during sleep hours (Except emergency escalations).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          <button
            onClick={() => triggerDemoNotification('MEDICATION')}
            className="btn btn-secondary flex items-center gap-1.5"
            style={{ fontSize: '0.8rem' }}
          >
            <Sparkles size={14} />
            <span>Send Test Alert</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : savedSuccess ? '✓ Saved!' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
