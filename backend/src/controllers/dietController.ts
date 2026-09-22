import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export const dietController = {
  getPatientDiet: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const plan = mockDataService.dietPlans.find((d) => d.patientId === patientId && d.isActive);
    if (!plan) {
      res.status(404).json({ success: false, error: 'No active diet plan found for patient' });
      return;
    }
    res.json({ success: true, data: plan });
  }
};

export const therapyController = {
  getPatientTherapy: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const sessions = mockDataService.therapySessions.filter((t) => t.patientId === patientId);
    res.json({ success: true, data: sessions });
  }
};

export const billingController = {
  getPatientBill: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const bill = mockDataService.bills.find((b) => b.patientId === patientId);
    if (!bill) {
      res.status(404).json({ success: false, error: 'No active bill found for patient' });
      return;
    }
    res.json({ success: true, data: bill });
  }
};
