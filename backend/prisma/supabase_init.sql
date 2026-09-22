-- ==============================================================================
-- MediFlow AI — Complete Supabase PostgreSQL Schema & Initial Hospital Data
-- Run this in your Supabase SQL Editor to create all tables and initial records
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'NURSE', 'ADMIN', 'STAFF');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UrgencyLevel" AS ENUM ('EMERGENCY', 'URGENT', 'ROUTINE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'CONFIRMED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "RoomCategory" AS ENUM ('GENERAL_WARD', 'SEMI_PRIVATE', 'PRIVATE_DELUXE', 'ICU', 'EMERGENCY_OBSERVATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'CLEANING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED_BY_PATIENT', 'VERIFIED_BY_STAFF', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "DoseStatus" AS ENUM ('PENDING', 'TAKEN', 'SKIPPED', 'SNOOZED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'INSURANCE_PENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BillItemCategory" AS ENUM ('CONSULTATION', 'ACCOMMODATION', 'PROCEDURE', 'LAB_TEST', 'MEDICATION', 'THERAPY', 'NURSING_CARE', 'MISCELLANEOUS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "EscalationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Tables

-- Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients Table
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "uhid" TEXT UNIQUE NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronicConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentUrgency" "UrgencyLevel" DEFAULT 'ROUTINE',
    "primaryLanguage" TEXT DEFAULT 'en',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "floor" TEXT NOT NULL,
    "wing" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS "Doctor" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "departmentId" TEXT REFERENCES "Department"("id"),
    "fullName" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experienceYears" INTEGER DEFAULT 10,
    "opdRoomNumber" TEXT NOT NULL,
    "consultationFee" DOUBLE PRECISION NOT NULL,
    "isAvailableToday" BOOLEAN DEFAULT true,
    "availableSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" TEXT REFERENCES "Doctor"("id") ON DELETE CASCADE,
    "appointmentDate" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "status" "AppointmentStatus" DEFAULT 'SCHEDULED',
    "urgencyLevel" "UrgencyLevel" DEFAULT 'ROUTINE',
    "chiefComplaint" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "roomNumber" TEXT UNIQUE NOT NULL,
    "category" "RoomCategory" NOT NULL,
    "floor" TEXT NOT NULL,
    "wing" TEXT NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "totalBeds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beds Table
CREATE TABLE IF NOT EXISTS "Bed" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "roomId" TEXT REFERENCES "Room"("id") ON DELETE CASCADE,
    "bedNumber" TEXT NOT NULL,
    "status" "BedStatus" DEFAULT 'AVAILABLE',
    "currentPatientId" TEXT REFERENCES "Patient"("id"),
    "allocatedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS "Prescription" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" TEXT REFERENCES "Doctor"("id"),
    "prescriptionDate" TEXT NOT NULL,
    "source" TEXT DEFAULT 'DOCTOR_UPLOAD',
    "imageUrl" TEXT,
    "verificationStatus" "VerificationStatus" DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "verifiedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Items Table
CREATE TABLE IF NOT EXISTS "PrescriptionItem" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "prescriptionId" TEXT REFERENCES "Prescription"("id") ON DELETE CASCADE,
    "medicineName" TEXT NOT NULL,
    "genericName" TEXT,
    "dosage" TEXT NOT NULL,
    "form" TEXT DEFAULT 'TABLET',
    "frequency" TEXT NOT NULL,
    "frequencyLabel" TEXT NOT NULL,
    "timing" TEXT DEFAULT 'AFTER_MEALS',
    "durationDays" INTEGER NOT NULL,
    "instructions" TEXT,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,
    "isAmbiguous" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Schedules Table
CREATE TABLE IF NOT EXISTS "MedicationSchedule" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "scheduledTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "instructions" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itemized Bills Table
CREATE TABLE IF NOT EXISTS "Bill" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "invoiceNumber" TEXT UNIQUE NOT NULL,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL,
    "status" "BillingStatus" DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "generatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill Line Items Table
CREATE TABLE IF NOT EXISTS "BillItem" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "billId" TEXT REFERENCES "Bill"("id") ON DELETE CASCADE,
    "category" "BillItemCategory" NOT NULL,
    "itemName" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-Up Logs Table
CREATE TABLE IF NOT EXISTS "DailyFollowUp" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "date" TEXT NOT NULL,
    "reportedSymptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painScale" INTEGER DEFAULT 0,
    "vitals" JSONB,
    "generalWellness" TEXT,
    "redFlagDetected" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escalation Alerts Table
CREATE TABLE IF NOT EXISTS "EscalationAlert" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "patientName" TEXT NOT NULL,
    "roomOrBedNumber" TEXT NOT NULL,
    "severity" "EscalationSeverity" NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "reportedSymptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceAgent" TEXT NOT NULL,
    "isResolved" BOOLEAN DEFAULT false,
    "resolvedAt" TIMESTAMP WITH TIME ZONE,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "patientId" TEXT REFERENCES "Patient"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. Initial Clinical Hospital Seed Data
-- ==============================================================================

-- Departments
INSERT INTO "Department" ("id", "name", "code", "floor", "wing") VALUES
('dept-cardio', 'Cardiology & Cardiothoracic Surgery', 'CARDIO', '2nd Floor', 'South Wing'),
('dept-ortho', 'Orthopedics & Joint Replacement', 'ORTHO', '1st Floor', 'North Wing'),
('dept-genmed', 'General Medicine & Diabetology', 'GENMED', '1st Floor', 'West Wing')
ON CONFLICT ("id") DO NOTHING;

-- Doctors
INSERT INTO "Doctor" ("id", "fullName", "specialization", "qualification", "experienceYears", "opdRoomNumber", "consultationFee", "isAvailableToday", "availableSlots") VALUES
('doc-001', 'Dr. Priya Varma', 'Senior Interventional Cardiologist', 'MBBS, MD, DM (Cardiology)', 14, 'OPD-204 (2nd Floor)', 800.0, true, ARRAY['10:00 AM', '10:30 AM', '11:00 AM', '04:00 PM', '04:30 PM']),
('doc-002', 'Dr. Ananya Reddy', 'Orthopedic & Joint Surgeon', 'MBBS, MS (Ortho), MCh', 11, 'OPD-108 (1st Floor)', 750.0, true, ARRAY['09:30 AM', '10:00 AM', '11:30 AM', '03:00 PM']),
('doc-003', 'Dr. Vikramaditya Sen', 'General Physician & Diabetologist', 'MBBS, MD (Medicine)', 16, 'OPD-102 (1st Floor)', 500.0, true, ARRAY['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'])
ON CONFLICT ("id") DO NOTHING;

-- Rooms & Wards
INSERT INTO "Room" ("id", "roomNumber", "category", "floor", "wing", "dailyRate", "totalBeds") VALUES
('room-gw-101', 'GW-101', 'GENERAL_WARD', '1st Floor', 'East Wing', 1200.0, 2),
('room-sp-201', 'SP-201', 'SEMI_PRIVATE', '2nd Floor', 'South Wing', 3000.0, 1),
('room-pd-301', 'PD-301', 'PRIVATE_DELUXE', '3rd Floor', 'North Wing', 6500.0, 1),
('room-icu-1', 'ICU-1', 'ICU', 'Ground Floor', 'Emergency Wing', 12000.0, 1)
ON CONFLICT ("id") DO NOTHING;

-- Beds
INSERT INTO "Bed" ("id", "roomId", "bedNumber", "status") VALUES
('bed-gw-101-1', 'room-gw-101', 'Bed 1', 'AVAILABLE'),
('bed-gw-101-2', 'room-gw-101', 'Bed 2', 'AVAILABLE'),
('bed-sp-201-1', 'room-sp-201', 'Bed 1', 'AVAILABLE'),
('bed-pd-301-1', 'room-pd-301', 'Bed 1', 'AVAILABLE'),
('bed-icu-1-a', 'room-icu-1', 'ICU Bed A', 'AVAILABLE')
ON CONFLICT ("id") DO NOTHING;

-- Sample Patient (Rajesh Sharma)
INSERT INTO "Patient" ("id", "uhid", "fullName", "dateOfBirth", "age", "gender", "bloodGroup", "contactNumber", "emergencyContact", "address", "allergies", "chronicConditions", "currentUrgency", "primaryLanguage") VALUES
('pat-001', 'MF-2026-8812', 'Rajesh Sharma', '1982-04-12', 44, 'MALE', 'B+', '+91 98765 43210', '+91 98765 43211 (Spouse)', 'Banjara Hills, Hyderabad, Telangana', ARRAY['Penicillin (Mild rash)'], ARRAY['Hypertension', 'Post-Angioplasty Recovery'], 'ROUTINE', 'te')
ON CONFLICT ("id") DO NOTHING;

-- Confirmation
SELECT 'MediFlow AI Supabase Schema & Initial Hospital Data initialized successfully!' AS status;
