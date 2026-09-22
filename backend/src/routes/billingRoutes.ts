import { Router } from 'express';
import { billingController } from '../controllers/billingController';

const router = Router();

router.get('/patient/:patientId', billingController.getPatientBills);
router.post('/payment/record', billingController.recordPayment);
router.post('/authorize-discount', billingController.authorizeDiscount);
router.get('/invoice/:invoiceId/export', billingController.getInvoiceExportData);

export default router;
