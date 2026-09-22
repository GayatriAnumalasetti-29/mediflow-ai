import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EscalationAlert, Patient, Prescription, Room, Appointment, TherapySession, Bill } from '@mediflow/shared';
import {
  ShieldAlert,
  CheckCircle,
  Users,
  Camera,
  BedDouble,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Calendar,
  Activity,
  Receipt,
  FileText,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  DollarSign,
  Tag,
  CreditCard,
  Lock,
  ShieldCheck,
  History,
  CheckCheck
} from 'lucide-react';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { BedMatrix } from '../../components/accommodation/BedMatrix';
import { PrescriptionVerifyModal } from '../../components/camera/PrescriptionVerifyModal';
import { Modal } from '../../components/common/Modal';
import { SystemReliabilityHarness } from '../../components/testing/SystemReliabilityHarness';
import { OfficeKitDoctorStation } from '../../components/officeKit/OfficeKitDoctorStation';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const StaffDashboard: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [escalations, setEscalations] = useState<EscalationAlert[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Discount authorization modal
  const [discountModalBill, setDiscountModalBill] = useState<Bill | null>(null);
  const [discountAmount, setDiscountAmount] = useState<string>('500');
  const [discountReason, setDiscountReason] = useState<string>('Senior Citizen Concession');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'aud-001',
      userId: 'usr-pat-001',
      userRole: 'PATIENT',
      action: 'MEDICATION_DOSE_CONFIRMED',
      resource: 'MedicationSchedule:sched-002',
      ipAddress: '192.168.1.45',
      timestamp: 'Today, 06:40 PM',
      details: 'Patient confirmed dose of Metoprolol Succinate ER 25mg as Taken.',
      status: 'SUCCESS'
    },
    {
      id: 'aud-002',
      userId: 'usr-doc-001',
      userRole: 'DOCTOR',
      action: 'PRESCRIPTION_VERIFIED',
      resource: 'Prescription:rx-001',
      ipAddress: '10.0.4.12',
      timestamp: 'Today, 06:30 PM',
      details: 'Dr. Priya Varma signed off on OCR extracted medicines.',
      status: 'SUCCESS'
    },
    {
      id: 'aud-003',
      userId: 'usr-doc-001',
      userRole: 'DOCTOR',
      action: 'PHI_VIEW',
      resource: 'PatientRecord:MF-2026-8812',
      ipAddress: '10.0.4.12',
      timestamp: 'Today, 06:15 PM',
      details: 'Authorized cardiologist accessed EHR record for Rajesh Sharma.',
      status: 'SUCCESS'
    }
  ]);

  useEffect(() => {
    Promise.all([
      api.getEscalations(),
      api.getPrescriptions('pat-001'),
      api.getAppointments(),
      api.getTherapySessions('pat-001'),
      api.getPatientBills('pat-001'),
      api.getAuditLogs()
    ]).then(([esc, rx, apts, ther, b, logs]) => {
      setEscalations(esc);
      setPrescriptions(rx);
      setAppointments(apts);
      setTherapySessions(ther);
      setBills(b);
      if (logs && logs.length > 0) {
        setAuditLogs(logs);
      }
    }).catch(console.error);

    setPatients([
      {
        id: 'pat-001',
        userId: 'usr-pat-001',
        uhid: 'MF-2026-8812',
        fullName: 'Rajesh Sharma',
        dateOfBirth: '1982-05-14',
        age: 44,
        gender: 'MALE',
        bloodGroup: 'O+',
        contactNumber: '+91 98765 43210',
        emergencyContact: '+91 98765 43211 (Spouse)',
        allergies: ['Penicillin', 'Sulfa drugs'],
        chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
        currentUrgency: 'ROUTINE' as any,
        primaryLanguage: 'te',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pat-002',
        userId: 'usr-pat-002',
        uhid: 'MF-2026-9041',
        fullName: 'Lakshmi Narayana',
        dateOfBirth: '1968-11-23',
        age: 57,
        gender: 'FEMALE',
        bloodGroup: 'B+',
        contactNumber: '+91 91234 56780',
        emergencyContact: '+91 91234 56789 (Son)',
        allergies: ['Aspirin'],
        chronicConditions: ['Post-Angioplasty Recovery'],
        currentUrgency: 'EMERGENCY' as any,
        primaryLanguage: 'te',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    try {
      const updated = await api.resolveEscalation(alertId, 'Clinical team attended patient and stabilized vitals');
      setEscalations((prev) => prev.map((e) => (e.id === alertId ? updated : e)));
    } catch (err) {
      console.error('Failed to resolve escalation', err);
    }
  };

  const handleApplyDiscount = () => {
    if (!discountModalBill) return;
    setIsApplyingDiscount(true);
    setTimeout(() => {
      const disc = parseFloat(discountAmount);
      const curTotal = discountModalBill.totalAmount ?? discountModalBill.totalPayable ?? 0;
      const curPaid = discountModalBill.paidAmount ?? discountModalBill.amountPaid ?? 0;
      const updated = {
        ...discountModalBill,
        discountAmount: (discountModalBill.discountAmount || 0) + disc,
        totalAmount: Math.max(0, curTotal - disc),
        totalPayable: Math.max(0, curTotal - disc),
        balanceDue: Math.max(0, curTotal - disc - curPaid)
      };
      setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setIsApplyingDiscount(false);
      setDiscountModalBill(null);
      alert(`Staff-authorized concession of ₹${disc} applied to Invoice #${discountModalBill.invoiceNumber}.`);
    }, 600);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Staff Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(14, 165, 233, 0.12))',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '6px' }}>
              Hospital Operations & Clinical Command Center
            </span>
            <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', fontWeight: 700 }}>
              Healthcare Staff Management Portal
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '4px' }}>
              Real-time triage queue monitoring, prescription OCR verification, bed allocation, billing audit, and 25-workflow test matrix.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onTabChange('staff_escalations')}
              className="btn btn-emergency"
              style={{ fontSize: '0.85rem' }}
            >
              <ShieldAlert size={16} />
              <span>{escalations.filter((e) => !e.isResolved).length} Active Red Flags</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital KPI Stats Row */}
      <div className="grid-cols-4">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bed Occupancy</span>
            <BedDouble size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>78%</div>
          <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>14 of 18 Beds Active</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active OPD Queue</span>
            <Users size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>8 Patients</div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Avg Wait: ~14 mins</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending OCR Reviews</span>
            <Camera size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>1 Prescription</div>
          <p style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '4px' }}>Confidence: 96%</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Test Pass Rate</span>
            <CheckCheck size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
            25 / 25
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>100% Reliability</p>
        </div>
      </div>

      {/* Staff Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'staff_overview', label: 'Overview & Alerts' },
          { id: 'staff_officekit', label: '📱 Office Kit Telemetry' },
          { id: 'staff_patients', label: 'Patient Directory' },
          { id: 'staff_queue', label: 'OPD Queue Caller' },
          { id: 'staff_rx_verify', label: 'Prescription OCR Workbench' },
          { id: 'staff_rooms', label: 'Room & Bed Matrix' },
          { id: 'staff_billing', label: 'Billing & Tariff Audit' },
          { id: 'staff_therapy', label: 'Rehab & Therapy' },
          { id: 'staff_reports', label: 'Hospital Analytics' },
          { id: 'staff_audit', label: 'Security & HIPAA Audit' },
          { id: 'staff_testing', label: 'System 25-Test Matrix' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === tab.id ? '#0ea5e9' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Office Kit Telemetry Bridge */}
      {activeTab === 'staff_officekit' && (
        <OfficeKitDoctorStation
          onImportScanToPrescription={() => onTabChange('staff_rx_verify')}
        />
      )}

      {/* TAB CONTENT: 1. Overview & Emergency Alerts */}
      {(activeTab === 'staff_overview' || activeTab === 'staff_escalations') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={22} color="#ef4444" />
                <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 600 }}>
                  Active Red-Flag Clinical Escalations
                </h2>
              </div>
              <span className="badge badge-emergency">
                {escalations.filter((e) => !e.isResolved).length} High Priority
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {escalations.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-card flex items-center justify-between flex-wrap gap-4"
                  style={{
                    border: alert.isResolved ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(239, 68, 68, 0.4)',
                    background: alert.isResolved ? 'rgba(17, 24, 39, 0.4)' : 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                        {alert.patientName}
                      </span>
                      {alert.roomOrBedNumber && (
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>({alert.roomOrBedNumber})</span>
                      )}
                      <StatusBadge
                        status={alert.severity}
                        variant={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'danger' : 'warning'}
                      />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '4px' }}>
                      {alert.triggerReason}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Reported Symptoms: {alert.reportedSymptoms.join(', ')} • Source: {alert.sourceAgent}
                    </div>
                  </div>

                  <div>
                    {alert.isResolved ? (
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Attended & Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', background: '#ef4444' }}
                      >
                        Acknowledge & Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BedMatrix />
        </div>
      )}

      {/* TAB CONTENT: 2. Patient Directory */}
      {activeTab === 'staff_patients' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600 }}>
                Patient Directory & Triage Registry
              </h2>
            </div>
            <div className="flex items-center gap-2 glass-card" style={{ padding: '0.4rem 0.8rem' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or UHID..."
                style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>UHID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Full Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Age / Gender</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Urgency</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Allergies</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Language</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#f8fafc' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#38bdf8', fontWeight: 600 }}>{p.uhid}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.fullName}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#cbd5e1' }}>{p.age}y / {p.gender}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><UrgencyBadge level={p.currentUrgency || 'ROUTINE'} /></td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#fca5a5', fontSize: '0.78rem' }}>{p.allergies.join(', ') || 'None'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#a78bfa' }}>{p.primaryLanguage?.toUpperCase()}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Viewing full EHR record for ${p.fullName} (${p.uhid})`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      <span>View EHR</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: 3. OPD Queue Manager */}
      {activeTab === 'staff_queue' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>
            OPD Queue Station & Token Calling Desk
          </h2>
          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            {appointments.map((apt) => (
              <div key={apt.id} className="glass-card">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                    Token #{apt.tokenNumber}
                  </span>
                  <StatusBadge status={apt.status} variant="warning" />
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem', marginTop: '6px' }}>
                  {apt.department} • {apt.doctor?.fullName || 'Specialist'}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Scheduled: {apt.timeSlot} • Reason: {apt.reasonForVisit}
                </p>

                <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                  <button
                    onClick={() => alert(`Calling Token #${apt.tokenNumber} into Room!`)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}
                  >
                    <span>Call Patient into Room</span>
                  </button>
                  <button
                    onClick={() => alert(`Token #${apt.tokenNumber} completed.`)}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                  >
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. Prescription OCR Workbench */}
      {activeTab === 'staff_rx_verify' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1.25rem' }}>
            Prescription OCR Verification Workbench
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptions.map((rx) => (
              <div key={rx.id} className="glass-card flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                      Prescription #{rx.id}
                    </span>
                    <StatusBadge status={rx.verificationStatus} variant="success" />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                    Extracted: {rx.extractedItems.map((i) => `${i.medicineName} (${i.dosage})`).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>
                    AI OCR Confidence: {Math.round(rx.ocrConfidence * 100)}% • Prescribing Doctor: {rx.doctorName}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRx(rx)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Camera size={16} />
                  <span>Open Verification Workbench</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. Room & Bed Matrix */}
      {activeTab === 'staff_rooms' && <BedMatrix />}

      {/* TAB CONTENT: 6. Billing & Tariff Audit */}
      {activeTab === 'staff_billing' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600 }}>
                Hospital Billing & Financial Authorization Audit
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Review approved tariffs, apply staff-authorized discounts, and verify insurance pre-authorizations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bills.map((bill) => (
              <div key={bill.id} className="glass-card flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.05rem' }}>
                      Invoice #{bill.invoiceNumber}
                    </span>
                    <StatusBadge status={bill.status} variant={bill.status === 'PAID' ? 'success' : 'warning'} />
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                    Total Approved: <strong>₹{(bill.totalAmount ?? bill.totalPayable ?? 0).toFixed(2)}</strong> • Paid: <strong style={{ color: '#34d399' }}>₹{(bill.paidAmount ?? bill.amountPaid ?? 0).toFixed(2)}</strong> • Outstanding: <strong style={{ color: '#ef4444' }}>₹{bill.balanceDue.toFixed(2)}</strong>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Services: {bill.items.length} Line Items (Cardiology OPD, Semi-Private Bed x 2 Days, ECG, Pharmacy)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiscountModalBill(bill)}
                    className="btn btn-secondary flex items-center gap-1.5"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <Tag size={15} />
                    <span>Apply Staff Concession</span>
                  </button>

                  <button
                    onClick={() => alert(`Discharge financial clearance granted for Invoice #${bill.invoiceNumber}`)}
                    className="btn btn-emerald flex items-center gap-1.5"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <CheckCircle size={15} />
                    <span>Authorize Discharge Clearance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. Rehab & Therapy */}
      {activeTab === 'staff_therapy' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>
            Physical & Rehabilitation Therapy Logs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {therapySessions.map((t) => (
              <div key={t.id} className="glass-card">
                <div className="flex items-center justify-between">
                  <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.95rem' }}>{t.therapyType}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.scheduledDate} at {t.timeSlot}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '4px' }}>Therapist: {t.therapistName}</div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>Notes: {t.therapistNotes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 8. Hospital Analytics & Reports */}
      {activeTab === 'staff_reports' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1.25rem' }}>
            Hospital Operational Analytics & Clinical Metrics
          </h2>
          <div className="grid-cols-3">
            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Medication Adherence Rate</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>94.2%</div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Based on 148 verified patient logs</p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Average Triage Response</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>4.2 mins</div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Emergency triage protocol speed</p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>OCR Extraction Accuracy</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: '6px' }}>96.8%</div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>100% human-in-the-loop checked</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 9. Security & HIPAA Audit Trail */}
      {activeTab === 'staff_audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} color="#34d399" />
                <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600 }}>
                  Security & Protected Health Information (PHI) Audit Trail
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                Immutable HIPAA/DISHA security access logs tracking user authentication, PHI views, and verification signatures.
              </p>
            </div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              Audit Logging Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div key={log.id} className="glass-card flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                      {log.action}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: '0.72rem' }}>
                      {log.userRole} ({log.userId})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      IP: {log.ipAddress}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '4px' }}>
                    {log.details}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    Resource: <code style={{ color: '#a78bfa' }}>{log.resource}</code> • Timestamp: {log.timestamp}
                  </div>
                </div>

                <span className="badge badge-routine">
                  ✓ {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 10. System 25-Test Matrix */}
      {activeTab === 'staff_testing' && <SystemReliabilityHarness />}

      {/* Verification Workbench Modal */}
      {selectedRx && (
        <PrescriptionVerifyModal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          prescription={selectedRx}
          onVerified={() => {
            setSelectedRx(null);
            alert('Prescription successfully validated and signed off by clinical staff.');
          }}
        />
      )}

      {/* Staff Discount Modal */}
      {discountModalBill && (
        <Modal
          isOpen={!!discountModalBill}
          onClose={() => setDiscountModalBill(null)}
          title={`Authorize Concession: Invoice #${discountModalBill.invoiceNumber}`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Concession Amount (₹):
              </label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Authorization Justification:
              </label>
              <input
                type="text"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
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

            <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setDiscountModalBill(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleApplyDiscount} disabled={isApplyingDiscount} className="btn btn-primary">
                {isApplyingDiscount ? 'Authorizing...' : 'Authorize & Sign-off'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
