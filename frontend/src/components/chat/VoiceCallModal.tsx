import React, { useState, useEffect } from 'react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, Globe, RotateCcw } from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    voiceState,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    replayLastSpeech
  } = useVoice();
  const { currentLanguage, detectedLanguage, updateDetectedLanguage } = useLanguage();

  const [aiLastSpeech, setAiLastSpeech] = useState<string>(
    'Hello, I am listening. Please speak your symptoms or healthcare request in Telugu, Hindi, or English.'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-start listening on open
      startListening(handleSpeechResult);
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  const handleSpeechResult = async (userSpeech: string) => {
    if (!userSpeech.trim()) return;
    setIsProcessing(true);

    try {
      const res = await api.sendChatMessage({
        message: userSpeech,
        context: { voiceMode: true }
      });

      if (res.detectedLanguage) {
        updateDetectedLanguage(res.detectedLanguage);
      }

      setAiLastSpeech(res.responseMessage);
      setIsProcessing(false);

      // Speak response automatically
      speakText(res.responseMessage, res.detectedLanguage, () => {
        // Continuous dialogue: resume listening after agent finishes speaking
        setTimeout(() => {
          if (isOpen) {
            startListening(handleSpeechResult);
          }
        }, 800);
      });
    } catch (err) {
      console.error('Voice call error', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const getStatusText = () => {
    if (isProcessing) return 'MediFlow AI is thinking & reasoning...';
    if (isSpeaking) return 'MediFlow AI is speaking...';
    if (isListening) return 'Listening to your voice (Speak naturally)...';
    return 'Voice consultation standby';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2000,
        padding: '2.5rem 1.5rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      {/* Top Header */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
              MediFlow AI Live Voice Consultation
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Hands-Free Multilingual Voice Stream
            </div>
          </div>
        </div>

        {/* Detected Language Chip */}
        <div className="flex items-center gap-2 glass-card" style={{ padding: '0.4rem 0.85rem' }}>
          <Globe size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
            Dialect: {detectedLanguage.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Center Interactive AI Orb & Subtitles */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '680px', textAlign: 'center' }}>
        {/* Animated AI Glowing Orb */}
        <div
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: isSpeaking
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(99, 102, 241, 0.2) 70%, transparent 100%)'
                : isListening
                ? 'radial-gradient(circle, rgba(14, 165, 233, 0.6) 0%, rgba(6, 182, 212, 0.2) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              animation: (isSpeaking || isListening) ? 'pulse-record 2s infinite' : 'none'
            }}
          />

          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: isSpeaking
                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                : isListening
                ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                : '#1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(14, 165, 233, 0.5)',
              zIndex: 2
            }}
          >
            {isSpeaking ? (
              <Volume2 size={48} color="#ffffff" />
            ) : (
              <Mic size={48} color="#ffffff" />
            )}
          </div>
        </div>

        {/* Live Frequency Waveform */}
        <VoiceVisualizer state={voiceState} barCount={20} height={42} />

        {/* State Label */}
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isListening ? '#38bdf8' : isSpeaking ? '#a78bfa' : '#94a3b8' }}>
          {getStatusText()}
        </div>

        {/* Live Subtitle Transcript Bubble */}
        <div
          className="glass-card"
          style={{
            width: '100%',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isListening ? 'You Said' : 'MediFlow AI Response'}
          </div>

          <div style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 500, lineHeight: '1.5' }}>
            {isListening
              ? transcript || interimTranscript || 'Listening to your microphone...'
              : aiLastSpeech}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-6" style={{ width: '100%', maxWidth: '600px' }}>
        {/* Toggle Mic */}
        <button
          onClick={() => {
            if (isListening) {
              stopListening();
            } else {
              startListening(handleSpeechResult);
            }
          }}
          className={`btn-voice ${isListening ? 'recording' : ''}`}
          style={{ width: '58px', height: '58px' }}
          title={isListening ? 'Mute Mic' : 'Unmute Mic'}
        >
          {isListening ? <MicOff size={26} /> : <Mic size={26} />}
        </button>

        {/* Replay Button */}
        <button
          onClick={replayLastSpeech}
          className="btn btn-secondary"
          style={{ padding: '0.8rem 1.4rem', borderRadius: '16px' }}
        >
          <RotateCcw size={18} />
          <span>Replay Response</span>
        </button>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="btn btn-emergency"
          style={{ padding: '0.8rem 1.4rem', borderRadius: '16px' }}
        >
          <PhoneOff size={18} />
          <span>End Consultation</span>
        </button>
      </div>
    </div>
  );
};
