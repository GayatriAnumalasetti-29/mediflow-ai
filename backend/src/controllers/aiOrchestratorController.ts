import { Request, Response } from 'express';
import { aiClientService } from '../services/aiClientService';
import { AgentQueryRequest } from '@mediflow/shared';
import { mockDataService } from '../services/mockDataService';
import { HOSPITAL_TARIFF_CATALOG } from '../services/tariffService';

export const aiOrchestratorController = {
  chat: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: AgentQueryRequest = req.body;
      const aiResponse = await aiClientService.queryAgent(payload);
      res.json({
        success: true,
        data: aiResponse
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `AI Orchestrator error: ${err.message}`
      });
    }
  },

  executeTool: async (req: Request, res: Response): Promise<void> => {
    const { toolName, parameters } = req.body;

    try {
      let result: any = null;

      switch (toolName) {
        case 'registerPatient':
          result = { patientId: `pat-${Date.now()}`, uhid: 'MF-2026-8812', status: 'REGISTERED' };
          break;
        case 'getPatientDetails':
          result = mockDataService.patients[0];
          break;
        case 'findDoctor':
        case 'checkDoctorAvailability':
          result = mockDataService.doctors;
          break;
        case 'bookAppointment':
          result = mockDataService.appointments[0];
          break;
        case 'checkRoomAvailability':
          result = mockDataService.rooms;
          break;
        case 'getMedicationSchedule':
          result = mockDataService.medicationSchedules;
          break;
        case 'getDietPlan':
          result = mockDataService.dietPlans[0];
          break;
        case 'getBill':
        case 'generateBill':
          result = mockDataService.bills[0];
          break;
        case 'createEscalation':
          result = mockDataService.escalations[0];
          break;
        default:
          result = { toolExecuted: toolName, status: 'SUCCESS' };
      }

      res.json({
        success: true,
        toolName,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Tool execution failed: ${err.message}`
      });
    }
  },

  detectLanguage: async (req: Request, res: Response): Promise<void> => {
    const { text } = req.body;
    const isTelugu = /[\u0C00-\u0C7F]/.test(text || '');
    const isHindi = /[\u0900-\u097F]/.test(text || '');

    const detected = isTelugu ? 'te' : isHindi ? 'hi' : 'en';

    res.json({
      success: true,
      data: {
        detectedLanguage: detected,
        confidence: 0.98,
        isCodeMixed: false
      }
    });
  },

  transcribe: async (req: Request, res: Response): Promise<void> => {
    const { languageHint } = req.body;
    res.json({
      success: true,
      data: {
        transcript: 'Simulated patient speech stream transcription',
        detectedLanguage: languageHint || 'en'
      }
    });
  },

  synthesizeSpeech: async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        audioBase64: null,
        message: 'Speech synthesis coordinated via neural engine'
      }
    });
  }
};
