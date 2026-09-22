import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';

const router = Router();

router.get('/patient/:patientId', notificationController.getNotifications);
router.post('/mark-read/:id', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.get('/preferences/:patientId', notificationController.getPreferences);
router.put('/preferences/:patientId', notificationController.updatePreferences);

export default router;
