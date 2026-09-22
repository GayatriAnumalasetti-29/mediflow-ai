import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Sparkles,
  Globe,
  Share2,
  FileText,
  Send,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';

export const VideoConsultation: React.FC = () => {
  const { isSpeaking } = useVoice();
  const { currentLanguage, detectedLanguage } = useLanguage();

  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // In-call chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Priya Varma', text: 'Hello Rajesh! How are you feeling after your morning dosage?', time: '10:01 AM' },
    { sender: 'Rajesh Sharma', text: 'Hello Doctor! Feeling much better, mild fatigue when climbing stairs.', time: '10:02 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Live subtitles
  const [liveCaption, setLiveCaption] = useState(
    'Dr. Priya Varma: "Let us continue your Metoprolol ER 25mg twice daily and review the ECG.'
  );

  // AI Scribe consultation summary
  const [clinicalNotes, setClinicalNotes] = useState<string[]>([
    'Chief Complaint: Post-angioplasty routine check-up and mild exertional fatigue.',
    'Vitals Reviewed: BP 122/78 mmHg, Heart Rate 74 bpm (Stable).',
    'Adherence: 94% on Atorvastatin, Metoprolol, and Ecosprin regimen.',
    'Doctor Advice: Maintain current dosages. Daily 15-min walking and breathing exercises.'
  ]);

  const patientVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timer: any;
    if (isVideoConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isVideoConnected]);

  const startConsultation = async () => {
    setIsVideoConnected(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (patientVideoRef.current) {
        patientVideoRef.current.srcObject = stream;
        patientVideoRef.current.play();
      }
    } catch (err) {
      console.warn('Simulating video camera stream for demo.');
    }
  };

  const endConsultation = () => {
    if (patientVideoRef.current && patientVideoRef.current.srcObject) {
      const stream = patientVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      patientVideoRef.current.srcObject = null;
    }
    setIsVideoConnected(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'Rajesh Sharma',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
              Telehealth Video Consultation Station
            </h2>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              ● Encrypted WebRTC Session
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Direct video consultation with Dr. Priya Varma, MD, DM (Senior Interventional Cardiologist)
          </p>
        </div>

        {isVideoConnected && (
          <div className="flex items-center gap-2 glass-card" style={{ padding: '0.4rem 0.9rem', color: '#38bdf8', fontWeight: 700 }}>
            <Clock size={16} />
            <span>{formatTimer(callDuration)}</span>
          </div>
        )}
      </div>

      {!isVideoConnected ? (
        /* Standby Pre-Call Screen */
        <div
          style={{
            height: '460px',
            background: 'rgba(7, 11, 20, 0.8)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            textAlign: 'center',
            padding: '2rem'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Video size={40} color="#ffffff" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
              Ready for Consultation with Dr. Priya Varma
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', margin: '6px auto 0 auto' }}>
              Your camera and microphone will be connected with live multilingual captions in Telugu, Hindi, and English.
            </p>
          </div>

          <button
            onClick={startConsultation}
            className="btn btn-emerald"
            style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', borderRadius: '14px' }}
          >
            <Video size={20} />
            <span>Join Video Consultation Room</span>
          </button>
        </div>
      ) : (
        /* Active Video Room */
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          {/* Main Video Viewport Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Split Video Container */}
            <div
              style={{
                height: '420px',
                background: '#070b14',
                borderRadius: '18px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Remote Doctor Stream Mockup */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(7, 11, 20, 0.95) 100%)'
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0ea5e9'
                  }}
                >
                  <UserCheck size={48} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>
                  Dr. Priya Varma, MD, DM
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Cardiology Specialist • Connected
                </div>
              </div>

              {/* Local Patient PIP View */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '160px',
                  height: '110px',
                  borderRadius: '12px',
                  background: '#0f172a',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {!isVideoOff ? (
                  <video
                    ref={patientVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center" style={{ height: '100%', color: '#64748b' }}>
                    <VideoOff size={24} />
                    <span style={{ fontSize: '0.68rem', marginTop: '2px' }}>Camera Off</span>
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '6px',
                    fontSize: '0.65rem',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  You (Patient)
                </span>
              </div>

              {/* Real-Time Live Captions / Subtitles Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  right: '20px',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(11, 15, 25, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Globe size={16} color="#38bdf8" />
                <span>{liveCaption}</span>
              </div>
            </div>

            {/* Video Control Bar */}
            <div
              className="glass-card flex items-center justify-center gap-4"
              style={{ padding: '0.85rem' }}
            >
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`btn ${isMicMuted ? 'btn-emergency' : 'btn-secondary'}`}
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`btn ${isVideoOff ? 'btn-emergency' : 'btn-secondary'}`}
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
                title="Share Screen or Report"
              >
                <Share2 size={20} />
              </button>

              <button
                onClick={endConsultation}
                className="btn btn-emergency"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}
              >
                <PhoneOff size={18} />
                <span>End Consultation</span>
              </button>
            </div>
          </div>

          {/* Side Panel: In-Call Chat & AI Clinical Scribe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '490px' }}>
            {/* AI Scribe Summary Card */}
            <div
              className="glass-card"
              style={{
                flex: 1,
                overflowY: 'auto',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                background: 'rgba(15, 23, 42, 0.85)'
              }}
            >
              <div className="flex items-center gap-2" style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                <Sparkles size={16} />
                <span>Live AI Clinical Scribe</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {clinicalNotes.map((note, i) => (
                  <div key={i} style={{ borderLeft: '2px solid #0ea5e9', paddingLeft: '8px' }}>
                    {note}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                * AI documentation assistant. Final care plan signed off by physician.
              </div>
            </div>

            {/* In-Call Text Chat */}
            <div
              className="glass-card flex flex-col"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(17, 24, 39, 0.85)'
              }}
            >
              <div className="flex items-center gap-2" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <MessageSquare size={15} color="#34d399" />
                <span>In-Call Chat</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {chatMessages.map((m, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 600, color: m.sender.startsWith('Dr.') ? '#38bdf8' : '#f8fafc' }}>
                      {m.sender}:
                    </span>{' '}
                    <span style={{ color: '#cbd5e1' }}>{m.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type in chat..."
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontSize: '0.8rem'
                  }}
                />
                <button onClick={handleSendChat} className="btn btn-primary" style={{ padding: '0.45rem 0.75rem' }}>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
