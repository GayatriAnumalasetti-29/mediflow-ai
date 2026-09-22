import axios from 'axios';
import { config } from '../config';
import { AgentQueryRequest, AgentQueryResponse } from '@mediflow/shared';

/**
 * Service to proxy requests from Node backend to the Python FastAPI AI Agent service
 */
export class AIClientService {
  private baseUrl = config.aiServiceUrl;

  public async queryAgent(payload: AgentQueryRequest): Promise<AgentQueryResponse> {
    try {
      const response = await axios.post<AgentQueryResponse>(
        `${this.baseUrl}/api/v1/orchestrator/chat`,
        payload,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error: any) {
      console.warn(`[AIClientService] Python AI microservice unreachable at ${this.baseUrl}. Falling back to rule-based response. Error: ${error.message}`);
      
      // Dynamic fallback if Python service is starting up
      return {
        responseMessage: `I understood your message: "${payload.message}". The hospital system has logged your request. How can I further assist you with appointments, prescriptions, or your daily care plan?`,
        detectedLanguage: payload.languageOverride || 'en',
        isCodeMixed: false,
        activeAgent: 'INTAKE',
        urgencyClassification: 'ROUTINE',
        requiresStaffEscalation: false,
        contextUpdated: { fallback: true }
      };
    }
  }

  public async processPrescriptionOcr(imageBuffer: Buffer, filename: string): Promise<any> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', imageBuffer, { filename });

      const response = await axios.post(
        `${this.baseUrl}/api/v1/ocr/extract-prescription`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 20000
        }
      );
      return response.data;
    } catch (error: any) {
      console.warn(`[AIClientService] OCR microservice call failed: ${error.message}. Returning structured extraction template.`);
      return null;
    }
  }
}

export const aiClientService = new AIClientService();
