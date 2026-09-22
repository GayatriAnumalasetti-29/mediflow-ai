import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Apple,
  Activity,
  CalendarDays,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
  Plus,
  Flame,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const RecoveryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'JOURNEY' | 'DIET' | 'ACTIVITY' | 'THERAPY'>('JOURNEY');

  // Activity logging modal
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [activityName, setActivityName] = useState('Gentle Flat-Surface Walking & Diaphragmatic Breathing');
  const [durationMins, setDurationMins] = useState(15);
  const [heartRate, setHeartRate] = useState(88);
  const [rpeScale, setRpeScale] = useState(3);
  const [activityNotes, setActivityNotes] = useState('Completed comfortable walk, no chest heaviness or fatigue.');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const [activityHistory, setActivityHistory] = useState([
    {
      id: 'act-1',
      name: 'Gentle Flat-Surface Walking & Diaphragmatic Breathing',
      duration: 15,
      heartRate: 88,
      rpe: 3,
      time: 'Today, 11:45 AM',
      notes: 'Comfortable pace, no chest tightness or dizziness reported.'
    },
    {
      id: 'act-2',
      name: 'Gentle Upper Body Mobility & Breathing Exercises',
      duration: 10,
      heartRate: 82,
      rpe: 2,
      time: 'Yesterday, 05:00 PM',
      notes: 'Completed full breathing cycles smoothly.'
    }
  ]);

  const handleSaveActivity = () => {
    setIsSubmittingActivity(true);
    setTimeout(() => {
      const newAct = {
        id: `act-${Date.now()}`,
        name: activityName,
        duration: durationMins,
        heartRate,
        rpe: rpeScale,
        time: 'Just now',
        notes: activityNotes
      };
      setActivityHistory((prev) => [newAct, ...prev]);
      setIsSubmittingActivity(false);
      setIsLogActivityOpen(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Recovery Hub Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(16, 185, 129, 0.15))',
          border: '1px solid rgba(14, 165, 233, 0.3)'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                🩺 Clinician-Authorized Care Protocol
              </span>
              <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                Day 5 Post-Angioplasty
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', fontWeight: 700 }}>
              Post-Treatment Recovery & Rehabilitation Hub
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '4px' }}>
              Supervised cardiovascular recovery roadmap integrating clinician orders, clinical nutrition, safe physical exertion, and rehab progress.
            </p>
          </div>

          {/* Quick Attribution Legend */}
          <div className="flex flex-col gap-1.5 glass-card" style={{ padding: '0.65rem 0.95rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <strong>Clinician Authorized:</strong> Physician/Therapist Orders
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <strong>AI Assistant:</strong> Scheduling, Reminders & Logging
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'JOURNEY', label: 'Recovery Journey Map', icon: TrendingUp },
          { id: 'DIET', label: 'Diet & Nutrition Plan', icon: Apple },
          { id: 'ACTIVITY', label: 'Clinician-Approved Activity', icon: Activity },
          { id: 'THERAPY', label: 'Physical Therapy & Rehab', icon: HeartPulse }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 600,
                background: isActive ? '#0ea5e9' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RECOVERY JOURNEY MAP */}
      {activeTab === 'JOURNEY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Milestone Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <CheckCircle2 size={24} color="#ffffff" />
                </div>
                <div>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '2px' }}>
                    🩺 Clinician Confirmed Procedure
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
                    Percutaneous Coronary Intervention (DES Stent Placement)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Completed on August 26, 2026 • Attending Cardiologist: Dr. Priya Varma, MD, DM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="glass-card" style={{ padding: '0.5rem 0.9rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Recovery Stage</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>Phase 2 (Home Safe)</div>
                </div>
              </div>
            </div>

            {/* 4-Phase Recovery Roadmap */}
            <div className="grid-cols-4" style={{ gap: '1rem' }}>
              <div className="glass-card" style={{ border: '1px solid rgba(52, 211, 153, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>PHASE 1 (DAYS 1-2)</span>
                  <CheckCircle2 size={16} color="#34d399" />
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem', marginTop: '4px' }}>Acute Inpatient Discharge</div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Stent placement & CCU vitals stabilization completed.</p>
              </div>

              <div className="glass-card" style={{ border: '1.5px solid #0ea5e9', background: 'rgba(14, 165, 233, 0.12)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>PHASE 2 (WEEKS 1-2)</span>
                  <span className="badge badge-routine">Current</span>
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem', marginTop: '4px' }}>Home Recovery & Mobility</div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>15-min daily walking, low sodium diet, 94% Rx adherence.</p>
              </div>

              <div className="glass-card" style={{ opacity: 0.75 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>PHASE 3 (WEEKS 3-6)</span>
                  <Clock size={16} color="#94a3b8" />
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem', marginTop: '4px' }}>Cardiopulmonary Strength</div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>12 supervised cardiac rehab sessions & 2D-Echo Doppler check.</p>
              </div>

              <div className="glass-card" style={{ opacity: 0.6 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>PHASE 4 (MONTHS 2-6+)</span>
                  <Clock size={16} color="#94a3b8" />
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem', marginTop: '4px' }}>Long-Term Maintenance</div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Full physical exertion clearance & annual lipid monitoring.</p>
              </div>
            </div>
          </div>

          {/* Quick Summary Grid of All Pillars */}
          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.85rem' }}>
                <div className="flex items-center gap-2">
                  <Apple size={18} color="#10b981" />
                  <h4 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>Prescribed Nutrition</h4>
                </div>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                  🩺 Clinician Authorized
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Low-Sodium Cardiac Nutrition Plan • Target: 1,800 kcal / day • Sodium: &lt; 2g / day • Hydration: 1.6 / 2.2 Liters logged.
              </p>
              <button
                onClick={() => setActiveTab('DIET')}
                className="btn btn-secondary flex items-center gap-1"
                style={{ marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <span>View Full Meal Schedule</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.35rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.85rem' }}>
                <div className="flex items-center gap-2">
                  <HeartPulse size={18} color="#a78bfa" />
                  <h4 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>Cardiac Rehabilitation</h4>
                </div>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
                  🩺 Dr. Ananya Ray, PT
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Chest Physiotherapy & Mobility Restoration • Mon/Wed/Fri 04:30 PM • 2 of 12 Supervised Sessions Completed.
              </p>
              <button
                onClick={() => setActiveTab('THERAPY')}
                className="btn btn-secondary flex items-center gap-1"
                style={{ marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <span>View Rehab Progress Notes</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIET & NUTRITION */}
      {activeTab === 'DIET' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '4px' }}>
                  🩺 Authorized by Dr. Priya Varma & Clinical Nutritionist Shalini Iyer, RD
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
                  Cardiac Low-Sodium Nutrition Schedule
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                  🤖 AI Automated Meal Reminders Active
                </span>
              </div>
            </div>

            {/* Meal Plan Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { time: '09:00 AM', meal: 'Breakfast', items: 'Oatmeal porridge with sliced almonds, 2 boiled egg whites, 1 cup warm water', cal: '420 kcal', status: 'Consumed' },
                { time: '01:00 PM', meal: 'Lunch', items: '1 cup Brown rice, steamed seasonal vegetables (beans/carrots), 1 cup yellow dal, cucumber salad', cal: '580 kcal', status: 'Consumed' },
                { time: '05:30 PM', meal: 'Evening Snack', items: 'Green tea without sugar, 15g unsalted roasted walnuts/almonds', cal: '180 kcal', status: 'Pending' },
                { time: '08:00 PM', meal: 'Dinner', items: '2 Multigrain rotis, clear vegetable soup with herbs, 50g grilled tofu/paneer', cal: '480 kcal', status: 'Pending' }
              ].map((m, idx) => (
                <div key={idx} className="glass-card flex items-center justify-between flex-wrap gap-4" style={{ padding: '1rem 1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '80px', fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                      {m.time}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{m.meal}</div>
                      <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>{m.items}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>{m.cal}</span>
                    <span className={`badge ${m.status === 'Consumed' ? 'badge-routine' : 'badge-urgent'}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Restricted Foods Alert */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#f87171', fontSize: '0.88rem' }}>
                  Restricted Foods (Strict Cardiac Precaution)
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Avoid deep-fried snacks, high-sodium pickles, processed meats, full-fat dairy, and caffeinated/sugary sodas. Keep total sodium strictly under 2,000 mg per day.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICIAN-APPROVED ACTIVITY */}
      {activeTab === 'ACTIVITY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '4px' }}>
                  🩺 Clinician-Approved Activity Protocol (Dr. Priya Varma)
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
                  Safe Physical Exertion & Daily Walking Log
                </h3>
              </div>

              <button
                onClick={() => setIsLogActivityOpen(true)}
                className="btn btn-primary flex items-center gap-1.5"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                <Plus size={16} />
                <span>Log Completed Activity</span>
              </button>
            </div>

            {/* Safety Guidelines Card */}
            <div className="glass-card" style={{ padding: '1.15rem', marginBottom: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div className="flex items-center gap-2" style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                <ShieldCheck size={18} />
                <span>Cardiac Exertion Safety Boundaries</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                • <strong>Prescribed Routine:</strong> 15 minutes of gentle walking on flat surfaces (Mid-morning or early evening).<br />
                • <strong>Heart Rate Ceiling:</strong> Maximum 110 bpm (Borg RPE Scale: 2-3 / 10 Light exertion).<br />
                • <strong>Red-Flag Stop Rule:</strong> Stop immediately if experiencing chest tightness, lightheadedness, or sudden dyspnea.
              </p>
            </div>

            {/* Activity History Logs */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Logged Exercise Sessions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activityHistory.map((act) => (
                <div key={act.id} className="glass-card flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{act.name}</span>
                      <span className="badge badge-routine">✓ {act.duration} mins</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Notes: {act.notes}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Logged: {act.time} • Exertion RPE: <strong>{act.rpe}/10 (Safe)</strong> • Heart Rate: <strong>{act.heartRate} bpm</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THERAPY & REHABILITATION */}
      {activeTab === 'THERAPY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', marginBottom: '4px' }}>
                  🩺 Supervising Physiotherapist: Dr. Ananya Ray, Senior PT, BPT, MPT (Cardiopulmonary)
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
                  Cardiac Rehabilitation & Chest Physiotherapy Logs
                </h3>
              </div>

              <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                🤖 AI Session Attendance Tracker Active
              </span>
            </div>

            {/* Therapy Sessions Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.98rem' }}>Session #2: Deep Breathing & Gentle Mobility</span>
                      <span className="badge badge-routine">Attended</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      Conducted on August 29, 2026 at 04:30 PM • Duration: 30 mins
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                    Therapist Clinical Progress Notes (Dr. Ananya Ray):
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    "Patient demonstrated 15% increase in inspiratory breath hold without accessory muscle strain. Blood pressure post-exercise: 124/80 mmHg. Cleared to continue phase 2 flat-walking at home."
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.98rem' }}>Session #3: Inspiratory Resistance Training</span>
                      <span className="badge badge-urgent">Scheduled</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      Monday, September 02, 2026 at 04:30 PM • Physio Room 2B
                    </div>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                    Reminder Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      <Modal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        title="Log Completed Physical Activity"
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Activity Routine:
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Duration (Minutes):
              </label>
              <input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Heart Rate (bpm):
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Perceived Exertion (Borg RPE Scale: 1 = Very Easy, 10 = Max):
              </label>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{rpeScale} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rpeScale}
              onChange={(e) => setRpeScale(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: rpeScale > 5 ? '#ef4444' : '#0ea5e9' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Notes / Sensations:
            </label>
            <textarea
              value={activityNotes}
              onChange={(e) => setActivityNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <button onClick={() => setIsLogActivityOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSaveActivity}
              disabled={isSubmittingActivity}
              className="btn btn-primary"
            >
              {isSubmittingActivity ? 'Saving...' : 'Save Activity Entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
