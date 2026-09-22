import { Router, Request, Response } from 'express';
import { bridgeService } from '../services/bridgeService';

const router = Router();

/**
 * POST /api/bridge/initiate
 * Initiates a patient handoff session from mobile/phone
 */
router.post('/initiate', (req: Request, res: Response) => {
  try {
    const { patientId, patientName, handoffData } = req.body;
    const session = bridgeService.createSession({
      patientId,
      patientName,
      sessionType: 'PATIENT_HANDOFF',
      handoffData,
      initiatingDevice: req.headers['user-agent']?.includes('Mobile') ? 'Patient Smartphone' : 'Source Device'
    });

    return res.status(201).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        pinCode: session.pinCode,
        status: session.status,
        expiresAt: session.expiresAt,
        sessionType: session.sessionType
      }
    });
  } catch (err: any) {
    console.error('[BridgeRoutes] Error initiating session:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate bridge session' });
  }
});

/**
 * POST /api/bridge/authorize
 * Authorizes a laptop/desktop device using the 6-digit PIN and returns the handoff payload
 */
router.post('/authorize', (req: Request, res: Response) => {
  try {
    const { pinCode, deviceName } = req.body;
    if (!pinCode) {
      return res.status(400).json({ success: false, message: '6-digit PIN code is required' });
    }

    const device = deviceName || (req.headers['user-agent']?.includes('Mobile') ? 'Mobile Companion' : 'Laptop Workstation');
    const session = bridgeService.authorizeJoin(pinCode, device);

    return res.status(200).json({
      success: true,
      session,
      handoffData: session.handoffData
    });
  } catch (err: any) {
    console.warn('[BridgeRoutes] Authorization rejected:', err.message);
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized: Invalid or expired bridge PIN.'
    });
  }
});

/**
 * GET /api/bridge/status/:pin
 * Verifies PIN existence and expiration without leaking medical records
 */
router.get('/status/:pin', (req: Request, res: Response) => {
  try {
    const session = bridgeService.getSessionByPin(req.params.pin);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired Bridge PIN code'
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      status: session.status,
      sessionType: session.sessionType,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error checking bridge status' });
  }
});

/**
 * POST /api/bridge/sever
 * Explicitly terminates and de-authorizes an active bridge session
 */
router.post('/sever', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const severed = bridgeService.severSession(sessionId);
    return res.status(200).json({
      success: true,
      message: 'Bridge session successfully severed and de-authorized.',
      severed
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error severing bridge session' });
  }
});

export default router;
