import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, AlertTriangle, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Prescription } from '@mediflow/shared';
import { PrescriptionVerifyModal } from './PrescriptionVerifyModal';

export const CameraCapture: React.FC = () => {
  const [permissionState, setPermissionState] = useState<'PROMPT' | 'GRANTED' | 'DENIED'>('PROMPT');
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPrescription, setExtractedPrescription] = useState<Prescription | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const requestCameraPermissionAndStart = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setPermissionState('GRANTED');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setPermissionState('DENIED');
      setErrorMessage('Camera access was not granted. You can use the document file uploader below to upload prescription photos or scans.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessOcr = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('patientId', 'pat-001');
      formData.append('doctorNotes', 'Camera captured prescription scan');
      formData.append('imageDataUrl', capturedImage);
      formData.append('image', capturedImage);

      const res = await api.uploadPrescription(formData);
      setExtractedPrescription(res);
      setShowVerifyModal(true);
    } catch (err) {
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteImage = () => {
    setCapturedImage(null);
    setExtractedPrescription(null);
    stopCamera();
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Title & Guidelines */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
            Prescription Camera Capture & OCR Intelligence
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
            Capture doctor prescriptions or upload medical documents. AI extracts medicines without guessing unclear handwriting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
            Zero-Guessing Guardrails Active
          </span>
        </div>
      </div>

      {/* Permission Warning Notice */}
      {errorMessage && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Viewport Area */}
      <div
        style={{
          width: '100%',
          height: '400px',
          background: '#070b14',
          borderRadius: '18px',
          border: isStreaming ? '2px solid #0ea5e9' : '2px dashed rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isStreaming && (
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {capturedImage && !isStreaming && (
          <img
            src={capturedImage}
            alt="Prescription Preview"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {!isStreaming && !capturedImage && (
          <div className="flex flex-col items-center gap-3 text-center" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(14, 165, 233, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)'
              }}
            >
              <Camera size={34} color="#38bdf8" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem' }}>
                Position Prescription Inside Clean Lighting
              </p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                Supports handwritten clinical prescriptions, OPD slips & digital lab orders
              </p>
            </div>
          </div>
        )}

        {/* Framing Guides overlay during live streaming */}
        {isStreaming && (
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              border: '2px dashed rgba(56, 189, 248, 0.7)',
              borderRadius: '12px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '12px'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
              Align Prescription within Borders
            </span>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 11, 20, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              zIndex: 5
            }}
          >
            <RefreshCw size={36} color="#38bdf8" className="spin" />
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
              Extracting medication names, dosages & frequency...
            </p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Control Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginTop: '1.5rem' }}>
        <div className="flex items-center gap-3">
          {!isStreaming && !capturedImage && (
            <button onClick={requestCameraPermissionAndStart} className="btn btn-primary">
              <Camera size={18} />
              <span>Open Live Camera</span>
            </button>
          )}

          {isStreaming && (
            <button onClick={takeSnapshot} className="btn btn-emerald">
              <CheckCircle2 size={18} />
              <span>Capture Snapshot</span>
            </button>
          )}

          {!capturedImage && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
            >
              <Upload size={18} />
              <span>Upload Prescription Photo / PDF</span>
            </button>
          )}

          {capturedImage && (
            <>
              <button
                onClick={handleProcessOcr}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <ShieldCheck size={18} />
                <span>Extract Medicines with AI OCR</span>
              </button>

              <button
                onClick={() => {
                  setCapturedImage(null);
                  requestCameraPermissionAndStart();
                }}
                className="btn btn-secondary"
              >
                <RefreshCw size={16} />
                <span>Retake</span>
              </button>

              <button
                onClick={handleDeleteImage}
                className="btn btn-secondary"
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {capturedImage && (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Snapshot ready for verification
          </span>
        )}
      </div>

      {/* Verification Workbench Modal */}
      {extractedPrescription && (
        <PrescriptionVerifyModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          prescription={extractedPrescription}
          onVerified={() => {
            setShowVerifyModal(false);
            alert('Prescription successfully verified! Your daily medication schedule and dose alerts are now active.');
          }}
        />
      )}
    </div>
  );
};
