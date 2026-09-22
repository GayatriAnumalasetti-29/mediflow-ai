import { Router } from 'express';
import { recoveryController } from '../controllers/recoveryController';

const router = Router();

router.get('/patient/:patientId/overview', recoveryController.getRecoveryOverview);
router.post('/activity/log', recoveryController.logActivity);
router.post('/therapy/attendance', recoveryController.logTherapyAttendance);
router.get('/journey-map', recoveryController.getJourneyMap);

export default router;
