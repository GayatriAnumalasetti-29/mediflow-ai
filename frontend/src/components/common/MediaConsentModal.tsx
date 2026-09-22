import React from 'react';
import { Modal } from './Modal';
import { ShieldCheck, Camera, Mic, Video, Lock, AlertCircle } from 'lucide-react';

interface MediaConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'CAMERA' | 'MICROPHONE' | 'VIDEO';
  onConsentGranted: () => void;
}

export const MediaConsentModal: React.FC<MediaConsentModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  onConsentGranted
}) => {
  const getDetails = () => {
    switch (mediaType) {
      case 'CAMERA':
        return {
          title: 'Prescription Camera Access Consent',
          icon: <Camera size={26} color="#0ea5e9" />,
          purpose: 'Your camera will be used solely to capture prescription and clinical document images for local Optical Character Recognition (OCR) parsing.',
          privacyPoint: 'Images are processed securely and are never shared or stored without your explicit verification and sign-off.'
        };
      case 'MICROPHONE':
        return {
          title: 'Multilingual Voice Recording Consent',
          icon: <Mic size={26} color="#0ea5e9" />,
          purpose: 'Your microphone will capture spoken symptoms, adherence affirmations, and questions in English, Telugu, or Hindi for automated speech-to-text processing.',
          privacyPoint: 'Audio streams are processed in real-time. Raw audio recordings are not retained post-transcription.'
        };
      case 'VIDEO':
        return {
          title: 'Telehealth Video Consultation Consent',
          icon: <Video size={26} color="#0ea5e9" />,
          purpose: 'Real-time two-way encrypted audio and video consultation with your attending specialist.',
          privacyPoint: 'All video transmissions are end-to-end encrypted following strict healthcare compliance regulations.'
        };
    }
  };

  const details = getDetails();

  const handleAgree = () => {
    onConsentGranted();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={details.title} maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(14, 165, 233, 0.3)'
            }}
          >
            {details.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
              Patient Medical Privacy Protection
            </div>
            <div style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} />
              <span>HIPAA / DISHA Compliant Processing</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <strong>Clinical Purpose:</strong> {details.purpose}
          </div>
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.8rem',
            color: '#34d399',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{details.privacyPoint}</span>
        </div>

        <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Decline
          </button>
          <button onClick={handleAgree} className="btn btn-primary flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>I Understand & Grant Consent</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
