import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { DoseStatus } from '@mediflow/shared';

export const medicationController = {
  getSchedule: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const schedules = mockDataService.medicationSchedules.filter((s) => s.patientId === patientId);
    const doses = mockDataService.todayDoses.filter((d) => d.patientId === patientId);

    res.json({
      success: true,
      data: {
        schedules,
        todayDoses: doses
      }
    });
  },

  logDose: async (req: Request, res: Response): Promise<void> => {
    const { doseId, status } = req.body;
    const dose = mockDataService.todayDoses.find((d) => d.id === doseId);
    if (!dose) {
      res.status(404).json({ success: false, error: 'Dose record not found' });
      return;
    }

    dose.status = status as DoseStatus;
    if (status === DoseStatus.TAKEN) {
      dose.confirmedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      message: `Dose status updated to ${status}`,
      data: dose
    });
  },

  getAdherence: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const doses = mockDataService.todayDoses.filter((d) => d.patientId === patientId);
    const taken = doses.filter((d) => d.status === DoseStatus.TAKEN).length;
    const total = doses.length || 1;

    res.json({
      success: true,
      data: {
        patientId,
        totalDosesPrescribed: total,
        totalDosesTaken: taken,
        totalDosesSkipped: doses.filter((d) => d.status === DoseStatus.SKIPPED).length,
        adherencePercentage: Math.round((taken / total) * 100),
        currentStreakDays: 5
      }
    });
  }
};
