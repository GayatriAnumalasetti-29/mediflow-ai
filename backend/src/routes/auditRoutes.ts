import { Router } from 'express';
import { auditController } from '../controllers/auditController';

const router = Router();

router.get('/', auditController.getAuditLogs);
router.get('/logs', auditController.getAuditLogs);
router.post('/record', auditController.recordCustomEvent);

export default router;
