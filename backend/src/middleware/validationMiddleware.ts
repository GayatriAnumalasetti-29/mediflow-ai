import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';

export interface ValidationTarget {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validateRequest = (schemas: ValidationTarget) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error: Request payload failed schema verification.',
          issues
        });
        return;
      }

      next(error);
    }
  };
};

// Common Medical Schemas
export const BookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required').optional().default('pat-001'),
  patientName: z.string().min(1, 'Patient name is required').optional().default('Patient'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  department: z.string().min(1, 'Department is required').optional(),
  appointmentType: z.enum(['VIRTUAL', 'DIRECT', 'virtual', 'direct'], {
    errorMap: () => ({ message: "Appointment type must be either 'VIRTUAL' or 'DIRECT'" })
  }).optional().default('DIRECT'),
  appointmentDate: z.string().min(4, 'Valid appointment date is required').optional(),
  timeSlot: z.string().min(3, 'Time slot is required (e.g. 10:30 AM)'),
  reasonForVisit: z.string().max(500, 'Reason for visit cannot exceed 500 characters').optional()
});

export const RescheduleAppointmentSchema = z.object({
  newDate: z.string().min(4, 'New appointment date is required').optional(),
  newTimeSlot: z.string().min(3, 'New time slot is required (e.g. 02:30 PM)'),
  newAppointmentType: z.enum(['VIRTUAL', 'DIRECT', 'virtual', 'direct']).optional(),
  reason: z.string().max(300).optional()
});

export const DoctorLoginSchema = z.object({
  email: z.string().email('Valid institutional email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['DOCTOR', 'NURSE', 'ADMIN', 'STAFF']).optional()
});

export const CheckInSchema = z.object({
  id: z.string().min(1, 'Appointment ID is required')
});

export const BridgeAuthorizeSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'PIN must be a 6-digit numeric code'),
  clientType: z.enum(['LAPTOP_BROWSER', 'DESKTOP_STATION', 'DOCTOR_CONSOLE']).optional()
});
