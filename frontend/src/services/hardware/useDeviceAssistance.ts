import { useState, useEffect, useRef, useCallback } from 'react';
import { DeviceAssistanceTelemetry } from '@mediflow/shared';

export interface DeviceAssistanceState {
  isSupported: boolean;
  permissionGranted: boolean;
  isSamplingActive: boolean;
  currentTelemetry: DeviceAssistanceTelemetry | null;
  requestPermissionAndSample: () => Promise<DeviceAssistanceTelemetry>;
  stopSampling: () => void;
  getInstantSnapshot: () => DeviceAssistanceTelemetry;
}

export const useDeviceAssistance = (): DeviceAssistanceState => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isSamplingActive, setIsSamplingActive] = useState<boolean>(false);
  const [currentTelemetry, setCurrentTelemetry] = useState<DeviceAssistanceTelemetry | null>(null);

  // Mutable refs for high-frequency sensor readings (avoid React re-render thrashing)
  const currentMotion = useRef<{ x: number; y: number; z: number; mag: number }>({ x: 0, y: 0, z: 9.8, mag: 9.8 });
  const currentTilt = useRef<{ alpha: number | null; beta: number | null; gamma: number | null }>({
    alpha: null,
    beta: null,
    gamma: null
  });
  const recentMagnitudes = useRef<number[]>([]);
  const batteryInfo = useRef<{ level: number; charging: boolean }>({ level: 85, charging: false });
  const networkInfo = useRef<{ online: boolean; effectiveType?: string; downlinkMbps?: number; rttMs?: number }>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g'
  });

  // 1. Detect hardware support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMotion = 'DeviceMotionEvent' in window || 'ondevicemotion' in window;
      const hasOrientation = 'DeviceOrientationEvent' in window || 'ondeviceorientation' in window;
      setIsSupported(hasMotion || hasOrientation);
    }
  }, []);

  // 2. Battery Status API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInfo.current = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };

        const updateBattery = () => {
          batteryInfo.current = {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          };
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {
        // Fallback
      });
    }
  }, []);

  // 3. Network Status API
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const conn = (navigator as any).connection;
      if (conn) {
        networkInfo.current = {
          online: navigator.onLine,
          effectiveType: conn.effectiveType || '4g',
          downlinkMbps: conn.downlink,
          rttMs: conn.rtt
        };

        const updateNet = () => {
          networkInfo.current = {
            online: navigator.onLine,
            effectiveType: conn.effectiveType || '4g',
            downlinkMbps: conn.downlink,
            rttMs: conn.rtt
          };
        };

        conn.addEventListener('change', updateNet);
      }

      const handleOnline = () => {
        networkInfo.current.online = true;
      };
      const handleOffline = () => {
        networkInfo.current.online = false;
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 4. Real DeviceMotionEvent Listener
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 9.8;
    const mag = Math.sqrt(x * x + y * y + z * z);

    currentMotion.current = { x, y, z, mag };

    // Sliding window of magnitudes to calculate physical stability index
    recentMagnitudes.current.push(mag);
    if (recentMagnitudes.current.length > 25) {
      recentMagnitudes.current.shift();
    }
  }, []);

  // 5. Real DeviceOrientationEvent Listener
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    currentTilt.current = {
      alpha: event.alpha !== null ? parseFloat(event.alpha.toFixed(1)) : null,
      beta: event.beta !== null ? parseFloat(event.beta.toFixed(1)) : null,
      gamma: event.gamma !== null ? parseFloat(event.gamma.toFixed(1)) : null
    };
  }, []);

  // Helper to construct a validated telemetry snapshot
  const getInstantSnapshot = useCallback((): DeviceAssistanceTelemetry => {
    const mag = parseFloat(currentMotion.current.mag.toFixed(2));
    
    // Calculate physical stability % based on acceleration variance around mean
    let stability = 95;
    if (recentMagnitudes.current.length >= 5) {
      const avg = recentMagnitudes.current.reduce((a, b) => a + b, 0) / recentMagnitudes.current.length;
      const variance = recentMagnitudes.current.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recentMagnitudes.current.length;
      const stdDev = Math.sqrt(variance);
      // Lower variance = higher steadiness (100% = perfectly stationary)
      stability = Math.max(20, Math.min(99, Math.round(100 - (stdDev * 15))));
    }

    let motionState: 'STATIONARY' | 'SLIGHT_MOVEMENT' | 'ACTIVE_WALKING' | 'UNSTEADY' = 'STATIONARY';
    if (mag > 14.0) {
      motionState = 'ACTIVE_WALKING';
    } else if (mag > 10.8 || stability < 70) {
      motionState = 'SLIGHT_MOVEMENT';
    } else {
      motionState = 'STATIONARY';
    }

    const telemetry: DeviceAssistanceTelemetry = {
      motionMagnitude: mag,
      stabilityIndex: stability,
      motionState,
      tilt: {
        alpha: currentTilt.current.alpha,
        beta: currentTilt.current.beta,
        gamma: currentTilt.current.gamma
      },
      battery: {
        level: batteryInfo.current.level,
        charging: batteryInfo.current.charging
      },
      network: {
        online: networkInfo.current.online,
        effectiveType: networkInfo.current.effectiveType,
        downlinkMbps: networkInfo.current.downlinkMbps,
        rttMs: networkInfo.current.rttMs
      },
      isRealHardware: typeof window !== 'undefined' && ('DeviceMotionEvent' in window || 'ondevicemotion' in window),
      timestamp: new Date().toISOString()
    };

    setCurrentTelemetry(telemetry);
    return telemetry;
  }, []);

  // Request explicit permission and sample real hardware
  const requestPermissionAndSample = async (): Promise<DeviceAssistanceTelemetry> => {
    if (typeof window === 'undefined') {
      return getInstantSnapshot();
    }

    // Handle iOS 13+ permission flow
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
          throw new Error('Permission denied by user');
        }
      } catch (err) {
        setPermissionGranted(false);
        throw err;
      }
    } else {
      setPermissionGranted(true);
    }

    // Attach native event listeners
    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    setIsSamplingActive(true);

    // Wait a brief 350ms window to collect high-fidelity real sensor readings
    await new Promise((resolve) => setTimeout(resolve, 350));

    const snapshot = getInstantSnapshot();
    return snapshot;
  };

  const stopSampling = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
    setIsSamplingActive(false);
  }, [handleDeviceMotion, handleDeviceOrientation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSampling();
    };
  }, [stopSampling]);

  return {
    isSupported,
    permissionGranted,
    isSamplingActive,
    currentTelemetry,
    requestPermissionAndSample,
    stopSampling,
    getInstantSnapshot
  };
};
