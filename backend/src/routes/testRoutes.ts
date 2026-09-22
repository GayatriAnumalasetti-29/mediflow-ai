import { Router } from 'express';
import { testRunnerController } from '../controllers/testRunnerController';

const router = Router();

router.get('/run-all', testRunnerController.runAllTests);
router.post('/run-all', testRunnerController.runAllTests);
router.get('/all', testRunnerController.runAllTests);
router.post('/all', testRunnerController.runAllTests);
router.post('/simulate-failure', testRunnerController.simulateFailure);

export default router;
