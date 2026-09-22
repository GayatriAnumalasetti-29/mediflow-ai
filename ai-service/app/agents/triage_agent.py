from typing import Dict, Any
from app.utils.guardrails import evaluate_emergency_red_flags
from app.models.schemas import UrgencyLevelEnum

class TriageAgent:
    """
    Evaluates urgency classifications (Emergency, Urgent, Routine) and maps to hospital departments.
    Does NOT provide standalone medical diagnoses.
    """
    
    async def process(self, message: str, context: Dict[str, Any], lang: str) -> Dict[str, Any]:
        is_emergency, triggers = evaluate_emergency_red_flags(message)
        
        if is_emergency:
            urgency = UrgencyLevelEnum.EMERGENCY
            dept = "Emergency Resuscitation & Acute Care"
            
            if lang in ["te", "te-en"]:
                response_text = "⚠️ అత్యవసర హెచ్చరిక: మీ లక్షణాలు తక్షణ వైద్య సహాయం అవసరమైనవిగా కనిపిస్తున్నాయి. దయచేసి వెంటనే మా ఎమర్జెన్సీ విభాగానికి రండి. డ్యూటీ డాక్టర్‌కు సమాచారం అందించబడింది."
            elif lang in ["hi", "hi-en"]:
                response_text = "⚠️ आपातकालीन सूचना: आपके लक्षण तत्काल चिकित्सीय ध्यान देने योग्य हैं। कृपया तुरंत हमारे आपातकालीन (Emergency) विभाग में संपर्क करें। ड्यूटी डॉक्टर को सूचित कर दिया गया है।"
            else:
                response_text = "⚠️ EMERGENCY ALERT: Your reported symptoms indicate immediate medical evaluation is required. Please proceed to the Emergency Room immediately. The triage nurse and duty physician have been alerted."
                
            return {
                "response": response_text,
                "urgency": urgency,
                "requiresStaffEscalation": True,
                "card": {
                    "cardType": "EMERGENCY_ALERT",
                    "data": {
                        "severity": "CRITICAL",
                        "department": dept,
                        "reasons": triggers,
                        "action": "Immediate Emergency Department Triage"
                    }
                },
                "context": {"triageLevel": "EMERGENCY"}
            }
            
        # Standard Triage Routing
        urgency = UrgencyLevelEnum.ROUTINE
        dept = "General Medicine / Outpatient Consultation"
        
        if lang in ["te", "te-en"]:
            response_text = f"మీ లక్షణాల ఆధారంగా {dept} విభాగానికి చెకప్ చేయించుకోవాలని సిఫార్సు చేస్తున్నాము. మీరు డాక్టర్ అపాయింట్‌మెంట్ బుక్ చేయాలనుకుంటున్నారా?"
        elif lang in ["hi", "hi-en"]:
            response_text = f"आपके लक्षणों के अनुसार हम {dept} में परामर्श की सलाह देते हैं। क्या आप डॉक्टर का अपॉइंटमेंट बुक करना चाहते हैं?"
        else:
            response_text = f"Based on your symptoms, we recommend an evaluation at the {dept}. Would you like me to show available doctor slots for booking?"
            
        return {
            "response": response_text,
            "urgency": urgency,
            "requiresStaffEscalation": False,
            "card": {
                "cardType": "TRIAGE_RESULT",
                "data": {
                    "recommendedDepartment": dept,
                    "urgency": "ROUTINE",
                    "estimatedWait": "15-20 mins"
                }
            },
            "context": {"triageLevel": "ROUTINE", "recommendedDept": dept}
        }

triage_agent = TriageAgent()
