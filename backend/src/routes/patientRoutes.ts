import { Router } from 'express';
import { patientController } from '../controllers/patientController';

const router = Router();

router.get('/', patientController.getAllPatients);
router.post('/register', patientController.registerPatient);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);

export default router;
