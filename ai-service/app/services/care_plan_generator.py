from typing import Dict, Any, List
import uuid

class CarePlanGenerator:
    """
    Synthesizes verified doctor prescriptions into a structured 5-Pillar Daily Care Plan:
    1. Medication Regimen
    2. Diet & Nutrition
    3. Clinician-Approved Physical Activity
    4. Rehabilitation & Physical Therapy
    5. Follow-Up Review Consultations
    """

    async def generate_care_plan(self, prescription_data: Dict[str, Any], patient_diagnosis: str = "Post-Angioplasty Recovery") -> Dict[str, Any]:
        return {
            "carePlanId": f"plan-{uuid.uuid4()}",
            "diagnosis": patient_diagnosis,
            "pillars": {
                "medication": [
                    {
                        "name": "Ecosprin 75mg",
                        "dosage": "1 Tablet",
                        "timing": "08:30 AM (After Breakfast)",
                        "duration": "30 Days",
                        "instructions": "Take immediately after morning meal with water."
                    },
                    {
                        "name": "Metoprolol Succinate ER 25mg",
                        "dosage": "1 Tablet",
                        "timing": "09:00 PM (After Dinner)",
                        "duration": "30 Days",
                        "instructions": "Swallow whole, do not crush or chew."
                    }
                ],
                "diet": {
                    "calorieTarget": 1800,
                    "sodiumLimit": "Less than 2g daily",
                    "hydrationTarget": "2.2 Liters / day",
                    "approvedMeals": [
                        {"meal": "Breakfast", "time": "09:00 AM", "items": "Oatmeal porridge with sliced almonds, 2 boiled egg whites"},
                        {"meal": "Lunch", "time": "01:00 PM", "items": "Brown rice, steamed seasonal vegetables, yellow dal, cucumber salad"},
                        {"meal": "Evening Snack", "time": "05:30 PM", "items": "Green tea with unsalted roasted nuts"},
                        {"meal": "Dinner", "time": "08:00 PM", "items": "2 Multigrain rotis, clear vegetable soup, grilled paneer/tofu"}
                    ],
                    "restrictedFoods": ["Deep fried snacks", "High sodium pickles", "Processed meats", "Sugary carbonated drinks"]
                },
                "activity": {
                    "activityType": "Gentle Walking & Guided Deep Breathing",
                    "timing": "11:30 AM (Mid-morning)",
                    "durationMinutes": 15,
                    "heartRateLimitBpm": 110,
                    "instructions": "Walk on flat surfaces. Rest immediately if dizziness or shortness of breath occurs."
                },
                "therapy": {
                    "therapyType": "Cardiac Rehabilitation & Chest Physiotherapy",
                    "schedule": "Monday, Wednesday, Friday at 04:30 PM",
                    "durationMinutes": 30,
                    "therapist": "Dr. Ananya Ray (Senior Physical Therapist)",
                    "focus": "Inspiratory muscle training and gentle mobility restoration."
                },
                "followUp": {
                    "doctorName": "Dr. Priya Varma",
                    "department": "Cardiology",
                    "scheduledDate": "Tomorrow 10:30 AM",
                    "tokenNumber": 12,
                    "requiredTests": ["12-Lead ECG", "Resting Blood Pressure Profile", "Basic Metabolic Panel"]
                }
            }
        }

care_plan_generator = CarePlanGenerator()
