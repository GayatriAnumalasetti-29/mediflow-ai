import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0.75rem 1.4rem',
        borderRadius: '16px',
        background: isOnline ? '#f0fdf4' : '#fef2f2',
        border: isOnline ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
        color: isOnline ? '#166534' : '#991b1b',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        fontSize: '0.88rem',
        fontWeight: 700,
        maxWidth: '90vw',
        animation: 'fadeInUp 0.3s ease'
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={18} color="#16a34a" />
          <span>✓ Back Online: Synchronized with MediFlow AI Hospital Core</span>
        </>
      ) : (
        <>
          <WifiOff size={18} color="#dc2626" />
          <span>⚡ Working Offline: Cached mode active. Live data will sync once connected.</span>
        </>
      )}
    </div>
  );
};
