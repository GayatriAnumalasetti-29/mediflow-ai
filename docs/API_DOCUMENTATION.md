# MediFlow AI — REST API & Agentic Tool Documentation

Comprehensive specification for all REST endpoints, WebSocket event channels, and Central Orchestrator Agentic Tools.

---

## 📡 REST API Reference

### 1. Authentication & Security
- `POST /api/auth/register` — Register a new patient account with auto-generated UHID (`MF-2026-XXXX`).
- `POST /api/auth/login` — Authenticate user and issue signed JWT session token.
- `GET /api/auth/me` — Retrieve currently authenticated user profile and active role permissions.

### 2. Patient & EHR Registry
- `GET /api/patients/:id` — Retrieve patient demographics, allergies, chronic conditions, and admitting room.
- `PUT /api/patients/:id` — Update patient profile information.

### 3. Doctors & Clinical Availability
- `GET /api/doctors` — Search doctors by department, specialization, experience, or name.
- `GET /api/doctors/:id/availability` — Query available slots and token limits for a doctor.

### 4. Appointments & OPD Queue
- `GET /api/appointments` — List active appointments.
- `POST /api/appointments/book` — Book consultation and generate sequential daily OPD Token #.
- `POST /api/appointments/:id/cancel` — Cancel appointment with reason logging.
- `POST /api/appointments/:id/reschedule` — Reschedule consultation time slot.
- `GET /api/appointments/queue/status` — Get currently-serving token #, patient token #, and estimated wait countdown.

### 5. Accommodation & Ward Matrix
- `GET /api/accommodation/rooms` — Query real-time ward room and bed availability (General, Semi-Private, Deluxe, ICU).
- `POST /api/accommodation/allocate` — Allocate inpatient bed to patient.
- `PUT /api/accommodation/rooms/:roomId/beds/:bedId/status` — Staff endpoint to toggle bed status (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`).

### 6. Prescriptions & Vision OCR
- `GET /api/prescriptions/patient/:patientId` — List patient's uploaded and verified prescriptions.
- `POST /api/prescriptions/upload` — Upload prescription scan/photo.
- `POST /api/prescriptions/:id/ocr-extract` — Process image via Vision OCR with handwriting ambiguity flags.
- `POST /api/prescriptions/:id/verify` — Human sign-off confirmation; automatically creates active `MedicationSchedule` records.

### 7. Medication Schedules & Adherence
- `GET /api/medications/patient/:patientId` — Retrieve active daily dose timeline.
- `POST /api/medications/confirm-dose` — Log dose taken confirmation (`COMPLETED`, `SNOOZED`, `MISSED`).

### 8. Care Plans & Recovery
- `GET /api/careplan/patient/:patientId/daily-timeline` — 5-Pillar daily care checklist with compliance metrics.
- `GET /api/recovery/patient/:patientId/overview` — Post-treatment milestone roadmap, diet, activity logs, and rehab notes.
- `POST /api/recovery/activity/log` — Record physical activity with duration, heart rate, and Borg RPE exertion rating (1-10).

### 9. Hospital Billing & Tariff Master
- `GET /api/billing/patient/:patientId` — Itemized invoice statement with unit rates, taxes/GST, and balance due.
- `POST /api/billing/payment/record` — Record digital UPI, card, or cash payment.
- `POST /api/billing/authorize-discount` — Staff-authorized concession/waiver approval.
- `GET /api/billing/invoice/:invoiceId/export` — Digital PDF statement generation data.

### 10. Notifications & Preferences
- `GET /api/notifications/patient/:patientId` — Retrieve categorized notifications (11 types).
- `POST /api/notifications/mark-read/:id` — Mark alert as read.
- `PUT /api/notifications/preferences/:patientId` — Update channel toggles, categories, and quiet hours.

### 11. Central AI Agent & Tools
- `POST /api/ai/chat` — Multimodal conversational intake endpoint with automatic language detection, intent routing, and TTS audio synthesis.
- `POST /api/ai/tool-execute` — Secure backend dispatcher for all 25 agentic tools.

---

## 🛠️ The 25 Central Orchestrator Agentic Tools

| # | Tool Identifier | Scope & Arguments |
|---|---|---|
| 1 | `registerPatient` | `fullName`, `age`, `gender`, `contact`, `bloodGroup` |
| 2 | `getPatientDetails` | `patientId` |
| 3 | `findDepartment` | `query` |
| 4 | `findDoctor` | `department`, `doctorName` |
| 5 | `checkDoctorAvailability` | `doctorId`, `dateStr` |
| 6 | `bookAppointment` | `patientId`, `doctorId`, `slot`, `reason` |
| 7 | `cancelAppointment` | `appointmentId`, `reason` |
| 8 | `rescheduleAppointment` | `appointmentId`, `newSlot` |
| 9 | `getQueueStatus` | `department` |
| 10 | `checkRoomAvailability` | `category` |
| 11 | `allocateAccommodation` | `patientId`, `roomNumber`, `bedNumber` |
| 12 | `uploadPrescription` | `patientId`, `imageUrl` |
| 13 | `extractPrescription` | `prescriptionId` |
| 14 | `verifyPrescription` | `prescriptionId`, `verifiedItems` |
| 15 | `createMedicationSchedule`| `patientId`, `items` |
| 16 | `getMedicationSchedule` | `patientId` |
| 17 | `recordMedicationConfirmation` | `scheduleId`, `status` |
| 18 | `getDietPlan` | `patientId` |
| 19 | `getActivityPlan` | `patientId` |
| 20 | `getTherapySchedule` | `patientId` |
| 21 | `generateBill` | `patientId` |
| 22 | `getBill` | `invoiceNumber` |
| 23 | `scheduleFollowUp` | `patientId`, `doctorName`, `dateStr` |
| 24 | `createNotification` | `patientId`, `title`, `message` |
| 25 | `createEscalation` | `patientId`, `symptoms`, `severity` |
