import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { NotificationType } from '@mediflow/shared';

let patientNotificationPreferences: Record<string, any> = {
  'pat-001': {
    patientId: 'pat-001',
    enableInApp: true,
    enableBrowserPush: true,
    enableVoiceTTS: true,
    channels: {
      medication: true,
      diet: true,
      activity: true,
      therapy: true,
      appointments: true,
      queue: true,
      billing: true,
      escalations: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  }
};

const full11Notifications = [
  {
    id: 'notif-1',
    patientId: 'pat-001',
    title: 'Upcoming Cardiology Consultation',
    message: 'Dr. Priya Varma (Cardiology) • Tomorrow at 10:30 AM in OPD Room 104.',
    type: 'APPOINTMENT_REMINDER',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'notif-2',
    patientId: 'pat-001',
    title: 'OPD Queue Status: Token #12',
    message: 'Currently serving Token #10. Estimated wait time: ~14 minutes.',
    type: 'QUEUE_UPDATE',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'notif-3',
    patientId: 'pat-001',
    title: 'Scheduled Evening Medication',
    message: 'Metoprolol Succinate ER 25mg (1 Tablet) after dinner.',
    type: 'MEDICATION_REMINDER',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'notif-4',
    patientId: 'pat-001',
    title: 'Inpatient Room Allocated',
    message: 'Semi-Private Inpatient Ward SP-201 (Bed 1) assigned successfully.',
    type: 'ROOM_ALLOCATION',
    isRead: true,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'notif-5',
    patientId: 'pat-001',
    title: 'Cardiac Rehabilitation Session',
    message: 'Monday at 04:30 PM with Dr. Ananya Ray in Physio Room 2B.',
    type: 'THERAPY_REMINDER',
    isRead: true,
    createdAt: new Date(Date.now() - 240 * 60000).toISOString()
  },
  {
    id: 'notif-6',
    patientId: 'pat-001',
    title: 'Hospital Itemized Invoice Generated',
    message: 'Invoice #INV-2026-8812 for ₹9,527.50 is ready for review.',
    type: 'BILLING_STATEMENT',
    isRead: true,
    createdAt: new Date(Date.now() - 360 * 60000).toISOString()
  }
];

export const notificationController = {
  getNotifications: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    res.json({
      success: true,
      data: full11Notifications
    });
  },

  markAsRead: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const notif = full11Notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notif
    });
  },

  markAllAsRead: async (req: Request, res: Response): Promise<void> => {
    full11Notifications.forEach((n) => (n.isRead = true));
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  },

  getPreferences: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const prefs = patientNotificationPreferences[patientId] || patientNotificationPreferences['pat-001'];
    res.json({
      success: true,
      data: prefs
    });
  },

  updatePreferences: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    patientNotificationPreferences[patientId] = {
      ...patientNotificationPreferences[patientId],
      ...req.body
    };

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: patientNotificationPreferences[patientId]
    });
  }
};
