import re
from typing import Tuple, List

RED_FLAG_KEYWORDS = [
    # English
    r"chest pain", r"heart attack", r"can't breathe", r"shortness of breath",
    r"unconscious", r"stroke", r"sudden numbness", r"severe bleeding",
    r"coughing blood", r"seizure", r"anaphylaxis", r"severe head trauma",
    
    # Telugu (Script & Transliterated)
    r"గుండె నొప్పి", r"గుండెల్లో నొప్పి", r"గుండెల్లో భారం", r"శ్వాస ఆడట్లేదు", r"రక్తం", r"స్పృహ తప్పింది",
    r"gundelo noppi", r"shwasa", r"raktam", r"spruha tappindi",
    
    # Hindi (Script & Transliterated)
    r"सीने में दर्द", r"सांस नहीं आ रही", r"खून", r"बेहोश", r"चक्कर",
    r"seene mein dard", r"saans lene mein takleef", r"khoon", r"behosh"
]

def evaluate_emergency_red_flags(text: str) -> Tuple[bool, List[str]]:
    """
    Checks patient utterance for critical emergency markers across English,
    Telugu, Hindi, and transliterated vernacular expressions.
    """
    lowered = text.lower()
    triggers_found = []
    
    for pattern in RED_FLAG_KEYWORDS:
        if re.search(pattern, lowered, re.IGNORECASE):
            triggers_found.append(pattern)
            
    is_emergency = len(triggers_found) > 0
    return is_emergency, triggers_found

def enforce_clinical_guardrail(response_text: str) -> str:
    """
    Ensures the response text maintains the clinician-in-the-loop disclaimer
    and does not pose as an independent prescribing physician.
    """
    diagnostic_claims = [
        "you have been diagnosed with",
        "i hereby prescribe",
        "my clinical diagnosis is"
    ]
    for claim in diagnostic_claims:
        if claim in response_text.lower():
            response_text += "\n\n*(Note: MediFlow AI assists with hospital workflow coordination. Definitive clinical diagnoses and prescriptions must be confirmed by your licensed healthcare provider.)*"
            break
    return response_text
