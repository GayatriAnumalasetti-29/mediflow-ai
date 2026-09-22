import { Router } from 'express';
import { followUpController } from '../controllers/followUpController';

const router = Router();

router.get('/patient/:patientId', followUpController.getFollowUpLogs);
router.post('/log', followUpController.createFollowUpLog);
router.post('/confirm-dose', followUpController.confirmDose);
router.post('/snooze', followUpController.snoozeReminder);
router.get('/adherence-stats', followUpController.getAdherenceStats);
router.get('/escalations', followUpController.getEscalations);
router.post('/escalations/:id/resolve', followUpController.resolveEscalation);

export default router;
