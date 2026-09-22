import { Router } from 'express';
import { medicationController } from '../controllers/medicationController';

const router = Router();

router.get('/schedule/:patientId', medicationController.getSchedule);
router.post('/log-dose', medicationController.logDose);
router.post('/log', medicationController.logDose);
router.get('/adherence/:patientId', medicationController.getAdherence);

export default router;
