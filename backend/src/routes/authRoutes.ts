import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateJwt, authController.getCurrentUser);

export default router;
