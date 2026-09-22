from typing import Dict, Any
from app.core.tools import hospital_tools

class AccommodationAgent:
    """
    Sub-agent managing Room Categories, Bed Allocation, and Admission details.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        beds = await hospital_tools.get_available_beds()

        if language.startswith("te"):
            response_text = (
                "హాస్పిటల్ లో ప్రస్తుతం అందుబాటులో ఉన్న రూములు మరియు బెడ్ల వివరాలు: "
                "సెమీ-ప్రైవేట్ (₹3,500/రోజు), డీలక్స్ రూమ్ (₹6,500/రోజు), మరియు ఐసీయూ బెడ్స్ సిద్ధంగా ఉన్నాయి. "
                "మీ అవసరాన్ని బట్టి బెడ్ కేటాయింపును తక్షణమే నమోదు చేయవచ్చు."
            )
        elif language.startswith("hi"):
            response_text = (
                "अस्पताल में वर्तमान में उपलब्ध कमरों और बिस्तरों का विवरण: "
                "सेमी-प्राइवेट (₹3,500/दिन), डीलक्स रूम (₹6,500/दिन), और आईसीयू बेड उपलब्ध हैं। "
                "आप अपनी पसंद के अनुसार सीधे बेड बुक कर सकते हैं।"
            )
        else:
            response_text = (
                "Here are the current available inpatient ward rooms and bed accommodations: "
                "Semi-Private (₹3,500/day), Deluxe Private (₹6,500/day), and Cardiac ICU beds are available. "
                "Would you like me to reserve a bed for your admission?"
            )

        card = {
            "cardType": "BED_CONFIRMATION",
            "data": {
                "availableRooms": [
                    {"category": "Semi-Private Ward", "room": "SP-201", "rate": "₹3,500 / day"},
                    {"category": "Deluxe Private", "room": "DLX-301", "rate": "₹6,500 / day"},
                    {"category": "Intensive Care Unit (ICU)", "room": "ICU-102", "rate": "₹12,000 / day"}
                ]
            }
        }

        return {
            "response": response_text,
            "card": card,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"bedsAvailable": len(beds)}
        }

accommodation_agent = AccommodationAgent()
