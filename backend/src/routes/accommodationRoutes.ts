import { Router } from 'express';
import { accommodationController } from '../controllers/accommodationController';

const router = Router();

router.get('/rooms', accommodationController.getRooms);
router.post('/allocate', accommodationController.allocateBed);
router.post('/admit', accommodationController.admitPatient);
router.post('/discharge', accommodationController.dischargePatient);
router.put('/beds/:bedId/status', accommodationController.updateBedStatus);

export default router;
