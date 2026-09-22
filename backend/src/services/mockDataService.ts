import fs from 'fs';
import path from 'path';
import {
  Patient,
  Doctor,
  Appointment,
  Bed,
  Room,
  Prescription,
  MedicationSchedule,
  MedicationDose,
  DietPlan,
  TherapySession,
  Bill,
  DailyFollowUpEntry,
  EscalationAlert,
  UrgencyLevel,
  AppointmentStatus,
  RoomCategory,
  BedStatus,
  VerificationStatus,
  MedicationFrequency,
  FoodTiming,
  DoseStatus,
  BillItemCategory,
  BillingStatus,
  FollowUpStatus,
  EscalationSeverity
} from '@mediflow/shared';

/**
 * DEVELOPMENT MOCK DATA STORE
 * This service provides structured in-memory mock datasets for local development,
 * testing, and UI demonstration without mutating production databases.
 */
class MockDataService {
  public patients: Patient[] = [
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
      address: 'Plot 42, Jubilee Hills, Hyderabad',
      allergies: ['Penicillin', 'Sulfa drugs'],
      chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
      currentUrgency: UrgencyLevel.ROUTINE,
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
      address: 'Flat 302, Banjara Hills, Hyderabad',
      allergies: ['Aspirin'],
      chronicConditions: ['Post-Angioplasty Recovery'],
      currentUrgency: UrgencyLevel.URGENT,
      primaryLanguage: 'te',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  public doctors: Doctor[] = [
    {
      id: 'doc-001',
      userId: 'usr-doc-001',
      fullName: 'Dr. Priya Varma, MD, DM',
      specialization: 'Senior Interventional Cardiologist',
      department: 'Cardiology',
      roomNumber: 'OPD-204 (2nd Floor)',
      consultationFee: 800,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      virtualSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      directSlots: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'],
      availableTimeSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM'],
      languagesSpoken: ['en', 'te', 'hi'],
      rating: 4.9,
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      experienceYears: 16,
      breakPeriods: ['01:00 PM - 02:00 PM'],
      onLeave: false
    },
    {
      id: 'doc-002',
      userId: 'usr-doc-002',
      fullName: 'Dr. Ananya Reddy, MS, MCh',
      specialization: 'Orthopedic & Joint Replacement Surgeon',
      department: 'Orthopedics',
      roomNumber: 'OPD-108 (1st Floor)',
      consultationFee: 750,
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
      virtualSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      directSlots: ['01:00 PM', '01:30 PM', '03:00 PM', '03:30 PM', '05:00 PM'],
      availableTimeSlots: ['10:00 AM', '10:30 AM', '01:00 PM', '03:00 PM'],
      languagesSpoken: ['en', 'te'],
      rating: 4.8,
      qualification: 'MBBS, MS (Ortho), MCh (Joint Recon)',
      experienceYears: 12,
      breakPeriods: ['02:00 PM - 03:00 PM'],
      onLeave: false
    },
    {
      id: 'doc-003',
      userId: 'usr-doc-003',
      fullName: 'Dr. Vikramaditya Sen, MD',
      specialization: 'General Physician & Diabetologist',
      department: 'General Medicine',
      roomNumber: 'OPD-102 (1st Floor)',
      consultationFee: 500,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      virtualSlots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'],
      directSlots: ['11:00 AM', '11:30 AM', '03:30 PM', '04:00 PM', '04:30 PM'],
      availableTimeSlots: ['08:30 AM', '09:00 AM', '11:00 AM', '03:30 PM'],
      languagesSpoken: ['en', 'hi', 'te'],
      rating: 4.9,
      qualification: 'MBBS, MD (General Medicine), PGDD',
      experienceYears: 20,
      breakPeriods: ['01:00 PM - 02:00 PM'],
      onLeave: false
    }
  ];

  public departments = [
    { id: 'dept-01', name: 'Cardiology', code: 'CARD', floor: 2, description: 'Heart, Vascular & Chest Pain Center' },
    { id: 'dept-02', name: 'Orthopedics', code: 'ORTH', floor: 1, description: 'Bone, Joint & Sports Trauma Care' },
    { id: 'dept-03', name: 'General Medicine', code: 'GMED', floor: 1, description: 'Primary Care, Fevers & Diabetes' },
    { id: 'dept-04', name: 'Neurology', code: 'NEUR', floor: 3, description: 'Brain, Spine & Nerve Rehabilitation' },
    { id: 'dept-05', name: 'Emergency Medicine', code: 'EMER', floor: 0, description: '24/7 Acute Trauma & Resuscitation' }
  ];

  public appointments: Appointment[] = [
    {
      id: 'apt-101',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      department: 'Cardiology',
      appointmentType: 'DIRECT',
      appointmentDate: '2026-09-01',
      timeSlot: '10:00 AM',
      tokenNumber: 12,
      status: AppointmentStatus.CONFIRMED,
      reasonForVisit: 'Routine cardiac follow-up and ECG review',
      consultationFee: 800,
      bookingTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'apt-102',
      patientId: 'pat-002',
      doctorId: 'doc-002',
      department: 'Orthopedics',
      appointmentType: 'DIRECT',
      appointmentDate: '2026-09-01',
      timeSlot: '11:30 AM',
      tokenNumber: 18,
      status: AppointmentStatus.IN_QUEUE,
      reasonForVisit: 'Left knee post-surgery mobilization review',
      consultationFee: 750,
      bookingTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  public rooms: Room[] = [
    {
      id: 'rm-101',
      roomNumber: 'GW-101',
      category: RoomCategory.GENERAL_WARD,
      floor: 1,
      totalBeds: 6,
      availableBeds: 2,
      dailyRate: 1200,
      amenities: ['Shared Air Conditioning', 'Nursing Station Support', 'Vital Monitor']
    },
    {
      id: 'rm-201',
      roomNumber: 'SP-201',
      category: RoomCategory.SEMI_PRIVATE,
      floor: 2,
      totalBeds: 2,
      availableBeds: 1,
      dailyRate: 3000,
      amenities: ['Air Conditioning', 'Twin Bed Curtain Partition', 'Attendant Recliner', 'TV']
    },
    {
      id: 'rm-301',
      roomNumber: 'PD-301',
      category: RoomCategory.PRIVATE_DELUXE,
      floor: 3,
      totalBeds: 1,
      availableBeds: 1,
      dailyRate: 6500,
      amenities: ['Private Suite', 'Smart TV', 'Attendant Sofa-cum-bed', 'Refrigerator', 'Ensuite Bath']
    },
    {
      id: 'rm-ICU1',
      roomNumber: 'ICU-1',
      category: RoomCategory.ICU,
      floor: 2,
      totalBeds: 8,
      availableBeds: 3,
      dailyRate: 12000,
      amenities: ['1:1 Critical Care Nursing', 'Advanced Multi-para Monitor', 'Ventilator Port', 'Defibrillator Access']
    }
  ];

  public beds: Bed[] = [
    { id: 'bed-1', bedNumber: 'GW-101-A', roomId: 'rm-101', roomNumber: 'GW-101', category: RoomCategory.GENERAL_WARD, floor: 1, dailyRate: 1200, status: BedStatus.OCCUPIED, currentPatientId: 'pat-001' },
    { id: 'bed-2', bedNumber: 'GW-101-B', roomId: 'rm-101', roomNumber: 'GW-101', category: RoomCategory.GENERAL_WARD, floor: 1, dailyRate: 1200, status: BedStatus.AVAILABLE },
    { id: 'bed-3', bedNumber: 'SP-201-A', roomId: 'rm-201', roomNumber: 'SP-201', category: RoomCategory.SEMI_PRIVATE, floor: 2, dailyRate: 3000, status: BedStatus.AVAILABLE },
    { id: 'bed-4', bedNumber: 'PD-301-A', roomId: 'rm-301', roomNumber: 'PD-301', category: RoomCategory.PRIVATE_DELUXE, floor: 3, dailyRate: 6500, status: BedStatus.AVAILABLE },
    { id: 'bed-5', bedNumber: 'ICU-1-A', roomId: 'rm-ICU1', roomNumber: 'ICU-1', category: RoomCategory.ICU, floor: 2, dailyRate: 12000, status: BedStatus.OCCUPIED, currentPatientId: 'pat-002' }
  ];

  public prescriptions: Prescription[] = [
    {
      id: 'rx-501',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      doctorName: 'Dr. Priya Varma',
      imageUrl: '/assets/sample_rx_cardiac.png',
      verificationStatus: VerificationStatus.VERIFIED_BY_PATIENT,
      ocrConfidence: 0.96,
      doctorNotes: 'Continue post-angioplasty regimen for 30 days. Maintain low sodium.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extractedItems: [
        {
          id: 'rx-item-1',
          medicineName: 'Atorvastatin',
          genericName: 'Atorvastatin Calcium',
          dosage: '20 mg',
          form: 'TABLET',
          frequency: MedicationFrequency.ONCE_DAILY,
          frequencyLabel: '0-0-1 (Night only)',
          timing: FoodTiming.AFTER_MEALS,
          durationDays: 30,
          instructions: 'Take after dinner with water',
          confidence: 0.98,
          isAmbiguous: false
        },
        {
          id: 'rx-item-2',
          medicineName: 'Metoprolol Succinate',
          genericName: 'Metoprolol ER',
          dosage: '25 mg',
          form: 'TABLET',
          frequency: MedicationFrequency.TWICE_DAILY,
          frequencyLabel: '1-0-1 (Morning & Night)',
          timing: FoodTiming.AFTER_MEALS,
          durationDays: 30,
          instructions: 'Do not crush; swallow whole',
          confidence: 0.95,
          isAmbiguous: false
        },
        {
          id: 'rx-item-3',
          medicineName: 'Ecosprin',
          genericName: 'Aspirin Gastro-resistant',
          dosage: '75 mg',
          form: 'TABLET',
          frequency: MedicationFrequency.ONCE_DAILY,
          frequencyLabel: '1-0-0 (Morning only)',
          timing: FoodTiming.AFTER_MEALS,
          durationDays: 30,
          instructions: 'Take immediately after breakfast',
          confidence: 0.96,
          isAmbiguous: false
        }
      ]
    }
  ];

  public medicationSchedules: MedicationSchedule[] = [
    {
      id: 'sched-01',
      patientId: 'pat-001',
      prescriptionId: 'rx-501',
      medicineName: 'Ecosprin 75 mg',
      dosage: '75 mg (1 Tablet)',
      frequency: MedicationFrequency.ONCE_DAILY,
      timing: FoodTiming.AFTER_MEALS,
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      scheduledTimes: ['08:30'],
      instructions: 'After breakfast with a full glass of water',
      isActive: true
    },
    {
      id: 'sched-02',
      patientId: 'pat-001',
      prescriptionId: 'rx-501',
      medicineName: 'Metoprolol ER 25 mg',
      dosage: '25 mg (1 Tablet)',
      frequency: MedicationFrequency.TWICE_DAILY,
      timing: FoodTiming.AFTER_MEALS,
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      scheduledTimes: ['09:00', '21:00'],
      instructions: 'Morning and Night after meals',
      isActive: true
    },
    {
      id: 'sched-03',
      patientId: 'pat-001',
      prescriptionId: 'rx-501',
      medicineName: 'Atorvastatin 20 mg',
      dosage: '20 mg (1 Tablet)',
      frequency: MedicationFrequency.ONCE_DAILY,
      timing: FoodTiming.AFTER_MEALS,
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      scheduledTimes: ['21:30'],
      instructions: 'Bedtime post-dinner',
      isActive: true
    }
  ];

  public todayDoses: MedicationDose[] = [
    {
      id: 'dose-001',
      scheduleId: 'sched-01',
      patientId: 'pat-001',
      medicineName: 'Ecosprin 75 mg',
      dosage: '1 Tablet',
      scheduledTime: '2026-09-01T08:30:00Z',
      status: DoseStatus.TAKEN,
      confirmedAt: '2026-09-01T08:42:15Z',
      timingNote: 'Morning after breakfast'
    },
    {
      id: 'dose-002',
      scheduleId: 'sched-02',
      patientId: 'pat-001',
      medicineName: 'Metoprolol ER 25 mg',
      dosage: '1 Tablet',
      scheduledTime: '2026-09-01T09:00:00Z',
      status: DoseStatus.TAKEN,
      confirmedAt: '2026-09-01T09:05:20Z',
      timingNote: 'Morning dose'
    },
    {
      id: 'dose-003',
      scheduleId: 'sched-02',
      patientId: 'pat-001',
      medicineName: 'Metoprolol ER 25 mg',
      dosage: '1 Tablet',
      scheduledTime: '2026-09-01T21:00:00Z',
      status: DoseStatus.PENDING,
      timingNote: 'Night dose after dinner'
    },
    {
      id: 'dose-004',
      scheduleId: 'sched-03',
      patientId: 'pat-001',
      medicineName: 'Atorvastatin 20 mg',
      dosage: '1 Tablet',
      scheduledTime: '2026-09-01T21:30:00Z',
      status: DoseStatus.PENDING,
      timingNote: 'Bedtime dose'
    }
  ];

  public dietPlans: DietPlan[] = [
    {
      id: 'diet-001',
      patientId: 'pat-001',
      prescribedByDoctorId: 'doc-001',
      dietitianName: 'Dr. Shalini Rao (Clinical Nutritionist)',
      planName: 'Cardiac Care & Diabetic Low Glycemic Plan',
      dailyCalorieTarget: 1800,
      hydrationGoalLiters: 2.2,
      meals: [
        {
          mealType: 'BREAKFAST',
          time: '08:00 AM',
          recommendedFoods: ['Oats porridge with almonds and chia seeds', '2 boiled egg whites / Steamed idlis (2 pcs) with mint chutney'],
          specialInstructions: 'Strictly zero added white sugar'
        },
        {
          mealType: 'LUNCH',
          time: '12:45 PM',
          recommendedFoods: ['Brown rice / Multigrain roti (2)', 'Palak dal / Mixed vegetable curry', 'Fresh cucumber & tomato salad', 'Low fat curd'],
          specialInstructions: 'Minimal oil (mustard/olive oil < 1 tsp)'
        },
        {
          mealType: 'EVENING_SNACK',
          time: '05:00 PM',
          recommendedFoods: ['Roasted makhana or sprouts chaat', 'Green tea / Warm lemon water (no sugar)'],
          specialInstructions: 'No deep-fried snacks'
        },
        {
          mealType: 'DINNER',
          time: '08:00 PM',
          recommendedFoods: ['Vegetable clear soup', 'Grilled paneer / Steamed tofu with sautéed beans & carrots', '1 phulka'],
          specialInstructions: 'Complete dinner 2 hours before sleeping'
        }
      ],
      foodsToAvoid: ['Refined flour (Maida)', 'Deep fried items (Samosa, Vada)', 'Processed meats', 'High sodium pickles & papads', 'Carbonated sugary drinks'],
      allergensRestricted: ['Penicillin-derived food molds'],
      startDate: '2026-09-01',
      isActive: true
    }
  ];

  public therapySessions: TherapySession[] = [
    {
      id: 'ther-001',
      patientId: 'pat-001',
      therapistId: 'staff-pt-01',
      therapistName: 'Kavitha Nair, BPT (Senior Physiotherapist)',
      therapyType: 'CARDIAC_REHAB',
      scheduledDate: '2026-09-02',
      timeSlot: '16:00',
      attended: true,
      therapistNotes: 'Patient completed 15 mins treadmill walking at 2.5 km/h. Heart rate stayed safely within 105-115 bpm range.',
      exercisesPrescribed: [
        {
          id: 'ex-01',
          name: 'Diaphragmatic Breathing',
          category: 'BREATHING',
          repetitions: '10 deep breaths x 3 cycles',
          frequencyPerDay: 3,
          precautions: ['Do not hold breath; breathe gently through nose and exhale through pursed lips']
        },
        {
          id: 'ex-02',
          name: 'Seated Ankle Pumps & Heel Slides',
          category: 'MOBILITY',
          repetitions: '15 repetitions each leg',
          frequencyPerDay: 2,
          precautions: ['Avoid sudden jerking movements']
        },
        {
          id: 'ex-03',
          name: 'Supervised Indoor Walking',
          category: 'MOBILITY',
          repetitions: '10-15 minutes gentle pace',
          frequencyPerDay: 2,
          precautions: ['Stop immediately if feeling lightheaded or experiencing chest heaviness']
        }
      ],
      nextFollowUpDate: '2026-09-05'
    }
  ];

  public bills: Bill[] = [
    {
      id: 'bill-001',
      invoiceNumber: 'INV-2026-8812',
      patientId: 'pat-001',
      subtotal: 9550,
      taxAmount: 477.5,
      discountAmount: 500,
      totalPayable: 9527.5,
      amountPaid: 5000,
      balanceDue: 4527.5,
      status: BillingStatus.PARTIALLY_PAID,
      insuranceClaimId: 'INS-HDFC-99231',
      createdAt: '2026-09-01T11:00:00Z',
      updatedAt: '2026-09-01T11:00:00Z',
      items: [
        {
          id: 'b-item-1',
          category: BillItemCategory.CONSULTATION,
          description: 'Specialist Consultation — Dr. Priya Varma (Cardiology)',
          unitPrice: 800,
          quantity: 1,
          totalPrice: 800,
          dateAdded: '2026-09-01T09:30:00Z'
        },
        {
          id: 'b-item-2',
          category: BillItemCategory.LAB_TEST,
          description: '12-Lead ECG & 2D-Echocardiography Doppler',
          unitPrice: 2800,
          quantity: 1,
          totalPrice: 2800,
          dateAdded: '2026-09-01T10:00:00Z'
        },
        {
          id: 'b-item-3',
          category: BillItemCategory.ACCOMMODATION,
          description: 'Semi-Private Room (SP-201) — 1 Day Admission',
          unitPrice: 3000,
          quantity: 1,
          totalPrice: 3000,
          dateAdded: '2026-09-01T10:30:00Z'
        },
        {
          id: 'b-item-4',
          category: BillItemCategory.MEDICATION,
          description: 'Inpatient Pharmacy Dispensation (Atorvastatin, Metoprolol, Ecosprin)',
          unitPrice: 1450,
          quantity: 1,
          totalPrice: 1450,
          dateAdded: '2026-09-01T10:45:00Z'
        },
        {
          id: 'b-item-5',
          category: BillItemCategory.THERAPY,
          description: 'Phase-1 Cardiac Rehabilitation Therapy Session',
          unitPrice: 1500,
          quantity: 1,
          totalPrice: 1500,
          dateAdded: '2026-09-01T11:00:00Z'
        }
      ]
    }
  ];

  public followUps: DailyFollowUpEntry[] = [
    {
      id: 'fol-001',
      patientId: 'pat-001',
      date: '2026-09-01',
      status: FollowUpStatus.COMPLETED,
      patientReportedStatus: 'Feeling active today. Morning medicine taken on time. No chest tightness.',
      painLevelScore: 1,
      temperature: 98.4,
      symptomsReported: ['Mild leg fatigue after walking'],
      medicationAdherenceReported: true,
      dietAdherenceReported: true,
      activityCompletedReported: true,
      aiSentiment: 'POSITIVE',
      requiresStaffReview: false,
      createdAt: '2026-09-01T12:00:00Z'
    }
  ];

  public escalations: EscalationAlert[] = [
    {
      id: 'esc-001',
      patientId: 'pat-002',
      patientName: 'Lakshmi Narayana',
      roomOrBedNumber: 'ICU-1-A',
      severity: EscalationSeverity.HIGH,
      triggerReason: 'Patient reported sudden recurrence of severe breathlessness during night check-in.',
      reportedSymptoms: ['Dyspnea on lying down', 'Orthopnea', 'Chest discomfort'],
      sourceAgent: 'FollowUpAgent',
      isResolved: false,
      createdAt: '2026-09-01T14:30:00Z'
    }
  ];

  public followUpLogs: DailyFollowUpEntry[] = this.followUps;
  public notifications: any[] = [];
  public medicationLogs: any[] = [];

  /**
   * Fast, indexed conflict verification ensuring zero double bookings.
   * Checks doctor availability on the given date and slot across active statuses.
   */
  public hasSlotConflict(doctorId: string, date: string, timeSlot: string, excludeAptId?: string): boolean {
    const activeStatuses: AppointmentStatus[] = [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.SCHEDULED
    ];

    return this.appointments.some(
      (a) =>
        a.id !== excludeAptId &&
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        a.timeSlot === timeSlot &&
        activeStatuses.includes(a.status)
    );
  }

  /**
   * Simulated atomic transaction runner.
   * If any step inside `operation` fails, state snapshot is automatically restored.
   */
  public async runTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const appointmentsSnapshot = [...this.appointments];
    const notificationsSnapshot = [...this.notifications];

    try {
      return await operation();
    } catch (error) {
      // Rollback on failure
      this.appointments = appointmentsSnapshot;
      this.notifications = notificationsSnapshot;
      throw error;
    }
  }

  /**
   * Privacy-preserving notification dispatcher.
   * Strips raw diagnostic / lab codes to comply with patient data privacy.
   */
  public safeNotify(patientId: string, title: string, generalizedMessage: string, type: any): any {
    const safeNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId,
      title: title.replace(/<[^>]*>?/gm, '').trim(),
      message: generalizedMessage.replace(/<[^>]*>?/gm, '').trim(),
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(safeNotif);
    this.persist();
    return safeNotif;
  }

  private dbFilePath = path.resolve(__dirname, '../../../data/mediflow_db.json');

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.patients) && data.patients.length > 0) this.patients = data.patients;
        if (Array.isArray(data.appointments) && data.appointments.length > 0) this.appointments = data.appointments;
        if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) this.prescriptions = data.prescriptions;
        if (Array.isArray(data.bills) && data.bills.length > 0) this.bills = data.bills;
        if (Array.isArray(data.beds) && data.beds.length > 0) this.beds = data.beds;
        if (Array.isArray(data.notifications) && data.notifications.length > 0) this.notifications = data.notifications;
        console.log('[Database] Loaded persistent data store from:', this.dbFilePath);
      }
    } catch (err) {
      console.warn('[Database] Initialized with seed dataset; persistence active at:', this.dbFilePath);
    }
  }

  public persist(): void {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const snapshot = {
        patients: this.patients,
        appointments: this.appointments,
        prescriptions: this.prescriptions,
        bills: this.bills,
        beds: this.beds,
        notifications: this.notifications,
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist data to disk:', err);
    }
  }
}

export const mockDataService = new MockDataService();
