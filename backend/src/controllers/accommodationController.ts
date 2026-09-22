import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { BedStatus, Bed, Room } from '@mediflow/shared';
import { socketService } from '../services/socketService';

export const accommodationController = {
  getRooms: async (req: Request, res: Response): Promise<void> => {
    const roomsWithBeds = mockDataService.rooms.map((room) => ({
      ...room,
      beds: mockDataService.beds.filter((b) => b.roomId === room.id)
    }));

    res.json({
      success: true,
      data: roomsWithBeds
    });
  },

  allocateBed: async (req: Request, res: Response): Promise<void> => {
    const { bedId, patientId } = req.body;
    const targetBed = mockDataService.beds.find((b) => b.id === bedId);

    if (!targetBed) {
      res.status(404).json({ success: false, error: 'Bed not found' });
      return;
    }

    targetBed.status = BedStatus.OCCUPIED;
    targetBed.currentPatientId = patientId || 'pat-001';

    mockDataService.notifications.unshift({
      id: `notif-${Date.now()}`,
      patientId: patientId || 'pat-001',
      title: 'Bed Allocation Confirmed',
      message: `You have been allocated Bed ${targetBed.bedNumber} in ${targetBed.category} (${targetBed.roomNumber}).`,
      type: 'ROOM_ALLOCATION',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    socketService.emitToAll('bed_status_changed', targetBed);

    res.json({
      success: true,
      message: 'Bed allocated successfully',
      data: targetBed
    });
  },

  admitPatient: async (req: Request, res: Response): Promise<void> => {
    const { patientId, bedId, admittingDoctorId, primaryDiagnosis } = req.body;
    
    let targetBed = mockDataService.beds.find((b) => b.id === bedId) || mockDataService.beds.find((b) => b.status === BedStatus.AVAILABLE);
    if (targetBed) {
      targetBed.status = BedStatus.OCCUPIED;
      targetBed.currentPatientId = patientId || 'pat-001';
    }

    const admissionRecord = {
      id: `adm-${Date.now()}`,
      patientId: patientId || 'pat-001',
      admittingDoctorId: admittingDoctorId || 'doc-001',
      bedId: targetBed?.id || 'bed-1',
      roomNumber: targetBed?.roomNumber || 'SP-201',
      admissionDate: new Date().toISOString(),
      primaryDiagnosis: primaryDiagnosis || 'Coronary Artery Disease - Post Angioplasty',
      status: 'ADMITTED'
    };

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully. Room and bed allocated.',
      data: admissionRecord
    });
  },

  dischargePatient: async (req: Request, res: Response): Promise<void> => {
    const { admissionId, dischargeNotes } = req.body;

    mockDataService.beds.forEach((bed) => {
      if (bed.currentPatientId === 'pat-001') {
        bed.status = BedStatus.AVAILABLE;
        bed.currentPatientId = undefined;
      }
    });

    res.json({
      success: true,
      message: 'Patient discharged. Bed marked available and post-discharge plan initiated.',
      data: {
        admissionId,
        status: 'DISCHARGED',
        dischargeDate: new Date().toISOString(),
        dischargeNotes: dischargeNotes || 'Discharged in stable clinical condition. Follow prescribed medications and diet.'
      }
    });
  },

  updateBedStatus: async (req: Request, res: Response): Promise<void> => {
    const { bedId } = req.params;
    const { status } = req.body;

    const targetBed = mockDataService.beds.find((b) => b.id === bedId);
    if (!targetBed) {
      res.status(404).json({ success: false, error: 'Bed not found' });
      return;
    }

    targetBed.status = status as BedStatus;

    res.json({
      success: true,
      message: 'Bed status updated',
      data: targetBed
    });
  }
};
