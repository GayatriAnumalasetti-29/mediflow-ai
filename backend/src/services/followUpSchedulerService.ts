import { socketService } from './socketService';
import { mockDataService } from './mockDataService';

export interface AutonomousReminderPayload {
  id: string;
  patientId: string;
  type: 'MEDICATION' | 'DIET' | 'ACTIVITY' | 'THERAPY' | 'CHECKIN';
  title: string;
  description: string;
  scheduledTime: string;
  ttsPromptEn: string;
  ttsPromptTe: string;
  ttsPromptHi: string;
  status: 'PENDING' | 'COMPLETED' | 'SNOOZED' | 'MISSED';
}

class FollowUpSchedulerService {
  private activeReminders: AutonomousReminderPayload[] = [
    {
      id: 'rem-1',
      patientId: 'pat-001',
      type: 'MEDICATION',
      title: 'Evening Medicine Due: Metoprolol ER 25mg',
      description: '1 Tablet post-dinner. Please take with water.',
      scheduledTime: '09:00 PM',
      ttsPromptEn: 'Hello Rajesh, it is time for your evening Metoprolol 25 milligram tablet. Have you taken it?',
      ttsPromptTe: 'నమస్కారం రాజేష్ గారు, మీ సాయంత్రం మెటోప్రోలాల్ టాబ్లెట్ సమయం అయింది. మీరు తీసుకున్నారా?',
      ttsPromptHi: 'नमस्ते राजेश जी, आपकी शाम की मेटोप्रोलोल गोली का समय हो गया है। क्या आपने इसे ले लिया है?',
      status: 'PENDING'
    }
  ];

  public getActiveReminders(patientId: string): AutonomousReminderPayload[] {
    return this.activeReminders.filter((r) => r.patientId === patientId);
  }

  public triggerReminder(patientId: string, reminderId: string) {
    const rem = this.activeReminders.find((r) => r.id === reminderId && r.patientId === patientId);
    if (rem) {
      socketService.emitToPatient(patientId, 'scheduled_reminder_dispatched', rem);
    }
  }

  public recordResponse(reminderId: string, status: 'COMPLETED' | 'SNOOZED' | 'MISSED') {
    const rem = this.activeReminders.find((r) => r.id === reminderId);
    if (rem) {
      rem.status = status;
      if (status === 'COMPLETED') {
        mockDataService.medicationLogs.push({
          id: `log-${Date.now()}`,
          patientId: rem.patientId,
          scheduleId: 'sched-002',
          scheduledTime: rem.scheduledTime,
          actualTakenTime: new Date().toISOString(),
          status: 'TAKEN' as any
        });
      }
    }
  }

  private intervalTimer: NodeJS.Timeout | null = null;

  public startBackgroundScheduler(): void {
    if (this.intervalTimer) return;
    console.log('[Scheduler] Starting autonomous appointment monitoring daemon (every 30s)...');
    this.evaluateAllMissedAppointments();
    this.intervalTimer = setInterval(() => {
      this.evaluateAllMissedAppointments();
    }, 30000);
  }

  public evaluateAllMissedAppointments(): void {
    const now = new Date();
    const GRACE_PERIOD_MINUTES = 15;

    const scheduledApts = mockDataService.appointments.filter(
      (a) => a.status === ('SCHEDULED' as any) || a.status === ('IN_QUEUE' as any)
    );

    for (const apt of scheduledApts) {
      try {
        const timePart = (apt.timeSlot || '').trim();
        if (!timePart) continue;

        let [time, meridiem] = timePart.split(' ');
        const [hoursStr, minsStr] = time.split(':');
        let hours = parseInt(hoursStr, 10);
        const mins = parseInt(minsStr || '0', 10);

        if (meridiem && meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (meridiem && meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

        const aptDateTime = new Date(apt.appointmentDate);
        if (isNaN(aptDateTime.getTime())) continue;
        aptDateTime.setHours(hours, mins, 0, 0);

        const diffMinutes = (now.getTime() - aptDateTime.getTime()) / (1000 * 60);

        if (diffMinutes > GRACE_PERIOD_MINUTES) {
          apt.status = 'MISSED' as any;
          (apt as any).missedAt = now.toISOString();

          // Dispatch notification
          const notif = mockDataService.safeNotify(
            apt.patientId,
            'Missed Appointment Alert',
            `Your appointment with ${apt.doctor?.fullName || apt.doctorName || 'Doctor'} on ${apt.appointmentDate} at ${apt.timeSlot} was missed. Tap to reschedule at your convenience.`,
            'MISSED_APPOINTMENT' as any
          );

          socketService.emitToPatient(apt.patientId, 'appointment:missed', {
            appointmentId: apt.id,
            doctorName: apt.doctor?.fullName || apt.doctorName,
            timeSlot: apt.timeSlot,
            notification: notif
          });

          console.log(`[Scheduler] Marked appointment ${apt.id} as MISSED (${Math.round(diffMinutes)}m past slot).`);
        }
      } catch (e) {
        // Safe skip
      }
    }
  }
}

export const followUpSchedulerService = new FollowUpSchedulerService();
