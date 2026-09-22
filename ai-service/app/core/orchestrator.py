import re
from typing import Dict, Any, List

from app.models.schemas import ChatRequest, ChatResponse, AgentRoleEnum
from app.services.language_detector import language_detector
from app.services.speech_service import speech_service
from app.utils.guardrails import evaluate_emergency_red_flags, enforce_clinical_guardrail
from app.core.tools import hospital_tools

class CentralAgentOrchestrator:
    """
    Central Agentic Orchestrator for MediFlow AI.
    Executes the 25-Tool Registry via secure backend functions without directly modifying databases.
    Pipeline: User Request -> Intent Extraction -> Tool Execution -> Multilingual NLP -> Text + TTS Speech.
    """

    def __init__(self):
        self.session_memory: Dict[str, List[Dict[str, str]]] = {}

    async def handle_chat_turn(self, req: ChatRequest) -> ChatResponse:
        session_id = req.patient_id or "anonymous_session"
        context = req.context or {}

        # 1. Voice STT if Audio Base64 is provided
        user_text = req.message.strip()
        if req.audio_base64 and not user_text:
            user_text = await speech_service.transcribe_audio(req.audio_base64, req.language_override)

        # 2. Automatic Language & Code-Mixing Detection
        if req.language_override:
            detected_lang = req.language_override
            is_code_mixed = False
        else:
            lang_info = language_detector.detect(user_text)
            detected_lang = lang_info["detected_language"]
            is_code_mixed = lang_info["is_code_mixed"]

        if session_id not in self.session_memory:
            self.session_memory[session_id] = []
        self.session_memory[session_id].append({"role": "user", "content": user_text, "lang": detected_lang})

        lowered = user_text.lower()
        active_role = AgentRoleEnum.INTAKE
        action_card = None
        urgency = "ROUTINE"
        requires_escalation = False

        # 3. Clinical Emergency Red-Flag Interception -> Tool: `createEscalation`
        is_emergency, red_flags = evaluate_emergency_red_flags(user_text)
        if is_emergency:
            active_role = AgentRoleEnum.ESCALATION
            urgency = "EMERGENCY"
            requires_escalation = True
            esc_res = await hospital_tools.create_escalation(
                patient_id=req.patient_id or "pat-001",
                symptoms=red_flags,
                severity="CRITICAL"
            )

            if detected_lang.startswith("te"):
                response_text = (
                    f"⚠️ అత్యవసర హెచ్చరిక: మీరు తెలిపిన లక్షణాలు తీవ్రమైనవి ({', '.join(red_flags)}). "
                    f"హాస్పిటల్ ఎమర్జెన్సీ మరియు కార్డియాలజీ నర్సింగ్ స్టేషన్ కు తక్షణ రెడ్-ఫ్లాగ్ హెచ్చరిక పంపబడింది. "
                    f"దయచేసి ప్రశాంతంగా కూర్చుని నెమ్మదిగా శ్వాస తీసుకోండి."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    f"⚠️ आपातकालीन सूचना: आपके बताए गए लक्षण गंभीर हैं ({', '.join(red_flags)})। "
                    f"अस्पताल की इमरजेंसी और कार्डियोलॉजी टीम को तुरंत रेड-फ्लैग अलर्ट भेज दिया गया है। "
                    f"कृपया तुरंत शांत होकर बैठें और गहरी सांस लें।"
                )
            else:
                response_text = (
                    f"⚠️ Clinical Emergency Protocol Activated: Red-flag symptoms detected ({', '.join(red_flags)}). "
                    f"An emergency escalation alert has been dispatched to the Cardiology Nurse Station. "
                    f"Please remain seated, take slow deep breaths, and await clinical assistance."
                )

            action_card = {
                "cardType": "EMERGENCY_ALERT",
                "data": {
                    "department": "Cardiology & Emergency",
                    "severity": "CRITICAL",
                    "symptoms": red_flags,
                    "escalationId": esc_res["escalationId"]
                }
            }

        # 4. Doctor Appointment & Availability -> Sub-Agent: AppointmentAgent (Enforces No Premature Auto-Booking)
        elif any(w in lowered for w in ["doctor", "appointment", "slot", "token", "డాక్టర్", "కన్సల్టేషన్", "अपॉइंटमेंट", "डॉक्टर"]):
            active_role = AgentRoleEnum.APPOINTMENT
            from app.agents.appointment_agent import AppointmentAgent
            apt_agent = AppointmentAgent()
            apt_result = await apt_agent.process(user_text, context, detected_lang)
            response_text = apt_result.get("responseText", "")
            action_card = apt_result.get("actionCard")

        # 5. Room & Bed Accommodations -> Tools: `checkRoomAvailability`, `allocateAccommodation`
        elif any(w in lowered for w in ["room", "bed", "admit", "ward", "icu", "గది", "రూమ్", "బెడ్", "कमरा", "वार्ड"]):
            active_role = AgentRoleEnum.ACCOMMODATION
            rooms = await hospital_tools.check_room_availability()

            if detected_lang.startswith("te"):
                response_text = (
                    "హాస్పిటల్ లో ప్రస్తుతం అందుబాటులో ఉన్న ఇన్ పేషెంట్ బెడ్ల వివరాలు: "
                    "సెమీ-ప్రైవేట్ వార్డ్ SP-201 (₹3,500/రోజు), డీలక్స్ రూమ్ DLX-301 (₹6,500/రోజు), మరియు కార్డియాక్ ఐసీయూ ICU-102 సిద్ధంగా ఉన్నాయి."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    "अस्पताल में वर्तमान में उपलब्ध इनपेशेंट बिस्तरों की स्थिति: "
                    "सेमी-प्राइवेट वार्ड SP-201 (₹3,500/दिन), डीलक्स रूम DLX-301 (₹6,500/दिन), और आईसीयू ICU-102 उपलब्ध हैं।"
                )
            else:
                response_text = (
                    "Here are the current inpatient room and bed allocations: "
                    "Semi-Private Ward SP-201 (₹3,500/day), Deluxe Suite DLX-301 (₹6,500/day), and Cardiac ICU-102 (₹12,000/day) are available."
                )

            action_card = {
                "cardType": "BED_CONFIRMATION",
                "data": {
                    "availableRooms": [
                        {"category": "Semi-Private Ward", "room": "SP-201", "rate": "₹3,500 / day"},
                        {"category": "Deluxe Private Suite", "room": "DLX-301", "rate": "₹6,500 / day"},
                        {"category": "Intensive Care Unit (ICU)", "room": "ICU-102", "rate": "₹12,000 / day"}
                    ],
                    "toolExecuted": "checkRoomAvailability"
                }
            }

        # 6. Medication & Adherence -> Tools: `getMedicationSchedule`, `recordMedicationConfirmation`
        elif any(w in lowered for w in ["medicine", "tablet", "dose", "took", "vesukunnanu", "లే తీసుకున్నాను", "दवा", "गोली", "ఖురాక్"]):
            active_role = AgentRoleEnum.MEDICATION
            if any(w in lowered for w in ["took", "taken", "completed", "yes", "వేసుకున్నాను", "తీసుకున్నాను", "ले लिया"]):
                med_res = await hospital_tools.record_medication_confirmation("sched-002", "TAKEN")
                if detected_lang.startswith("te"):
                    response_text = "చాలా మంచిది! మీ మందుల డోస్ విజయవంతంగా నమోదయింది. మీ రికవరీ ప్రణాళిక 94% ఖచ్చితత్వంతో కొనసాగుతోంది."
                elif detected_lang.startswith("hi"):
                    response_text = "बहुत बढ़िया! आपकी दवा की खुराक दर्ज कर ली गई है। आपका 5-दिवसीय अनुपालन 94% पर है।"
                else:
                    response_text = "Dose confirmed as Taken! Your 5-day care adherence streak is at 94%."
            else:
                if detected_lang.startswith("te"):
                    response_text = "మీ తదుపరి డోస్: మెటోప్రోలాల్ ER 25mg (1 టాబ్లెట్) రాత్రి 09:00 గంటలకు భోజనం తర్వాత వేసుకోవాలి."
                elif detected_lang.startswith("hi"):
                    response_text = "आपकी अगली निर्धारित खुराक: मेटोप्रोलोल ER 25mg (1 गोली) रात 09:00 बजे रात के खाने के बाद लेनी है।"
                else:
                    response_text = "Your next scheduled dose is Metoprolol Succinate ER 25mg (1 Tablet) at 09:00 PM after dinner."

            action_card = {
                "cardType": "MEDICATION_REMINDER",
                "data": {
                    "medicineName": "Metoprolol Succinate ER 25mg",
                    "dosage": "1 Tablet (Post-Dinner)",
                    "timing": "09:00 PM",
                    "status": "CONFIRMED",
                    "toolExecuted": "recordMedicationConfirmation"
                }
            }

        # 7. Diet & Clinical Nutrition -> Tool: `getDietPlan`
        elif any(w in lowered for w in ["diet", "food", "meal", "dinner", "lunch", "ఆహారం", "భోజనం", "తిండి", "खाना", "आहार"]):
            active_role = AgentRoleEnum.DIET
            diet = await hospital_tools.get_diet_plan("pat-001")

            if detected_lang.startswith("te"):
                response_text = (
                    "డాక్టర్ ఆమోదించిన కార్డియాక్ డైట్ సూచనలు: "
                    "రాత్రి భోజనంలో 2 మల్టీగ్రెయిన్ రోటీలు, వెజిటబుల్ సూప్ మరియు పనీర్ తీసుకోండి. ఉప్పు పరిమితి రోజుకు 2 గ్రాముల లోపు ఉంచండి."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    "चिकित्सक द्वारा अनुमोदित कार्डियक आहार निर्देश: "
                    "रात के खाने में 2 मल्टीग्रेन रोटी, सब्जियों का सूप और पनीर लें। नमक की मात्रा 2 ग्राम से कम रखें।"
                )
            else:
                response_text = (
                    "Clinician-Authorized Cardiac Diet: Target 1,800 kcal / day with low sodium (< 2g/day) and 2.2L hydration. "
                    "Dinner: 2 Multigrain rotis, clear vegetable soup, and grilled paneer. Avoid fried snacks."
                )

            action_card = {
                "cardType": "DIET_PLAN",
                "data": {
                    "calorieTarget": 1800,
                    "dinner": "2 Multigrain rotis, clear vegetable soup, grilled paneer",
                    "sodiumLimit": "< 2g/day",
                    "toolExecuted": "getDietPlan"
                }
            }

        # 8. Billing & Hospital Invoices -> Tools: `getBill`, `generateBill`
        elif re.search(r'\b(bill|cost|invoice|payment|fee|fees)\b', lowered) or any(w in lowered for w in ["బిల్లు", "ఖర్చు", "చెల్లింపు", "बिल", "भुगतान"]):
            active_role = AgentRoleEnum.BILLING
            bill = await hospital_tools.get_bill("INV-2026-8812")

            if detected_lang.startswith("te"):
                response_text = (
                    f"ఆసుపత్రి అధికారిక ఇన్వాయిస్ #{bill['invoiceNumber']}: "
                    f"మొత్తం ఆమోదిత చార్జీలు: ₹{bill['totalAmount']:,.2f}. చెల్లించిన మొత్తం: ₹{bill['paidAmount']:,.2f}. "
                    f"ప్రస్తుత బకాయి: ₹{bill['balanceDue']:,.2f}."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    f"अस्पताल का आधिकारिक इनवॉइस #{bill['invoiceNumber']}: "
                    f"कुल अनुमोदित शुल्क: ₹{bill['totalAmount']:,.2f}। भुगतान की गई राशि: ₹{bill['paidAmount']:,.2f}। "
                    f"शेष देय राशि: ₹{bill['balanceDue']:,.2f}।"
                )
            else:
                response_text = (
                    f"Hospital Itemized Invoice #{bill['invoiceNumber']}: "
                    f"Total Approved Charges: ₹{bill['totalAmount']:,.2f}. Amount Paid: ₹{bill['paidAmount']:,.2f}. "
                    f"Outstanding Balance Due: ₹{bill['balanceDue']:,.2f}."
                )

            action_card = {
                "cardType": "BILL_BREAKDOWN",
                "data": {
                    "invoiceNumber": bill["invoiceNumber"],
                    "totalPayable": f"₹{bill['totalAmount']:,.2f}",
                    "paidAmount": f"₹{bill['paidAmount']:,.2f}",
                    "balanceDue": f"₹{bill['balanceDue']:,.2f}",
                    "status": bill["status"],
                    "toolExecuted": "getBill"
                }
            }

        # 8.5. Device Assistance & Contextual Phone Telemetry
        device_ctx = context.get("deviceContext")
        perm_status = context.get("devicePermissionStatus")
        weakness_keywords = [
            "weak", "weakness", "tired", "fatigue", "dizzy", "dizziness", "unsteady", 
            "shaky", "tremor", "faint", "exhausted", "treatment", "after treatment", 
            "నీరసం", "బలహీనత", "కళ్ళు తిరుగుతున్నాయి", "అలసట", "శక్తి లేదు",
            "कमजोरी", "चक्कर", "थकान", "बेहोशी", "कमज़ोर"
        ]
        is_weakness_query = any(w in lowered for w in weakness_keywords)

        if device_ctx:
            # The patient has granted permission and shared real phone device telemetry
            active_role = AgentRoleEnum.DEVICE_ASSISTANCE
            mag = float(device_ctx.get("motionMagnitude", 9.8))
            stab = float(device_ctx.get("stabilityIndex", 95))
            tilt = device_ctx.get("tilt") or {}
            pitch = tilt.get("beta")
            roll = tilt.get("gamma")
            batt = device_ctx.get("battery") or {}
            batt_lvl = batt.get("level", 85)
            charging = batt.get("charging", False)
            net = device_ctx.get("network") or {}
            net_type = net.get("effectiveType", "WiFi / Mobile")
            net_online = net.get("online", True)

            # Determine motion state based on real physical acceleration
            if 9.2 <= mag <= 10.5:
                motion_desc_en = "at steady stationary rest (standard gravitational baseline)"
                motion_desc_te = "నిశ్చలమైన విశ్రాంతి స్థితిలో ఉంది"
                motion_desc_hi = "शांत विश्राम अवस्था में है"
            elif 10.5 < mag < 13.0:
                motion_desc_en = "experiencing slight ambient movement or gentle posture shifts"
                motion_desc_te = "తేలికపాటి కదలికలను నమోదు చేస్తోంది"
                motion_desc_hi = "हल्की हलचल दर्ज कर रहा है"
            else:
                motion_desc_en = "detecting noticeable movement or dynamic physical motion"
                motion_desc_te = "గమనించదగిన శారీరక కదలికలను నమోదు చేస్తోంది"
                motion_desc_hi = "सक्रिय शारीरिक हलचल दर्ज कर रहा है"

            if detected_lang.startswith("te"):
                response_text = (
                    f"మీరు అనుమతించిన ఫోన్ సెన్సార్ సమాచారం విజయవంతంగా స్వీకరించబడింది. "
                    f"పరికర యాక్సిలరోమీటర్ ప్రకారం మీ ఫోన్ ప్రస్తుతం {motion_desc_te} (స్థిరత్వం: {stab:.0f}%, చలన త్వరణం: {mag:.2f} m/s²). "
                    f"ఫోన్ బ్యాటరీ {batt_lvl}% వద్ద ఉంది ({'చార్జింగ్ అవుతోంది' if charging else 'బ్యాటరీ రన్నింగ్'}). "
                    f"దయచేసి ప్రశాంతంగా పడుకుని విశ్రాంతి తీసుకోండి, కొద్దికొద్దిగా నీరు లేదా ఓఆర్ఎస్ త్రాగండి. "
                    f"⚠️ గమనిక: మొబైల్ సెన్సార్లు కేవలం బాహ్య కదలికలను మాత్రమే సూచిస్తాయి; ఇవి వైద్య నిర్ధారణ (డయాగ్నోసిస్) లేదా అంతర్గత బలహీనతను కొలవలేవు. "
                    f"మీ నీరసం కొనసాగితే డాక్టర్ సంప్రదింపులను పొందండి."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    f"आपके फोन से स्वीकृत वास्तविक डिवाइस जानकारी प्राप्त हो गई है। "
                    f"डिवाइस एक्सेलेरोमीटर के अनुसार आपका फोन {motion_desc_hi} (स्थिरता: {stab:.0f}%, त्वरण: {mag:.2f} m/s²)। "
                    f"डिवाइस बैटरी {batt_lvl}% है ({'चार्ज हो रहा है' if charging else 'बैटरी पर'})। "
                    f"कृपया बिस्तर पर आराम करें और ओआरएस या हल्का गुनगुना पानी पिएं। "
                    f"⚠️ सूचना: फोन के सेंसर केवल आसपास की गति और फोन की स्थिति बताते हैं; यह कोई चिकित्सीय निदान (Medical Diagnosis) नहीं है। "
                    f"यदि कमजोरी बनी रहे, तो डॉक्टर से सलाह लें।"
                )
            else:
                response_text = (
                    f"I have received your permitted real-time phone device telemetry. "
                    f"Based on your phone's accelerometer, your device is {motion_desc_en} (stability: {stab:.0f}%, acceleration: {mag:.2f} m/s²). "
                    f"Device battery is at {batt_lvl}% ({'charging' if charging else 'on battery'}) on an active {net_type} connection. "
                    f"Please rest comfortably in bed, keep hydrated with electrolyte fluids, and avoid sudden standing. "
                    f"⚠️ Contextual Notice: Phone sensors provide ambient context only (e.g. device movement/steadiness) and cannot medically diagnose conditions or measure physiological vitals. "
                    f"If your weakness persists or intensifies, we will immediately connect you with our clinical team."
                )

            action_card = {
                "cardType": "DEVICE_CONTEXT_SUMMARY",
                "data": {
                    "motionMagnitude": f"{mag:.2f} m/s²",
                    "stabilityIndex": f"{stab:.0f}%",
                    "motionState": "STATIONARY" if mag < 10.5 else "ACTIVE",
                    "pitchTilt": f"{float(pitch):.1f}°" if pitch is not None else "Steady",
                    "rollTilt": f"{float(roll):.1f}°" if roll is not None else "Steady",
                    "batteryLevel": f"{batt_lvl}%",
                    "isCharging": charging,
                    "network": net_type,
                    "isRealHardware": True,
                    "disclaimer": "Non-Diagnostic Contextual Telemetry. Does not replace clinical evaluation or vital sign monitors."
                }
            }

        elif is_weakness_query and perm_status != "denied":
            # The patient mentions weakness/fatigue, and has not yet granted/denied permission
            active_role = AgentRoleEnum.DEVICE_ASSISTANCE
            if detected_lang.startswith("te"):
                response_text = (
                    "చికిత్స తర్వాత మీరు బలహీనంగా ఉన్నట్లు తెలిపారు. మీ విశ్రాంతి సమయం మరియు శారీరక స్థిరత్వాన్ని పరిశీలించడానికి, "
                    "మీ మొబైల్ ఫోన్ యొక్క యాక్సిలరోమీటర్ & పరికర సమాచారాన్ని మాతో పంచుకోవాలనుకుంటున్నారా? "
                    "మీ అనుమతితో మాత్రమే ఇది చదవబడుతుంది. (గమనిక: మొబైల్ సెన్సార్లు వైద్య నిర్ధారణ చేయలేవు, సహాయక సమాచారంగా మాత్రమే ఉపయోగపడతాయి)."
                )
            elif detected_lang.startswith("hi"):
                response_text = (
                    "उपचार के बाद कमजोरी महसूस होना सामान्य हो सकता है। आपकी वर्तमान शारीरिक स्थिरता और विश्राम की स्थिति को समझने के लिए, "
                    "क्या आप अपने फोन की गति (Accelerometer) और डिवाइस स्थिति साझा करना चाहते हैं? "
                    "यह पूरी तरह आपकी अनुमति पर निर्भर है। (नोट: फोन सेंसर कोई चिकित्सीय निदान नहीं करते हैं, केवल सहायक संदर्भ प्रदान करते हैं)।"
                )
            else:
                response_text = (
                    "I understand you are feeling weak after your treatment. "
                    "To provide supportive context (such as your device's physical steadiness and resting motion while you recuperate), "
                    "would you like to share your phone's real sensor & motion information? "
                    "This is entirely optional and only accessed with your permission. "
                    "(Note: Phone sensors provide ambient context only and do not provide medical diagnosis)."
                )

            action_card = {
                "cardType": "DEVICE_PERMISSION_REQUEST",
                "data": {
                    "reason": "Assess resting motion stability, phone tilt orientation, and device battery status while you rest.",
                    "requestedSensors": ["Accelerometer (Motion)", "Gyroscope (Orientation)", "Battery & Network Status"],
                    "privacyNotice": "Accessed locally from your device with strict clinical non-diagnostic guardrails.",
                    "disclaimer": "Phone sensors cannot diagnose clinical weakness or measure physiological vitals."
                }
            }

        # 9. Intelligent Clinical Medical & Healthcare Suggestion
        else:
            active_role = AgentRoleEnum.INTAKE
            from app.core.clinical_ai import generate_clinical_ai_response
            response_text, auto_card = generate_clinical_ai_response(user_text, detected_lang)
            if not action_card:
                action_card = auto_card

        # Enforce clinical safety guardrails
        sanitized_msg = enforce_clinical_guardrail(response_text)

        # Synthesize Voice TTS stream
        audio_out = None
        if context.get("voiceMode"):
            audio_out = await speech_service.synthesize_speech(sanitized_msg, detected_lang)

        self.session_memory[session_id].append({"role": "assistant", "content": sanitized_msg, "lang": detected_lang})

        # Sliding Window: Retain last 12 message turns to bound memory usage
        if len(self.session_memory[session_id]) > 12:
            self.session_memory[session_id] = self.session_memory[session_id][-12:]

        return ChatResponse(
            response_message=sanitized_msg,
            audio_base64=audio_out,
            detected_language=detected_lang,
            is_code_mixed=is_code_mixed,
            active_agent=active_role,
            action_card=action_card,
            urgency_classification=urgency,
            requires_staff_escalation=requires_escalation,
            context_updated={"intentHandled": active_role.value}
        )

orchestrator = CentralAgentOrchestrator()
