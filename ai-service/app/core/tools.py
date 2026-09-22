from typing import Dict, Any, List, Optional
import uuid

class HospitalOperationsTools:
    """
    Comprehensive 25-Tool Registry for MediFlow AI Central Orchestrator.
    All hospital operations are securely invoked through tool calling interfaces.
    """

    # 1. registerPatient
    async def register_patient(self, full_name: str, age: int, gender: str, contact: str, blood_group: str = "O+") -> Dict[str, Any]:
        uhid_num = 8812
        return {
            "patientId": f"pat-{uuid.uuid4()}",
            "uhid": f"MF-2026-{uhid_num}",
            "fullName": full_name,
            "age": age,
            "gender": gender,
            "bloodGroup": blood_group,
            "contactNumber": contact,
            "status": "REGISTERED"
        }

    # 2. getPatientDetails
    async def get_patient_details(self, patient_id: str) -> Dict[str, Any]:
        return {
            "patientId": patient_id or "pat-001",
            "uhid": "MF-2026-8812",
            "fullName": "Rajesh Sharma",
            "age": 44,
            "gender": "MALE",
            "bloodGroup": "O+",
            "allergies": ["Penicillin", "Sulfa drugs"],
            "chronicConditions": ["Post-Angioplasty Recovery", "Mild Hypertension"],
            "currentRoom": "SP-201 (Semi-Private Ward)"
        }

    # 3. findDepartment
    async def find_department(self, query: str) -> List[Dict[str, Any]]:
        depts = [
            {"id": "dept-1", "name": "Cardiology", "floor": "1st Floor OPD", "hod": "Dr. Priya Varma"},
            {"id": "dept-2", "name": "Neurology", "floor": "2nd Floor OPD", "hod": "Dr. Arvind Rao"},
            {"id": "dept-3", "name": "Orthopedics", "floor": "1st Floor OPD", "hod": "Dr. Sneha Reddy"},
            {"id": "dept-4", "name": "Emergency & Trauma", "floor": "Ground Floor", "hod": "Dr. Vikram Seth"}
        ]
        return [d for d in depts if query.lower() in d["name"].lower()] or depts

    # 4. findDoctor
    async def find_doctor(self, department: Optional[str] = None, doctor_name: Optional[str] = None) -> List[Dict[str, Any]]:
        doctors = [
            {
                "id": "doc-001",
                "fullName": "Dr. Priya Varma",
                "department": "Cardiology",
                "specialization": "Interventional Cardiology",
                "qualification": "MD, DM (Cardiology)",
                "experienceYears": 14,
                "consultationFee": 800,
                "roomNumber": "OPD Room 104"
            },
            {
                "id": "doc-002",
                "fullName": "Dr. Arvind Rao",
                "department": "Neurology",
                "specialization": "Clinical Neurophysiology",
                "qualification": "MD, DM (Neurology)",
                "experienceYears": 18,
                "consultationFee": 900,
                "roomNumber": "OPD Room 202"
            },
            {
                "id": "doc-003",
                "fullName": "Dr. Sneha Reddy",
                "department": "Orthopedics",
                "specialization": "Joint Replacement & Arthroscopy",
                "qualification": "MS (Ortho)",
                "experienceYears": 11,
                "consultationFee": 750,
                "roomNumber": "OPD Room 108"
            }
        ]
        if department:
            return [d for d in doctors if department.lower() in d["department"].lower()]
        if doctor_name:
            return [d for d in doctors if doctor_name.lower() in d["fullName"].lower()]
        return doctors

    # 5. checkDoctorAvailability
    async def check_doctor_availability(self, doctor_id: str, date_str: str = "Tomorrow") -> Dict[str, Any]:
        return {
            "doctorId": doctor_id or "doc-001",
            "doctorName": "Dr. Priya Varma",
            "date": date_str,
            "availableSlots": ["10:30 AM", "02:00 PM", "04:30 PM"],
            "currentQueueTokensIssued": 11,
            "maxTokenLimit": 25
        }

    # 6. bookAppointment
    async def book_appointment(self, patient_id: str, doctor_id: str, slot: str, reason: str = "Consultation") -> Dict[str, Any]:
        token_num = 12
        return {
            "appointmentId": f"apt-{uuid.uuid4()}",
            "patientId": patient_id or "pat-001",
            "doctorId": doctor_id or "doc-001",
            "doctorName": "Dr. Priya Varma",
            "department": "Cardiology",
            "timeSlot": slot or "Tomorrow 10:30 AM",
            "tokenNumber": token_num,
            "status": "CONFIRMED",
            "roomNumber": "OPD Room 104"
        }

    # 7. cancelAppointment
    async def cancel_appointment(self, appointment_id: str, reason: str = "Patient request") -> Dict[str, Any]:
        return {
            "appointmentId": appointment_id,
            "status": "CANCELLED",
            "cancellationReason": reason,
            "cancelledAt": "2026-08-31T18:40:00Z"
        }

    # 8. rescheduleAppointment
    async def reschedule_appointment(self, appointment_id: str, new_slot: str) -> Dict[str, Any]:
        return {
            "appointmentId": appointment_id,
            "status": "RESCHEDULED",
            "newTimeSlot": new_slot,
            "tokenNumber": 12
        }

    # 9. getQueueStatus
    async def get_queue_status(self, department: str = "Cardiology") -> Dict[str, Any]:
        return {
            "department": f"{department} OPD",
            "currentToken": 10,
            "myToken": 12,
            "waitingCount": 2,
            "estimatedWaitTimeMinutes": 14
        }

    # 10. checkRoomAvailability
    async def check_room_availability(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        rooms = [
            {"roomNumber": "SP-201", "category": "SEMI_PRIVATE", "dailyRate": 3500, "availableBeds": 1, "floor": "2nd Floor"},
            {"roomNumber": "DLX-301", "category": "DELUXE", "dailyRate": 6500, "availableBeds": 1, "floor": "3rd Floor"},
            {"roomNumber": "ICU-102", "category": "ICU", "dailyRate": 12000, "availableBeds": 2, "floor": "1st Floor"}
        ]
        if category:
            return [r for r in rooms if category.lower() in r["category"].lower()]
        return rooms

    # 11. allocateAccommodation
    async def allocate_accommodation(self, patient_id: str, room_number: str, bed_number: int = 1) -> Dict[str, Any]:
        return {
            "allocationId": f"alloc-{uuid.uuid4()}",
            "patientId": patient_id,
            "roomNumber": room_number,
            "bedNumber": bed_number,
            "status": "OCCUPIED",
            "allocatedAt": "2026-08-31T18:40:00Z"
        }

    # 12. uploadPrescription
    async def upload_prescription(self, patient_id: str, image_url: str) -> Dict[str, Any]:
        return {
            "prescriptionId": f"rx-{uuid.uuid4()}",
            "patientId": patient_id,
            "imageUrl": image_url,
            "status": "UPLOADED"
        }

    # 13. extractPrescription
    async def extract_prescription(self, prescription_id: str) -> Dict[str, Any]:
        return {
            "prescriptionId": prescription_id,
            "extractedItems": [
                {"medicineName": "Atorvastatin Calcium", "dosage": "20 mg", "frequency": "0-0-1", "timing": "AFTER_MEALS", "confidence": 0.98},
                {"medicineName": "Metoprolol Succinate ER", "dosage": "25 mg", "frequency": "1-0-1", "timing": "AFTER_MEALS", "confidence": 0.95},
                {"medicineName": "Ecosprin", "dosage": "75 mg", "frequency": "1-0-0", "timing": "AFTER_MEALS", "confidence": 0.88, "isAmbiguous": True}
            ],
            "overallConfidence": 0.94
        }

    # 14. verifyPrescription
    async def verify_prescription(self, prescription_id: str, verified_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "prescriptionId": prescription_id,
            "verificationStatus": "VERIFIED_BY_PATIENT",
            "itemCount": len(verified_items),
            "verifiedAt": "2026-08-31T18:40:00Z"
        }

    # 15. createMedicationSchedule
    async def create_medication_schedule(self, patient_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "patientId": patient_id,
            "schedulesCreated": len(items),
            "activeSchedules": ["Ecosprin 75mg at 08:30 AM", "Metoprolol ER 25mg at 09:00 PM"],
            "status": "ACTIVE"
        }

    # 16. getMedicationSchedule
    async def get_medication_schedule(self, patient_id: str) -> List[Dict[str, Any]]:
        return [
            {"medicine": "Ecosprin 75mg", "dosage": "1 Tablet", "time": "08:30 AM", "status": "COMPLETED"},
            {"medicine": "Metoprolol ER 25mg", "dosage": "1 Tablet", "time": "09:00 PM", "status": "PENDING"}
        ]

    # 17. recordMedicationConfirmation
    async def record_medication_confirmation(self, schedule_id: str, status: str = "TAKEN") -> Dict[str, Any]:
        return {
            "scheduleId": schedule_id,
            "status": "COMPLETED",
            "loggedAt": "2026-08-31T18:40:00Z",
            "complianceStreakDays": 5
        }

    # 18. getDietPlan
    async def get_diet_plan(self, patient_id: str) -> Dict[str, Any]:
        return {
            "dietType": "Clinician-Authorized Low-Sodium Cardiac Nutrition",
            "calorieTarget": 1800,
            "sodiumLimit": "< 2g/day",
            "hydrationTarget": "2.2 Liters/day",
            "meals": [
                {"meal": "Breakfast", "time": "09:00 AM", "items": "Oatmeal porridge with almonds, 2 boiled egg whites"},
                {"meal": "Lunch", "time": "01:00 PM", "items": "Brown rice, steamed seasonal vegetables, dal"},
                {"meal": "Evening Snack", "time": "05:30 PM", "items": "Green tea, unsalted roasted nuts"},
                {"meal": "Dinner", "time": "08:00 PM", "items": "2 Multigrain rotis, clear vegetable soup, grilled paneer"}
            ]
        }

    # 19. getActivityPlan
    async def get_activity_plan(self, patient_id: str) -> Dict[str, Any]:
        return {
            "activityType": "Gentle Flat Walking & Diaphragmatic Breathing",
            "targetDurationMinutes": 15,
            "heartRateCeilingBpm": 110,
            "frequency": "Daily Mid-Morning"
        }

    # 20. getTherapySchedule
    async def get_therapy_schedule(self, patient_id: str) -> Dict[str, Any]:
        return {
            "therapyType": "Cardiac Rehabilitation & Chest Physiotherapy",
            "therapist": "Dr. Ananya Ray, Senior PT",
            "schedule": "Monday, Wednesday, Friday at 04:30 PM",
            "completedSessions": 2,
            "totalPrescribed": 12
        }

    # 21. generateBill
    async def generate_bill(self, patient_id: str) -> Dict[str, Any]:
        return {
            "invoiceNumber": "INV-2026-8812",
            "subtotal": 9072.50,
            "taxAmount": 455.00,
            "totalAmount": 9527.50,
            "paidAmount": 5000.00,
            "balanceDue": 4527.50,
            "status": "PARTIALLY_PAID"
        }

    # 22. getBill
    async def get_bill(self, invoice_number: str = "INV-2026-8812") -> Dict[str, Any]:
        return {
            "invoiceNumber": invoice_number,
            "patientName": "Rajesh Sharma",
            "uhid": "MF-2026-8812",
            "totalAmount": 9527.50,
            "paidAmount": 5000.00,
            "balanceDue": 4527.50,
            "status": "PARTIALLY_PAID"
        }

    # 23. scheduleFollowUp
    async def schedule_follow_up(self, patient_id: str, doctor_name: str, date_str: str) -> Dict[str, Any]:
        return {
            "followUpId": f"fol-{uuid.uuid4()}",
            "doctorName": doctor_name or "Dr. Priya Varma",
            "department": "Cardiology OPD",
            "scheduledDate": date_str or "Tomorrow 10:30 AM",
            "tokenNumber": 12
        }

    # 24. createNotification
    async def create_notification(self, patient_id: str, title: str, message: str) -> Dict[str, Any]:
        return {
            "notificationId": f"notif-{uuid.uuid4()}",
            "patientId": patient_id,
            "title": title,
            "message": message,
            "createdAt": "2026-08-31T18:40:00Z"
        }

    # 25. createEscalation
    async def create_escalation(self, patient_id: str, symptoms: List[str], severity: str = "CRITICAL") -> Dict[str, Any]:
        return {
            "escalationId": f"esc-{uuid.uuid4()}",
            "patientId": patient_id,
            "severity": severity,
            "reportedSymptoms": symptoms,
            "dispatchedTo": "Cardiology Emergency Nurse Station",
            "status": "ACTIVE_RED_FLAG"
        }

hospital_tools = HospitalOperationsTools()
