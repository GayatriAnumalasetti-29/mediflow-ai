import { BridgeSession, PatientHandoffPayload, DeviceTelemetry } from '@mediflow/shared';
import crypto from 'crypto';

// In-memory registry of active bridge sessions
const activeSessionsByPin = new Map<string, BridgeSession>();
const activeSessionsById = new Map<string, BridgeSession>();

// 10-Minute Session TTL in milliseconds
export const HANDOFF_TTL_MS = 10 * 60 * 1000;

class BridgeService {
  /**
   * Generates a cryptographically randomized 6-digit numeric PIN code
   */
  private generateUniquePin(): string {
    let pin: string;
    let attempts = 0;
    do {
      pin = crypto.randomInt(100000, 999999).toString();
      attempts++;
      if (attempts > 1000) {
        // Clear any expired sessions to free up space
        this.cleanupExpiredSessions();
      }
    } while (activeSessionsByPin.has(pin));
    return pin;
  }

  /**
   * Creates a new bridge session (for either Doctor Telemetry or Patient Handoff)
   */
  public createSession(options: {
    patientId?: string;
    patientName?: string;
    doctorName?: string;
    sessionType?: 'DOCTOR_TELEMETRY' | 'PATIENT_HANDOFF';
    handoffData?: PatientHandoffPayload;
    initiatingDevice?: string;
  }): BridgeSession {
    const pin = this.generateUniquePin();
    const sessionId = `bridge-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HANDOFF_TTL_MS).toISOString();

    const session: BridgeSession = {
      sessionId,
      pinCode: pin,
      patientId: options.patientId || 'pat-001',
      patientName: options.patientName || 'Rajesh Sharma',
      doctorName: options.doctorName || 'Dr. Priya Varma',
      sessionType: options.sessionType || 'PATIENT_HANDOFF',
      connectedDevice: null,
      status: 'WAITING',
      createdAt: now.toISOString(),
      expiresAt,
      authorizedDevices: options.initiatingDevice ? [options.initiatingDevice] : [],
      isRevoked: false,
      handoffData: options.handoffData
        ? {
            ...options.handoffData,
            sessionId,
            updatedAt: now.toISOString()
          }
        : undefined
    };

    activeSessionsByPin.set(pin, session);
    activeSessionsById.set(sessionId, session);

    console.log(`[BridgeService] Created ${session.sessionType} session ${sessionId} (PIN: ${pin}, TTL: 10m)`);
    return session;
  }

  /**
   * Authorizes a device to join a bridge session using the 6-digit PIN
   */
  public authorizeJoin(pinCode: string, deviceName: string): BridgeSession {
    const cleanedPin = pinCode.trim();
    const session = activeSessionsByPin.get(cleanedPin);

    if (!session) {
      throw new Error('Invalid or unassigned Bridge PIN code. Please verify the 6-digit code on the source screen.');
    }

    if (session.isRevoked) {
      throw new Error('This bridge session was disconnected or revoked by the patient.');
    }

    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      // Evict expired session
      activeSessionsByPin.delete(cleanedPin);
      activeSessionsById.delete(session.sessionId);
      throw new Error('This handoff PIN has expired for patient security. Please generate a fresh code on your phone.');
    }

    session.connectedDevice = deviceName;
    session.status = 'CONNECTED';

    if (!session.authorizedDevices) {
      session.authorizedDevices = [];
    }
    if (!session.authorizedDevices.includes(deviceName)) {
      session.authorizedDevices.push(deviceName);
    }

    console.log(`[BridgeService] Authorized device "${deviceName}" for session ${session.sessionId}`);
    return session;
  }

  /**
   * Updates handoff state (e.g. synchronized chat messages or documents)
   */
  public updateHandoffState(sessionId: string, partialHandoff: Partial<PatientHandoffPayload>): BridgeSession {
    const session = activeSessionsById.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.isRevoked) {
      throw new Error('Cannot update revoked session');
    }

    const currentData = session.handoffData || {
      sessionId,
      patientId: session.patientId,
      patientName: session.patientName,
      messages: [],
      updatedAt: new Date().toISOString()
    };

    session.handoffData = {
      ...currentData,
      ...partialHandoff,
      updatedAt: new Date().toISOString()
    };

    return session;
  }

  /**
   * Severs/disconnects an active session, de-authorizing all devices immediately
   */
  public severSession(sessionId: string): BridgeSession | null {
    const session = activeSessionsById.get(sessionId);
    if (!session) return null;

    session.status = 'DISCONNECTED';
    session.isRevoked = true;
    session.connectedDevice = null;

    // Remove PIN so it can't be reused
    activeSessionsByPin.delete(session.pinCode);

    // Keep session ID marked as revoked for a short window, then evict
    setTimeout(() => {
      activeSessionsById.delete(sessionId);
    }, 30000);

    console.log(`[BridgeService] Severed and de-authorized session ${sessionId}`);
    return session;
  }

  /**
   * Retrieves a session by PIN
   */
  public getSessionByPin(pinCode: string): BridgeSession | null {
    const session = activeSessionsByPin.get(pinCode.trim());
    if (!session) return null;

    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      activeSessionsByPin.delete(pinCode.trim());
      activeSessionsById.delete(session.sessionId);
      return null;
    }

    return session;
  }

  /**
   * Retrieves a session by Session ID
   */
  public getSessionById(sessionId: string): BridgeSession | null {
    const session = activeSessionsById.get(sessionId);
    if (!session) return null;

    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      if (session.pinCode) activeSessionsByPin.delete(session.pinCode);
      activeSessionsById.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Cleanup expired sessions
   */
  public cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [pin, session] of activeSessionsByPin.entries()) {
      if (session.expiresAt && new Date(session.expiresAt).getTime() < now) {
        activeSessionsByPin.delete(pin);
        activeSessionsById.delete(session.sessionId);
      }
    }
  }
}

export const bridgeService = new BridgeService();

// Prune expired sessions every 60 seconds
setInterval(() => {
  bridgeService.cleanupExpiredSessions();
}, 60000);
