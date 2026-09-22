import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  BridgeSession,
  DeviceTelemetry,
  RemoteScanPayload,
  NurseCallAlert,
  PatientHandoffPayload
} from '@mediflow/shared';
import { bridgeService } from '../services/bridgeService';

export const setupBridgeHandlers = (io: SocketIOServer, socket: Socket): void => {
  // 1. Doctor / Staff creates a bridge pairing session from laptop (existing Office Kit flow)
  socket.on('bridge:create_session', (payload: { patientId?: string; patientName?: string; doctorName?: string }) => {
    try {
      const session = bridgeService.createSession({
        patientId: payload?.patientId,
        patientName: payload?.patientName,
        doctorName: payload?.doctorName || 'Dr. Priya Varma',
        sessionType: 'DOCTOR_TELEMETRY',
        initiatingDevice: 'Doctor Workstation (Laptop)'
      });

      // Join doctor socket to room
      socket.join(`bridge:${session.sessionId}`);
      console.log(`[Bridge] Doctor created session ${session.sessionId} with PIN ${session.pinCode}`);

      socket.emit('bridge:session_created', session);
    } catch (err: any) {
      console.error('[Bridge] Error creating session:', err);
      socket.emit('bridge:error', { message: 'Failed to create bridge session' });
    }
  });

  // 2. Patient initiates a secure Phone-to-Laptop Handoff session from mobile
  socket.on('bridge:initiate_patient_handoff', (payload: {
    patientId?: string;
    patientName?: string;
    handoffData?: PatientHandoffPayload;
  }) => {
    try {
      const deviceLabel = socket.handshake.headers['user-agent']?.includes('Mobile')
        ? 'Patient Smartphone'
        : 'Patient Client Device';

      const session = bridgeService.createSession({
        patientId: payload?.patientId,
        patientName: payload?.patientName,
        sessionType: 'PATIENT_HANDOFF',
        handoffData: payload?.handoffData,
        initiatingDevice: deviceLabel
      });

      socket.join(`bridge:${session.sessionId}`);
      console.log(`[Bridge] Patient initiated handoff session ${session.sessionId} with PIN ${session.pinCode}`);

      socket.emit('bridge:handoff_initiated', session);
    } catch (err: any) {
      console.error('[Bridge] Error initiating patient handoff:', err);
      socket.emit('bridge:error', { message: 'Failed to initiate patient handoff' });
    }
  });

  // 3. Laptop / Companion joins via PIN or QR code (Universal Join)
  socket.on('bridge:join_session', (payload: { pinCode: string; deviceName?: string }) => {
    try {
      const pin = payload.pinCode?.trim();
      const defaultDeviceLabel = socket.handshake.headers['user-agent']?.includes('Mobile')
        ? 'Smartphone Companion'
        : 'Laptop Workstation';
      const deviceLabel = payload.deviceName || defaultDeviceLabel;

      const session = bridgeService.authorizeJoin(pin, deviceLabel);

      socket.join(`bridge:${session.sessionId}`);
      console.log(`[Bridge] Device "${deviceLabel}" successfully joined session ${session.sessionId} (${session.sessionType})`);

      // Emit success to connecting device
      socket.emit('bridge:join_success', session);

      // If this is a patient handoff session, emit full authorized handoff payload
      if (session.sessionType === 'PATIENT_HANDOFF') {
        socket.emit('bridge:handoff_authorized', {
          session,
          handoffData: session.handoffData
        });
      }

      // Notify peer device in the room that counterpart has connected
      io.to(`bridge:${session.sessionId}`).emit('bridge:device_connected', {
        sessionId: session.sessionId,
        deviceName: deviceLabel,
        connectedAt: new Date().toISOString(),
        authorizedDevices: session.authorizedDevices
      });
    } catch (err: any) {
      console.error('[Bridge] Join error:', err.message);
      socket.emit('bridge:error', { message: err.message || 'Failed to join bridge session' });
    }
  });

  // 4. Bi-directional Patient Handoff State Synchronization
  socket.on('bridge:sync_handoff', (payload: { sessionId: string; update: Partial<PatientHandoffPayload> }) => {
    try {
      if (!payload?.sessionId || !payload?.update) return;

      const updatedSession = bridgeService.updateHandoffState(payload.sessionId, payload.update);

      // Broadcast update to all other devices in the bridge room
      socket.to(`bridge:${payload.sessionId}`).emit('bridge:handoff_synced', {
        sessionId: payload.sessionId,
        update: payload.update,
        handoffData: updatedSession.handoffData,
        syncedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('[Bridge] Handoff sync error:', err.message);
      socket.emit('bridge:error', { message: 'Failed to synchronize bridge state' });
    }
  });

  // 5. Explicit Session Sever / Disconnect (One-Click Revocation)
  socket.on('bridge:sever_session', (payload: { sessionId: string }) => {
    try {
      if (!payload?.sessionId) return;

      console.log(`[Bridge] Severing session ${payload.sessionId} upon user request`);
      const severedSession = bridgeService.severSession(payload.sessionId);

      // Broadcast severance to all devices connected to this bridge room
      io.to(`bridge:${payload.sessionId}`).emit('bridge:session_severed', {
        sessionId: payload.sessionId,
        message: 'The bridge session has been severed and de-authorized for patient privacy.',
        severedAt: new Date().toISOString()
      });

      // Leave socket room
      socket.leave(`bridge:${payload.sessionId}`);
    } catch (err: any) {
      console.error('[Bridge] Error severing session:', err);
    }
  });

  // 6. Mobile companion streams real-time sensor & PPG vitals telemetry (Office Kit)
  socket.on('bridge:telemetry_stream', (payload: { sessionId: string; telemetry: DeviceTelemetry }) => {
    if (!payload?.sessionId || !payload?.telemetry) return;

    const session = bridgeService.getSessionById(payload.sessionId);
    if (session && session.status !== 'STREAMING') {
      session.status = 'STREAMING';
    }

    // Broadcast live telemetry to doctor screen
    io.to(`bridge:${payload.sessionId}`).emit('bridge:telemetry_update', payload.telemetry);
  });

  // 7. Remote Camera Scan beam to doctor workstation (Office Kit)
  socket.on('bridge:remote_scan', (payload: RemoteScanPayload) => {
    if (!payload?.sessionId || !payload?.imageDataUrl) return;

    console.log(`[Bridge] Remote scan received for session ${payload.sessionId} (${payload.scanType})`);
    io.to(`bridge:${payload.sessionId}`).emit('bridge:scan_received', payload);
  });

  // 8. Remote Bedside Nurse Call / Emergency SOS trigger (Office Kit)
  socket.on('bridge:trigger_nurse_call', (alert: NurseCallAlert) => {
    if (!alert?.sessionId) return;

    console.log(`[Bridge] 🚨 Bedside Nurse Call triggered: ${alert.priority} for ${alert.patientName}`);
    io.to(`bridge:${alert.sessionId}`).emit('bridge:nurse_call_alert', alert);
    io.to('staff_channel').emit('escalation_alert', {
      id: `alert-bridge-${Date.now()}`,
      patientId: alert.patientId,
      patientName: alert.patientName,
      sourceAgent: 'HackTracker Phone Bedside Companion',
      severity: alert.priority === 'EMERGENCY_SOS' ? 'CRITICAL' : 'HIGH',
      triggerReason: `Bedside wireless nurse call button pressed: ${alert.priority}`,
      reportedSymptoms: ['Wireless Bedside Emergency Call'],
      createdAt: new Date().toISOString()
    });
  });

  // 9. Query session status
  socket.on('bridge:query_session', (payload: { sessionId: string }) => {
    const session = bridgeService.getSessionById(payload.sessionId);
    if (session) {
      socket.emit('bridge:session_status', session);
    }
  });
};
