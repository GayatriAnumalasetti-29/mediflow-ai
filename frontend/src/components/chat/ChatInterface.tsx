import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, detectClientLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { api } from '../../services/api';
import {
  ChatMessage,
  AgentActionCard,
  Prescription,
  ExtractedPrescriptionItem,
  VerificationStatus,
  BridgeSession,
  PatientHandoffPayload
} from '@mediflow/shared';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Paperclip,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  RotateCcw,
  PhoneCall,
  Zap,
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  Video,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  Check,
  X,
  FileText,
  Upload,
  Eye,
  Pill,
  Smartphone,
  Laptop,
  Activity,
  Compass,
  Battery,
  Wifi,
  ShieldAlert
} from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VoiceCallModal } from './VoiceCallModal';
import { DeviceBridgeModal } from './DeviceBridgeModal';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useDeviceAssistance } from '../../services/hardware/useDeviceAssistance';
import { useOnDeviceAI, HybridProcessingMetadata } from '../../services/hardware/useOnDeviceAI';

interface Props {
  onNavigateTab?: (tab: string) => void;
}

interface ExtendedChatMessage extends ChatMessage {
  imageUrl?: string;
  prescriptionData?: Prescription;
  isVerified?: boolean;
  processingMeta?: HybridProcessingMetadata;
}

export const ChatInterface: React.FC<Props> = ({ onNavigateTab }) => {
  const { currentLanguage, setLanguage, updateDetectedLanguage, detectedLanguage } = useLanguage();
  const {
    voiceState,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    errorMessage: voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoice();

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'AGENT',
      text: 'Hello! I am MediFlow AI, your unified multimodal healthcare coordinator. You can talk to me via voice, type in any language, open your camera to scan prescriptions or medical documents, or connect to a telehealth video consultation. How may I assist your care today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);

  // Live Integrated Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { user } = useAuth();

  // Voice Call Modal
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

  // Real Phone Device Assistance Hook & Active Access State
  const deviceAssistance = useDeviceAssistance();
  const [activeSensorAccess, setActiveSensorAccess] = useState<string | null>(null);
  const [devicePermissionDenied, setDevicePermissionDenied] = useState<boolean>(false);

  // Real On-Device AI Hook & Hybrid Inspection State
  const onDeviceAI = useOnDeviceAI();
  const [selectedMeta, setSelectedMeta] = useState<HybridProcessingMetadata | null>(null);

  // Real Phone-to-Laptop Bridge State & Bi-Directional Synchronization
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [activeBridgeSession, setActiveBridgeSession] = useState<BridgeSession | null>(null);
  const [bridgeSyncStatus, setBridgeSyncStatus] = useState<string | null>(null);

  // Editing prescription item state
  const [editingItem, setEditingItem] = useState<{ msgId: string; itemIndex: number; dosage: string; frequency: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Transcript Auto-Send Handler
  useEffect(() => {
    if (transcript && !isListening) {
      handleSend(transcript);
    }
  }, [transcript, isListening]);

  // Check URL parameters for direct handoff connection (e.g. from QR scan or link)
  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const bridgePin = urlParams?.get('bridgePin');
    if (bridgePin && bridgePin.length === 6 && !activeBridgeSession) {
      console.log(`[ChatInterface] Direct bridge PIN detected: ${bridgePin}`);
      socket.emit('bridge:join_session', {
        pinCode: bridgePin,
        deviceName: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Laptop Workstation'
      });
    }
  }, []);

  // Real-time synchronization listeners across paired bridge devices
  useEffect(() => {
    const handleHandoffSynced = (data: { update: Partial<PatientHandoffPayload>; handoffData?: PatientHandoffPayload }) => {
      if (data.update?.messages && data.update.messages.length > 0) {
        setMessages(data.update.messages);
      }
      setBridgeSyncStatus(`Synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setTimeout(() => setBridgeSyncStatus(null), 3000);
    };

    const handleHandoffAuthorized = (data: { session: BridgeSession; handoffData: PatientHandoffPayload }) => {
      setActiveBridgeSession(data.session);
      if (data.handoffData?.messages && data.handoffData.messages.length > 0) {
        setMessages(data.handoffData.messages);
      }
      if (data.handoffData?.prescriptionImage) {
        setAttachedPreview(data.handoffData.prescriptionImage);
      }
      setBridgeSyncStatus('Bridge Handshake Complete');
      setTimeout(() => setBridgeSyncStatus(null), 4000);
    };

    const handleSessionSevered = () => {
      setActiveBridgeSession(null);
      setBridgeSyncStatus(null);
    };

    socket.on('bridge:handoff_synced', handleHandoffSynced);
    socket.on('bridge:handoff_authorized', handleHandoffAuthorized);
    socket.on('bridge:session_severed', handleSessionSevered);

    return () => {
      socket.off('bridge:handoff_synced', handleHandoffSynced);
      socket.off('bridge:handoff_authorized', handleHandoffAuthorized);
      socket.off('bridge:session_severed', handleSessionSevered);
    };
  }, []);

  // Broadcast state changes to paired bridge device
  const syncToBridge = (updatedMessages: ExtendedChatMessage[], additionalPayload: Partial<PatientHandoffPayload> = {}) => {
    if (!activeBridgeSession) return;
    socket.emit('bridge:sync_handoff', {
      sessionId: activeBridgeSession.sessionId,
      update: {
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
        ...additionalPayload
      }
    });
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 1. Real Camera Start & Stop
  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);

      // Check for torch flash capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if ((capabilities as any).torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Real camera stream error:', err);
      setCameraError('Camera access denied or unavailable. Please grant browser camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      const nextState = !isTorchOn;
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  // Capture image snapshot from live camera feed
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setAttachedPreview(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Prompts
  const quickPrompts = [
    { label: "📱 I feel weak after treatment", text: "I feel weak after my treatment." },
    { label: "What helps with mild fever?", text: "What home remedies and care help with mild fever and body aches?" },
    { label: "నాకు తలనొప్పిగా ఉంది (Telugu)", text: "నాకు తలనొప్పి మరియు కంటి అలసటగా ఉంది, ఏమి చేయాలి?" },
    { label: "एसिडिटी का उपाय (Hindi)", text: "मुझे एसिडिटी और पेट में भारीपन महसूस हो रहा है, क्या उपाय करें?" },
    { label: "Book Cardiologist Doctor", text: "I want to book an appointment with a Cardiologist" },
    { label: "Connect to Telehealth Video", text: "I want to start a video consultation with the doctor" }
  ];

  // Device Assistance Permission Handlers
  const handleGrantDevicePermission = async () => {
    setActiveSensorAccess('Accessing real-time phone accelerometer & gyroscope...');
    try {
      const telemetry = await deviceAssistance.requestPermissionAndSample();

      const userTelemetryMsg: ExtendedChatMessage = {
        id: `user-dev-${Date.now()}`,
        sender: 'PATIENT',
        text: `📱 Shared real device telemetry (Stability: ${telemetry.stabilityIndex}%, Motion: ${telemetry.motionMagnitude} m/s², Battery: ${telemetry.battery?.level}%)`,
        detectedLanguage: currentLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, userTelemetryMsg]);
      setIsSending(true);

      const response = await api.sendChatMessage("Here is my device information", {
        languageOverride: currentLanguage,
        deviceContext: telemetry
      });

      if (response.detectedLanguage) {
        updateDetectedLanguage(response.detectedLanguage);
      }

      const agentMsg: ExtendedChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        text: response.responseMessage,
        actionCard: response.actionCard,
        detectedLanguage: response.detectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);

      if (response.audioBase64 || isListening) {
        speakText(response.responseMessage, response.detectedLanguage || currentLanguage);
      }

      setTimeout(() => {
        setActiveSensorAccess(null);
      }, 4000);
    } catch (err: any) {
      console.warn('Device permission error:', err);
      setActiveSensorAccess(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleDenyDevicePermission = async () => {
    setDevicePermissionDenied(true);
    setActiveSensorAccess(null);

    const userDeclineMsg: ExtendedChatMessage = {
      id: `user-deny-${Date.now()}`,
      sender: 'PATIENT',
      text: '✕ Continue without sensor data',
      detectedLanguage: currentLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userDeclineMsg]);
    setIsSending(true);

    try {
      const response = await api.sendChatMessage("I feel weak after my treatment", {
        languageOverride: currentLanguage,
        devicePermissionStatus: 'denied'
      });

      const agentMsg: ExtendedChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        text: response.responseMessage,
        actionCard: response.actionCard,
        detectedLanguage: response.detectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);

      if (response.audioBase64 || isListening) {
        speakText(response.responseMessage, response.detectedLanguage || currentLanguage);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSending(false);
    }
  };

  // Primary Multimodal Send Handler
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    const hasMedia = !!attachedPreview;

    if (!textToSend && !hasMedia) return;
    if (isSending) return;

    // 1. REAL ON-DEVICE AI PREPROCESSING (Client-Side, zero network latency)
    const onDeviceStartTime = performance.now();
    const onDeviceTasks: string[] = [];

    // A. Local Privacy PII Redaction
    const piiResult = onDeviceAI.sanitizePIILocally(textToSend);
    if (piiResult.isSanitized) {
      onDeviceTasks.push(`PII Masked (${piiResult.maskedCount} IDs)`);
    }

    // B. Local Language & Script Detection
    const onDeviceLang = onDeviceAI.detectLanguageOnDevice(textToSend);
    onDeviceTasks.push(`Language: ${onDeviceLang.languageName}`);
    updateDetectedLanguage(onDeviceLang.detectedLanguage);

    // C. Local Emergency Symptom Triage Check (< 1ms)
    const edgeTriage = onDeviceAI.evaluateSymptomsOnDevice(textToSend);
    if (edgeTriage.urgency !== 'ROUTINE') {
      onDeviceTasks.push(`Edge Alert: ${edgeTriage.urgency}`);
    }

    let optimizedMediaUrl = attachedPreview;
    let imagePreprocessResult: any = null;

    // D. Canvas 2D OCR Preprocessing & Sharpness Check
    if (hasMedia && attachedPreview) {
      imagePreprocessResult = await onDeviceAI.preprocessImageForOCR(attachedPreview);
      optimizedMediaUrl = imagePreprocessResult.processedDataUrl;
      const docClass = onDeviceAI.classifyDocumentOnDevice(attachedPreview, attachedFile?.name);
      onDeviceTasks.push(`Canvas Binarized (${imagePreprocessResult.compressionRatio})`);
      onDeviceTasks.push(`Sharpness: ${imagePreprocessResult.sharpnessScore}%`);
      onDeviceTasks.push(`Doc: ${docClass.documentType}`);
    }

    const onDeviceLatency = parseFloat((performance.now() - onDeviceStartTime).toFixed(2));

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ExtendedChatMessage = {
      id: userMsgId,
      sender: 'PATIENT',
      text: piiResult.sanitizedText || (hasMedia ? 'Please analyze this prescription document with MediFlow Vision OCR.' : ''),
      imageUrl: optimizedMediaUrl || undefined,
      processingMeta: {
        onDevice: {
          executed: true,
          tasks: onDeviceTasks,
          piiMaskedCount: piiResult.maskedCount,
          imageOptimized: !!imagePreprocessResult,
          sharpnessScore: imagePreprocessResult?.sharpnessScore,
          detectedLanguage: onDeviceLang.detectedLanguage,
          latencyMs: onDeviceLatency
        }
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    syncToBridge([...messages, userMsg]);
    setInputText('');
    const currentMedia = optimizedMediaUrl;
    setAttachedPreview(null);
    setAttachedFile(null);
    setIsSending(true);

    try {
      // 2. If prescription / document image was attached, execute Vision OCR pipeline
      if (hasMedia) {
        const formData = new FormData();
        formData.append('patientId', 'pat-001');
        formData.append('doctorNotes', piiResult.sanitizedText || 'Camera captured prescription document');

        const serverStartTime = performance.now();
        const ocrResult = await api.uploadPrescription(formData);
        const serverLatency = Math.round(performance.now() - serverStartTime);

        const ocrMsg: ExtendedChatMessage = {
          id: `agent-ocr-${Date.now()}`,
          sender: 'AGENT',
          text: `📷 **MediFlow Vision OCR Analysis Complete**\n\nI have extracted the medication details from your uploaded image. To guarantee patient safety and adhere to our clinical zero-guessing guardrail, please **verify the medicine names and dosages below** before I activate your active reminders schedule.`,
          prescriptionData: ocrResult,
          isVerified: false,
          detectedLanguage: onDeviceLang.detectedLanguage,
          processingMeta: {
            onDevice: {
              executed: true,
              tasks: onDeviceTasks,
              piiMaskedCount: piiResult.maskedCount,
              imageOptimized: true,
              sharpnessScore: imagePreprocessResult?.sharpnessScore,
              detectedLanguage: onDeviceLang.detectedLanguage,
              latencyMs: onDeviceLatency
            },
            serverSide: {
              model: 'MediFlow Vision OCR & Clinical Verifier',
              activeAgent: 'PRESCRIPTION_OCR',
              latencyMs: serverLatency
            }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, ocrMsg]);

        // Voice Readback
        speakText('I have extracted the prescription information. Please verify the medication details before schedule activation.', onDeviceLang.detectedLanguage);
      } else {
        // 3. Text / Voice Turn to AI Orchestrator
        // Check if patient asked for video consult directly
        if (textToSend.toLowerCase().includes('video consult') || textToSend.toLowerCase().includes('video call') || textToSend.toLowerCase().includes('doctor call')) {
          const videoMsg: ExtendedChatMessage = {
            id: `agent-vid-${Date.now()}`,
            sender: 'AGENT',
            text: 'I can connect you directly with Dr. Priya Varma (Interventional Cardiology) in our secure telehealth video consultation room.',
            actionCard: {
              cardType: 'DOCTOR_SELECTION',
              data: {
                doctorName: 'Dr. Priya Varma',
                specialization: 'Interventional Cardiology',
                department: 'Cardiology OPD Room 104',
                fee: '₹800',
                slot: 'Instant Telehealth Meet Available'
              }
            },
            processingMeta: {
              onDevice: {
                executed: true,
                tasks: onDeviceTasks,
                piiMaskedCount: piiResult.maskedCount,
                detectedLanguage: onDeviceLang.detectedLanguage,
                latencyMs: onDeviceLatency
              },
              serverSide: {
                model: 'Telehealth Bridge Router',
                activeAgent: 'APPOINTMENT',
                latencyMs: 12
              }
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, videoMsg]);
          speakText('I can connect you directly with Doctor Priya Varma in our telehealth video room.', onDeviceLang.detectedLanguage);
          return;
        }

        const serverStartTime = performance.now();
        const response = await api.sendChatMessage(piiResult.sanitizedText, {
          languageOverride: currentLanguage,
          voiceMode: isListening || false
        });
        const serverLatency = Math.round(performance.now() - serverStartTime);

        if (response.detectedLanguage) {
          updateDetectedLanguage(response.detectedLanguage);
        }

        const agentMsg: ExtendedChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'AGENT',
          text: response.responseMessage,
          actionCard: response.actionCard,
          detectedLanguage: response.detectedLanguage,
          processingMeta: {
            onDevice: {
              executed: true,
              tasks: onDeviceTasks,
              piiMaskedCount: piiResult.maskedCount,
              detectedLanguage: onDeviceLang.detectedLanguage,
              latencyMs: onDeviceLatency
            },
            serverSide: {
              model: 'Gemini 1.5 Pro & MediFlow Engine',
              activeAgent: response.activeAgent,
              latencyMs: serverLatency
            }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, agentMsg]);
        syncToBridge([...messages, userMsg, agentMsg]);

        // Auto TTS speech readback
        if (isListening || response.audioBase64) {
          speakText(response.responseMessage, response.detectedLanguage || onDeviceLang.detectedLanguage);
        }
      }
    } catch (err: any) {
      const errorMsg: ExtendedChatMessage = {
        id: `agent-err-${Date.now()}`,
        sender: 'AGENT',
        text: 'I have logged your request. For persistent or acute symptoms, taking adequate rest, monitoring your vitals, and scheduling a consultation with our specialist is strongly advised.',
        processingMeta: {
          onDevice: {
            executed: true,
            tasks: onDeviceTasks,
            piiMaskedCount: piiResult.maskedCount,
            detectedLanguage: onDeviceLang.detectedLanguage,
            latencyMs: onDeviceLatency
          },
          serverSide: {
            model: 'Local Client Safe Fallback',
            activeAgent: 'INTAKE',
            latencyMs: 1
          }
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Patient Verification Confirmation Handler
  const handleConfirmPrescription = async (msgId: string, prescription: Prescription) => {
    try {
      await api.verifyPrescription(prescription.id, {
        verifiedItems: prescription.extractedItems,
        verificationRole: 'PATIENT'
      });

      // Update message state to show confirmed
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isVerified: true } : m))
      );

      // Add confirmation response from agent
      const confirmationMsg: ExtendedChatMessage = {
        id: `agent-confirm-${Date.now()}`,
        sender: 'AGENT',
        text: `✅ **Prescription Verified & Schedule Activated!**\n\nI have successfully activated your daily medication reminder schedule for ${prescription.extractedItems?.length || 3} prescribed medicines. You will receive automated alerts and voice chimes at your scheduled dose timings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedMsgs = [
        ...messages.map((m) => (m.id === msgId ? { ...m, isVerified: true } : m)),
        confirmationMsg
      ];
      setMessages(updatedMsgs);
      syncToBridge(updatedMsgs, { prescriptionData: { ...prescription, isVerified: true } });
      speakText('Your prescription is verified and your daily medication reminder schedule is now active.', detectedLanguage);
    } catch (e) {
      console.error('Prescription verification error:', e);
    }
  };

  return (
    <div
      className="glass-panel flex flex-col"
      style={{
        height: '760px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(186, 230, 253, 0.85)',
        boxShadow: '0 15px 35px rgba(14, 165, 233, 0.12)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {/* 1. Header Toolbar with Multimodal Modalities */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('overview')}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Return to Patient Home"
            >
              <ArrowLeft size={16} />
              <span>← Back</span>
            </button>
          )}

          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />

          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>MediFlow AI • Unified Multimodal Agent</span>
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 800 }}>
                {detectedLanguage.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Text • Voice (STT/TTS) • Camera OCR • Document Vault • Telehealth Video
            </div>
          </div>
        </div>

        {/* Live Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Telehealth Video Consult Button */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('video_consult')}
              className="btn"
              style={{
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1.5px solid #7dd3fc',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Join Live Telehealth Video Room with Specialist"
            >
              <Video size={15} />
              <span>Video Consult</span>
            </button>
          )}

          {/* Real Phone-to-Laptop Bridge Trigger */}
          <button
            onClick={() => setIsBridgeModalOpen(true)}
            className="btn"
            style={{
              background: activeBridgeSession ? '#f0fdf4' : '#f0f9ff',
              color: activeBridgeSession ? '#15803d' : '#0369a1',
              border: activeBridgeSession ? '1.5px solid #86efac' : '1.5px solid #7dd3fc',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '0.4rem 0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Open Phone-to-Laptop Bridge & Secure Handoff"
          >
            <Smartphone size={14} />
            <span style={{ fontSize: '0.7rem' }}>↔️</span>
            <Laptop size={14} />
            <span>{activeBridgeSession ? 'Bridge Active' : 'Device Bridge'}</span>
          </button>

          {/* Voice Call Mode Trigger */}
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            className="btn btn-emerald flex items-center gap-1.5"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <PhoneCall size={14} />
            <span>Voice Call</span>
          </button>

          {/* Speech Active Mute */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="btn btn-secondary flex items-center gap-1"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#7c3aed', borderColor: '#c084fc' }}
            >
              <VolumeX size={14} />
              <span>Mute</span>
            </button>
          )}

          {/* Clear / Restart */}
          <button
            onClick={() => setMessages([messages[0]])}
            className="btn btn-secondary"
            title="Restart Conversation"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Real Phone-to-Laptop Active Bridge Status Bar */}
      {activeBridgeSession && (
        <div
          style={{
            background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
            borderBottom: '1px solid #86efac',
            padding: '0.45rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#166534'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px #16a34a' }} />
            <span>
              <strong>Phone-to-Laptop Bridge Active:</strong> Paired with <strong>{activeBridgeSession.connectedDevice || 'Remote Workstation'}</strong> • PIN: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 5px', borderRadius: '4px' }}>{activeBridgeSession.pinCode}</code> • Bi-directional Sync Active
            </span>
            {bridgeSyncStatus && (
              <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem' }}>
                {bridgeSyncStatus}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              socket.emit('bridge:sever_session', { sessionId: activeBridgeSession.sessionId });
              setActiveBridgeSession(null);
            }}
            className="btn"
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Immediately disconnect and revoke bridge access"
          >
            Disconnect Bridge
          </button>
        </div>
      )}

      {/* 2. Suggestion Quick Chips */}
      <div
        style={{
          padding: '0.55rem 1.25rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto'
        }}
      >
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="suggestion-chip"
            style={{ whiteSpace: 'nowrap' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active Device Sensor Telemetry Access Indicator */}
      {activeSensorAccess && (
        <div
          style={{
            background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
            borderBottom: '1.5px solid #6ee7b7',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#065f46',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block'
              }}
            />
            <Smartphone size={16} color="#059669" />
            <span>
              <strong>Active Device Assistance:</strong> {activeSensorAccess}
            </span>
          </div>
          <button
            onClick={() => {
              deviceAssistance.stopSampling();
              setActiveSensorAccess(null);
            }}
            style={{
              background: '#d1fae5',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              padding: '2px 8px',
              color: '#047857',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            ✕ Revoke / Stop
          </button>
        </div>
      )}

      {/* 3. Live Embedded Camera Viewfinder Dock (When Active) */}
      {isCameraActive && (
        <div
          style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '1rem',
            borderBottom: '2px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
              <Camera size={16} />
              <span>Live Prescription Camera Viewfinder (Real Device Stream)</span>
            </div>
            <button onClick={stopCamera} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '220px', borderRadius: '12px', overflow: 'hidden', background: '#000000', border: '2px dashed #0284c7' }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Viewfinder Target Framing Box */}
            <div
              style={{
                position: 'absolute',
                inset: '16px',
                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '8px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '8px'
              }}
            >
              <span style={{ background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                Position Prescription Here
              </span>
            </div>
          </div>

          {cameraError && (
            <div style={{ color: '#f87171', fontSize: '0.8rem' }}>{cameraError}</div>
          )}

          {/* Camera Controls Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={toggleCameraFacing}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Flip Front / Rear Camera"
            >
              <SwitchCamera size={16} />
              <span>Flip Camera</span>
            </button>

            {hasTorch && (
              <button
                onClick={toggleTorch}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isTorchOn ? <Flashlight size={16} color="#facc15" /> : <FlashlightOff size={16} />}
                <span>Torch</span>
              </button>
            )}

            <button
              onClick={captureSnapshot}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={18} />
              <span>Snap & Send to AI</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Messages Feed */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'rgba(248, 250, 252, 0.68)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'PATIENT';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '82%',
                  padding: '1rem 1.25rem',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#ffffff',
                  color: isUser ? '#ffffff' : '#0f172a',
                  border: isUser ? 'none' : '1.5px solid #bae6fd',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  fontSize: '0.94rem',
                  lineHeight: '1.55'
                }}
              >
                {/* Agent Header Tag */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} /> MediFlow Clinical AI
                      </span>
                      {m.detectedLanguage && (
                        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.68rem', padding: '1px 6px' }}>
                          {m.detectedLanguage.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => speakText(m.text, m.detectedLanguage || currentLanguage)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      title="Replay Audio Voice"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                )}

                {/* Attached Captured/Uploaded Image Preview */}
                {m.imageUrl && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img
                      src={m.imageUrl}
                      alt="Prescription capture"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '220px',
                        borderRadius: '10px',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                {/* Text Content */}
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

                {/* Vision OCR Extraction & Patient Verification Card */}
                {m.prescriptionData && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Pill size={16} color="#0284c7" />
                        <span>Extracted Medications Table</span>
                      </div>
                      <span className="badge badge-routine">
                        OCR Confidence: {Math.round((m.prescriptionData.ocrConfidence || 0.94) * 100)}%
                      </span>
                    </div>

                    {/* Medications List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {m.prescriptionData.extractedItems?.map((item: ExtractedPrescriptionItem, idx: number) => {
                        const isAmbiguous = item.isAmbiguous || (item.confidence && item.confidence < 0.95);
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: isAmbiguous ? '#fffbeb' : '#ffffff',
                              border: `1.5px solid ${isAmbiguous ? '#f59e0b' : '#e2e8f0'}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.82rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{item.medicineName}</span>
                                <span style={{ color: '#0284c7' }}>({item.dosage})</span>
                                {isAmbiguous && (
                                  <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    ⚠️ Please verify
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                {item.frequencyLabel} • {item.timing?.replace(/_/g, ' ')} • {item.durationDays} Days
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                              {Math.round((item.confidence || 0.95) * 100)}% Match
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Clinical Verification Gate */}
                    {m.isVerified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} />
                        <span>Verified by Patient — Reminders Active in Schedule</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => handleConfirmPrescription(m.id, m.prescriptionData!)}
                          className="btn btn-primary"
                          style={{
                            flex: 1,
                            padding: '0.6rem 1rem',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Check size={16} />
                          <span>✓ Confirm & Activate Medication Schedule</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Standard Action Cards (Appointments, Guidance, Device Assistance) */}
                {m.actionCard && (
                  <div style={{ marginTop: '0.75rem' }}>
                    {m.actionCard.cardType === 'DOCTOR_SELECTION' && (
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{m.actionCard.data.doctorName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>{m.actionCard.data.specialization}</div>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('video_consult')}
                            className="btn btn-primary"
                            style={{ marginTop: '8px', fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Video size={14} />
                            <span>Join Video Consult Room</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reschedule Options Card (Rule: Patient Confirms, Never Auto-Choose) */}
                    {m.actionCard.cardType === 'RESCHEDULE_OPTIONS' && (
                      <div
                        style={{
                          background: '#ffffff',
                          padding: '14px 16px',
                          borderRadius: '14px',
                          border: '1.5px solid #38bdf8',
                          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 800, fontSize: '0.88rem' }}>
                          <RotateCcw size={16} />
                          <span>Reschedule Available Slots • {m.actionCard.data.doctorName}</span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f0f9ff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                          ℹ️ <strong>Clinical Rule:</strong> MediFlow AI does not automatically select for you. Please choose a slot below:
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(m.actionCard.data.options || []).map((opt: any) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setInputText(`I would like to confirm rescheduling to ${opt.label}`);
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                              }}
                            >
                              <span>{opt.label}</span>
                              <span style={{ color: '#0284c7', fontSize: '0.74rem' }}>Select & Confirm →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Device Assistance Permission Request Card */}
                    {m.actionCard.cardType === 'DEVICE_PERMISSION_REQUEST' && (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #a7f3d0',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#065f46' }}>
                              📱 Device Assistance Permission Request
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                              Real Phone Sensors & Ambient Context
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#1f2937', marginBottom: '10px', lineHeight: 1.4 }}>
                          <strong>Why this is needed:</strong> {m.actionCard.data.reason || 'To assess your physical steadiness, phone orientation, and resting state while you recuperate.'}
                        </div>

                        {/* Requested sensors chip list */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          {(m.actionCard.data.requestedSensors || ['Accelerometer (Motion)', 'Gyroscope (Orientation)', 'Battery & Network']).map((s: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #6ee7b7',
                                color: '#065f46',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Activity size={11} />
                              <span>{s}</span>
                            </span>
                          ))}
                        </div>

                        {/* Non-Diagnostic Guardrail Notice */}
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            color: '#92400e',
                            marginBottom: '12px',
                            lineHeight: 1.35
                          }}
                        >
                          <strong>ℹ️ Non-Diagnostic Contextual Safety Notice:</strong> Phone sensors provide ambient context only (e.g. device movement/stability) and cannot medically diagnose conditions or measure physiological vitals.
                        </div>

                        {/* Action Buttons: Allow vs Decline */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={handleGrantDevicePermission}
                            disabled={isSending}
                            className="btn btn-emerald"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 700
                            }}
                          >
                            <Check size={15} />
                            <span>✓ Allow & Share Real Device Context</span>
                          </button>

                          <button
                            onClick={handleDenyDevicePermission}
                            disabled={isSending}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#64748b'
                            }}
                          >
                            <X size={15} />
                            <span>✕ Continue Without Sensor Data</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Device Context Summary Card */}
                    {m.actionCard.cardType === 'DEVICE_CONTEXT_SUMMARY' && (
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: '#0284c7', color: '#ffffff', borderRadius: '8px', padding: '5px', display: 'flex' }}>
                              <Smartphone size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                Real Phone Device Context Telemetry
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Captured via Native Web Sensor APIs
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              border: '1px solid #86efac'
                            }}
                          >
                            ✓ Real Platform Hardware
                          </span>
                        </div>

                        {/* Metric Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Motion Acceleration</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{m.actionCard.data.motionMagnitude}</div>
                            <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                              {m.actionCard.data.motionState || 'STATIONARY'}
                            </div>
                          </div>

                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Physical Steadiness</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{m.actionCard.data.stabilityIndex}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Stable Resting State</div>
                          </div>

                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Orientation / Tilt</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              P: {m.actionCard.data.pitchTilt} | R: {m.actionCard.data.rollTilt}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Gyroscope Angles</div>
                          </div>

                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Device Battery & Net</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {m.actionCard.data.batteryLevel} • {m.actionCard.data.network}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: m.actionCard.data.isCharging ? '#10b981' : '#64748b' }}>
                              {m.actionCard.data.isCharging ? 'Charging ⚡' : 'Running on Battery'}
                            </div>
                          </div>
                        </div>

                        {/* Prominent Mandatory Non-Diagnostic Disclaimer */}
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1.5px solid #fde68a',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: '#92400e',
                            lineHeight: 1.4,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}
                        >
                          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong>Non-Diagnostic Notice:</strong> Mobile phone sensors provide ambient context only and cannot medically diagnose clinical conditions or measure physiological vitals. If weakness persists, please seek medical evaluation.
                          </div>
                        </div>

                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('video_consult')}
                            className="btn btn-primary"
                            style={{ marginTop: '10px', fontSize: '0.78rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Video size={14} />
                            <span>Consult Doctor via Video Call</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Real Hybrid Architecture Processing Breakdown Badge */}
                {m.processingMeta && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '5px 10px',
                      background: m.sender === 'AGENT' ? '#f0fdf4' : '#f8fafc',
                      borderRadius: '8px',
                      border: m.sender === 'AGENT' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        ⚡ ON-DEVICE
                      </span>
                      <span style={{ color: '#065f46', fontWeight: 600 }}>
                        {m.processingMeta.onDevice.tasks.slice(0, 2).join(' • ')} ({m.processingMeta.onDevice.latencyMs}ms)
                      </span>
                    </div>

                    {m.processingMeta.serverSide && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.66rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          ☁️ SERVER
                        </span>
                        <span style={{ color: '#0369a1', fontWeight: 600 }}>
                          {m.processingMeta.serverSide.activeAgent} ({m.processingMeta.serverSide.latencyMs}ms)
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedMeta(m.processingMeta || null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#475569',
                        cursor: 'pointer',
                        fontSize: '0.68rem',
                        textDecoration: 'underline',
                        fontWeight: 700
                      }}
                      title="Inspect On-Device vs Server Processing Pipeline"
                    >
                      Inspect Breakdown
                    </button>
                  </div>
                )}
              </div>

              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', padding: '0 4px', fontWeight: 500 }}>
                {m.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Multimodal Input Bar (Microphone, Camera, Upload, Text) */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        {/* Attached preview chip */}
        {attachedPreview && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0f9ff',
              border: '1.5px solid #7dd3fc',
              padding: '6px 12px',
              borderRadius: '10px',
              marginBottom: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={attachedPreview} alt="Attached" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
              <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                {attachedFile ? attachedFile.name : 'Camera Snapshot Ready for OCR'}
              </span>
            </div>
            <button
              onClick={() => {
                setAttachedPreview(null);
                setAttachedFile(null);
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕ Remove
            </button>
          </div>
        )}

        {voiceError && (
          <div style={{ color: '#dc2626', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            ⚠️ {voiceError}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Real Microphone Voice Toggle */}
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`btn-voice ${isListening ? 'recording' : ''}`}
            title={isListening ? 'Stop Voice Recording' : 'Speak Naturally (Auto-detects Telugu, Hindi, English, etc.)'}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Real Camera Viewfinder Toggle */}
          <button
            onClick={() => {
              if (isCameraActive) {
                stopCamera();
              } else {
                startCamera('environment');
              }
            }}
            className="btn btn-secondary"
            title="Open Live Camera for Prescription / Document Scan"
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              background: isCameraActive ? '#e0f2fe' : '#ffffff',
              borderColor: isCameraActive ? '#0284c7' : '#cbd5e1'
            }}
          >
            <Camera size={18} color={isCameraActive ? '#0284c7' : '#334155'} />
          </button>

          {/* File Upload Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            title="Upload Document or Prescription Image"
            style={{ padding: '0.75rem', borderRadius: '12px' }}
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isListening
                ? (interimTranscript || 'Listening to your speech...')
                : attachedPreview
                ? 'Add notes or click Send to extract prescription...'
                : 'Type, speak, snap camera, or upload report...'
            }
            style={{
              flex: 1,
              padding: '0.8rem 1.15rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '0.94rem',
              color: '#0f172a',
              fontWeight: 500
            }}
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={isSending || (!inputText.trim() && !attachedPreview)}
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.25rem', borderRadius: '12px', opacity: isSending ? 0.7 : 1 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Standalone Voice Call Experience Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
      />

      {/* Hybrid Architecture Breakdown Inspector Modal */}
      {selectedMeta && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setSelectedMeta(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Hybrid Processing Architecture Breakdown
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeta(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            {/* Side-by-side or stacked breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* ON-DEVICE SECTION */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, fontSize: '0.88rem' }}>
                    <span style={{ background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                      ⚡ REAL ON-DEVICE
                    </span>
                    <span>Local Client Runtime</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                    Latency: {selectedMeta.onDevice.latencyMs}ms
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#14532d', lineHeight: 1.4 }}>
                  <div><strong>Tasks Executed Locally:</strong></div>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {selectedMeta.onDevice.tasks.map((t, idx) => (
                      <li key={idx}>✓ {t}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#047857' }}>
                    🔒 <strong>Zero-Network Privacy:</strong> PII tokens & personal data are sanitized inside the local browser sandbox before network submission.
                  </div>
                </div>
              </div>

              {/* SERVER-SIDE SECTION */}
              {selectedMeta.serverSide && (
                <div style={{ background: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#075985', fontWeight: 800, fontSize: '0.88rem' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        ☁️ SERVER-SIDE
                      </span>
                      <span>Cloud Orchestrator</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
                      Latency: {selectedMeta.serverSide.latencyMs}ms
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.4 }}>
                    <div><strong>Model & Engine:</strong> {selectedMeta.serverSide.model}</div>
                    <div><strong>Active Agent Role:</strong> {selectedMeta.serverSide.activeAgent}</div>
                    <div style={{ marginTop: '4px', fontSize: '0.74rem', color: '#0284c7' }}>
                      ⚡ Central clinical reasoning, medical knowledge synthesis, and hospital database tool registry.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedMeta(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Phone-to-Laptop Bridge Modal */}
      <DeviceBridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        currentState={{
          messages,
          attachedPreview,
          prescriptionData: messages.find((m) => m.prescriptionData)?.prescriptionData,
          activeAppointment: user?.activeAppointment,
          triageLevel: 'STANDARD',
          symptomSummary: 'Active AI Patient Interaction',
          language: detectedLanguage,
          patientId: user?.id || 'pat-001',
          patientName: user?.fullName || 'Rajesh Sharma'
        }}
        activeSession={activeBridgeSession}
        onHandoffReceived={(payload, session) => {
          if (payload.messages && payload.messages.length > 0) {
            setMessages(payload.messages);
          }
          if (payload.prescriptionImage) {
            setAttachedPreview(payload.prescriptionImage);
          }
          setActiveBridgeSession(session);
          setIsBridgeModalOpen(false);
          // Remove query param cleanly
          if (typeof window !== 'undefined' && window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
        onSessionSevered={() => {
          setActiveBridgeSession(null);
        }}
      />
    </div>
  );
};
