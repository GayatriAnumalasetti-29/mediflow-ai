import { Router } from 'express';
import { therapyController } from '../controllers/therapyController';

const router = Router();

router.get('/patient/:patientId', therapyController.getPatientTherapy);

export default router;
