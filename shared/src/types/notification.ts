import { NotificationType } from '../enums';

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
