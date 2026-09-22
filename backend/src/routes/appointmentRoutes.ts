import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';
import {
  validateRequest,
  BookAppointmentSchema,
  RescheduleAppointmentSchema,
  CheckInSchema
} from '../middleware/validationMiddleware';
import { sensitiveEndpointLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', appointmentController.getAppointments);
router.get('/patient/:patientId', appointmentController.getPatientAppointments);
router.get('/slots/available', appointmentController.getAvailableSlots);
router.get('/queue/live', appointmentController.getQueueStatus);

router.post(
  '/book',
  sensitiveEndpointLimiter,
  validateRequest({ body: BookAppointmentSchema }),
  appointmentController.bookAppointment
);

router.post(
  '/check-in/:id',
  validateRequest({ params: CheckInSchema }),
  appointmentController.checkInAppointment
);

router.post(
  '/join/:id',
  validateRequest({ params: CheckInSchema }),
  appointmentController.joinVirtualMeet
);

router.post(
  '/missed/:id',
  validateRequest({ params: CheckInSchema }),
  appointmentController.evaluateMissedAppointment
);

router.post(
  '/reschedule/:id',
  sensitiveEndpointLimiter,
  validateRequest({ params: CheckInSchema, body: RescheduleAppointmentSchema }),
  appointmentController.rescheduleAppointment
);

router.post(
  '/reminder/:id',
  validateRequest({ params: CheckInSchema }),
  appointmentController.setAppointmentReminder
);

router.post(
  '/cancel/:id',
  validateRequest({ params: CheckInSchema }),
  appointmentController.cancelAppointment
);

export default router;
