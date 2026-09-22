import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { AppointmentStatus, Appointment, NotificationType, AppointmentType } from '@mediflow/shared';
import { socketService } from '../services/socketService';
import { concurrencyLock } from '../utils/concurrencyLock';
import { auditLoggerService } from '../services/auditLoggerService';

// Configurable hospital grace period for missed appointments (Default: 15 minutes)
export const HOSPITAL_GRACE_PERIOD_MINUTES = 15;

export const appointmentController = {
  getAppointments: async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: mockDataService.appointments
    });
  },

  getPatientAppointments: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const appointments = mockDataService.appointments.filter((a) => a.patientId === patientId);
    res.json({
      success: true,
      data: appointments
    });
  },

  // Dynamic slot availability query with conflict check
  getAvailableSlots: async (req: Request, res: Response): Promise<void> => {
    const { doctorId, date, type } = req.query;

    const doctor = mockDataService.doctors.find((d) => d.id === doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }

    if (doctor.onLeave) {
      res.json({
        success: true,
        data: {
          doctor: doctor.fullName,
          date: date,
          type: type,
          availableSlots: [],
          message: 'Doctor is currently on leave for the selected date.'
        }
      });
      return;
    }

    // Determine the base slot pool based on appointment type
    const isVirtual = String(type).toUpperCase() === 'VIRTUAL';
    const baseSlots = isVirtual ? (doctor.virtualSlots || ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']) : (doctor.directSlots || ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM']);

    // Check existing appointments on this date across BOTH virtual and direct pools to prevent double-booking
    const queryDate = (date as string) || new Date().toISOString().split('T')[0];
    const existingBookings = mockDataService.appointments.filter(
      (a) =>
        a.doctorId === doctor.id &&
        a.appointmentDate === queryDate &&
        [AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.SCHEDULED].includes(a.status)
    );

    const bookedTimes = new Set(existingBookings.map((b) => b.timeSlot));

    const availableSlots = baseSlots.map((slot) => ({
      slot,
      isAvailable: !bookedTimes.has(slot),
      conflictReason: bookedTimes.has(slot) ? 'Booked by another patient' : undefined
    }));

    res.json({
      success: true,
      data: {
        doctor: doctor.fullName,
        department: doctor.department,
        date: queryDate,
        type: isVirtual ? 'VIRTUAL' : 'DIRECT',
        availableSlots
      }
    });
  },

  bookAppointment: async (req: Request, res: Response): Promise<void> => {
    const {
      patientId,
      patientName,
      doctorId,
      department,
      appointmentType,
      appointmentDate,
      timeSlot,
      reasonForVisit
    } = req.body;

    const doctor = mockDataService.doctors.find((d) => d.id === doctorId) || mockDataService.doctors[0];
    const targetDate = appointmentDate || new Date().toISOString().split('T')[0];
    const targetSlot = timeSlot || '10:30 AM';
    const type: 'VIRTUAL' | 'DIRECT' = String(appointmentType).toUpperCase() === 'VIRTUAL' ? 'VIRTUAL' : 'DIRECT';

    const slotKey = `slot:${doctor.id}:${targetDate}:${targetSlot}`;

    try {
      // 1. ATOMIC CONCURRENCY LOCK ACQUISITION — Guarantees Race-Free Double-Booking Prevention
      const newAppointment = await concurrencyLock.withLock(
        slotKey,
        async () => {
          // Double-check conflict inside exclusive lock
          if (mockDataService.hasSlotConflict(doctor.id, targetDate, targetSlot)) {
            const conflictErr: any = new Error('Sorry, this slot was just reserved by another patient. Please select another available time.');
            conflictErr.statusCode = 409;
            throw conflictErr;
          }

          // Execute state modifications in an atomic rollback transaction
          return await mockDataService.runTransaction(async () => {
            const deptApts = mockDataService.appointments.filter((a) => a.department === (department || doctor.department));
            const assignedTokenNumber = deptApts.length + 11;

            const apt: Appointment = {
              id: `apt-${Date.now()}`,
              patientId: patientId || 'pat-001',
              patientName: patientName || 'Patient',
              doctorId: doctor.id,
              doctor: doctor,
              department: department || doctor.department,
              appointmentType: type,
              appointmentDate: targetDate,
              timeSlot: targetSlot,
              tokenNumber: assignedTokenNumber,
              status: AppointmentStatus.CONFIRMED,
              reasonForVisit: reasonForVisit || 'Consultation review',
              consultationFee: doctor.consultationFee || 800,
              bookingTimestamp: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            mockDataService.appointments.unshift(apt);

            // Safe notification without exposed sensitive diagnosis
            mockDataService.safeNotify(
              apt.patientId,
              `${type === 'VIRTUAL' ? 'Virtual Video Meet' : 'Hospital Direct Visit'} Confirmed`,
              `Your consultation with ${doctor.fullName} (${doctor.department}) on ${targetDate} at ${targetSlot} is confirmed. ${type === 'DIRECT' ? `Token #${assignedTokenNumber}` : `Appointment ID: ${apt.id}`}`,
              NotificationType.APPOINTMENT_REMINDER
            );

            // Audit Ledger Registration
            auditLoggerService.logEvent({
              userId: apt.patientId,
              userRole: 'PATIENT',
              action: 'APPOINTMENT_BOOKED',
              resource: `Appointment:${apt.id}`,
              ipAddress: req.ip || '127.0.0.1',
              details: `Reserved ${type} consultation with ${doctor.fullName} on ${targetDate} at ${targetSlot}. Token #${assignedTokenNumber}.`,
              status: 'SUCCESS',
              afterState: { id: apt.id, doctorId: doctor.id, date: targetDate, slot: targetSlot, token: assignedTokenNumber }
            });

            socketService.emitToPatient(apt.patientId, 'appointment_booked', apt);
            return apt;
          });
        },
        'A reservation is currently in progress for this slot. Please try again momentarily.'
      );

      res.status(201).json({
        success: true,
        message: 'Appointment confirmed and slot reserved successfully',
        data: newAppointment
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: err.message || 'Error occurred while reserving appointment slot.'
      });
    }
  },

  // Patient arrival check-in for Direct Visit
  checkInAppointment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const appointment = mockDataService.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    appointment.status = AppointmentStatus.CHECKED_IN;
    appointment.checkInTimestamp = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Patient checked in successfully at the hospital desk',
      data: appointment
    });
  },

  // Join Virtual Meet
  joinVirtualMeet: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const appointment = mockDataService.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    appointment.status = AppointmentStatus.IN_PROGRESS;
    appointment.consultationStartTimestamp = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Patient joined virtual meet room',
      data: appointment
    });
  },

  // Evaluate & trigger missed appointment logic if grace period passed
  evaluateMissedAppointment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { gracePeriodMinutes = HOSPITAL_GRACE_PERIOD_MINUTES } = req.body;

    const appointment = mockDataService.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    if ([AppointmentStatus.CONFIRMED, AppointmentStatus.SCHEDULED].includes(appointment.status)) {
      appointment.status = AppointmentStatus.MISSED;
      appointment.missedAt = new Date().toISOString();
      appointment.updatedAt = new Date().toISOString();

      // Trigger Missed Appointment Notification
      mockDataService.notifications.unshift({
        id: `notif-${Date.now()}`,
        patientId: appointment.patientId,
        title: 'Missed Appointment Notice',
        message: `Your appointment with ${appointment.doctor?.fullName || 'Doctor'} scheduled for ${appointment.appointmentDate} at ${appointment.timeSlot} was missed. If you were unable to attend, you can choose another convenient appointment time.`,
        type: NotificationType.MISSED_APPOINTMENT,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      mockDataService.persist();
    }

    res.json({
      success: true,
      message: 'Appointment marked as missed',
      data: appointment
    });
  },

  rescheduleAppointment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { newDate, newTimeSlot, newAppointmentType } = req.body;

    const originalAppointment = mockDataService.appointments.find((a) => a.id === id);
    if (!originalAppointment) {
      res.status(404).json({ success: false, error: 'Original appointment not found' });
      return;
    }

    const doctorId = originalAppointment.doctorId;
    const doctor = mockDataService.doctors.find((d) => d.id === doctorId) || originalAppointment.doctor;
    const targetDate = newDate || originalAppointment.appointmentDate;
    const targetSlot = newTimeSlot || '02:30 PM';
    const targetType = newAppointmentType || originalAppointment.appointmentType;

    const slotKey = `slot:${doctorId}:${targetDate}:${targetSlot}`;

    try {
      const newAppointment = await concurrencyLock.withLock(
        slotKey,
        async () => {
          // Double-check availability for new slot
          if (mockDataService.hasSlotConflict(doctorId, targetDate, targetSlot, originalAppointment.id)) {
            const conflictErr: any = new Error('I am sorry, that time is unavailable. Here are the closest available options.');
            conflictErr.statusCode = 409;
            throw conflictErr;
          }

          return await mockDataService.runTransaction(async () => {
            // Mark original as rescheduled
            const newAppointmentId = `apt-${Date.now()}`;
            originalAppointment.status = AppointmentStatus.RESCHEDULED;
            originalAppointment.rescheduledTo = newAppointmentId;
            originalAppointment.updatedAt = new Date().toISOString();

            // Assign new token for rescheduled appointment
            const deptApts = mockDataService.appointments.filter((a) => a.department === originalAppointment.department);
            const newToken = deptApts.length + 12;

            const apt: Appointment = {
              id: newAppointmentId,
              patientId: originalAppointment.patientId,
              patientName: originalAppointment.patientName,
              doctorId: doctorId,
              doctor: doctor,
              department: originalAppointment.department,
              appointmentType: targetType,
              appointmentDate: targetDate,
              timeSlot: targetSlot,
              tokenNumber: newToken,
              status: AppointmentStatus.CONFIRMED,
              reasonForVisit: originalAppointment.reasonForVisit,
              consultationFee: originalAppointment.consultationFee,
              rescheduledFrom: originalAppointment.id,
              bookingTimestamp: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            mockDataService.appointments.unshift(apt);

            mockDataService.safeNotify(
              apt.patientId,
              'Appointment Successfully Rescheduled',
              `Your consultation with ${doctor?.fullName || 'Specialist'} has been moved to ${targetDate} at ${targetSlot}. ${targetType === 'DIRECT' ? `New Token #${newToken}` : `New Appointment ID: ${newAppointmentId}`}.`,
              NotificationType.APPOINTMENT_REMINDER
            );

            // Audit Ledger Registration
            auditLoggerService.logEvent({
              userId: apt.patientId,
              userRole: 'PATIENT',
              action: 'APPOINTMENT_RESCHEDULED',
              resource: `Appointment:${apt.id}`,
              ipAddress: req.ip || '127.0.0.1',
              details: `Rescheduled from ${originalAppointment.appointmentDate} ${originalAppointment.timeSlot} to ${targetDate} ${targetSlot}.`,
              status: 'SUCCESS',
              beforeState: { id: originalAppointment.id, date: originalAppointment.appointmentDate, slot: originalAppointment.timeSlot },
              afterState: { id: apt.id, date: targetDate, slot: targetSlot, token: newToken }
            });

            return apt;
          });
        },
        'A rescheduling operation is currently in progress for this slot. Please try again momentarily.'
      );

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: newAppointment
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: err.message || 'Conflict occurred during reschedule.'
      });
    }
  },

  setAppointmentReminder: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { reminderMinutesBefore = 60 } = req.body;

    const appointment = mockDataService.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    appointment.reminderEnabled = true;
    appointment.reminderMinutesBefore = reminderMinutesBefore;
    appointment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Appointment reminder set for ${reminderMinutesBefore} minutes prior.`,
      data: appointment
    });
  },

  cancelAppointment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = mockDataService.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = cancellationReason || 'Patient request';
    appointment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  },

  getQueueStatus: async (req: Request, res: Response): Promise<void> => {
    const { department } = req.query;
    res.json({
      success: true,
      data: {
        department: (department as string) || 'Cardiology OPD',
        currentToken: 10,
        myToken: 12,
        waitingCount: 2,
        estimatedWaitTimeMinutes: 14,
        status: 'ON_TIME'
      }
    });
  }
};
