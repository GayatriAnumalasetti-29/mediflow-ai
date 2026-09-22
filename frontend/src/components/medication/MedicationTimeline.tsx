import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MedicationSchedule, MedicationDose, DoseStatus } from '@mediflow/shared';
import { Check, Clock, AlertCircle, ShieldCheck, Flame } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const MedicationTimeline: React.FC = () => {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [adherence, setAdherence] = useState<number>(100);

  useEffect(() => {
    api.getMedicationSchedules('pat-001').then((res: MedicationSchedule[]) => {
      setSchedules(res || []);
      setDoses([
        { id: 'd-1', scheduleId: 'sched-01', patientId: 'pat-001', medicineName: 'Ecosprin 75mg', dosage: '1 Tab', scheduledTime: '08:30 AM', status: DoseStatus.TAKEN, timingNote: 'Morning dose' },
        { id: 'd-2', scheduleId: 'sched-02', patientId: 'pat-001', medicineName: 'Metoprolol ER 25mg', dosage: '1 Tab', scheduledTime: '09:00 AM', status: DoseStatus.TAKEN, timingNote: 'Morning dose' },
        { id: 'd-3', scheduleId: 'sched-02', patientId: 'pat-001', medicineName: 'Metoprolol ER 25mg', dosage: '1 Tab', scheduledTime: '09:00 PM', status: DoseStatus.PENDING, timingNote: 'Night dose' }
      ]);
    }).catch(console.error);
  }, []);

  const handleTakeDose = async (doseId: string) => {
    try {
      await api.logMedicationTaken({ doseId, status: 'TAKEN' });
      setDoses((prev) =>
        prev.map((d) => (d.id === doseId ? { ...d, status: DoseStatus.TAKEN, confirmedAt: new Date().toISOString() } : d))
      );
    } catch (err) {
      console.error('Error taking dose', err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
            Daily Medication Schedule & Adherence
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Verified post-prescription daily doses with timing and food instructions.
          </p>
        </div>

        <div className="flex items-center gap-3 glass-card" style={{ padding: '0.5rem 1rem' }}>
          <Flame size={20} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Adherence Streak</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>5 Days Active (94%)</div>
          </div>
        </div>
      </div>

      {/* Today's Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {doses.map((dose) => {
          const isTaken = dose.status === DoseStatus.TAKEN;
          return (
            <div
              key={dose.id}
              className="glass-card flex items-center justify-between"
              style={{
                border: isTaken ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                background: isTaken ? 'rgba(16, 185, 129, 0.05)' : 'rgba(17, 24, 39, 0.65)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isTaken ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isTaken ? <Check size={20} color="#34d399" /> : <Clock size={20} color="#38bdf8" />}
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                    {dose.medicineName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {dose.dosage} • {dose.timingNote}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge
                  status={dose.status}
                  variant={isTaken ? 'success' : 'warning'}
                />

                {!isTaken && (
                  <button
                    onClick={() => handleTakeDose(dose.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    <Check size={14} />
                    <span>Confirm Taken</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
