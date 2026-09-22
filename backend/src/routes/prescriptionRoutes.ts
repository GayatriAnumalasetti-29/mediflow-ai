import { Router } from 'express';
import { prescriptionController } from '../controllers/prescriptionController';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.post('/upload', upload.single('image'), prescriptionController.uploadPrescription);
router.post('/:id/verify', prescriptionController.verifyPrescription);
router.post('/verify/:id', prescriptionController.verifyPrescription);

export default router;
