import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export const doctorController = {
  getAllDoctors: async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: mockDataService.doctors
    });
  },

  getDepartments: async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: mockDataService.departments
    });
  },

  getDoctorSlots: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const doctor = mockDataService.doctors.find((d) => d.id === id);
    if (!doctor) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }
    res.json({
      success: true,
      slots: doctor.availableTimeSlots,
      days: doctor.availableDays
    });
  }
};
