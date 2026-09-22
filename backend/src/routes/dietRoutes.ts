import { Router } from 'express';
import { dietController } from '../controllers/dietController';

const router = Router();

router.get('/patient/:patientId', dietController.getPatientDiet);

export default router;
