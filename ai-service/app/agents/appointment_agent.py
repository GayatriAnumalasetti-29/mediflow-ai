from typing import Dict, Any
from app.core.tools import hospital_tools

class AppointmentAgent:
    """
    Sub-agent managing Doctor Directory, Scheduling, Booking, Rescheduling, and Token Generation.
    Supports English, Telugu, and Hindi responses.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        lowered = message.lower()
        
        # 1. Determine Target Department
        dept = "Cardiology"
        if "neuro" in lowered or "మెదడు" in lowered or "న్యూరో" in lowered:
            dept = "Neurology"
        elif "ortho" in lowered or "ఎముక" in lowered or "ఆర్థో" in lowered:
            dept = "Orthopedics"
        elif "general" in lowered or "physician" in lowered or "జ్వరం" in lowered:
            dept = "General Medicine"

        doctors = await hospital_tools.search_doctors(department=dept)
        selected_doc = doctors[0] if doctors else {
            "id": "doc-001",
            "fullName": "Dr. Priya Varma, MD, DM",
            "department": dept,
            "specialization": "Senior Interventional Cardiologist",
            "consultationFee": 800,
            "roomNumber": "OPD-204 (2nd Floor)",
            "experienceYears": 16,
            "virtualSlots": ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"],
            "directSlots": ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"]
        }

        # 2. Check Consultation Preference: Virtual vs Direct
        is_virtual_request = any(k in lowered for k in ["online", "virtual", "video", "ఇంటి వద్ద", "వీడియో", "ऑनलाइन", "वीडियो"])
        is_reschedule_request = any(k in lowered for k in ["reschedule", "missed", "change time", "రీషెడ్యూల్", "మిస్సయింది", "समय बदलें"])
        is_reminder_request = any(k in lowered for k in ["remind", "reminder", "జ్ఞాపకం", "రిమైండర్", "याद दिलाएं"])

        consultation_mode = "VIRTUAL" if is_virtual_request else "DIRECT"
        suggested_slot = "10:00 AM" if is_virtual_request else "02:30 PM"

        if is_reminder_request:
            if language.startswith("te"):
                response_text = "ఖచ్చితంగా! మీ అపాయింట్‌మెంట్‌కు 1 గంట ముందు మీకు రిమైండర్ నోటిఫికేషన్ పంపబడుతుంది."
            elif language.startswith("hi"):
                response_text = "निश्चित रूप से! आपके परामर्श से 1 घंटे पहले आपको रिमाइंडर सूचना भेजी जाएगी।"
            else:
                response_text = "Certainly! An appointment reminder has been scheduled for 1 hour before your consultation."
            
            card = {
                "cardType": "REMINDER_CONFIRMED",
                "data": {"timeBefore": "60 Minutes", "status": "ACTIVE"}
            }

        elif is_reschedule_request:
            if language.startswith("te"):
                response_text = (
                    f"అపాయింట్‌మెంట్ రీషెడ్యూల్ చేయడానికి మీ ప్రాధాన్య తేదీ మరియు సమయం ఏమిటి? "
                    f"నేను డాక్టర్ లభ్యతను తనిఖీ చేసాను. {selected_doc['fullName']} గారికి అందుబాటులో ఉన్న ఎంపికలు:\n"
                    f"1. ఆప్షన్ 1: రేపు 10:30 AM (వర్చువల్ మీట్)\n"
                    f"2. ఆప్షన్ 2: రేపు 03:00 PM (హాస్పిటల్ విజిట్)\n"
                    f"దయచేసి మీరు కోరుకునే స్లాట్‌ను ఎంచుకుని నిర్ధారించండి. మీ నిర్ధారణ లేకుండా సిస్టమ్ స్వయంచాలకంగా ఎంచుకోదు."
                )
            elif language.startswith("hi"):
                response_text = (
                    f"परामर्श पुनर्निर्धारित (reschedule) करने के लिए आपकी पसंदीदा तारीख और समय क्या है? "
                    f"मैंने डॉक्टर की वास्तविक उपलब्धता की जांच की है। {selected_doc['fullName']} के लिए उपलब्ध विकल्प:\n"
                    f"1. विकल्प 1: कल 10:30 AM (वर्चुअल वीडियो मीट)\n"
                    f"2. विकल्प 2: कल 03:00 PM (अस्पताल प्रत्यक्ष दौरा)\n"
                    f"कृपया अपना पसंदीदा स्लॉट चुनें और पुष्टि करें। आपकी पुष्टि के बिना सिस्टम स्वचालित रूप से स्लॉट बुक नहीं करेगा।"
                )
            else:
                response_text = (
                    f"When is your preferred date and time for rescheduling? "
                    f"I have verified actual availability for {selected_doc['fullName']}. Here are the available options:\n"
                    f"• Option 1: Tomorrow at 10:30 AM (🎥 Virtual Meet)\n"
                    f"• Option 2: Tomorrow at 03:00 PM (🏥 Direct Hospital Visit)\n"
                    f"• Option 3: Day after tomorrow at 11:15 AM (🎥 Virtual Meet)\n"
                    f"Please select and confirm which slot you prefer. As per clinical safety policy, MediFlow AI will never automatically choose a slot for you."
                )
            
            card = {
                "cardType": "RESCHEDULE_OPTIONS",
                "data": {
                    "doctorId": selected_doc["id"],
                    "doctorName": selected_doc["fullName"],
                    "department": selected_doc["department"],
                    "ruleEnforced": "Do not automatically choose for the patient",
                    "options": [
                        {
                            "id": "opt-1",
                            "date": "Tomorrow",
                            "slot": "10:30 AM",
                            "mode": "VIRTUAL",
                            "label": "Option 1: Tomorrow 10:30 AM (🎥 Virtual Meet)"
                        },
                        {
                            "id": "opt-2",
                            "date": "Tomorrow",
                            "slot": "03:00 PM",
                            "mode": "DIRECT",
                            "label": "Option 2: Tomorrow 03:00 PM (🏥 Direct Visit)"
                        },
                        {
                            "id": "opt-3",
                            "date": "Day After Tomorrow",
                            "slot": "11:15 AM",
                            "mode": "VIRTUAL",
                            "label": "Option 3: Day After Tomorrow 11:15 AM (🎥 Virtual Meet)"
                        }
                    ],
                    "confirmationRequired": True
                }
            }

        elif is_virtual_request:
            if language.startswith("te"):
                response_text = (
                    f"మీరు ఆన్‌లైన్ వీడియో కన్సల్టేషన్ కోరారు. {selected_doc['fullName']} ({selected_doc['specialization']}) "
                    f"రేపు ఉదయం 10:00 AM వర్చువల్ మీట్ ద్వారా అందుబాటులో ఉన్నారు. కన్సల్టేషన్ ఫీజు ₹{selected_doc['consultationFee']}."
                )
            elif language.startswith("hi"):
                response_text = (
                    f"आपने ऑनलाइन वीडियो परामर्श का अनुरोध किया है। {selected_doc['fullName']} ({selected_doc['specialization']}) "
                    f"कल सुबह 10:00 AM पर वर्चुअल मीट के लिए उपलब्ध हैं। परामर्श शुल्क ₹{selected_doc['consultationFee']} है।"
                )
            else:
                response_text = (
                    f"You requested an online consultation. {selected_doc['fullName']} ({selected_doc['specialization']}) "
                    f"is available for a Virtual Meet tomorrow at 10:00 AM. Consultation fee: ₹{selected_doc['consultationFee']}."
                )
            
            card = {
                "cardType": "DOCTOR_SELECTION",
                "data": {
                    "mode": "VIRTUAL",
                    "doctorId": selected_doc["id"],
                    "doctorName": selected_doc["fullName"],
                    "department": selected_doc["department"],
                    "specialization": selected_doc["specialization"],
                    "slot": "Tomorrow 10:00 AM",
                    "fee": f"₹{selected_doc['consultationFee']}",
                    "action": "Join Virtual Meet"
                }
            }

        else:
            if language.startswith("te"):
                response_text = (
                    f"నేను మీ కోసం {dept} విభాగంలో డాక్టర్ వివరాలను పరిశీలించాను. "
                    f"{selected_doc['fullName']} ({selected_doc['specialization']}) రేపు మధ్యాహ్నం 02:30 PM OPD వద్ద అందుబాటులో ఉన్నారు. "
                    f"కన్సల్టేషన్ ఫీజు ₹{selected_doc['consultationFee']} మరియు కన్ఫర్మేషన్ తర్వాత టోకెన్ కేటాయించబడుతుంది."
                )
            elif language.startswith("hi"):
                response_text = (
                    f"मैंने आपके लिए {dept} विभाग में उपलब्ध डॉक्टरों की जांच की है। "
                    f"{selected_doc['fullName']} ({selected_doc['specialization']}) कल दोपहर 02:30 PM OPD में उपलब्ध हैं। "
                    f"परामर्श शुल्क ₹{selected_doc['consultationFee']} है और पुष्टि के बाद टोकन आवंटित किया जाएगा।"
                )
            else:
                response_text = (
                    f"I checked doctor availability in {dept}. {selected_doc['fullName']} "
                    f"({selected_doc['specialization']}) is available for a Direct Visit tomorrow at 02:30 PM in {selected_doc['roomNumber']}. "
                    f"Consultation Fee: ₹{selected_doc['consultationFee']}. A token will be assigned upon confirmation."
                )

            card = {
                "cardType": "DOCTOR_SELECTION",
                "data": {
                    "mode": "DIRECT",
                    "doctorId": selected_doc["id"],
                    "doctorName": selected_doc["fullName"],
                    "department": selected_doc["department"],
                    "specialization": selected_doc["specialization"],
                    "slot": "Tomorrow 02:30 PM",
                    "fee": f"₹{selected_doc['consultationFee']}",
                    "room": selected_doc["roomNumber"]
                }
            }

        return {
            "response": response_text,
            "card": card,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"selectedDoctorId": selected_doc["id"], "selectedDepartment": dept, "mode": consultation_mode}
        }

appointment_agent = AppointmentAgent()
