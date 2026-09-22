import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '@mediflow/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  patientId?: string;
  doctorId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Development / Demo fast-track token support
  if (token === 'mock-jwt-token-12345') {
    req.user = {
      id: 'usr-pat-001',
      email: 'rajesh.sharma@example.com',
      role: UserRole.PATIENT,
      name: 'Rajesh Sharma',
      patientId: 'pat-001'
    };
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

export const authenticateOptional = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'mock-jwt-token-12345') {
      req.user = {
        id: 'usr-pat-001',
        email: 'rajesh.sharma@example.com',
        role: UserRole.PATIENT,
        name: 'Rajesh Sharma',
        patientId: 'pat-001'
      };
    } else {
      try {
        req.user = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      } catch {
        // Continue unauthenticated if token invalid
      }
    }
  }
  next();
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access restricted. Requires one of roles: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
};
