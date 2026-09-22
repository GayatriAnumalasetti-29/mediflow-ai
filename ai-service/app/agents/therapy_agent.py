from typing import Dict, Any

class TherapyAgent:
    """
    Sub-agent managing Physical Therapy, Cardiac Rehabilitation Sessions,
    and Therapist Progress Logs.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        lowered = message.lower()

        if language.startswith("te"):
            response_text = (
                "🩺 ఫిజికల్ థెరపీ & కార్డియాక్ రిహాబిలిటేషన్ షెడ్యూల్: "
                "మీ తదుపరి సెషన్ సోమవారం, బుధవారం, శుక్రవారం సాయంత్రం 04:30 గంటలకు డాక్టర్ అనన్య రాయ్ (సీనియర్ ఫిజియోథెరపిస్ట్) వద్ద ఉంది. "
                "ఇన్స్పిరేటరీ కండరాల శిక్షణ మరియు సున్నితమైన కదలిక పునరుద్ధరణపై దృష్టి సారించబడుతుంది."
            )
        elif language.startswith("hi"):
            response_text = (
                "🩺 फिजियोथेरेपी और कार्डिएक रिहैबिलिटेशन सत्र: "
                "आपका अगला सत्र सोमवार, बुधवार, शुक्रवार शाम 04:30 बजे डॉ. अनन्या रे (सीनियर फिजियोथेरेपिस्ट) के साथ निर्धारित है। "
                "श्वसन मांसपेशियों के प्रशिक्षण और गतिशीलता पर ध्यान दिया जाएगा।"
            )
        else:
            response_text = (
                "🩺 Clinician-Authorized Rehabilitation Protocol: "
                "Your Cardiac Rehabilitation & Chest Physiotherapy sessions are scheduled Monday, Wednesday, Friday at 04:30 PM "
                "with Dr. Ananya Ray (Senior Physical Therapist). Focus: Inspiratory muscle training & mobility restoration."
            )

        return {
            "response": response_text,
            "card": None,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"therapySessionScheduled": True}
        }

therapy_agent = TherapyAgent()
