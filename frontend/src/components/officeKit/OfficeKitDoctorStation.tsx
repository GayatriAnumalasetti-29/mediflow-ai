import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../services/socket';
import {
  BridgeSession,
  DeviceTelemetry,
  RemoteScanPayload,
  NurseCallAlert
} from '@mediflow/shared';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
  Heart,
  AlertTriangle,
  Battery,
  Sun,
  ShieldCheck,
  FileText,
  Bell,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Zap,
  Play
} from 'lucide-react';

interface Props {
  patientId?: string;
  patientName?: string;
  onImportScanToPrescription?: (imageUrl: string) => void;
}

export const OfficeKitDoctorStation: React.FC<Props> = ({
  patientId = 'pat-001',
  patientName = 'Rajesh Sharma',
  onImportScanToPrescription
}) => {
  const [session, setSession] = useState<BridgeSession | null>(null);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    heartRateBpm: 74,
    ppgConfidence: 0.94,
    pulseWaveform: [0, 0.1, 0.4, 0.9, -0.4, -0.2, 0, 0.1, 0.3],
    fallDetected: false,
    tremorIndex: 0.6,
    motionMagnitude: 9.81,
    batteryLevel: 88,
    isCharging: false,
    ambientLightLux: 320,
    timestamp: new Date().toISOString()
  });
  const [receivedScans, setReceivedScans] = useState<RemoteScanPayload[]>([]);
  const [nurseAlerts, setNurseAlerts] = useState<NurseCallAlert[]>([]);
  const [isSimulatedActive, setIsSimulatedActive] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformHistory = useRef<number[]>([]);

  // 1. Create or query session on mount
  useEffect(() => {
    socket.emit('bridge:create_session', {
      patientId,
      patientName,
      doctorName: 'Dr. Priya Varma (Cardiology OPD)'
    });

    const handleCreated = (s: BridgeSession) => {
      setSession(s);
    };

    const handleDeviceConnected = (data: { deviceName: string }) => {
      setSession((prev) => (prev ? { ...prev, status: 'CONNECTED', connectedDevice: data.deviceName } : null));
    };

    const handleTelemetryUpdate = (data: DeviceTelemetry) => {
      setTelemetry(data);
      if (data.pulseWaveform && data.pulseWaveform.length > 0) {
        waveformHistory.current = [...waveformHistory.current.slice(-100), ...data.pulseWaveform.slice(-5)];
      }
    };

    const handleScanReceived = (scan: RemoteScanPayload) => {
      setReceivedScans((prev) => [scan, ...prev]);
    };

    const handleNurseAlert = (alert: NurseCallAlert) => {
      setNurseAlerts((prev) => [alert, ...prev]);
    };

    socket.on('bridge:session_created', handleCreated);
    socket.on('bridge:device_connected', handleDeviceConnected);
    socket.on('bridge:telemetry_update', handleTelemetryUpdate);
    socket.on('bridge:scan_received', handleScanReceived);
    socket.on('bridge:nurse_call_alert', handleNurseAlert);

    return () => {
      socket.off('bridge:session_created', handleCreated);
      socket.off('bridge:device_connected', handleDeviceConnected);
      socket.off('bridge:telemetry_update', handleTelemetryUpdate);
      socket.off('bridge:scan_received', handleScanReceived);
      socket.off('bridge:nurse_call_alert', handleNurseAlert);
    };
  }, [patientId, patientName]);

  // Draw real-time ECG-style pulse waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Pulse Waveform
    const points = waveformHistory.current.length > 0 ? waveformHistory.current : [0, 0.05, 0.1, 0.6, -0.3, 0, 0.05];
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const step = width / Math.max(1, points.length - 1);
    points.forEach((val, idx) => {
      const x = idx * step;
      // Invert & scale around center
      const y = height / 2 - val * (height * 0.7);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [telemetry]);

  // Simulation generator for evaluation on laptop
  useEffect(() => {
    let interval: any;
    if (isSimulatedActive) {
      interval = setInterval(() => {
        const simulatedBpm = 72 + Math.floor(Math.sin(Date.now() / 3000) * 8);
        const wave = [0, 0.05, 0.15, 0.85, -0.45, -0.1, 0, 0.05];
        const newTelemetry: DeviceTelemetry = {
          heartRateBpm: simulatedBpm,
          ppgConfidence: 0.96,
          pulseWaveform: wave,
          fallDetected: false,
          tremorIndex: parseFloat((0.4 + Math.random() * 0.4).toFixed(1)),
          motionMagnitude: parseFloat((9.8 + (Math.random() - 0.5) * 0.3).toFixed(2)),
          batteryLevel: 88,
          isCharging: true,
          ambientLightLux: 340 + Math.floor(Math.random() * 20),
          timestamp: new Date().toISOString()
        };
        setTelemetry(newTelemetry);
        waveformHistory.current = [...waveformHistory.current.slice(-90), ...wave];
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isSimulatedActive]);

  const companionUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?view=officekit_companion&pin=${session?.pinCode || ''}`
    : '';

  const copyCompanionLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(companionUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSimulateFallAlert = () => {
    setTelemetry((prev) => ({ ...prev, fallDetected: true, motionMagnitude: 28.5 }));
  };

  const resetFall = () => {
    setTelemetry((prev) => ({ ...prev, fallDetected: false, motionMagnitude: 9.81 }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
              <Zap size={14} />
              <span>CLINICAL OFFICE KIT • HARDWARE TELEMETRY BRIDGE</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              Bedside Clinical Telemetry Console
            </h2>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '0.92rem' }}>
              Real-time synchronization between Smartphone Edge Sensors and Hospital Doctor Workstation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                background: session?.status === 'CONNECTED' || session?.status === 'STREAMING' || isSimulatedActive
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(245, 158, 11, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '0.88rem',
                fontWeight: 700
              }}
            >
              {session?.status === 'CONNECTED' || session?.status === 'STREAMING' || isSimulatedActive ? (
                <>
                  <Wifi size={18} style={{ color: '#86efac' }} />
                  <span>BRIDGE ACTIVE: {session?.connectedDevice || 'Virtual Smartphone'}</span>
                </>
              ) : (
                <>
                  <WifiOff size={18} style={{ color: '#fde047' }} />
                  <span>PAIRING STANDBY</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsSimulatedActive(!isSimulatedActive)}
              className="btn"
              style={{
                background: isSimulatedActive ? '#ef4444' : '#ffffff',
                color: isSimulatedActive ? '#ffffff' : '#0369a1',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
              title="Toggle automatic hardware telemetry simulation"
            >
              {isSimulatedActive ? 'Pause Sim' : '⚡ 1-Click Live Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Fall Alert Banner if Triggered */}
      {telemetry.fallDetected && (
        <div
          style={{
            background: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)',
            animation: 'pulse 1.5s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '50%', color: '#dc2626' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.05rem' }}>
                🚨 CRITICAL: BEDSIDE FALL DETECTED (Impact: {telemetry.motionMagnitude} m/s²)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                Patient {patientName} (Room SP-201) accelerometer registered a sudden drop & high impact event.
              </div>
            </div>
          </div>
          <button
            onClick={resetFall}
            className="btn btn-primary"
            style={{ background: '#dc2626', border: 'none', fontWeight: 700 }}
          >
            Acknowledge & Clear Alert
          </button>
        </div>
      )}

      {/* Main Grid: Left Pairing / Device Info | Right Live Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 360px) 1fr', gap: '1.25rem' }}>
        {/* Left Column: QR Code & Pairing Instructions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} style={{ color: '#0284c7' }} />
            <span>Phone Pairing Station</span>
          </h3>

          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* SVG Stylized QR Code Graphic */}
            <div
              style={{
                width: '160px',
                height: '160px',
                background: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.1)'
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ fill: '#0f172a' }}>
                <rect x="5" y="5" width="25" height="25" fill="#0284c7" />
                <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                <rect x="14" y="14" width="7" height="7" fill="#0284c7" />

                <rect x="70" y="5" width="25" height="25" fill="#0284c7" />
                <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                <rect x="79" y="14" width="7" height="7" fill="#0284c7" />

                <rect x="5" y="70" width="25" height="25" fill="#0284c7" />
                <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                <rect x="14" y="79" width="7" height="7" fill="#0284c7" />

                {/* Data Matrix Dots */}
                <rect x="35" y="10" width="8" height="8" />
                <rect x="50" y="10" width="8" height="8" />
                <rect x="35" y="25" width="8" height="8" />
                <rect x="45" y="35" width="8" height="8" />
                <rect x="60" y="35" width="8" height="8" />
                <rect x="10" y="45" width="8" height="8" />
                <rect x="25" y="45" width="8" height="8" />
                <rect x="40" y="50" width="8" height="8" />
                <rect x="55" y="55" width="8" height="8" />
                <rect x="70" y="45" width="8" height="8" />
                <rect x="85" y="50" width="8" height="8" />
                <rect x="45" y="70" width="8" height="8" />
                <rect x="60" y="75" width="8" height="8" />
                <rect x="75" y="80" width="8" height="8" />
                <rect x="45" y="85" width="8" height="8" />
              </svg>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PAIRING PIN CODE</div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  color: '#0284c7',
                  fontFamily: 'monospace'
                }}
              >
                {session?.pinCode || '------'}
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Scan QR or open on phone:
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <a
                href={companionUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} />
                <span>Open Phone View</span>
              </a>

              <button
                onClick={copyCompanionLink}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                title="Copy mobile companion link"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Telemetry Summary Mini-Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Battery size={14} />
                <span>Battery</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                {telemetry.batteryLevel ?? 88}% {telemetry.isCharging ? '⚡' : ''}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sun size={14} />
                <span>Ward Light</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                {telemetry.ambientLightLux ?? 320} lux
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulateFallAlert}
            className="btn btn-secondary"
            style={{ color: '#dc2626', border: '1px solid #fca5a5', fontSize: '0.82rem', fontWeight: 700 }}
          >
            ⚠️ Test Bedside Fall Alert Trigger
          </button>
        </div>

        {/* Right Column: Real-Time Physiological Telemetry Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Vitals Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Heart Rate / Pulse */}
            <div
              className="card"
              style={{
                borderLeft: '4px solid #ef4444',
                background: 'linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991b1b' }}>OPTICAL PULSE (PPG)</span>
                <Heart size={18} style={{ color: '#ef4444', animation: 'pulse 1.2s infinite' }} />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 0 0' }}>
                {telemetry.heartRateBpm ? telemetry.heartRateBpm : '--'}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>BPM</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                Confidence: {Math.round((telemetry.ppgConfidence || 0.95) * 100)}% • Camera Sensor
              </div>
            </div>

            {/* Tremor Index */}
            <div
              className="card"
              style={{
                borderLeft: '4px solid #8b5cf6',
                background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b21a8' }}>TREMOR / STABILITY</span>
                <Activity size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 0 0' }}>
                {telemetry.tremorIndex}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>/ 10</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: telemetry.tremorIndex < 2 ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                {telemetry.tremorIndex < 2 ? 'Normal Post-op Range' : 'Elevated Tremor'}
              </div>
            </div>

            {/* Accelerometer Magnitude */}
            <div
              className="card"
              style={{
                borderLeft: '4px solid #0284c7',
                background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>MOTION ACCELEROMETER</span>
                <Zap size={18} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 0 0' }}>
                {telemetry.motionMagnitude}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>m/s²</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Bedside Patient Mobility
              </div>
            </div>
          </div>

          {/* Real-Time Optical ECG Waveform Monitor */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} style={{ color: '#0284c7' }} />
                <span>Live Photoplethysmography (PPG) Waveform Stream</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Frequency: ~30 Hz • Real-time Optical Feedback</span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '8px', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={640}
                height={120}
                style={{ width: '100%', height: '120px', display: 'block' }}
              />
            </div>
          </div>

          {/* Received Wireless Scans & Nurse Calls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Wireless Document / Camera Receiver */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                <FileText size={16} style={{ color: '#0284c7' }} />
                <span>Wireless Phone Camera Scans</span>
              </div>

              {receivedScans.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                  No scans received yet. Take a photo on the paired phone companion to beam it here instantly.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {receivedScans.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={s.imageDataUrl}
                          alt="Remote scan"
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.scanType}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(s.capturedAt).toLocaleTimeString()}</div>
                        </div>
                      </div>

                      {onImportScanToPrescription && (
                        <button
                          onClick={() => onImportScanToPrescription(s.imageDataUrl)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          Push to OCR
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bedside Nurse Call Logs */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                <Bell size={16} style={{ color: '#ef4444' }} />
                <span>Bedside Nurse Call History</span>
              </div>

              {nurseAlerts.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                  All clear. No active nurse call triggers.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {nurseAlerts.map((a, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        background: a.priority === 'EMERGENCY_SOS' ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${a.priority === 'EMERGENCY_SOS' ? '#fecaca' : '#bbf7d0'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: a.priority === 'EMERGENCY_SOS' ? '#dc2626' : '#16a34a' }}>
                          {a.priority}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {a.patientName} • {a.roomNumber}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(a.triggeredAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
