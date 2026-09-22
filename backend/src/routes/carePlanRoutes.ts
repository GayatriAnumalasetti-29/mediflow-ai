import { Router } from 'express';
import { carePlanController } from '../controllers/carePlanController';

const router = Router();

router.get('/patient/:patientId/daily-timeline', carePlanController.getDailyTimeline);
router.post('/milestone/toggle', carePlanController.toggleMilestone);

export default router;
