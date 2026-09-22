import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { socket } from '../../services/socket';
import { BridgeSession, PatientHandoffPayload } from '@mediflow/shared';
import {
  Smartphone,
  Laptop,
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  LogOut,
  RefreshCw,
  ExternalLink,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Current patient interaction state to hand off
  currentState: {
    messages: any[];
    attachedPreview?: string | null;
    prescriptionData?: any;
    activeAppointment?: any;
    triageLevel?: string;
    symptomSummary?: string;
    language?: string;
    patientId?: string;
    patientName?: string;
  };
  // Callback when a laptop receives an authorized handoff
  onHandoffReceived: (payload: PatientHandoffPayload, session: BridgeSession) => void;
  // Active bridge session if already established
  activeSession: BridgeSession | null;
  onSessionSevered: () => void;
}

export const DeviceBridgeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentState,
  onHandoffReceived,
  activeSession,
  onSessionSevered
}) => {
  // Tabs: 'share' (Phone -> Laptop) or 'connect' (Laptop <- Phone)
  const [activeTab, setActiveTab] = useState<'share' | 'connect'>('share');

  // Share mode states
  const [session, setSession] = useState<BridgeSession | null>(activeSession);
  const [isInitiating, setIsInitiating] = useState<boolean>(false);
  const [connectedPeer, setConnectedPeer] = useState<string | null>(activeSession?.connectedDevice || null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(600); // 10 minutes default
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Connect mode states
  const [inputPin, setInputPin] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);

  // Sync prop changes
  useEffect(() => {
    if (activeSession) {
      setSession(activeSession);
      setConnectedPeer(activeSession.connectedDevice);
    }
  }, [activeSession]);

  // Generate or render dynamic QR code whenever session changes
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'share') {
      if (!session && !isInitiating) {
        initiateHandoffSession();
      } else if (session && canvasRef.current) {
        const handoffUrl = `${window.location.origin}/?view=chat&bridgePin=${session.pinCode}`;
        QRCode.toCanvas(canvasRef.current, handoffUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0369a1',
            light: '#ffffff'
          }
        }).catch((err) => {
          console.error('[DeviceBridge] QR code generation error:', err);
        });
      }
    }
  }, [isOpen, activeTab, session]);

  // Countdown timer for 10-minute session TTL
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimer = () => {
      const remainingMs = new Date(session.expiresAt!).getTime() - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSec(remainingSec);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.expiresAt]);

  // Socket event listeners
  useEffect(() => {
    const handleHandoffInitiated = (newSession: BridgeSession) => {
      setSession(newSession);
      setIsInitiating(false);
    };

    const handleDeviceConnected = (data: { deviceName: string }) => {
      setConnectedPeer(data.deviceName);
      setSession((prev) => (prev ? { ...prev, status: 'CONNECTED', connectedDevice: data.deviceName } : null));
    };

    const handleHandoffAuthorized = (data: { session: BridgeSession; handoffData: PatientHandoffPayload }) => {
      setIsConnecting(false);
      setSession(data.session);
      setConnectedPeer(data.session.connectedDevice || 'Source Smartphone');
      onHandoffReceived(data.handoffData, data.session);
    };

    const handleSessionSevered = () => {
      setSession(null);
      setConnectedPeer(null);
      onSessionSevered();
    };

    const handleError = (data: { message: string }) => {
      setIsConnecting(false);
      setConnectError(data.message || 'Bridge connection error');
    };

    socket.on('bridge:handoff_initiated', handleHandoffInitiated);
    socket.on('bridge:device_connected', handleDeviceConnected);
    socket.on('bridge:handoff_authorized', handleHandoffAuthorized);
    socket.on('bridge:session_severed', handleSessionSevered);
    socket.on('bridge:error', handleError);

    return () => {
      socket.off('bridge:handoff_initiated', handleHandoffInitiated);
      socket.off('bridge:device_connected', handleDeviceConnected);
      socket.off('bridge:handoff_authorized', handleHandoffAuthorized);
      socket.off('bridge:session_severed', handleSessionSevered);
      socket.off('bridge:error', handleError);
    };
  }, [onHandoffReceived, onSessionSevered]);

  const initiateHandoffSession = () => {
    setIsInitiating(true);
    setConnectError(null);

    const payload: PatientHandoffPayload = {
      sessionId: '',
      patientId: currentState.patientId || 'pat-001',
      patientName: currentState.patientName || 'Rajesh Sharma',
      messages: currentState.messages || [],
      uploadedDocumentUrl: currentState.attachedPreview || null,
      prescriptionImage: currentState.attachedPreview || null,
      prescriptionData: currentState.prescriptionData || null,
      activeAppointment: currentState.activeAppointment || null,
      triageLevel: currentState.triageLevel || 'STANDARD',
      symptomSummary: currentState.symptomSummary || 'Patient Chat Session',
      language: currentState.language || 'en',
      updatedAt: new Date().toISOString()
    };

    socket.emit('bridge:initiate_patient_handoff', {
      patientId: payload.patientId,
      patientName: payload.patientName,
      handoffData: payload
    });
  };

  const handleConnectByPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim().length !== 6) {
      setConnectError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsConnecting(true);
    setConnectError(null);

    socket.emit('bridge:join_session', {
      pinCode: inputPin.trim(),
      deviceName: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Laptop Workstation'
    });
  };

  const handleSeverSession = () => {
    if (!session) return;
    socket.emit('bridge:sever_session', { sessionId: session.sessionId });
    setSession(null);
    setConnectedPeer(null);
    onSessionSevered();
  };

  const copyPinCode = () => {
    if (!session?.pinCode) return;
    navigator.clipboard.writeText(session.pinCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyHandoffLink = () => {
    if (!session?.pinCode) return;
    const link = `${window.location.origin}/?view=chat&bridgePin=${session.pinCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handoffUrl = session ? `${window.location.origin}/?view=chat&bridgePin=${session.pinCode}` : '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(255, 255, 255, 0.93)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 20px 45px rgba(2, 132, 199, 0.25)',
          border: '1.5px solid #bae6fd',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', opacity: 0.9 }}>
                CLINICAL DEVICE BRIDGE • REAL-TIME SESSION
              </div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
                Phone-to-Laptop Patient Bridge
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <button
            onClick={() => setActiveTab('share')}
            style={{
              flex: 1,
              padding: '0.85rem',
              border: 'none',
              background: activeTab === 'share' ? '#ffffff' : 'transparent',
              color: activeTab === 'share' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'share' ? 800 : 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderBottom: activeTab === 'share' ? '2.5px solid #0284c7' : 'none',
              cursor: 'pointer'
            }}
          >
            <Smartphone size={16} />
            <span>Transfer to Laptop</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            style={{
              flex: 1,
              padding: '0.85rem',
              border: 'none',
              background: activeTab === 'connect' ? '#ffffff' : 'transparent',
              color: activeTab === 'connect' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'connect' ? 800 : 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderBottom: activeTab === 'connect' ? '2.5px solid #0284c7' : 'none',
              cursor: 'pointer'
            }}
          >
            <Laptop size={16} />
            <span>Connect to Phone</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeTab === 'share' ? (
            /* TAB 1: SHARE FROM THIS DEVICE TO LAPTOP */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {connectedPeer ? (
                /* Connected State */
                <div
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                        🟢 Active Bi-Directional Bridge
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                        Connected to: <strong>{connectedPeer}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSeverSession}
                    className="btn"
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                /* Standby Waiting State */
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    color: '#1e40af'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wifi size={15} style={{ color: '#0284c7' }} />
                    <span>Awaiting connection from laptop or desktop...</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: timeLeftSec < 60 ? '#dc2626' : '#0369a1' }}>
                    <Clock size={14} />
                    <span>{formatTimer(timeLeftSec)}</span>
                  </div>
                </div>
              )}

              {/* Dynamic Scannable QR Code Canvas */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '2px solid #e0f2fe',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <canvas ref={canvasRef} style={{ width: '200px', height: '200px', display: 'block' }} />
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Scan with laptop webcam or mobile camera
                </div>
              </div>

              {/* 6-Digit PIN Display */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                  PAIRING PIN CODE
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '6px 0',
                    background: '#f8fafc',
                    padding: '0.4rem 1.25rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.9rem',
                      fontWeight: 900,
                      letterSpacing: '6px',
                      color: '#0284c7',
                      fontFamily: 'monospace'
                    }}
                  >
                    {session?.pinCode || '------'}
                  </span>
                  <button
                    onClick={copyPinCode}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#0284c7'
                    }}
                    title="Copy PIN Code"
                  >
                    {copiedPin ? <Check size={18} style={{ color: '#16a34a' }} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Quick Link Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  onClick={copyHandoffLink}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    padding: '0.55rem'
                  }}
                >
                  {copiedLink ? <Check size={15} style={{ color: '#16a34a' }} /> : <Copy size={15} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Secure Handoff Link'}</span>
                </button>

                <a
                  href={handoffUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    padding: '0.55rem 0.9rem'
                  }}
                  title="Test opening in a new laptop tab"
                >
                  <ExternalLink size={15} />
                  <span>Open in Tab</span>
                </a>
              </div>

              {/* Data In Transit Transparency Notice */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  width: '100%',
                  fontSize: '0.78rem',
                  color: '#475569'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  <ShieldCheck size={15} style={{ color: '#16a34a' }} />
                  <span>Authorized State in Transit:</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.4' }}>
                  <li>{currentState.messages?.length || 1} Chat Messages with clinical triage state</li>
                  <li>{currentState.attachedPreview ? '1 Uploaded Prescription / Medical Document' : 'No pending document upload'}</li>
                  <li>Patient workflow token & active appointments</li>
                </ul>
              </div>
            </div>
          ) : (
            /* TAB 2: CONNECT TO AN EXISTING PHONE SESSION */
            <form onSubmit={handleConnectByPin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <Laptop size={24} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Enter 6-Digit Pairing PIN
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Enter the code displayed on your smartphone to securely authorize and continue your interaction here.
                </p>
              </div>

              {connectError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>{connectError}</span>
                </div>
              )}

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '2rem',
                    letterSpacing: '8px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '2px solid #94a3b8',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting || inputPin.length !== 6}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  opacity: isConnecting || inputPin.length !== 6 ? 0.6 : 1,
                  cursor: isConnecting || inputPin.length !== 6 ? 'not-allowed' : 'pointer'
                }}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Authorizing Bridge Handshake...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Authorize & Load Conversation</span>
                  </>
                )}
              </button>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontSize: '0.78rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Lock size={15} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Strict Privacy Guarantee:</strong> This session will automatically expire after 10 minutes. Health records are synchronized in client memory and can be severed instantly at any time.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b'
          }}
        >
          <span>Clinical Office Kit Phone/Laptop Bridge v2.4</span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
