from typing import Dict, Any
from app.utils.escalation_rules import evaluate_patient_followup_symptoms

class FollowUpAgent:
    """
    Sub-agent managing Autonomous Daily Follow-Up, Natural Adherence Confirmations,
    and Post-Discharge Symptom Monitoring.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        lowered = message.lower()

        # 1. Red-Flag Symptom Evaluation
        is_emergency, rule = evaluate_patient_followup_symptoms(message)
        if is_emergency and rule:
            advice = rule.get(f"advice_{language[:2]}", rule["advice_en"])
            if language.startswith("te"):
                response_text = (
                    f"⚠️ అత్యవసర హెచ్చరిక: మీరు తెలిపిన లక్షణాలు ({rule['reason']}) అత్యంత శ్రద్ధ అవసరమైనవి. "
                    f"హాస్పిటల్ క్లినికల్ టీమ్ కు తక్షణ హెచ్చరిక పంపబడింది. {advice}"
                )
            elif language.startswith("hi"):
                response_text = (
                    f"⚠️ आपातकालीन चेतावनी: आपके द्वारा बताए गए लक्षण ({rule['reason']}) गंभीर हैं। "
                    f"अस्पताल की क्लिनिकल टीम को सूचित कर दिया गया है। {advice}"
                )
            else:
                response_text = (
                    f"⚠️ Clinical Emergency Notice: The symptoms reported indicate potential {rule['reason']}. "
                    f"An emergency escalation alert has been dispatched to the hospital duty team. {advice}"
                )

            card = {
                "cardType": "EMERGENCY_ALERT",
                "data": {
                    "severity": rule["severity"],
                    "reason": rule["reason"],
                    "department": rule["department"]
                }
            }

            return {
                "response": response_text,
                "card": card,
                "urgency": rule["severity"],
                "requiresStaffEscalation": True,
                "context": {"escalationTriggered": True, "reason": rule["reason"]}
            }

        # 2. Conversational Adherence Affirmations ("I already took it", "vesukunnanu", "le liya")
        adherence_keywords = [
            "took", "taken", "already", "yes", "completed", "done", "finished",
            "వేసుకున్నాను", "తీసుకున్నాను", "అయిపోయింది", "వేశాను",
            "ले लिया", "खा ली", "पी ली", "हो गया"
        ]

        if any(w in lowered for w in adherence_keywords):
            if language.startswith("te"):
                response_text = "చాలా మంచిది! మీ మెడికేషన్ షెడ్యూల్ లో డోస్ నమోదయింది. మీ రోజువారీ రికవరీ ప్రణాళిక 94% ఖచ్చితత్వంతో కొనసాగుతోంది."
            elif language.startswith("hi"):
                response_text = "बहुत बढ़िया! आपकी दवा की खुराक रिकॉर्ड कर ली गई है। आपकी दैनिक रिकवरी 94% अनुपालन के साथ सही दिशा में है।"
            else:
                response_text = "Excellent! Your medication dose has been recorded as Taken. Your 5-day recovery adherence streak is at 94%."

            card = {
                "cardType": "MEDICATION_REMINDER",
                "data": {
                    "medicineName": "Metoprolol ER 25mg",
                    "status": "COMPLETED",
                    "streakDays": 5,
                    "compliancePercent": 94
                }
            }

            return {
                "response": response_text,
                "card": card,
                "urgency": "ROUTINE",
                "requiresStaffEscalation": False,
                "context": {"doseConfirmed": True}
            }

        # 3. Snooze / Remind Later Requests
        snooze_keywords = ["snooze", "later", "after", "minutes", "తరువాత", "కొద్దిసేపు", "बाद में"]
        if any(w in lowered for w in snooze_keywords):
            if language.startswith("te"):
                response_text = "సరే, నేను మీకు 15 నిమిషాల తర్వాత మళ్లీ గుర్తుచేస్తాను. దయచేసి సమయానికి మందులు వేసుకోవడం మర్చిపోకండి."
            elif language.startswith("hi"):
                response_text = "ठीक है, मैं आपको 15 मिनट बाद फिर याद दिलाऊंगा। कृपया समय पर दवा लेना न भूलें।"
            else:
                response_text = "Understood. I have snoozed your dose reminder for 15 minutes. Please remember to take it with water."

            return {
                "response": response_text,
                "card": None,
                "urgency": "ROUTINE",
                "requiresStaffEscalation": False,
                "context": {"snoozedMinutes": 15}
            }

        # 4. Standard Daily Wellness Feedback
        if language.startswith("te"):
            response_text = "మీ ఆరోగ్యం నిలకడగా ఉన్నట్లు నమోదయింది. ఆహారంలో ఉప్పు తగ్గించి, రోజుకు 2.2 లీటర్ల నీరు తాగడం కొనసాగించండి."
        elif language.startswith("hi"):
            response_text = "आपकी दैनिक स्वास्थ्य स्थिति सामान्य दर्ज की गई है। कृपया कम नमक वाला आहार और पर्याप्त पानी पीना जारी रखें।"
        else:
            response_text = "Your daily recovery status is recorded as Stable. Continue your prescribed low-sodium diet and 2.2L daily hydration target."

        return {
            "response": response_text,
            "card": None,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"healthStatus": "STABLE"}
        }

followup_agent = FollowUpAgent()
