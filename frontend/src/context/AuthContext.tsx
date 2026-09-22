import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '@mediflow/shared';

export interface UserSession {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
  department?: string;
  uhid?: string;
  age?: number;
  gender?: string;
  address?: string;
  contactNumber?: string;
  reason?: string;
  symptoms?: string;
  primaryLanguage?: string;
  photoUrl?: string | null;
  activeAppointment?: any | null;
  // Context-awareness flags
  isAdmitted?: boolean;
  hasBill?: boolean;
  hasPrescription?: boolean;
  hasReminderRequest?: boolean;
  hasMissedAppointment?: boolean;
  missedAppointmentDetails?: {
    doctorName: string;
    department: string;
    originalDate: string;
    originalSlot: string;
  } | null;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: Partial<UserSession>) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setPatientSession: (patientData: Partial<UserSession>) => void;
  setActiveAppointment: (apt: any) => void;
  updateContextFlags: (flags: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (credentials: Partial<UserSession>) => {
    const isStaff = credentials.role === UserRole.DOCTOR || credentials.role === UserRole.ADMIN || credentials.role === UserRole.NURSE;
    setUser({
      id: credentials.id || (isStaff ? 'usr-doc-001' : `usr-pat-${Date.now()}`),
      fullName: credentials.fullName || (isStaff ? 'Dr. Priya Varma, MD, DM' : ''),
      role: credentials.role || UserRole.PATIENT,
      email: credentials.email || (isStaff ? 'dr.priya@mediflow.hospital' : ''),
      department: credentials.department || (isStaff ? 'Cardiology' : undefined),
      uhid: credentials.uhid,
      age: credentials.age,
      gender: credentials.gender,
      address: credentials.address,
      contactNumber: credentials.contactNumber,
      reason: credentials.reason,
      symptoms: credentials.symptoms,
      primaryLanguage: credentials.primaryLanguage,
      photoUrl: credentials.photoUrl,
      activeAppointment: credentials.activeAppointment || null
    });
    setToken('session-token-active');
  };

  const setPatientSession = (patientData: Partial<UserSession>) => {
    setUser((prev) => ({
      id: prev?.id || `usr-pat-${Date.now()}`,
      fullName: patientData.fullName || prev?.fullName || '',
      role: UserRole.PATIENT,
      email: patientData.email || prev?.email || `${(patientData.fullName || 'patient').toLowerCase().replace(/\s+/g, '.')}@patient.mediflow.hospital`,
      uhid: patientData.uhid || prev?.uhid,
      age: patientData.age || prev?.age,
      gender: patientData.gender || prev?.gender,
      address: patientData.address || prev?.address,
      contactNumber: patientData.contactNumber || prev?.contactNumber,
      reason: patientData.reason || prev?.reason,
      symptoms: patientData.symptoms || prev?.symptoms,
      primaryLanguage: patientData.primaryLanguage || prev?.primaryLanguage,
      photoUrl: patientData.photoUrl || prev?.photoUrl,
      activeAppointment: prev?.activeAppointment || null
    }));
    setToken('patient-session-token');
  };

  const setActiveAppointment = (apt: any) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeAppointment: apt
      };
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const switchRole = (role: UserRole) => {
    const isStaff = role === UserRole.DOCTOR || role === UserRole.ADMIN || role === UserRole.NURSE;
    setUser({
      id: isStaff ? 'usr-doc-001' : 'usr-pat-001',
      fullName: isStaff ? 'Dr. Priya Varma, MD, DM' : '',
      role,
      email: isStaff ? 'dr.priya@mediflow.hospital' : '',
      department: isStaff ? 'Cardiology' : undefined
    });
  };

  const updateContextFlags = (flags: Partial<UserSession>) => {
    setUser((prev) => (prev ? { ...prev, ...flags } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        login,
        logout,
        switchRole,
        setPatientSession,
        setActiveAppointment,
        updateContextFlags
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
