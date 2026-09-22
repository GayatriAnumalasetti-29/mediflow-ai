import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '@mediflow/shared';
import { AuthenticatedRequest } from '../middlewares/auth';

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, role } = req.body;

    // Fast-track demo login / development tokens
    const userRole = (role as UserRole) || UserRole.PATIENT;
    const user = {
      id: userRole === UserRole.PATIENT ? 'usr-pat-001' : 'usr-doc-001',
      email: email || (userRole === UserRole.PATIENT ? 'rajesh.sharma@example.com' : 'priya.varma@mediflow.org'),
      name: userRole === UserRole.PATIENT ? 'Rajesh Sharma' : 'Dr. Priya Varma',
      role: userRole,
      patientId: userRole === UserRole.PATIENT ? 'pat-001' : undefined,
      doctorId: userRole === UserRole.DOCTOR ? 'doc-001' : undefined
    };

    const token = jwt.sign(user, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user
    });
  },

  getCurrentUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({ success: true, user: req.user });
  }
};
