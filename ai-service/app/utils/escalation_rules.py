from typing import Optional
from typing import Dict, Any, List, Tuple
from app.models.schemas import UrgencyLevelEnum

# Deterministic Red-Flag Clinical Escalation Matrix
RED_FLAG_PATTERNS = [
    {
        "keywords": ["chest pain", "chest tightness", "radiating pain", "left arm pain", "గుండెల్లో నొప్పి", "ఛాతీ నొప్పి", "छाती में दर्द", "सीने में भारीपन"],
        "severity": "CRITICAL",
        "reason": "Suspected Acute Coronary Syndrome or Ischemic Cardiac Event",
        "department": "Emergency & Cardiology",
        "advice_en": "Stop all physical exertion immediately. Sit upright, take slow breaths, and do not drive yourself.",
        "advice_te": "శారీరక శ్రమను తక్షణమే ఆపండి. నిటారుగా కూర్చుని నెమ్మదిగా శ్వాస తీసుకోండి.",
        "advice_hi": "तुरंत सभी शारीरिक गतिविधियाँ रोकें। सीधे बैठें और गहरी सांस लें।"
    },
    {
        "keywords": ["shortness of breath", "breathless", "cannot breathe", "dyspnea", "శ్వాస ఆడట్లేదు", "దమ్ము", "సాస్", "सांस फूलना"],
        "severity": "HIGH",
        "reason": "Severe Respiratory Distress / Fluid Overload",
        "department": "Pulmonology & Emergency",
        "advice_en": "Rest in an elevated position. Check pulse oximeter if available.",
        "advice_te": "ఎత్తైన స్థానంలో విశ్రాంతి తీసుకోండి. పల్స్ ఆక్సిమీటర్ రీడింగ్ పరిశీలించండి.",
        "advice_hi": "ऊंचे तकिए के सहारे बैठें। अगर पल्स ऑक्सीमीटर है तो ऑक्सीजन जांचें।"
    },
    {
        "keywords": ["dizziness", "blackout", "fainting", "syncope", "కళ్ళు తిరగడం", "స్పృహ తప్పడం", "चक्कर आना", "बेहोशी"],
        "severity": "HIGH",
        "reason": "Severe Hypotension or Bradyarrhythmia",
        "department": "Cardiology",
        "advice_en": "Lie down flat and elevate your legs slightly. Drink water if conscious.",
        "advice_te": "పడుకుని కాళ్ళను కొద్దిగా పైకి ఎత్తండి. స్పృహ ఉంటే మంచి నీళ్ళు తాగండి.",
        "advice_hi": "समतल बिस्तर पर लेट जाएं और पैरों को थोड़ा ऊपर उठाएं।"
    },
    {
        "keywords": ["blood in vomit", "blood in stool", "hematemesis", "రక్తం పడుతోంది", "खून की उल्टी"],
        "severity": "CRITICAL",
        "reason": "Gastrointestinal Hemorrhage / Antiplatelet Complication",
        "department": "Gastroenterology & Emergency",
        "advice_en": "Do not consume food or oral medications. Seek immediate hospital emergency care.",
        "advice_te": "ఆహారం లేదా నోటి మందులు తీసుకోకండి. తక్షణమే అత్యవసర విభాగానికి వెళ్ళండి.",
        "advice_hi": "कोई खाना या दवा न लें। तुरंत अस्पताल के आपातकालीन वार्ड में जाएं।"
    }
]

def evaluate_patient_followup_symptoms(message: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    lowered = message.lower()
    for rule in RED_FLAG_PATTERNS:
        if any(k in lowered for k in rule["keywords"]):
            return True, rule
    return False, None
