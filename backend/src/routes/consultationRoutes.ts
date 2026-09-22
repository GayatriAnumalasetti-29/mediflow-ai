import { Router } from 'express';
import { consultationController } from '../controllers/consultationController';

const router = Router();

router.post('/session', consultationController.createSession);
router.post('/summarize', consultationController.summarizeSession);

export default router;
