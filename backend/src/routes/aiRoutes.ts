import { Router } from 'express';
import { aiOrchestratorController } from '../controllers/aiOrchestratorController';

const router = Router();

router.post('/chat', aiOrchestratorController.chat);
router.post('/tool-execute', aiOrchestratorController.executeTool);
router.post('/detect-language', aiOrchestratorController.detectLanguage);
router.post('/transcribe', aiOrchestratorController.transcribe);
router.post('/synthesize-speech', aiOrchestratorController.synthesizeSpeech);

export default router;
