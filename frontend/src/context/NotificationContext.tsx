import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Notification } from '@mediflow/shared';
import { useVoice } from './VoiceContext';
import { useLanguage } from './LanguageContext';

export interface NotificationPreferences {
  enableInApp: boolean;
  enableBrowserPush: boolean;
  enableVoiceTTS: boolean;
  channels: {
    medication: boolean;
    diet: boolean;
    activity: boolean;
    therapy: boolean;
    appointments: boolean;
    queue: boolean;
    billing: boolean;
    escalations: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isBrowserPushSupported: boolean;
  browserPushPermission: NotificationPermission;
  requestBrowserPushPermission: () => Promise<boolean>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => Promise<void>;
  triggerDemoNotification: (type: string) => void;
}

const defaultPreferences: NotificationPreferences = {
  enableInApp: true,
  enableBrowserPush: false,
  enableVoiceTTS: true,
  channels: {
    medication: true,
    diet: true,
    activity: true,
    therapy: true,
    appointments: true,
    queue: true,
    billing: true,
    escalations: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { speakText } = useVoice();
  const { currentLanguage } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [browserPushPermission, setBrowserPushPermission] = useState<NotificationPermission>('default');

  const isBrowserPushSupported = typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    if (isBrowserPushSupported) {
      setBrowserPushPermission(window.Notification.permission);
    }

    // Load initial notifications
    api.getNotifications('pat-001')
      .then(setNotifications)
      .catch(console.error);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const requestBrowserPushPermission = async (): Promise<boolean> => {
    if (!isBrowserPushSupported) return false;
    try {
      const permission = await window.Notification.requestPermission();
      setBrowserPushPermission(permission);
      const isGranted = permission === 'granted';
      setPreferences((prev) => ({ ...prev, enableBrowserPush: isGranted }));
      return isGranted;
    } catch (err) {
      console.error('Failed to request browser notification permission', err);
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead('pat-001');
    } catch (err) {
      console.error(err);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    const merged = { ...preferences, ...newPrefs };
    setPreferences(merged);
  };

  const triggerDemoNotification = (type: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      patientId: 'pat-001',
      title: 'Scheduled Evening Medication Reminder',
      message: 'Time for Metoprolol Succinate ER 25mg (1 Tablet) after dinner.',
      type: 'MEDICATION_REMINDER' as any,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Native Browser Notification
    if (preferences.enableBrowserPush && browserPushPermission === 'granted') {
      try {
        new window.Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.error('Browser push error', err);
      }
    }

    // Voice TTS Speech
    if (preferences.enableVoiceTTS) {
      const prompt =
        currentLanguage.startsWith('te')
          ? 'నమస్కారం రాజేష్ గారు, రాత్రి మందుల సమయం అయింది.'
          : currentLanguage.startsWith('hi')
          ? 'नमस्ते राजेश जी, रात की दवा लेने का समय हो गया है।'
          : 'Hello Rajesh, it is time for your scheduled evening medication.';

      speakText(prompt, currentLanguage);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isBrowserPushSupported,
        browserPushPermission,
        requestBrowserPushPermission,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        triggerDemoNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
