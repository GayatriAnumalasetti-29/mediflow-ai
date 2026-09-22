import React from 'react';
import {
  LayoutDashboard,
  MessageSquareHeart,
  CalendarDays,
  Pill,
  Apple,
  Activity,
  Receipt,
  HeartPulse,
  Users,
  Camera,
  BedDouble,
  User,
  ShieldAlert,
  BarChart3,
  FileCheck2,
  Video,
  FileText,
  Clock,
  ListTodo,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  isStaff?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isStaff = false }) => {
  const patientNav = [
    { id: 'overview', label: "Today's Care", icon: LayoutDashboard },
    { id: 'care_timeline', label: 'Unified Care Agenda', icon: ListTodo },
    { id: 'chat', label: 'AI Voice & Chat', icon: MessageSquareHeart },
    { id: 'video_consult', label: 'Video Consultation', icon: Video },
    { id: 'appointments', label: 'Doctors & Queue', icon: CalendarDays },
    { id: 'accommodation', label: 'Rooms & Beds', icon: BedDouble },
    { id: 'camera_rx', label: 'Prescription OCR', icon: Camera },
    { id: 'documents', label: 'Medical Documents', icon: FileText },
    { id: 'medication', label: 'Medication Schedule', icon: Pill },
    { id: 'diet', label: 'Diet & Nutrition', icon: Apple },
    { id: 'recovery', label: 'Recovery & Rehab', icon: Activity },
    { id: 'billing', label: 'Billing & Invoice', icon: Receipt },
    { id: 'followup', label: 'Daily Check-In', icon: HeartPulse },
    { id: 'profile', label: 'Digital Health ID', icon: User }
  ];

  const staffNav = [
    { id: 'staff_overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'staff_officekit', label: 'Office Kit Telemetry', icon: Zap },
    { id: 'staff_patients', label: 'Patient Directory', icon: Users },
    { id: 'staff_queue', label: 'OPD Queue Caller', icon: CalendarDays },
    { id: 'staff_rx_verify', label: 'OCR Verification', icon: FileCheck2 },
    { id: 'staff_rooms', label: 'Bed & Room Matrix', icon: BedDouble },
    { id: 'staff_therapy', label: 'Rehab & Therapy', icon: Activity },
    { id: 'staff_reports', label: 'Hospital Analytics', icon: BarChart3 },
    { id: 'staff_escalations', label: 'Emergency Red Flags', icon: ShieldAlert }
  ];

  const navItems = isStaff ? staffNav : patientNav;

  return (
    <aside className="glass-panel" style={{ width: '260px', padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: 'fit-content' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem' }}>
        {isStaff ? 'Clinical Command' : 'Patient Navigation'}
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'patient_home');
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.62rem 0.85rem',
              borderRadius: '12px',
              background: isActive ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.15))' : 'transparent',
              color: isActive ? '#38bdf8' : '#94a3b8',
              border: isActive ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.85rem',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={17} color={isActive ? '#38bdf8' : '#64748b'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
