import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';
import { VerificationStatus, Prescription, MedicationSchedule, MedicationFrequency } from '@mediflow/shared';
import { socketService } from '../services/socketService';
import { prescriptionOcrService } from '../services/prescriptionOcrService';

export const prescriptionController = {
  getPatientPrescriptions: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const records = mockDataService.prescriptions.filter((p) => p.patientId === patientId);
    res.json({ success: true, data: records });
  },

  uploadPrescription: async (req: Request, res: Response): Promise<void> => {
    const { patientId, doctorNotes, imageDataUrl, image } = req.body;
    const uploadedFileBuffer = (req as any).file ? (req as any).file.buffer : null;

    const imageInput = uploadedFileBuffer || imageDataUrl || image;

    // Run Real Tesseract.js Optical Character Recognition Engine
    const ocrResult = await prescriptionOcrService.extractFromImage(imageInput);

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: patientId || 'pat-001',
      doctorId: 'doc-001',
      doctorName: 'Dr. Priya Varma',
      imageUrl: typeof imageInput === 'string' && imageInput.startsWith('data:image')
        ? imageInput
        : '/assets/sample_rx_cardiac.png',
      verificationStatus: VerificationStatus.UNVERIFIED,
      ocrConfidence: ocrResult.ocrConfidence,
      doctorNotes: doctorNotes || (ocrResult.ocrText ? `OCR Recognized: ${ocrResult.ocrText.slice(0, 80)}...` : 'Cardiology clinic prescription'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extractedItems: ocrResult.extractedItems
    };

    mockDataService.prescriptions.unshift(newRx);
    mockDataService.persist();

    res.status(201).json({
      success: true,
      message: ocrResult.isRealOcrRun
        ? 'Prescription processed by live Tesseract OCR engine. Awaiting human verification.'
        : 'Prescription processed by OCR pipeline. Awaiting human verification.',
      data: newRx,
      ocrDetails: {
        recognizedTextSnippet: ocrResult.ocrText ? ocrResult.ocrText.slice(0, 150) : null,
        confidence: ocrResult.ocrConfidence,
        isRealOcrRun: ocrResult.isRealOcrRun
      }
    });
  },

  verifyPrescription: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { verifiedItems, verificationRole } = req.body;

    const rx = mockDataService.prescriptions.find((p) => p.id === id);
    if (!rx) {
      res.status(404).json({ success: false, error: 'Prescription record not found' });
      return;
    }

    rx.verificationStatus =
      verificationRole === 'STAFF'
        ? VerificationStatus.VERIFIED_BY_STAFF
        : VerificationStatus.VERIFIED_BY_PATIENT;
    rx.verifiedAt = new Date().toISOString();

    if (verifiedItems && Array.isArray(verifiedItems)) {
      rx.extractedItems = verifiedItems;
    }

    // AUTOMATIC MEDICATION SCHEDULE GENERATION UPON VERIFICATION
    rx.extractedItems.forEach((item, index) => {
      const scheduleId = `sched-${Date.now()}-${index}`;
      const scheduledTimes =
        item.frequency === MedicationFrequency.TWICE_DAILY
          ? ['09:00', '21:00']
          : item.frequencyLabel.includes('Night')
          ? ['21:30']
          : ['08:30'];

      const newSchedule: MedicationSchedule = {
        id: scheduleId,
        patientId: rx.patientId,
        prescriptionId: rx.id,
        medicineName: `${item.medicineName} ${item.dosage}`,
        dosage: `1 ${item.form || 'Tablet'}`,
        frequency: item.frequency,
        timing: item.timing,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + item.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTimes,
        instructions: item.instructions || `${item.timing.replace(/_/g, ' ')}`,
        isActive: true
      };

      // Add to active schedules
      mockDataService.medicationSchedules.push(newSchedule);
    });

    mockDataService.persist();

    socketService.emitToPatient(rx.patientId, 'prescription_verified', {
      prescriptionId: rx.id,
      verifiedStatus: rx.verificationStatus,
      itemsCount: rx.extractedItems.length
    });

    res.json({
      success: true,
      message: 'Prescription verified. Daily medication schedule automatically generated and activated.',
      data: rx
    });
  }
};
