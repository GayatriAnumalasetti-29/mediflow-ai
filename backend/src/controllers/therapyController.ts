import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export const therapyController = {
  getPatientTherapy: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const sessions = mockDataService.therapySessions.filter((t) => t.patientId === patientId);
    res.json({ success: true, data: sessions });
  }
};
