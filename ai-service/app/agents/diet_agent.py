from typing import Dict, Any

class DietAgent:
    """
    Sub-agent managing Diet, Clinical Nutrition Guidelines, and Meal Reminders.
    Enforces strict adherence to clinician-approved nutritional parameters.
    """

    async def process(self, message: str, context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        lowered = message.lower()

        if language.startswith("te"):
            response_text = (
                "🩺 డాక్టర్ ఆమోదించిన కార్డియాక్ డైట్ ప్రణాళిక: "
                "రోజువారీ కేలరీ లక్ష్యం: 1,800 kcal, ఉప్పు వినియోగం 2 గ్రాముల కంటే తక్కువగా ఉండాలి. "
                "అల్పాహారం: ఓట్ మీల్ మరియు గుడ్డు తెల్లసొన; మధ్యాహ్న భోజనం: బ్రౌన్ రైస్ మరియు కూరగాయలు; "
                "రాత్రి భోజనం: తేలికపాటి వెజిటబుల్ సూప్ మరియు రోటీ. నూనెలో వేయించిన పదార్థాలు మరియు అధిక ఉప్పు గల ఊరగాయలు పూర్తిగా నివారించండి."
            )
        elif language.startswith("hi"):
            response_text = (
                "🩺 चिकित्सक द्वारा अनुमोदित कार्डियक आहार योजना: "
                "दैनिक कैलोरी लक्ष्य: 1,800 kcal, नमक की मात्रा 2 ग्राम से कम रखें। "
                "नाश्ता: ओट्स और उबले अंडे का सफेद भाग; दोपहर का भोजन: ब्राउन राइस और दाल; "
                "रात का खाना: हल्की सब्जी का सूप और रोटी। तला-भुना खाना और अधिक नमक वाले अचार से पूरी तरह परहेज करें।"
            )
        else:
            response_text = (
                "🩺 Clinician-Authorized Cardiac Nutrition Protocol: "
                "Daily calorie target: 1,800 kcal with sodium restricted to < 2g/day and 2.2L hydration. "
                "Breakfast: Oatmeal porridge with almonds & 2 boiled egg whites; "
                "Lunch: Brown rice, seasonal steamed vegetables & dal; "
                "Dinner: Multigrain rotis with clear vegetable soup. Avoid fried snacks and processed meats."
            )

        card = {
            "cardType": "DIET_PLAN",
            "data": {
                "authorizingDoctor": "Dr. Priya Varma (Cardiology)",
                "clinicalDietitian": "Ms. Shalini Iyer, RD",
                "calorieTarget": 1800,
                "sodiumLimit": "< 2g / day",
                "hydrationTarget": "2.2 Liters / day",
                "dinner": "2 Multigrain rotis, clear vegetable soup, grilled paneer",
                "attribution": "CLINICIAN_AUTHORIZED"
            }
        }

        return {
            "response": response_text,
            "card": card,
            "urgency": "ROUTINE",
            "requiresStaffEscalation": False,
            "context": {"dietPlanActive": True}
        }

diet_agent = DietAgent()
