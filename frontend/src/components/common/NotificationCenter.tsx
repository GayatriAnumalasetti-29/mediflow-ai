import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Calendar,
  Clock,
  Pill,
  BedDouble,
  DollarSign,
  AlertTriangle,
  Volume2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();
  const { currentLanguage } = useLanguage();
  const { speakText } = useVoice();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MEDICATION') return n.type === 'MEDICATION_REMINDER';
    if (activeFilter === 'QUEUE') return n.type === 'QUEUE_UPDATE';
    if (activeFilter === 'APPOINTMENT') return n.type === 'APPOINTMENT_REMINDER';
    if (activeFilter === 'BILLING') return n.type === 'BILLING_STATEMENT';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return <Calendar size={16} color="#38bdf8" />;
      case 'QUEUE_UPDATE':
        return <Clock size={16} color="#fbbf24" />;
      case 'MEDICATION_REMINDER':
        return <Pill size={16} color="#a78bfa" />;
      case 'ROOM_ALLOCATION':
        return <BedDouble size={16} color="#34d399" />;
      case 'BILLING_STATEMENT':
        return <DollarSign size={16} color="#f59e0b" />;
      default:
        return <Bell size={16} color="#0ea5e9" />;
    }
  };

  const handleActionRoute = (notif: any) => {
    markAsRead(notif.id);
    if (notif.type === 'APPOINTMENT_REMINDER' || notif.type === 'QUEUE_UPDATE') onNavigateTab('appointments');
    else if (notif.type === 'MEDICATION_REMINDER') onNavigateTab('medication');
    else if (notif.type === 'BILLING_STATEMENT') onNavigateTab('billing');
    else if (notif.type === 'ROOM_ALLOCATION') onNavigateTab('accommodation');
    else onNavigateTab('overview');
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          width: '420px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: '620px',
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeIn 0.2s ease-out',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <Bell size={18} color="#0ea5e9" />
            <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f8fafc' }}>
              Notifications & Alerts
            </span>
            {unreadCount > 0 && (
              <span className="badge badge-urgent" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreferencesOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              title="Notification Preferences"
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={markAllAsRead}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.78rem' }}
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ padding: '0.5rem 1.25rem', display: 'flex', gap: '0.35rem', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {['ALL', 'MEDICATION', 'QUEUE', 'APPOINTMENT', 'BILLING'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: activeFilter === f ? '#0ea5e9' : 'rgba(255,255,255,0.05)',
                color: activeFilter === f ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notification Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No notifications in this category.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="glass-card flex items-start justify-between gap-3"
                style={{
                  padding: '0.85rem 1rem',
                  background: notif.isRead ? 'rgba(15, 23, 42, 0.5)' : 'rgba(14, 165, 233, 0.12)',
                  border: notif.isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(14, 165, 233, 0.3)',
                  cursor: 'pointer'
                }}
                onClick={() => handleActionRoute(notif)}
              >
                <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>

                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 600, color: notif.isRead ? '#cbd5e1' : '#f8fafc', fontSize: '0.85rem' }}>
                      {notif.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(notif.message, currentLanguage);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px' }}
                      title="Read aloud"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>

                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Multilingual Voice & Push enabled
          </span>
          <button
            onClick={() => setIsPreferencesOpen(true)}
            style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Manage Preferences
          </button>
        </div>
      </div>

      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
};
