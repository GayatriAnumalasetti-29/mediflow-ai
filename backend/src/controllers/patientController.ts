import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { Patient, UrgencyLevel } from '@mediflow/shared';

export const patientController = {
  getAllPatients: async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: mockDataService.patients
    });
  },

  getPatientById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const patient = mockDataService.patients.find((p) => p.id === id);
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }
    res.json({
      success: true,
      data: patient
    });
  },

  registerPatient: async (req: Request, res: Response): Promise<void> => {
    const {
      fullName,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      contactNumber,
      phoneNumber,
      emergencyContact,
      address,
      allergies,
      chronicConditions,
      primaryLanguage,
      reason,
      symptoms,
      uhid: customUhid
    } = req.body;

    const uhidSerial = Math.floor(1000 + Math.random() * 9000);
    const uhid = customUhid || `MF-2026-${uhidSerial}`;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      uhid,
      fullName: fullName || 'New Patient',
      dateOfBirth: dateOfBirth || '1990-01-01',
      age: Number(age) || 36,
      gender: (gender ? String(gender).toUpperCase() : 'MALE') as any,
      bloodGroup: bloodGroup || 'O+',
      contactNumber: contactNumber || phoneNumber || '+91 98765 00000',
      emergencyContact: emergencyContact || '+91 98765 00001 (Family)',
      address: address || 'Hyderabad, Telangana, India',
      allergies: allergies || [],
      chronicConditions: chronicConditions || (symptoms ? [symptoms] : []),
      currentUrgency: UrgencyLevel.ROUTINE,
      primaryLanguage: primaryLanguage || 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockDataService.patients.unshift(newPatient);
    mockDataService.persist();

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully with assigned UHID',
      data: newPatient
    });
  },

  updatePatient: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const patientIndex = mockDataService.patients.findIndex((p) => p.id === id);
    if (patientIndex === -1) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    mockDataService.patients[patientIndex] = {
      ...mockDataService.patients[patientIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Patient profile updated',
      data: mockDataService.patients[patientIndex]
    });
  }
};
