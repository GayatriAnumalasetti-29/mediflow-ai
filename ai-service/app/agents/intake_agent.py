from typing import Dict, Any

class IntakeAgent:
    """
    Handles conversational patient intake, gathering chief complaint, history, and duration.
    """
    
    async def process(self, message: str, context: Dict[str, Any], lang: str) -> Dict[str, Any]:
        if lang in ["te", "te-en"]:
            response_text = "నమస్కారం, మీ ఆరోగ్య సమస్యను అర్థం చేసుకున్నాను. మీరు ఎన్ని రోజుల నుండి ఈ సమస్యతో బాధపడుతున్నారు?"
        elif lang in ["hi", "hi-en"]:
            response_text = "नमस्ते, मैंने आपकी समस्या को समझ लिया है। क्या आप बता सकते हैं कि यह परेशानी कितने दिनों से हो रही है?"
        else:
            response_text = "Hello, I have noted your symptoms. Could you please let me know how many days you have been experiencing this?"
            
        return {
            "response": response_text,
            "card": {
                "cardType": "INTAKE_SUMMARY",
                "data": {
                    "chiefComplaint": message,
                    "status": "In Progress"
                }
            },
            "context": {
                "intakeComplete": False,
                "chiefComplaint": message
            }
        }

intake_agent = IntakeAgent()
