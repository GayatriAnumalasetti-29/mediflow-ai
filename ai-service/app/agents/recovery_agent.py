from typing import Dict, Any

class RecoveryAgent:
    """
    Sub-agent managing Post-Procedure Exercise, Clinician-Approved Activities,
    and Exertion Safety Constraints.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        lowered = message.lower()

        if language.startswith("te"):
            response_text = (
                "🩺 డాక్టర్ ఆమోదించిన శారీరక వ్యాయామ సూచనలు: "
                "రోజుకు 15 నిమిషాల పాటు సమతల ప్రదేశంలో నెమ్మదిగా నడవడం మరియు లోతైన శ్వాస వ్యాయామాలు చేయండి. "
                "గుండె స్పందన రేటు గరిష్టంగా 110 bpm దాటకూడదు. కళ్ళు తిరిగినా లేదా ఆయాసం వచ్చినా తక్షణమే విశ్రాంతి తీసుకోండి."
            )
        elif language.startswith("hi"):
            response_text = (
                "🩺 चिकित्सक द्वारा अनुमोदित शारीरिक व्यायाम निर्देश: "
                "दिन में 15 मिनट समतल सतह पर धीमी गति से टहलें और गहरी सांस लेने का अभ्यास करें। "
                "हृदय गति 110 bpm से अधिक नहीं होनी चाहिए। चक्कर आने या सांस फूलने पर तुरंत रुक जाएं।"
            )
        else:
            response_text = (
                "🩺 Clinician-Authorized Activity Protocol: "
                "15 minutes of gentle walking on flat surfaces combined with guided diaphragmatic breathing. "
                "Keep heart rate below 110 bpm (Borg RPE Exertion Scale: 2-3 / 10). Rest immediately if dizziness or shortness of breath occurs."
            )

        return {
            "response": response_text,
            "card": None,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"activityApproved": True, "rpeLimit": 3}
        }

recovery_agent = RecoveryAgent()
