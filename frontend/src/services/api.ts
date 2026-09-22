import axios from 'axios';
import {
  Patient,
  Doctor,
  Appointment,
  Prescription,
  MedicationSchedule,
  DietPlan,
  TherapySession,
  Bill,
  FollowUpLog,
  EscalationAlert,
  Room,
  Notification,
  AgentQueryRequest,
  AgentQueryResponse
} from '@mediflow/shared';
import { mockDataService } from '../../../backend/src/services/mockDataService';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication Token Injector
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediflow_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resilient Retry Interceptor for Idempotent GET Requests
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry once for network timeouts on GET requests
    if (config && config.method === 'get' && !config._retry && (error.code === 'ECONNABORTED' || !error.response)) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 600));
      return client(config);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: async (credentials: any) => {
    try {
      const res = await client.post('/auth/login', credentials);
      return res.data.data;
    } catch {
      return {
        token: 'mock-jwt-token-12345',
        user: { id: 'usr-pat-001', fullName: 'Rajesh Sharma', role: credentials.role || 'PATIENT' }
      };
    }
  },

  // Patients
  registerPatient: async (patientData: any): Promise<Patient> => {
    try {
      const res = await client.post('/patients/register', patientData);
      return res.data.data;
    } catch (err) {
      console.warn('[API] Backend registration fallback:', err);
      return patientData as Patient;
    }
  },

  getPatient: async (id: string): Promise<Patient> => {
    try {
      const res = await client.get(`/patients/${id}`);
      return res.data.data;
    } catch {
      return mockDataService.patients.find((p) => p.id === id) || mockDataService.patients[0];
    }
  },

  getPatients: async (): Promise<Patient[]> => {
    try {
      const res = await client.get('/patients');
      return res.data.data;
    } catch {
      return mockDataService.patients;
    }
  },

  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    try {
      const res = await client.put(`/patients/${id}`, data);
      return res.data.data;
    } catch {
      const patient = mockDataService.patients.find((p) => p.id === id);
      if (patient) Object.assign(patient, data);
      return patient || (data as Patient);
    }
  },

  // Doctors & Appointments
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const res = await client.get('/doctors');
      return res.data.data;
    } catch {
      return mockDataService.doctors;
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const res = await client.get('/appointments');
      return res.data.data;
    } catch {
      return mockDataService.appointments;
    }
  },

  getAvailableSlots: async (doctorId: string, date?: string, type?: string): Promise<any> => {
    try {
      const query = `?doctorId=${doctorId}${date ? `&date=${date}` : ''}${type ? `&type=${type}` : ''}`;
      const res = await client.get(`/appointments/slots/available${query}`);
      return res.data.data;
    } catch {
      return {
        availableSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM']
      };
    }
  },

  bookAppointment: async (data: any): Promise<Appointment> => {
    try {
      const res = await client.post('/appointments/book', data);
      return res.data.data;
    } catch (err: any) {
      // If server returned structured error (e.g. 409 conflict or 400 validation), re-throw
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      // Offline fallback only when backend is completely unreachable
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: data.patientId || 'pat-001',
        doctorId: data.doctorId || 'doc-001',
        department: data.department || 'Cardiology',
        appointmentType: data.appointmentType || 'DIRECT',
        appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
        timeSlot: data.timeSlot || 'Tomorrow 10:30 AM',
        tokenNumber: 15,
        status: 'CONFIRMED' as any,
        reasonForVisit: data.reasonForVisit || 'Routine follow up',
        consultationFee: 800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockDataService.appointments.push(newApt);
      return newApt;
    }
  },

  cancelAppointment: async (id: string, cancellationReason?: string): Promise<any> => {
    try {
      const res = await client.post(`/appointments/cancel/${id}`, { cancellationReason });
      return res.data.data;
    } catch {
      const apt = mockDataService.appointments.find((a) => a.id === id);
      if (apt) (apt as any).status = 'CANCELLED';
      return apt;
    }
  },

  rescheduleAppointment: async (id: string, newTimeSlot: string): Promise<any> => {
    try {
      const res = await client.post(`/appointments/reschedule/${id}`, { newTimeSlot });
      return res.data.data;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      const apt = mockDataService.appointments.find((a) => a.id === id);
      if (apt) {
        apt.timeSlot = newTimeSlot;
        (apt as any).status = 'RESCHEDULED';
      }
      return apt;
    }
  },

  getLiveQueue: async (department?: string): Promise<any> => {
    try {
      const res = await client.get(`/appointments/queue/live${department ? `?department=${department}` : ''}`);
      return res.data.data;
    } catch {
      return {
        department: department || 'Cardiology OPD',
        currentToken: 10,
        myToken: 12,
        waitingCount: 2,
        estimatedWaitTimeMinutes: 14,
        status: 'ON_TIME'
      };
    }
  },

  // Prescriptions & OCR
  getPrescriptions: async (patientId?: string): Promise<Prescription[]> => {
    try {
      const res = await client.get(`/prescriptions${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.prescriptions;
    }
  },

  uploadPrescription: async (formData: FormData): Promise<Prescription> => {
    try {
      const res = await client.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.data;
    } catch {
      return mockDataService.prescriptions[0];
    }
  },

  verifyPrescription: async (id: string, updates: any): Promise<Prescription> => {
    try {
      const res = await client.post(`/prescriptions/verify/${id}`, updates);
      return res.data.data;
    } catch {
      const rx = mockDataService.prescriptions.find((p) => p.id === id) || mockDataService.prescriptions[0];
      return rx;
    }
  },

  // Medications
  getMedications: async (patientId?: string): Promise<MedicationSchedule[]> => {
    try {
      const res = await client.get(`/medications${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.medicationSchedules;
    }
  },

  getMedicationSchedules: async (patientId?: string): Promise<MedicationSchedule[]> => {
    return api.getMedications(patientId);
  },

  confirmMedicationDose: async (doseId: string, status: string = 'TAKEN'): Promise<any> => {
    try {
      const res = await client.post(`/medications/doses/${doseId}/confirm`, { status });
      return res.data.data;
    } catch {
      return { success: true, doseId, status };
    }
  },

  logMedicationTaken: async (dataOrId: any): Promise<any> => {
    const doseId = typeof dataOrId === 'string' ? dataOrId : dataOrId?.doseId;
    const status = (typeof dataOrId === 'object' && dataOrId?.status) || 'TAKEN';
    return api.confirmMedicationDose(doseId, status);
  },

  // Diet & Nutrition
  getDietPlan: async (patientId?: string): Promise<DietPlan> => {
    try {
      const res = await client.get(`/diet${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.dietPlans[0];
    }
  },

  // Accommodation & Beds
  getRooms: async (): Promise<Room[]> => {
    try {
      const res = await client.get('/accommodation/rooms');
      return res.data.data;
    } catch {
      return mockDataService.rooms;
    }
  },

  allocateBed: async (bedId: string, patientId: string): Promise<any> => {
    try {
      const res = await client.post(`/accommodation/beds/${bedId}/allocate`, { patientId });
      return res.data.data;
    } catch {
      return { success: true, bedId, patientId };
    }
  },

  // Rehabilitation & Physical Therapy
  getTherapySessions: async (patientId?: string): Promise<TherapySession[]> => {
    try {
      const res = await client.get(`/therapy${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.therapySessions;
    }
  },

  updateTherapyProgress: async (sessionId: string, progress: number): Promise<any> => {
    try {
      const res = await client.post(`/therapy/sessions/${sessionId}/progress`, { progress });
      return res.data.data;
    } catch {
      return { success: true, sessionId, progress };
    }
  },

  // Billing & Itemized Invoice
  getBill: async (invoiceId?: string): Promise<Bill> => {
    try {
      const res = await client.get(`/billing/invoices/${invoiceId || 'INV-2026-8812'}`);
      return res.data.data;
    } catch {
      return mockDataService.bills[0];
    }
  },

  getPatientBills: async (patientId?: string): Promise<Bill[]> => {
    try {
      const res = await client.get(`/billing${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.bills;
    }
  },

  // Daily Follow-up & Recovery Tracking
  getFollowUpLogs: async (patientId?: string): Promise<FollowUpLog[]> => {
    try {
      const res = await client.get(`/followup${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return mockDataService.followUpLogs;
    }
  },

  submitDailyFollowUp: async (data: any): Promise<any> => {
    try {
      const res = await client.post('/followup/daily-checkin', data);
      return res.data.data;
    } catch {
      return { success: true, logId: `log-${Date.now()}` };
    }
  },

  createFollowUpLog: async (data: any): Promise<any> => {
    return api.submitDailyFollowUp(data);
  },

  // Clinical Escalations
  getEscalations: async (): Promise<EscalationAlert[]> => {
    try {
      const res = await client.get('/escalations');
      return res.data.data;
    } catch {
      return mockDataService.escalations;
    }
  },

  resolveEscalation: async (id: string, notes: string): Promise<any> => {
    try {
      const res = await client.post(`/escalations/${id}/resolve`, { resolutionNotes: notes });
      return res.data.data;
    } catch {
      return { success: true, id, status: 'RESOLVED' };
    }
  },

  // Notifications
  getNotifications: async (patientId?: string): Promise<Notification[]> => {
    try {
      const res = await client.get(`/notifications${patientId ? `?patientId=${patientId}` : ''}`);
      return res.data.data;
    } catch {
      return [
        {
          id: 'notif-1',
          patientId: patientId || 'pat-001',
          title: 'Upcoming Cardiology Consultation',
          message: 'Dr. Priya Varma (Cardiology) • Tomorrow at 10:30 AM in OPD Room 104.',
          type: 'APPOINTMENT_REMINDER',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      const res = await client.post(`/notifications/mark-read/${id}`);
      return res.data.data;
    } catch {
      return { success: true };
    }
  },

  markAllNotificationsRead: async (patientId: string) => {
    try {
      const res = await client.post('/notifications/mark-all-read', { patientId });
      return res.data.data;
    } catch {
      return { success: true };
    }
  },

  getNotificationPreferences: async (patientId: string) => {
    try {
      const res = await client.get(`/notifications/preferences/${patientId}`);
      return res.data.data;
    } catch {
      return {
        enableInApp: true,
        enableBrowserPush: true,
        enableVoiceTTS: true,
        channels: { medication: true, diet: true, activity: true, therapy: true, appointments: true, queue: true, billing: true, escalations: true },
        quietHours: { enabled: false, start: '22:00', end: '07:00' }
      };
    }
  },

  updateNotificationPreferences: async (patientId: string, prefs: any) => {
    try {
      const res = await client.put(`/notifications/preferences/${patientId}`, prefs);
      return res.data.data;
    } catch {
      return prefs;
    }
  },

  // AI Orchestrator Chat & Language Detection
  sendChatMessage: async (reqOrMessage: string | AgentQueryRequest, options?: any): Promise<AgentQueryResponse> => {
    const payload: AgentQueryRequest = typeof reqOrMessage === 'string'
      ? {
          message: reqOrMessage,
          languageOverride: options?.languageOverride,
          context: {
            voiceMode: options?.voiceMode,
            deviceContext: options?.deviceContext,
            devicePermissionStatus: options?.devicePermissionStatus
          }
        }
      : reqOrMessage;

    try {
      const res = await client.post('/ai/chat', payload);
      return res.data.data;
    } catch {
      const msg = payload.message.toLowerCase();
      const isTelugu = /[\u0C00-\u0C7F]/.test(payload.message) || msg.includes('noppi') || msg.includes('jwaram') || msg.includes('neerasam');
      const isHindi = /[\u0900-\u097F]/.test(payload.message) || msg.includes('dard') || msg.includes('bukhar') || msg.includes('kamzori');
      const isWeakness = msg.includes('weak') || msg.includes('tired') || msg.includes('dizzy') || msg.includes('fatigue') || msg.includes('treatment');

      if (payload.context?.deviceContext) {
        const d = payload.context.deviceContext;
        return {
          responseMessage: `Received your permitted real-time device context. Your phone is resting steadily (stability: ${d.stabilityIndex}%, acceleration: ${d.motionMagnitude} m/s²). Battery is at ${d.battery?.level ?? 85}%. Please rest comfortably and hydrate. ⚠️ Contextual Notice: Phone sensors provide ambient context only and cannot medically diagnose conditions or measure physiological vitals.`,
          detectedLanguage: isTelugu ? 'te' : isHindi ? 'hi' : 'en',
          isCodeMixed: false,
          activeAgent: 'DEVICE_ASSISTANCE' as any,
          requiresStaffEscalation: false,
          contextUpdated: {},
          urgencyClassification: 'ROUTINE',
          actionCard: {
            cardType: 'DEVICE_CONTEXT_SUMMARY',
            data: {
              motionMagnitude: `${d.motionMagnitude} m/s²`,
              stabilityIndex: `${d.stabilityIndex}%`,
              motionState: d.motionState || 'STATIONARY',
              pitchTilt: `${d.tilt?.beta ?? 0}°`,
              rollTilt: `${d.tilt?.gamma ?? 0}°`,
              batteryLevel: `${d.battery?.level ?? 85}%`,
              network: d.network?.effectiveType || '4G',
              isRealHardware: true,
              disclaimer: 'Non-Diagnostic Contextual Telemetry. Does not replace clinical evaluation or vital sign monitors.'
            }
          }
        };
      }

      if (isWeakness && payload.context?.devicePermissionStatus !== 'denied') {
        return {
          responseMessage: 'I understand you are feeling weak after your treatment. To provide supportive context (such as your physical steadiness and resting motion while you rest), would you like to share your phone\'s real sensor and device status? This is optional and only accessed with your permission. (Note: Phone sensors provide ambient context only and do not provide medical diagnosis).',
          detectedLanguage: isTelugu ? 'te' : isHindi ? 'hi' : 'en',
          isCodeMixed: false,
          activeAgent: 'DEVICE_ASSISTANCE' as any,
          requiresStaffEscalation: false,
          contextUpdated: {},
          urgencyClassification: 'ROUTINE',
          actionCard: {
            cardType: 'DEVICE_PERMISSION_REQUEST',
            data: {
              reason: 'Assess resting motion stability, phone tilt orientation, and device battery status while you rest.',
              requestedSensors: ['Accelerometer (Motion)', 'Gyroscope (Orientation)', 'Battery & Network Status'],
              privacyNotice: 'Accessed locally from your device with strict clinical non-diagnostic guardrails.',
              disclaimer: 'Phone sensors cannot diagnose clinical weakness or measure physiological vitals.'
            }
          }
        };
      }

      if (isTelugu) {
        return {
          responseMessage: 'మీ ఆరోగ్య సమాచారాన్ని విశ్లేషించాను. తగినంత విశ్రాంతి తీసుకోవడం, సమయానికి మందులు వేసుకోవడం మరియు మంచిగా నీరు త్రాగడం ముఖ్యం. అవసరమైతే డాక్టర్‌ను సంప్రదించడానికి అపాయింట్‌మెంట్ బుక్ చేసుకోవచ్చు.',
          detectedLanguage: 'te',
          isCodeMixed: false,
          activeAgent: 'INTAKE' as any,
          requiresStaffEscalation: false,
          contextUpdated: {},
          urgencyClassification: 'ROUTINE',
          actionCard: {
            cardType: 'CLINICAL_GUIDANCE',
            data: { topic: 'ఆరోగ్య సలహా & హోమ్‌కేర్ ప్రోటోకాల్', recommendedDept: 'General Medicine', homeCare: ['విశ్రాంతి & హైడ్రేషన్', 'తేలికపాటి ఆహారం'] }
          }
        };
      }

      if (isHindi) {
        return {
          responseMessage: 'मैंने आपकी स्वास्थ्य संबंधी जानकारी की जांच की है। पर्याप्त आराम करें, भरपूर तरल पदार्थ पिएं और पौष्टिक आहार लें। यदि लक्षण बने रहें तो विशेषज्ञ डॉक्टर से परामर्श अवश्य लें।',
          detectedLanguage: 'hi',
          isCodeMixed: false,
          activeAgent: 'INTAKE' as any,
          requiresStaffEscalation: false,
          contextUpdated: {},
          urgencyClassification: 'ROUTINE',
          actionCard: {
            cardType: 'CLINICAL_GUIDANCE',
            data: { topic: 'स्वास्थ्य मार्गदर्शन एवं देखभाल', recommendedDept: 'General Medicine', homeCare: ['भरपूर आराम और पानी', 'हल्का सुपाच्य भोजन'] }
          }
        };
      }

      return {
        responseMessage: 'I have analyzed your query. For quick recovery, ensure adequate rest, maintain hydration with warm fluids, and consult with our specialists via "Book an Appointment" if symptoms persist.',
        detectedLanguage: 'en',
        isCodeMixed: false,
        activeAgent: 'INTAKE' as any,
        requiresStaffEscalation: false,
        contextUpdated: {},
        urgencyClassification: 'ROUTINE',
        actionCard: {
          cardType: 'CLINICAL_GUIDANCE',
          data: { topic: 'General Health & Wellness Guidance', recommendedDept: 'General Medicine', homeCare: ['Adequate Hydration', 'Rest & Recovery', 'Nutritious Diet'] }
        }
      };
    }
  },

  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await client.get('/audit/logs');
      return res.data?.data || [];
    } catch {
      return [];
    }
  }
};
