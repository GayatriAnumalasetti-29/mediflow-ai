import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Pill,
  Apple,
  Activity,
  CalendarDays,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import { CareTimelineItem } from '../../../../backend/src/controllers/carePlanController';

export const UnifiedCareTimeline: React.FC = () => {
  const [timelineItems, setTimelineItems] = useState<CareTimelineItem[]>([
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
  ]);

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const completedCount = timelineItems.filter((i) => i.isCompleted).length;
  const totalCount = timelineItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleMilestone = (id: string) => {
    setTimelineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isCompleted;
          return {
            ...item,
            isCompleted: nextState,
            completedAt: nextState
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined
          };
        }
        return item;
      })
    );
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'MEDICATION':
        return <Pill size={18} color="#38bdf8" />;
      case 'DIET':
        return <Apple size={18} color="#10b981" />;
      case 'ACTIVITY':
        return <Activity size={18} color="#fbbf24" />;
      case 'THERAPY':
        return <HeartPulse size={18} color="#a78bfa" />;
      case 'FOLLOWUP':
        return <CalendarDays size={18} color="#f43f5e" />;
      default:
        return <CheckCircle2 size={18} color="#34d399" />;
    }
  };

  const filteredItems =
    selectedFilter === 'ALL'
      ? timelineItems
      : timelineItems.filter((i) => i.pillar === selectedFilter);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Top Banner & Adherence Meter */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
              Master Unified Daily Care Timeline
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Chronological daily routine integrating verified medications, meals, physical activity, rehabilitation, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3 glass-card" style={{ padding: '0.65rem 1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Today's Care Compliance</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
              {progressPercent}% Completed ({completedCount}/{totalCount})
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
            borderRadius: '9999px',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      {/* Pillar Filter Pills */}
      <div className="flex gap-2" style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'ALL', label: 'All Milestones' },
          { id: 'MEDICATION', label: 'Medication' },
          { id: 'DIET', label: 'Diet Meals' },
          { id: 'ACTIVITY', label: 'Walking & Activity' },
          { id: 'THERAPY', label: 'Physical Therapy' },
          { id: 'FOLLOWUP', label: 'Follow-Up' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: selectedFilter === f.id ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
              color: selectedFilter === f.id ? '#ffffff' : '#94a3b8',
              border: selectedFilter === f.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Chronological Timeline Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="glass-card flex items-start justify-between gap-4"
            style={{
              padding: '1.15rem 1.25rem',
              border: item.isCompleted
                ? '1px solid rgba(52, 211, 153, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              background: item.isCompleted
                ? 'rgba(16, 185, 129, 0.05)'
                : 'rgba(17, 24, 39, 0.7)'
            }}
          >
            <div className="flex items-start gap-3.5">
              {/* Checkbox Trigger */}
              <button
                onClick={() => toggleMilestone(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '2px'
                }}
                title={item.isCompleted ? 'Mark Pending' : 'Mark Completed'}
              >
                {item.isCompleted ? (
                  <CheckCircle2 size={24} color="#34d399" />
                ) : (
                  <Circle size={24} color="#64748b" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                    {item.time}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: item.isCompleted ? '#94a3b8' : '#f8fafc',
                      textDecoration: item.isCompleted ? 'line-through' : 'none'
                    }}
                  >
                    {item.title}
                  </span>
                  {item.badgeText && (
                    <span
                      className="badge"
                      style={{
                        background:
                          item.badgeVariant === 'success'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : item.badgeVariant === 'warning'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : item.badgeVariant === 'purple'
                            ? 'rgba(139, 92, 246, 0.2)'
                            : 'rgba(14, 165, 233, 0.2)',
                        color:
                          item.badgeVariant === 'success'
                            ? '#34d399'
                            : item.badgeVariant === 'warning'
                            ? '#fbbf24'
                            : item.badgeVariant === 'purple'
                            ? '#a78bfa'
                            : '#38bdf8'
                      }}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                {item.completedAt && (
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
                    ✓ Logged at {item.completedAt}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '4px' }}>{getPillarIcon(item.pillar)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
