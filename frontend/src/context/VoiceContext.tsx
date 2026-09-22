import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

interface VoiceContextType {
  voiceState: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  speakText: (text: string, language?: string, onComplete?: () => void) => void;
  stopSpeaking: () => void;
  replayLastSpeech: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState<{ text: string; language: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = async (onResult?: (text: string) => void) => {
    setErrorMessage(null);
    setInterimTranscript('');
    setTranscript('');

    // 1. Request real device microphone permission via getUserMedia
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release permission test track
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (permErr: any) {
      console.warn('Real microphone permission denied:', permErr);
      setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser settings.');
      setVoiceState('ERROR');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not natively supported in this browser. Please use Chrome, Edge, or Safari.');
      setVoiceState('ERROR');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'te-IN,hi-IN,en-IN,ta-IN,kn-IN'; // Multi-locale language priority

      recognition.onstart = () => {
        setVoiceState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          setVoiceState('PROCESSING');
          if (onResult) onResult(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Real speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Microphone status: ${event.error}`);
          setVoiceState('ERROR');
        } else {
          setVoiceState('IDLE');
        }
      };

      recognition.onend = () => {
        if (voiceState === 'LISTENING') {
          setVoiceState('IDLE');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start real speech recognition', err);
      setErrorMessage('Microphone permissions are required for voice interaction.');
      setVoiceState('ERROR');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setVoiceState('IDLE');
  };

  const speakText = (text: string, language: string = 'en', onComplete?: () => void) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop active speech

    // Remove markdown symbols and emojis
    const cleanText = text
      .replace(/[*_#`⚠️❌✅●]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    setLastSpokenText({ text, language });
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick Regional Voice Dialects (Extensible)
    const langPrefix = language.toLowerCase().split('-')[0];
    const bcpMap: Record<string, string> = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ar: 'ar-SA',
      en: 'en-US'
    };

    utterance.lang = bcpMap[langPrefix] || 'en-US';

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setVoiceState('SPEAKING');
    utterance.onend = () => {
      setVoiceState('IDLE');
      if (onComplete) onComplete();
    };
    utterance.onerror = () => setVoiceState('IDLE');

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setVoiceState('IDLE');
    }
  };

  const replayLastSpeech = () => {
    if (lastSpokenText) {
      speakText(lastSpokenText.text, lastSpokenText.language);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        voiceState,
        isListening: voiceState === 'LISTENING',
        isSpeaking: voiceState === 'SPEAKING',
        isProcessing: voiceState === 'PROCESSING',
        transcript,
        interimTranscript,
        errorMessage,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,
        replayLastSpeech
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
