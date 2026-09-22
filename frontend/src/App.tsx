import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationCenter } from './components/common/NotificationCenter';
import { LandingPage } from './pages/landing/LandingPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { Sidebar } from './components/common/Sidebar';
import { AutonomousReminderToast } from './components/followUp/AutonomousReminderToast';
import { RoleGuard } from './components/common/RoleGuard';
import { DemoDataNotice } from './components/common/DemoDataNotice';
import { DoctorLoginModal } from './components/auth/DoctorLoginModal';
import { PatientNavDrawer } from './components/common/PatientNavDrawer';
import { MyAppointmentsModal } from './components/appointments/MyAppointmentsModal';
import { OfficeKitDoctorStation } from './components/officeKit/OfficeKitDoctorStation';
import { OfficeKitMobileCompanion } from './components/officeKit/OfficeKitMobileCompanion';

import { NetworkStatusBanner } from './components/common/NetworkStatusBanner';
import { MovingNeuralNetworkBackground } from './components/common/MovingNeuralNetworkBackground';
import { LiveDemoExperience } from './components/demo/LiveDemoExperience';
import { PatientOpForm } from './components/op/PatientOpForm';

export const App: React.FC = () => {
  const { user, setPatientSession } = useAuth();

  // Read URL parameters for direct mobile companion launch via QR code
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialViewParam = urlParams?.get('view');
  const initialPinParam = urlParams?.get('pin') || '';
  const bridgePinParam = urlParams?.get('bridgePin') || '';

  const [currentView, setCurrentView] = useState<string>(
    initialViewParam === 'officekit_companion'
      ? 'officekit_companion'
      : (initialViewParam === 'chat' || bridgePinParam)
      ? 'chat'
      : (initialViewParam || 'landing')
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDoctorLoginOpen, setIsDoctorLoginOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const initialDemoParam = urlParams?.get('demo') === '1' || urlParams?.get('demo') === 'true';
  const [isDemoModeOpen, setIsDemoModeOpen] = useState(initialDemoParam);

  const isLandingView = currentView === 'landing';
  const isStaffView = currentView.startsWith('staff_');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in dedicated Mobile Phone Companion Mode (e.g. from QR scan on phone)
  if (currentView === 'officekit_companion') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <MovingNeuralNetworkBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <OfficeKitMobileCompanion
            initialPin={initialPinParam}
            onExit={() => handleNavigate('landing')}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 🧠 Dynamic Moving Neural Synapse Network Layer */}
      <MovingNeuralNetworkBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Simulation / Demonstration Demarcation Banner */}
        <DemoDataNotice />

      {/* Network Resilience Status Toast */}
      <NetworkStatusBanner />

      {/* Universal Top Navigation with ☰ Menu Icon */}
      <div className="landing-container" style={{ paddingTop: '0.75rem' }}>
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          onToggleMenu={() => setIsMenuDrawerOpen(true)}
          unreadCount={2}
          onOpenOfficeKitBridge={() => handleNavigate('officekit_bridge')}
          onStartDemo={() => setIsDemoModeOpen(true)}
        />
      </div>

      {/* ☰ Slide-Out Context-Aware Navigation Drawer */}
      <PatientNavDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onNavigateTab={(tab) => {
          handleNavigate(tab);
          setIsMenuDrawerOpen(false);
        }}
        onOpenMyAppointments={() => {
          setIsMenuDrawerOpen(false);
          setIsMyAppointmentsOpen(true);
        }}
        onOpenOfficeKitBridge={() => {
          setIsMenuDrawerOpen(false);
          handleNavigate('officekit_bridge');
        }}
        onStartDemo={() => {
          setIsMenuDrawerOpen(false);
          setIsDemoModeOpen(true);
        }}
      />

      {/* 🎬 20-Step Live End-to-End Demo Experience HUD */}
      <LiveDemoExperience
        isOpen={isDemoModeOpen}
        onClose={() => setIsDemoModeOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Dedicated My Appointments Modal (Upcoming, Check-In, Past, Missed, Reschedule) */}
      <MyAppointmentsModal
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
        onJoinVirtualMeet={() => {
          setIsMyAppointmentsOpen(false);
          handleNavigate('video_consult');
        }}
      />

      {/* Notification Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => {
          handleNavigate(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* Autonomous Scheduled Reminder Toast (Active for Patients when enabled) */}
      {!isStaffView && !isLandingView && user?.activeAppointment?.reminderEnabled && <AutonomousReminderToast />}

      {/* Doctor & Staff Login Modal (Triggered via Footer) */}
      <DoctorLoginModal
        isOpen={isDoctorLoginOpen}
        onClose={() => setIsDoctorLoginOpen(false)}
        onLoginSuccess={() => {
          handleNavigate('staff_overview');
        }}
      />

      {/* Main Content Render */}
      {isLandingView ? (
        <main>
          <LandingPage
            onStartChat={() => handleNavigate('chat')}
            onBookAppointment={() => handleNavigate('appointments')}
            onOpenStaff={() => setIsDoctorLoginOpen(true)}
            onOpenOverview={() => handleNavigate('overview')}
          />
        </main>
      ) : currentView === 'op_form' ? (
        <div className="landing-container" style={{ paddingBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => handleNavigate('landing')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#ffffff',
                border: '1.5px solid #7dd3fc',
                color: '#0284c7',
                cursor: 'pointer'
              }}
            >
              ← Back to Main Menu
            </button>
          </div>
          <PatientOpForm
            onSubmitSuccess={(patientData) => {
              setPatientSession(patientData);
              handleNavigate('overview');
            }}
          />
        </div>
      ) : currentView === 'officekit_bridge' ? (
        <div className="landing-container" style={{ paddingBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => handleNavigate('landing')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#ffffff',
                border: '1.5px solid #7dd3fc',
                color: '#0284c7',
                cursor: 'pointer'
              }}
            >
              ← Back to Main Menu
            </button>
          </div>
          <OfficeKitDoctorStation
            onImportScanToPrescription={() => handleNavigate('camera_rx')}
          />
        </div>
      ) : isStaffView ? (
        <div className="app-container" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Staff Command Sidebar */}
          <Sidebar
            activeTab={currentView}
            onTabChange={handleNavigate}
            isStaff={true}
          />

          {/* Core Staff Portal Area */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <RoleGuard
              allowedRoles={['DOCTOR', 'NURSE', 'ADMIN', 'STAFF']}
              fallbackRedirect={() => handleNavigate('overview')}
            >
              <StaffDashboard
                activeTab={currentView}
                onTabChange={handleNavigate}
              />
            </RoleGuard>
          </main>
        </div>
      ) : (
        <div className="landing-container">
          {/* Clean, spacious Patient Portal Area without permanent side clutter */}
          <main style={{ minWidth: 0 }}>
            <PatientDashboard
              activeTab={currentView}
              onTabChange={handleNavigate}
              onOpenMyAppointments={() => setIsMyAppointmentsOpen(true)}
            />
          </main>
        </div>
      )}

      {/* Universal Compliance Footer with Doctor & Staff Login Button */}
      <Footer onOpenDoctorLogin={() => setIsDoctorLoginOpen(true)} />
      </div>
    </div>
  );
};
