import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Doctor, Appointment, AppointmentStatus } from '@mediflow/shared';
import {
  Calendar,
  Clock,
  UserCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const AppointmentBooking: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [visitReason, setVisitReason] = useState<string>('Post-Angioplasty Follow-up Review');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancellation & Reschedule Modals
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newSlot, setNewSlot] = useState('Tomorrow 02:00 PM');

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getAppointments()]).then(([docs, apts]) => {
      setDoctors(docs);
      setAppointments(apts);
    });
  }, []);

  const departments = ['ALL', 'Cardiology', 'Neurology', 'Orthopedics'];

  const filteredDoctors =
    selectedDept === 'ALL'
      ? doctors
      : doctors.filter((d) => d.department.toLowerCase() === selectedDept.toLowerCase());

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    const slots = (doc as any).availableSlots || doc.availableTimeSlots || ['10:00 AM'];
    setSelectedSlot(slots[0] || '10:00 AM');
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor) return;
    setIsSubmitting(true);
    try {
      const booked = await api.bookAppointment({
        patientId: 'pat-001',
        doctorId: selectedDoctor.id,
        department: selectedDoctor.department,
        timeSlot: selectedSlot,
        reasonForVisit: visitReason
      });
      setAppointments((prev) => [booked, ...prev]);
      setIsBookingOpen(false);
      alert(`Appointment confirmed with ${selectedDoctor.fullName}! Your OPD Token is #${booked.tokenNumber}.`);
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalApt) return;
    try {
      const updated = await api.cancelAppointment(cancelModalApt.id, cancelReason);
      setAppointments((prev) => prev.map((a) => (a.id === cancelModalApt.id ? updated : a)));
      setCancelModalApt(null);
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleModalApt) return;
    try {
      const updated = await api.rescheduleAppointment(rescheduleModalApt.id, newSlot);
      setAppointments((prev) => prev.map((a) => (a.id === rescheduleModalApt.id ? updated : a)));
      setRescheduleModalApt(null);
    } catch (err) {
      console.error('Reschedule failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Active Tokens / Appointments List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              My Scheduled OPD Appointments & Tokens
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Real-time consultation tokens, doctor rooms, and schedule modification.
            </p>
          </div>
          <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
            {appointments.filter((a) => a.status !== 'CANCELLED').length} Active Appointments
          </span>
        </div>

        <div className="grid-cols-2" style={{ gap: '1rem' }}>
          {appointments.map((apt) => (
            <div key={apt.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket size={20} color="#38bdf8" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                    Token #{apt.tokenNumber}
                  </span>
                </div>
                <StatusBadge
                  status={apt.status}
                  variant={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'RESCHEDULED' ? 'warning' : 'danger'}
                />
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>
                  {apt.doctor?.fullName || 'Specialist Physician'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {apt.department} • {apt.doctor?.roomNumber || 'Consultation Room'}
                </p>
              </div>

              <div className="flex items-center gap-4" style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <span className="flex items-center gap-1">
                  <Clock size={14} color="#38bdf8" /> {apt.timeSlot}
                </span>
                <span>Reason: {apt.reasonForVisit}</span>
              </div>

              {apt.status !== 'CANCELLED' && (
                <div className="flex gap-2" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setRescheduleModalApt(apt)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => setCancelModalApt(apt)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                  >
                    <XCircle size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Doctor Directory & Booking Catalog */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              Hospital Specialists & Available Slots
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Select department and book direct appointments with token assignment.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="flex gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: selectedDept === dept ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
                  color: selectedDept === dept ? '#ffffff' : '#94a3b8',
                  border: selectedDept === dept ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-cols-3" style={{ gap: '1.25rem' }}>
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="glass-card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', marginBottom: '6px' }}>
                      {doc.department}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
                      {doc.fullName}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                <div style={{ margin: '0.85rem 0', fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Department: <strong>{doc.department}</strong></div>
                  <div>Languages: <strong>{doc.languagesSpoken.join(', ').toUpperCase()}</strong></div>
                  <div>Consultation Fee: <strong style={{ color: '#34d399' }}>₹{doc.consultationFee}</strong></div>
                  <div>Location: <strong>{doc.roomNumber}</strong></div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Available Days:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {doc.availableDays.map((d, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenBooking(doc)}
                className="btn btn-primary flex items-center justify-center gap-2"
                style={{ width: '100%', padding: '0.65rem' }}
              >
                <span>Book Token Slot</span>
                <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <Modal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          title={`Book Consultation: ${selectedDoctor.fullName}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedDoctor.fullName} ({selectedDoctor.department})</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{selectedDoctor.roomNumber} • Fee: ₹{selectedDoctor.consultationFee}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Select Available Time Slot:
              </label>
              <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                {((selectedDoctor as any).availableSlots || selectedDoctor.availableTimeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM']).map((slot: string) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: selectedSlot === slot ? '#0ea5e9' : 'rgba(15,23,42,0.8)',
                      color: selectedSlot === slot ? '#ffffff' : '#cbd5e1',
                      border: selectedSlot === slot ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Reason for Consultation / Symptoms:
              </label>
              <textarea
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <button onClick={() => setIsBookingOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Generating Token...' : 'Confirm Booking & Generate Token'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Modal */}
      {cancelModalApt && (
        <Modal
          isOpen={!!cancelModalApt}
          onClose={() => setCancelModalApt(null)}
          title="Cancel Consultation Appointment"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              Are you sure you want to cancel Token #{cancelModalApt.tokenNumber} with {cancelModalApt.doctor?.fullName}?
            </p>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Cancellation Reason:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
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

            <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setCancelModalApt(null)} className="btn btn-secondary">
                Keep Appointment
              </button>
              <button onClick={handleConfirmCancel} className="btn btn-emergency">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalApt && (
        <Modal
          isOpen={!!rescheduleModalApt}
          onClose={() => setRescheduleModalApt(null)}
          title="Reschedule Consultation"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              Select a new time slot for Token #{rescheduleModalApt.tokenNumber}:
            </p>

            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                fontSize: '0.88rem'
              }}
            >
              <option value="Tomorrow 11:30 AM">Tomorrow 11:30 AM</option>
              <option value="Tomorrow 02:00 PM">Tomorrow 02:00 PM</option>
              <option value="Tomorrow 04:30 PM">Tomorrow 04:30 PM</option>
              <option value="Day after tomorrow 10:00 AM">Day after tomorrow 10:00 AM</option>
            </select>

            <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setRescheduleModalApt(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmReschedule} className="btn btn-primary">
                Save New Time Slot
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
