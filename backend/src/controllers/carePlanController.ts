import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export interface CareTimelineItem {
  id: string;
  pillar: 'MEDICATION' | 'DIET' | 'ACTIVITY' | 'THERAPY' | 'FOLLOWUP' | 'VITALS';
  time: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'purple';
}

let mockDailyCareTimeline: CareTimelineItem[] = [
  {
    id: 'tl-1',
    pillar: 'VITALS',
    time: '08:00 AM',
    title: 'Morning Blood Pressure & Vitals Log',
    description: 'Target: BP < 130/80 mmHg, Resting Heart Rate 60-80 bpm.',
    isCompleted: true,
    completedAt: '08:05 AM',
    badgeText: '122/78 mmHg',
    badgeVariant: 'success'
  },
  {
    id: 'tl-2',
    pillar: 'MEDICATION',
    time: '08:30 AM',
    title: 'Morning Dose: Ecosprin 75mg',
    description: '1 Tablet after breakfast with water.',
    isCompleted: true,
    completedAt: '08:42 AM',
    badgeText: 'Taken',
    badgeVariant: 'success'
  },
  {
    id: 'tl-3',
    pillar: 'DIET',
    time: '09:00 AM',
    title: 'Heart-Healthy Breakfast',
    description: 'Oatmeal porridge with sliced almonds + 2 boiled egg whites (Low-Sodium).',
    isCompleted: true,
    completedAt: '09:15 AM',
    badgeText: '420 kcal',
    badgeVariant: 'info'
  },
  {
    id: 'tl-4',
    pillar: 'FOLLOWUP',
    time: '10:30 AM',
    title: 'Doctor OPD Follow-up Consultation',
    description: 'Dr. Priya Varma (Cardiology OPD Room 104) • Review post-angioplasty vitals & ECG.',
    isCompleted: false,
    badgeText: 'Token #12',
    badgeVariant: 'warning'
  },
  {
    id: 'tl-5',
    pillar: 'ACTIVITY',
    time: '11:30 AM',
    title: 'Clinician-Approved Gentle Walking',
    description: '15-min flat surface gentle walk with guided slow deep breathing (HR limit: 110 bpm).',
    isCompleted: false,
    badgeText: '15 mins',
    badgeVariant: 'info'
  },
  {
    id: 'tl-6',
    pillar: 'DIET',
    time: '01:00 PM',
    title: 'Nutritious Cardiac Lunch',
    description: 'Brown rice, steamed seasonal veggies, yellow dal, and fresh cucumber salad.',
    isCompleted: false,
    badgeText: '580 kcal',
    badgeVariant: 'info'
  },
  {
    id: 'tl-7',
    pillar: 'THERAPY',
    time: '04:30 PM',
    title: 'Cardiac Rehabilitation Therapy',
    description: 'Chest physiotherapy and breathing exercises with Dr. Ananya Ray in Physio Room 2B.',
    isCompleted: false,
    badgeText: 'Rehab Session',
    badgeVariant: 'purple'
  },
  {
    id: 'tl-8',
    pillar: 'DIET',
    time: '05:30 PM',
    title: 'Evening Snack & Hydration Check',
    description: 'Green tea with unsalted roasted nuts. Hydration target: 1.6 / 2.2L.',
    isCompleted: false,
    badgeText: 'Hydration',
    badgeVariant: 'info'
  },
  {
    id: 'tl-9',
    pillar: 'DIET',
    time: '08:00 PM',
    title: 'Low-Sodium Cardiac Dinner',
    description: '2 Multigrain rotis, clear vegetable soup, and grilled paneer.',
    isCompleted: false,
    badgeText: '480 kcal',
    badgeVariant: 'info'
  },
  {
    id: 'tl-10',
    pillar: 'MEDICATION',
    time: '09:00 PM',
    title: 'Evening Dose: Metoprolol ER 25mg',
    description: '1 Tablet post-dinner. Swallow whole, do not crush.',
    isCompleted: false,
    badgeText: 'Due 09:00 PM',
    badgeVariant: 'warning'
  },
  {
    id: 'tl-11',
    pillar: 'FOLLOWUP',
    time: '09:30 PM',
    title: 'Daily Post-Discharge Health Check-In',
    description: 'Report evening pain score (0-10), dizziness, and vitals via AI voice check-in.',
    isCompleted: false,
    badgeText: 'AI Check-In',
    badgeVariant: 'purple'
  }
];

export const carePlanController = {
  getDailyTimeline: async (req: Request, res: Response): Promise<void> => {
    const total = mockDailyCareTimeline.length;
    const completed = mockDailyCareTimeline.filter((t) => t.isCompleted).length;
    const compliancePercent = Math.round((completed / total) * 100);

    res.json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        totalMilestones: total,
        completedMilestones: completed,
        compliancePercent,
        timeline: mockDailyCareTimeline
      }
    });
  },

  toggleMilestone: async (req: Request, res: Response): Promise<void> => {
    const { milestoneId } = req.body;
    const item = mockDailyCareTimeline.find((t) => t.id === milestoneId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Milestone not found' });
      return;
    }

    item.isCompleted = !item.isCompleted;
    if (item.isCompleted) {
      item.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      item.completedAt = undefined;
    }

    const total = mockDailyCareTimeline.length;
    const completed = mockDailyCareTimeline.filter((t) => t.isCompleted).length;

    res.json({
      success: true,
      message: `Milestone updated: ${item.title}`,
      data: {
        item,
        compliancePercent: Math.round((completed / total) * 100)
      }
    });
  }
};
