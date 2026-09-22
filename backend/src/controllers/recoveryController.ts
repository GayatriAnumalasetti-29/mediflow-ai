import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export interface ActivityLogItem {
  id: string;
  patientId: string;
  activityName: string;
  durationMinutes: number;
  heartRateBpm: number;
  rpeExertionScale: number; // Borg 1-10
  loggedAt: string;
  notes: string;
}

let mockActivityLogs: ActivityLogItem[] = [
  {
    id: 'act-1',
    patientId: 'pat-001',
    activityName: 'Gentle Flat-Surface Walking & Diaphragmatic Breathing',
    durationMinutes: 15,
    heartRateBpm: 88,
    rpeExertionScale: 3,
    loggedAt: 'Today, 11:45 AM',
    notes: 'Comfortable pace, no chest tightness or dizziness reported.'
  },
  {
    id: 'act-2',
    patientId: 'pat-001',
    activityName: 'Gentle Upper Body Mobility & Breathing Exercises',
    durationMinutes: 10,
    heartRateBpm: 82,
    rpeExertionScale: 2,
    loggedAt: 'Yesterday, 05:00 PM',
    notes: 'Completed full breathing cycles smoothly.'
  }
];

export const recoveryController = {
  getRecoveryOverview: async (req: Request, res: Response): Promise<void> => {
    const { patientId } = req.params;

    res.json({
      success: true,
      data: {
        treatmentMilestone: {
          procedureName: 'Percutaneous Coronary Intervention (DES Stent Placement)',
          procedureDate: '2026-08-26',
          daysPostProcedure: 5,
          attendingDoctor: 'Dr. Priya Varma, MD, DM',
          status: 'RECOVERING_ON_TRACK'
        },
        medicationSummary: {
          activeRegimenCount: 3,
          adherenceRate: 94,
          streakDays: 5,
          nextDose: 'Metoprolol ER 25mg at 09:00 PM'
        },
        dietSummary: {
          protocol: 'Clinician-Authorized Low-Sodium Cardiac Nutrition',
          calorieTarget: 1800,
          hydrationGoalLiters: 2.2,
          currentHydrationLiters: 1.6
        },
        activitySummary: {
          weeklyMinutesCompleted: 65,
          targetWeeklyMinutes: 90,
          recentLogs: mockActivityLogs
        },
        therapySummary: {
          type: 'Cardiac Rehabilitation & Chest Physiotherapy',
          assignedTherapist: 'Dr. Ananya Ray, Senior PT',
          sessionsCompleted: 2,
          totalSessionsPrescribed: 12,
          nextSession: 'Monday at 04:30 PM (Physio Room 2B)'
        },
        upcomingFollowUp: {
          doctor: 'Dr. Priya Varma',
          department: 'Cardiology OPD',
          date: 'Tomorrow 10:30 AM',
          tokenNumber: 12,
          requiredChecks: ['12-Lead ECG Doppler', 'Resting BP Profile']
        }
      }
    });
  },

  logActivity: async (req: Request, res: Response): Promise<void> => {
    const { patientId, activityName, durationMinutes, heartRateBpm, rpeExertionScale, notes } = req.body;

    const newActivity: ActivityLogItem = {
      id: `act-${Date.now()}`,
      patientId: patientId || 'pat-001',
      activityName: activityName || 'Gentle Walking & Breathing Routine',
      durationMinutes: durationMinutes || 15,
      heartRateBpm: heartRateBpm || 85,
      rpeExertionScale: rpeExertionScale || 3,
      loggedAt: 'Just now',
      notes: notes || 'Completed without adverse symptoms'
    };

    mockActivityLogs.unshift(newActivity);

    res.status(201).json({
      success: true,
      message: 'Physical activity logged successfully',
      data: newActivity
    });
  },

  logTherapyAttendance: async (req: Request, res: Response): Promise<void> => {
    const { sessionId, attendanceStatus, progressNotes } = req.body;
    res.json({
      success: true,
      message: 'Therapy attendance and clinical progress notes updated',
      data: {
        sessionId: sessionId || 'ther-1',
        attendanceStatus: attendanceStatus || 'ATTENDED',
        progressNotes: progressNotes || 'Inspiratory capacity improved by 15%. Good endurance on gentle treadmill test.',
        updatedAt: new Date().toISOString()
      }
    });
  },

  getJourneyMap: async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        currentPhase: 'Phase 2: Early Home Recovery & Mobility',
        phases: [
          {
            phaseNumber: 1,
            name: 'Hospital Inpatient & Acute Discharge',
            duration: 'Days 1 - 2',
            status: 'COMPLETED',
            milestones: ['Successful Angioplasty Stent Placement', 'Vitals stabilized in CCU', 'Discharge counseling & Rx verification']
          },
          {
            phaseNumber: 2,
            name: 'Early Home Recovery & Safe Mobility',
            duration: 'Week 1 - 2',
            status: 'IN_PROGRESS',
            milestones: ['Daily 15-min flat walking', 'Strict low-sodium cardiac diet', '94% medication adherence streak', 'First OPD follow-up with Dr. Priya Varma']
          },
          {
            phaseNumber: 3,
            name: 'Cardiopulmonary Strength & Cardiac Rehab',
            duration: 'Week 3 - 6',
            status: 'UPCOMING',
            milestones: ['Graduated 30-min brisk walking', 'Complete 12 supervised cardiac rehab sessions', '2D-Echocardiogram Doppler review']
          },
          {
            phaseNumber: 4,
            name: 'Long-term Cardiovascular Maintenance',
            duration: 'Month 2 - 6+',
            status: 'UPCOMING',
            milestones: ['Full physical exertion clearance', 'Annual lipid profile & stress testing', 'Autonomous lifestyle maintenance']
          }
        ]
      }
    });
  }
};
