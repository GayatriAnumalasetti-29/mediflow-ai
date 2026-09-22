from typing import Dict, Any

class MedicationAgent:
    """
    Coordinates daily medication schedules, dosage reminders, and adherence confirmation.
    """
    
    async def process(self, message: str, context: Dict[str, Any], lang: str) -> Dict[str, Any]:
        if lang in ["te", "te-en"]:
            response_text = "ఈ రోజు రాత్రి 9:00 గంటలకు మీ 'Metoprolol ER 25 mg' టాబ్లెట్ తీసుకోవాల్సి ఉంది (భోజనం తర్వాత). మీరు ఇప్పటికే తీసుకున్నట్లయితే నిర్ధారించండి."
        elif lang in ["hi", "hi-en"]:
            response_text = "आज रात 9:00 बजे आपकी 'Metoprolol ER 25 mg' गोली लेने का समय है (भोजन के बाद)। यदि आपने ले ली है, तो कृपया पुष्टि करें।"
        else:
            response_text = "Your next scheduled dose is 'Metoprolol ER 25 mg' tonight at 9:00 PM (after dinner). Would you like to confirm that you have taken it?"

        return {
            "response": response_text,
            "card": {
                "cardType": "MEDICATION_REMINDER",
                "data": {
                    "medicineName": "Metoprolol ER 25 mg",
                    "dosage": "1 Tablet",
                    "time": "09:00 PM (Tonight)",
                    "timing": "After meals"
                }
            },
            "context": {"nextDose": "Metoprolol ER 25 mg"}
        }

medication_agent = MedicationAgent()
