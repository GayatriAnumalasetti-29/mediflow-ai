from typing import Dict, Any

class EscalationAgent:
    """
    Directs urgent and critical clinical alerts to duty doctors and triage nursing teams.
    """
    
    async def process(self, message: str, context: Dict[str, Any], lang: str) -> Dict[str, Any]:
        if lang in ["te", "te-en"]:
            response_text = "మీ సమస్య అత్యవసరమైనదిగా గుర్తించబడింది. ఆసుపత్రి సిబ్బందికి తక్షణ సమాచారం పంపబడింది."
        elif lang in ["hi", "hi-en"]:
            response_text = "आपकी समस्या को प्राथमिकता के आधार पर अस्पताल की मेडिकल टीम को प्रेषित कर दिया गया है।"
        else:
            response_text = "Your alert has been escalated to the emergency triage staff and supervising physician."

        return {
            "response": response_text,
            "requiresStaffEscalation": True,
            "card": {
                "cardType": "ESCALATION_TRIGGERED",
                "data": {
                    "status": "Escalated to Staff",
                    "priority": "HIGH"
                }
            },
            "context": {"escalated": True}
        }

escalation_agent = EscalationAgent()
