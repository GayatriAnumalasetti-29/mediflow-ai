import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { BillingStatus, NotificationType } from '@mediflow/shared';
import { HOSPITAL_TARIFF_CATALOG } from '../services/tariffService';

export const billingController = {
  getPatientBills: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const bills = mockDataService.bills.filter((b) => b.patientId === patientId);

    res.json({
      success: true,
      data: bills
    });
  },

  recordPayment: async (req: Request, res: Response): Promise<void> => {
    const { billId, amount, paymentMethod, transactionReference } = req.body;

    const bill = mockDataService.bills.find((b) => b.id === billId || b.invoiceNumber === billId);
    if (!bill) {
      res.status(404).json({ success: false, error: 'Bill record not found' });
      return;
    }

    const payNum = parseFloat(amount || '0');
    bill.amountPaid = (bill.amountPaid || 0) + payNum;
    bill.paidAmount = bill.amountPaid;
    bill.balanceDue = Math.max(0, bill.totalPayable - bill.amountPaid);

    if (bill.balanceDue <= 0) {
      bill.status = BillingStatus.PAID;
    } else {
      bill.status = BillingStatus.PARTIALLY_PAID;
    }

    mockDataService.notifications.unshift({
      id: `notif-${Date.now()}`,
      patientId: bill.patientId,
      title: 'Payment Received & Receipt Generated',
      message: `Payment of ₹${payNum.toFixed(2)} received via ${paymentMethod || 'Online UPI'}. Outstanding balance: ₹${bill.balanceDue.toFixed(2)}.`,
      type: NotificationType.BILLING_STATEMENT,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        invoiceNumber: bill.invoiceNumber,
        amountPaid: bill.amountPaid,
        paidAmount: bill.amountPaid,
        balanceDue: bill.balanceDue,
        status: bill.status,
        receiptNumber: `RCP-${Date.now()}`
      }
    });
  },

  authorizeDiscount: async (req: Request, res: Response): Promise<void> => {
    const { billId, discountAmount, discountReason, authorizedStaffId } = req.body;

    const bill = mockDataService.bills.find((b) => b.id === billId || b.invoiceNumber === billId);
    if (!bill) {
      res.status(404).json({ success: false, error: 'Bill record not found' });
      return;
    }

    const disc = parseFloat(discountAmount || '0');
    bill.discountAmount = (bill.discountAmount || 0) + disc;
    bill.totalPayable = Math.max(0, bill.totalPayable - disc);
    bill.totalAmount = bill.totalPayable;
    bill.balanceDue = Math.max(0, bill.totalPayable - (bill.amountPaid || 0));

    res.json({
      success: true,
      message: `Staff authorized discount of ₹${disc.toFixed(2)} applied to invoice ${bill.invoiceNumber}`,
      data: bill
    });
  },

  getInvoiceExportData: async (req: Request, res: Response): Promise<void> => {
    const { invoiceId } = req.params;
    const bill = mockDataService.bills.find((b) => b.invoiceNumber === invoiceId || b.id === invoiceId) || mockDataService.bills[0];

    res.json({
      success: true,
      data: {
        hospitalName: 'MediFlow Multi-Speciality Super Speciality Hospital',
        gstin: '36AAAAA0000A1Z5',
        taxRegistrationNumber: 'HYD-MED-2026-8812',
        address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
        patient: {
          uhid: 'MF-2026-8812',
          fullName: 'Rajesh Sharma',
          age: 44,
          gender: 'MALE',
          attendingDoctor: 'Dr. Priya Varma, MD, DM (Cardiology)'
        },
        bill
      }
    });
  }
};
