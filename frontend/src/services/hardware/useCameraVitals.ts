import { useState, useRef, useEffect, useCallback } from 'react';

export interface CameraVitalsState {
  isScanning: boolean;
  isFingerDetected: boolean;
  bpm: number | null;
  confidence: number;
  pulseWaveform: number[];
  hasTorch: boolean;
  torchEnabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  toggleTorch: () => Promise<void>;
  errorMessage: string | null;
}

export const useCameraVitals = (): CameraVitalsState => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isFingerDetected, setIsFingerDetected] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [pulseWaveform, setPulseWaveform] = useState<number[]>([]);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Optical signal buffer
  const signalBuffer = useRef<number[]>([]);
  const peakTimes = useRef<number[]>([]);
  const lastSampleTime = useRef<number>(Date.now());

  // Bandpass / Peak detection for PPG
  const processFrame = useCallback(() => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Sample a 40x40 patch from center of camera frame
    const width = 40;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    try {
      ctx.drawImage(video, (video.videoWidth - width) / 2, (video.videoHeight - height) / 2, width, height, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      const totalPixels = width * height;

      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }

      const rAvg = rSum / totalPixels;
      const gAvg = gSum / totalPixels;
      const bAvg = bSum / totalPixels;

      // Finger Detection Logic:
      // High red dominance with sufficient absorption of green/blue light
      const fingerOnLens = rAvg > 90 && rAvg > (gAvg + bAvg) * 0.9;
      setIsFingerDetected(fingerOnLens);

      if (fingerOnLens) {
        const now = Date.now();
        const rawIntensity = rAvg / (gAvg + bAvg + 1.0);

        signalBuffer.current.push(rawIntensity);
        if (signalBuffer.current.length > 120) {
          signalBuffer.current.shift();
        }

        // Generate normalized waveform points (-1 to 1) for visualizer
        const buf = signalBuffer.current;
        const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
        const normalized = buf.map((v) => parseFloat((v - mean).toFixed(3)));
        setPulseWaveform(normalized.slice(-40));

        // Peak detection algorithm with refractory period
        if (buf.length >= 45) {
          const currentVal = buf[buf.length - 1];
          const prevVal = buf[buf.length - 2];
          const prevPrevVal = buf[buf.length - 3];

          // Local maxima peak
          if (prevVal > prevPrevVal && prevVal > currentVal && prevVal > mean + 0.008) {
            const timeDiff = now - lastSampleTime.current;
            // Refractory window between heartbeats: 330ms (180 BPM) to 1330ms (45 BPM)
            if (timeDiff >= 330 && timeDiff <= 1330) {
              peakTimes.current.push(timeDiff);
              if (peakTimes.current.length > 8) {
                peakTimes.current.shift();
              }

              // Compute moving average BPM
              const avgIntervalMs = peakTimes.current.reduce((a, b) => a + b, 0) / peakTimes.current.length;
              const calculatedBpm = Math.round(60000 / avgIntervalMs);

              if (calculatedBpm >= 45 && calculatedBpm <= 165) {
                setBpm(calculatedBpm);
                setConfidence(Math.min(0.98, 0.70 + (peakTimes.current.length * 0.035)));
              }
            }
            lastSampleTime.current = now;
          }
        }
      } else {
        // Flatline wave when no finger is covering the lens
        setPulseWaveform((prev) => [...prev.slice(-39), 0]);
        setConfidence(0);
      }
    } catch (e) {
      console.warn('Frame processing exception:', e);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isScanning]);

  const startScanning = async () => {
    setErrorMessage(null);
    signalBuffer.current = [];
    peakTimes.current = [];

    try {
      // Prioritize rear/environment camera with flash torch
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if ((capabilities as any).torch) {
        setHasTorch(true);
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: true }]
          });
          setTorchEnabled(true);
        } catch {
          // Ignore torch restriction
        }
      } else {
        setHasTorch(false);
      }

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera stream error for PPG vitals:', err);
      setErrorMessage('Could not open camera stream. Ensure camera permissions are granted.');
    }
  };

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsFingerDetected(false);
    setTorchEnabled(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      const nextState = !torchEnabled;
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchEnabled(nextState);
      } catch (e) {
        console.warn('Torch toggle error:', e);
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, processFrame]);

  return {
    isScanning,
    isFingerDetected,
    bpm,
    confidence,
    pulseWaveform,
    hasTorch,
    torchEnabled,
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    toggleTorch,
    errorMessage
  };
};
