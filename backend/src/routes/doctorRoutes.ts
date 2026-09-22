import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';

const router = Router();

router.get('/', doctorController.getAllDoctors);
router.get('/departments', doctorController.getDepartments);
router.get('/:id/slots', doctorController.getDoctorSlots);

export default router;
