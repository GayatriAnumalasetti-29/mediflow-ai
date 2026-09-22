import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../services/socket';
import { useCameraVitals } from '../../services/hardware/useCameraVitals';
import { useDeviceSensors } from '../../services/hardware/useDeviceSensors';
import { BridgeSession, DeviceTelemetry } from '@mediflow/shared';
import {
  Smartphone,
  Heart,
  Activity,
  Camera,
  Bell,
  Wifi,
  WifiOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  Send
} from 'lucide-react';

interface Props {
  initialPin?: string;
  onExit?: () => void;
}

export const OfficeKitMobileCompanion: React.FC<Props> = ({ initialPin = '', onExit }) => {
  const [pinCode, setPinCode] = useState<string>(initialPin);
  const [session, setSession] = useState<BridgeSession | null>(null);
  const [activeTab, setActiveTab] = useState<'vitals' | 'motion' | 'camera' | 'nurse'>('vitals');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanType, setScanType] = useState<'PRESCRIPTION' | 'WOUND' | 'MEDICINE_BOX'>('PRESCRIPTION');
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [nurseCallSent, setNurseCallSent] = useState<boolean>(false);

  // Hardware hooks
  const vitals = useCameraVitals();
  const sensors = useDeviceSensors();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-connect if initial PIN is provided
  useEffect(() => {
    if (initialPin && initialPin.length === 6 && !session) {
      handleJoin(initialPin);
    }
  }, [initialPin]);

  // Socket listeners for bridge session
  useEffect(() => {
    const handleJoinSuccess = (s: BridgeSession) => {
      setSession(s);
      setIsJoining(false);
      setJoinError(null);
      sensors.triggerHaptic('dose_confirmed');
    };

    const handleError = (err: { message: string }) => {
      setJoinError(err.message);
      setIsJoining(false);
      sensors.triggerHaptic('warning');
    };

    socket.on('bridge:join_success', handleJoinSuccess);
    socket.on('bridge:error', handleError);

    return () => {
      socket.off('bridge:join_success', handleJoinSuccess);
      socket.off('bridge:error', handleError);
    };
  }, []);

  // Stream hardware telemetry to laptop every 800ms when connected
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      const telemetryPayload: DeviceTelemetry = {
        heartRateBpm: vitals.bpm,
        ppgConfidence: vitals.confidence,
        pulseWaveform: vitals.pulseWaveform,
        fallDetected: sensors.fallDetected,
        tremorIndex: sensors.tremorIndex,
        motionMagnitude: sensors.motionMagnitude,
        batteryLevel: sensors.batteryLevel,
        isCharging: sensors.isCharging,
        ambientLightLux: sensors.ambientLightLux,
        timestamp: new Date().toISOString()
      };

      socket.emit('bridge:telemetry_stream', {
        sessionId: session.sessionId,
        telemetry: telemetryPayload
      });
    }, 800);

    return () => clearInterval(timer);
  }, [session, vitals.bpm, vitals.confidence, vitals.pulseWaveform, sensors.fallDetected, sensors.tremorIndex, sensors.motionMagnitude, sensors.batteryLevel, sensors.isCharging, sensors.ambientLightLux]);

  const handleJoin = (targetPin?: string) => {
    const code = (targetPin || pinCode).trim();
    if (code.length < 6) {
      setJoinError('Please enter a valid 6-digit PIN code.');
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    socket.emit('bridge:join_session', {
      pinCode: code,
      deviceName: navigator.userAgent.includes('Mobile') ? 'Patient Smartphone' : 'Mobile Edge Device'
    });
  };

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScanPreview(reader.result as string);
        setScanSuccessMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeamScanToLaptop = () => {
    if (!scanPreview || !session) return;
    socket.emit('bridge:remote_scan', {
      sessionId: session.sessionId,
      imageDataUrl: scanPreview,
      scanType,
      capturedAt: new Date().toISOString()
    });
    setScanSuccessMessage(`Photo successfully beamed to ${session.doctorName}'s screen!`);
    sensors.triggerHaptic('dose_confirmed');
    setTimeout(() => {
      setScanPreview(null);
      setScanSuccessMessage(null);
    }, 3000);
  };

  const handleTriggerNurseCall = (priority: 'ROUTINE' | 'EMERGENCY_SOS') => {
    if (!session) return;
    socket.emit('bridge:trigger_nurse_call', {
      sessionId: session.sessionId,
      patientId: session.patientId,
      patientName: session.patientName,
      roomNumber: 'SP-201',
      priority,
      triggeredAt: new Date().toISOString()
    });
    sensors.triggerHaptic('emergency_sos');
    setNurseCallSent(true);
    setTimeout(() => setNurseCallSent(false), 4000);
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '1rem',
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* Mobile Top Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
            <Zap size={14} />
            <span>Mobile Phone Companion</span>
          </div>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>MediFlow Bedside</h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          {session ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              <Wifi size={12} /> Paired
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              <WifiOff size={12} /> Unpaired
            </span>
          )}
          {onExit && (
            <button
              onClick={onExit}
              style={{ display: 'block', background: 'none', border: 'none', color: '#ffffff', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', marginTop: '4px' }}
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Pairing Screen if Not Connected */}
      {!session ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '50%', width: '56px', height: '56px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Smartphone size={28} />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Pair with Doctor Screen</h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Enter the 6-digit PIN code displayed on the doctor’s workstation to stream real-time hardware telemetry.
            </p>
          </div>

          {joinError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '8px', padding: '8px', fontSize: '0.8rem' }}>
              {joinError}
            </div>
          )}

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="e.g. 482910"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '6px',
              textAlign: 'center',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '2px solid #0284c7',
              color: '#0f172a'
            }}
          />

          <button
            onClick={() => handleJoin()}
            disabled={isJoining}
            className="btn btn-primary"
            style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
          >
            {isJoining ? 'Pairing...' : 'Connect to Doctor Station'}
          </button>
        </div>
      ) : (
        /* Connected Phone Companion Tabs */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Navigation Tab Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('vitals')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'vitals' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: activeTab === 'vitals' ? '#0284c7' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'vitals' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              ❤️ Vitals
            </button>
            <button
              onClick={() => setActiveTab('motion')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'motion' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: activeTab === 'motion' ? '#0284c7' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'motion' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              🏃 Motion
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'camera' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: activeTab === 'camera' ? '#0284c7' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'camera' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📷 Scan
            </button>
            <button
              onClick={() => setActiveTab('nurse')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'nurse' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: activeTab === 'nurse' ? '#dc2626' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'nurse' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              🚨 Call
            </button>
          </div>

          {/* TAB 1: Camera PPG Optical Heart Rate */}
          {activeTab === 'vitals' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Heart size={20} style={{ color: '#ef4444' }} />
                  <span>Optical Heart Rate (PPG)</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Gently place your index finger over your camera lens and flash.
                </p>
              </div>

              {/* Camera Video Viewfinder (Hidden from layout or small preview) */}
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${vitals.isFingerDetected ? '#ef4444' : '#94a3b8'}`, boxShadow: vitals.isFingerDetected ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none' }}>
                <video
                  ref={vitals.videoRef}
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={vitals.canvasRef} style={{ display: 'none' }} />
                {!vitals.isScanning && (
                  <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    Camera Off
                  </div>
                )}
              </div>

              {/* Finger detection status */}
              <div>
                {vitals.isScanning ? (
                  vitals.isFingerDetected ? (
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
                      ✓ Finger detected — Reading pulse wave...
                    </span>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 700, fontSize: '0.85rem' }}>
                      Place finger over rear camera lens
                    </span>
                  )
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Press Start to measure pulse</span>
                )}
              </div>

              {/* BPM Readout */}
              <div style={{ background: '#fff5f5', borderRadius: '16px', padding: '1rem', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>MEASURED HEART RATE</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                  {vitals.bpm ?? '--'}
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>BPM</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                  Streaming live to Doctor Console
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {!vitals.isScanning ? (
                  <button
                    onClick={() => vitals.startScanning()}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                  >
                    Start Pulse Scan
                  </button>
                ) : (
                  <button
                    onClick={() => vitals.stopScanning()}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                  >
                    Stop Scan
                  </button>
                )}

                {vitals.hasTorch && (
                  <button
                    onClick={() => vitals.toggleTorch()}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Toggle Flash Torch"
                  >
                    {vitals.torchEnabled ? <Flashlight size={18} style={{ color: '#eab308' }} /> : <FlashlightOff size={18} />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Motion & Bedside Fall Detector */}
          {activeTab === 'motion' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={20} style={{ color: '#0284c7' }} />
                  <span>Accelerometer & Fall Detector</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Real hardware motion telemetry for in-patient fall prevention & tremor score.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACCELERATION</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
                    {sensors.motionMagnitude}
                    <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px' }}>m/s²</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TREMOR SCORE</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8b5cf6' }}>
                    {sensors.tremorIndex}
                    <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px' }}>/ 10</span>
                  </div>
                </div>
              </div>

              {sensors.fallDetected ? (
                <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '1rem' }}>⚠️ FALL DETECTED!</div>
                  <div style={{ fontSize: '0.8rem', color: '#b91c1c', margin: '4px 0 8px 0' }}>
                    Alarm sent to Doctor & Nurse station.
                  </div>
                  <button onClick={sensors.resetFallAlert} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    Dismiss Fall Alert
                  </button>
                </div>
              ) : (
                <button
                  onClick={sensors.simulateFall}
                  className="btn btn-secondary"
                  style={{ color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700, padding: '0.75rem' }}
                >
                  ⚡ Simulate Freefall & Impact Drop
                </button>
              )}

              <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                Battery: {sensors.batteryLevel}% • Ambient Light: {sensors.ambientLightLux} lux
              </div>
            </div>
          )}

          {/* TAB 3: Wireless Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={20} style={{ color: '#0284c7' }} />
                  <span>Wireless Clinical Scanner</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Snap prescription, medicine pack, or surgical wound to beam to doctor screen.
                </p>
              </div>

              {/* Scan Type Picker */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['PRESCRIPTION', 'WOUND', 'MEDICINE_BOX'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setScanType(t)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: scanType === t ? '#0284c7' : '#ffffff',
                      color: scanType === t ? '#ffffff' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {scanSuccessMessage && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  ✓ {scanSuccessMessage}
                </div>
              )}

              {scanPreview ? (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={scanPreview}
                    alt="Captured scan"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={handleBeamScanToLaptop}
                      className="btn btn-primary"
                      style={{ flex: 1, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Send size={16} />
                      <span>Beam to Doctor's Laptop</span>
                    </button>
                    <button
                      onClick={() => setScanPreview(null)}
                      className="btn btn-secondary"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapturePhoto}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Camera size={20} />
                    <span>Take Photo with Camera</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Bedside Nurse Call */}
          {activeTab === 'nurse' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Bell size={22} style={{ color: '#dc2626' }} />
                  <span>Bedside Nurse Call Button</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Alerts the nursing station & Dr. Priya Varma immediately with audio chimes.
                </p>
              </div>

              {nurseCallSent && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
                  ✓ Nurse Call Alert dispatched to Station!
                </div>
              )}

              {/* Big Red Emergency SOS */}
              <button
                onClick={() => handleTriggerNurseCall('EMERGENCY_SOS')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '1.75rem 1rem',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🚨 EMERGENCY SOS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9 }}>
                  Severe Pain, Chest Pressure, or Breathing Issue
                </span>
              </button>

              {/* Routine Nurse Call */}
              <button
                onClick={() => handleTriggerNurseCall('ROUTINE')}
                className="btn btn-secondary"
                style={{
                  padding: '1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1'
                }}
              >
                🛎️ Routine Nurse Call (Water, Bedside Help, IV Line)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
