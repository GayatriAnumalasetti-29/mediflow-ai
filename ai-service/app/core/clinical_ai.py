"""
Clinical Medical Knowledge & Diagnostic Suggestion Engine
Provides rich, context-aware, empathetic, and multilingual medical suggestions
for symptoms, general medical queries, outpatient guidance, and clinical advice.
"""

from typing import Dict, Any, Tuple

CLINICAL_TOPICS = [
    {
        "keywords": ["fever", "temperature", "chills", "జ్వరం", "బుఖార్", "తాపం", "bukhar"],
        "en": (
            "For a mild to moderate fever, ensure you get plenty of bed rest and drink oral rehydration fluids, coconut water, or warm soups to prevent dehydration. "
            "Wear lightweight clothing and apply a cool, damp cloth to your forehead if you feel uncomfortable. "
            "Monitor your temperature every 4 to 6 hours. "
            "⚠️ Please consult our General Medicine OPD (Dr. Vikramaditya Sen) if your fever exceeds 102°F (38.9°C), persists for more than 48 hours, or is accompanied by severe chills, rash, or breathing difficulty."
        ),
        "te": (
            "తేలికపాటి జ్వరం ఉన్నప్పుడు తగినంత విశ్రాంతి తీసుకోవడం మరియు డీహైడ్రేషన్ నివారించడానికి ఓఆర్ఎస్, కొబ్బరి నీళ్ళు లేదా వేడి సూప్‌లు ఎక్కువగా త్రాగడం ముఖ్యం. "
            "తేలికపాటి కాటన్ దుస్తులు ధరించండి. "
            "ప్రతి 4-6 గంటలకు ఉష్ణోగ్రతను గమనించండి. "
            "⚠️ జ్వరం 102°F దాటినా, 2 రోజులకు పైగా తగ్గకపోయినా లేదా తీవ్రమైన నొప్పులు ఉన్నట్లయితే వెంటనే జనరల్ మెడిసిన్ డాక్టర్ (డా. విక్రమాదిత్య సేన్) గారిని సంప్రదించండి."
        ),
        "hi": (
            "हल्के से मध्यम बुखार में भरपूर आराम करें और डिहाइड्रेशन से बचने के लिए ओआरएस, नारियल पानी या गर्म सूप जैसे तरल पदार्थ पिएं। "
            "हल्के सूती कपड़े पहनें। "
            "हर 4 से 6 घंटे में तापमान की जांच करें। "
            "⚠️ यदि बुखार 102°F से अधिक हो जाए, 2 दिन से अधिक बना रहे, या तेज ठंड लगे, तो तुरंत हमारे जनरल फिजिशियन (डॉ. विक्रमादित्य सेन) से परामर्श लें।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Fever Care & Hydration Protocol",
                "recommendedDept": "General Medicine",
                "homeCare": ["Rest & Hydration", "ORS / Warm Fluids", "Temperature Monitoring"],
                "warningSigns": ["Fever > 102°F", "Stiff neck or rash", "Persistent > 48h"]
            }
        }
    },
    {
        "keywords": ["headache", "migraine", "head pain", "తలపోటు", "తలనొప్పి", "सिरदर्द", "सर दर्द"],
        "en": (
            "Headaches can arise from tension, eye strain, dehydration, or lack of sleep. "
            "Try resting in a quiet, dark room, staying well-hydrated, and applying a warm or cold compress across your temples. "
            "Avoid bright screens and caffeinated beverages temporarily. "
            "⚠️ Seek urgent clinical evaluation if you experience a sudden 'thunderclap' headache, visual disturbances, numbness, or neck stiffness."
        ),
        "te": (
            "తలనొప్పి సాధారణంగా ఒత్తిడి, నిద్రలేమి, డీహైడ్రేషన్ లేదా కంటి అలసట వల్ల రావచ్చు. "
            "నిశ్శబ్దమైన, కాంతి తక్కువగా ఉండే గదిలో విశ్రాంతి తీసుకోండి మరియు మంచిగా నీరు త్రాగండి. "
            "మొబైల్ లేదా కంప్యూటర్ స్క్రీన్‌లకు కాసేపు దూరంగా ఉండండి. "
            "⚠️ అకస్మాత్తుగా తీవ్రమైన తలనొప్పి, కంటి చూపు మందగించడం లేదా మెడ బిగుతుగా మారినట్లయితే వెంటనే వైద్యుడిని సంప్రదించండి."
        ),
        "hi": (
            "सिरदर्द आमतौर पर तनाव, नींद की कमी, डिहाइड्रेशन या स्क्रीन के ज्यादा इस्तेमाल से हो सकता है। "
            "शांत और अंधेरे कमरे में आराम करें, भरपूर पानी पिएं और माथे पर हल्का ठंडा सेंक लगाएं। "
            "स्क्रीन और कैफीन से कुछ समय दूर रहें। "
            "⚠️ यदि सिरदर्द अचानक बहुत तेज हो, चक्कर आए या गर्दन में अकड़न हो, तो तुरंत डॉक्टर से जांच कराएं।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Headache & Migraine Management",
                "recommendedDept": "General Medicine / Neurology",
                "homeCare": ["Dark Room Rest", "Hydration", "Screen-Time Reduction"],
                "warningSigns": ["Thunderclap headache", "Vision changes", "Neck stiffness"]
            }
        }
    },
    {
        "keywords": ["cough", "cold", "sore throat", "runny nose", "దగ్గు", "జలుబు", "గొంతు నొప్పి", "खांसी", "जुकाम", "गले में खराश"],
        "en": (
            "For cold, cough, and throat irritation: Warm salt-water gargles (3 times a day) provide immediate throat soothing. "
            "Steam inhalation for 5 to 10 minutes helps clear nasal congestion. "
            "Drink warm herbal teas, ginger tea with honey, and maintain warm fluid intake. "
            "⚠️ If your cough produces discolored phlegm, lasts beyond 7 days, or causes shortness of breath, please book an OPD consultation."
        ),
        "te": (
            "దగ్గు, జలుబు మరియు గొంతు నొప్పి ఉన్నప్పుడు: గోరువెచ్చని ఉప్పు నీటితో రోజుకు 2-3 సార్లు గార్గ్లింగ్ చేయడం వల్ల గొంతు ఉపశమనం లభిస్తుంది. "
            "రోజుకు రెండుసార్లు ఆవిరి (Steam inhalation) పట్టండి. "
            "తులసి, అల్లం టీ లేదా గోరువెచ్చని నీటిని త్రాగండి. "
            "⚠️ దగ్గు వారం రోజులకు పైగా తగ్గకపోయినా లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉన్నా వైద్యులను సంప్రదించండి."
        ),
        "hi": (
            "खांसी, जुकाम और गले की खराश के लिए: दिन में 2-3 बार हल्के गर्म नमक के पानी से गरारे करें। "
            "दिन में दो बार भाप (Steam) लें जिससे बंद नाक खुल जाएगी। "
            "अदरक-तुलसी की चाय पिएं और गुनगुना पानी पिएं। "
            "⚠️ यदि खांसी 7 दिनों से अधिक रहे या सांस लेने में परेशानी हो, तो तुरंत डॉक्टर से मिलें।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Upper Respiratory & Cold Relief",
                "recommendedDept": "General Medicine",
                "homeCare": ["Warm Salt Water Gargle", "Steam Inhalation", "Ginger Honey Tea"],
                "warningSigns": ["Shortness of breath", "Blood in sputum", "Cough > 7 days"]
            }
        }
    },
    {
        "keywords": ["stomach", "acidity", "gas", "nausea", "vomiting", "కడుపు నొప్పి", "ఎసిడిటీ", "గ్యాస్", "వాంతులు", "पेट दर्द", "एसिडिटी", "उल्टी"],
        "en": (
            "For mild acidity, bloating, or stomach upset: Eat small, bland meals such as curd rice, bananas, oats, or khichdi. "
            "Avoid spicy, deep-fried, oily foods, carbonated drinks, and raw spices. "
            "Stay hydrated by sipping buttermilk or coconut water. Avoid lying down immediately after eating. "
            "⚠️ If you experience severe abdominal cramps, persistent vomiting, or black stools, please consult a physician immediately."
        ),
        "te": (
            "ఎసిడిటీ లేదా కడుపులో ఉబ్బరం ఉన్నప్పుడు: పెరుగు అన్నం, అరటిపండు లేదా కిచిడీ వంటి తేలికపాటి ఆహారాన్ని తీసుకోండి. "
            "మసాలాలు, వేపుళ్ళు మరియు కూల్ డ్రింక్స్ పూర్తిగా నివారించండి. "
            "మజ్జిగ లేదా కొబ్బరి నీళ్ళు సిప్ చేస్తూ ఉండండి. తిన్న వెంటనే పడుకోవద్దు. "
            "⚠️ తీవ్రమైన కడుపు నొప్పి లేదా ఆగకుండా వాంతులు అవుతుంటే వెంటనే డాక్టర్‌ను సంప్రదించండి."
        ),
        "hi": (
            "एसिडिटी या पेट में भारीपन के लिए: हल्का और सुपाच्य भोजन जैसे दही-चावल, खिचड़ी या केला खाएं। "
            "अधिक मिर्च-मसाले, तली हुई चीजें और कोल्ड ड्रिंक्स से परहेज करें। "
            "छाछ या नारियल पानी पिएं। खाना खाने के तुरंत बाद न सोएं। "
            "⚠️ यदि पेट में तेज मरोड़ हो या लगातार उल्टियां हों, तो तुरंत अस्पताल आएं।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Gastric Comfort & Acidity Protocol",
                "recommendedDept": "Gastroenterology / General Medicine",
                "homeCare": ["Bland Diet (Curd rice, Khichdi)", "Cold Milk / Buttermilk", "Avoid Spices"],
                "warningSigns": ["Severe abdominal pain", "Repeated vomiting", "Dark stools"]
            }
        }
    },
    {
        "keywords": ["knee", "joint", "back pain", "arthritis", "మోకాలు నొప్పి", "కీళ్ల నొప్పులు", "నడుము నొప్పి", "घुटने का दर्द", "जोड़ों का दर्द", "कमर दर्द"],
        "en": (
            "For joint stiffness, knee discomfort, or backache: Gentle non-impact movement and short walks help maintain joint lubrication. "
            "Apply a warm heating pad for chronic stiffness, or an ice pack for acute swelling. "
            "Maintain an ergonomic sitting posture and avoid heavy lifting. "
            "⚠️ You can schedule a consultation with our Senior Orthopedic Surgeon (Dr. Ananya Reddy) for joint examination and physiotherapy planning."
        ),
        "te": (
            "కీళ్ళు లేదా మోకాళ్ళ నొప్పులు ఉన్నప్పుడు: కొద్దిసేపు తేలికపాటి నడక మరియు జాయింట్ స్ట్రెచ్ వ్యాయామాలు చేయండి. "
            "వాపు ఉన్నచోట ఐస్ ప్యాక్ లేదా పాత నొప్పులకు వేడి కాపడం పెట్టండి. "
            "బరువైన వస్తువులను ఎత్తవద్దు. "
            "⚠️ ఆర్థోపెడిక్స్ కన్సల్టేషన్ కోసం మా నిపుణురాలు డా. అనన్య రెడ్డి గారిని సంప్రదించవచ్చు."
        ),
        "hi": (
            "घुटनों या जोड़ों के दर्द के लिए: हल्की सैर करें और जोड़ों को धीरे-धीरे स्ट्रेच करें। "
            "दर्द वाली जगह पर गर्म सेंक या सूजन होने पर आइस पैक लगाएं। "
            "भारी वजन उठाने से बचें और बैठने की मुद्रा ठीक रखें। "
            "⚠️ विशेषज्ञ जांच के लिए आप हमारी ऑर्थोपेडिक सर्जन (डॉ. अनन्या रेड्डी) से अपॉइंटमेंट ले सकते हैं।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Joint & Orthopedic Care",
                "recommendedDept": "Orthopedics",
                "homeCare": ["Gentle Mobilization", "Hot/Cold Compress", "Ergonomic Posture"],
                "warningSigns": ["Inability to bear weight", "Joint deformity", "Severe nocturnal pain"]
            }
        }
    },
    {
        "keywords": ["heart", "cardio", "chest", "bp", "blood pressure", "గుండె", "రక్తపోటు", "బీపీ", "हृदय", "ब्लड प्रेशर", "बीपी"],
        "en": (
            "For cardiac wellness and blood pressure management: Maintain a low-sodium diet (< 2g salt/day), take prescribed medications consistently, and engage in daily 30-minute moderate walking. "
            "Limit saturated fats, manage stress with breathing exercises, and keep a regular BP log. "
            "⚠️ Dr. Priya Varma (Senior Cardiologist) is available for 12-lead ECG, 2D-Echocardiography, and cardiac consultations."
        ),
        "te": (
            "గుండె ఆరోగ్యం మరియు బీపీ నియంత్రణ కొరకు: ఆహారంలో ఉప్పు తగ్గించండి, సమయానికి మందులు వేసుకోండి మరియు రోజూ 30 నిమిషాలు నడవండి. "
            "నూనె, కొవ్వు పదార్థాలు తగ్గించి ధ్యానం లేదా శ్వాస వ్యాయామాలు చేయండి. "
            "⚠️ కార్డియాలజీ విభాగంలో డా. ప్రియా వర్మ గారు ECG మరియు గుండె పరీక్షల కొరకు అందుబాటులో ఉన్నారు."
        ),
        "hi": (
            "हृदय स्वास्थ्य और ब्लड प्रेशर नियंत्रण के लिए: भोजन में नमक की मात्रा कम करें, नियमित दवाएं लें और रोज 30 मिनट टहलें। "
            "तनाव कम करें और नियमित बीपी चेक करते रहें। "
            "⚠️ ईसीजी एवं परामर्श के लिए हमारे सीनियर कार्डियोलॉजिस्ट (डॉ. प्रिया वर्मा) उपलब्ध हैं।"
        ),
        "card": {
            "cardType": "CLINICAL_GUIDANCE",
            "data": {
                "topic": "Cardiovascular Health Protocol",
                "recommendedDept": "Cardiology",
                "homeCare": ["Low-Sodium Diet", "Daily 30-min Walk", "Regular BP Tracking"],
                "warningSigns": ["Chest heaviness", "Radiating arm pain", "Unexplained sweating"]
            }
        }
    }
]

def generate_clinical_ai_response(user_text: str, language: str = "en") -> Tuple[str, Dict[str, Any]]:
    lowered = user_text.lower()
    
    # 1. Search against clinical topic knowledge base
    for topic in CLINICAL_TOPICS:
        if any(k in lowered for k in topic["keywords"]):
            lang_key = "te" if language.startswith("te") else ("hi" if language.startswith("hi") else "en")
            return topic[lang_key], topic["card"]

    # 2. General empathetic clinical response
    if language.startswith("te"):
        resp = (
            f"మీరు అడిగిన ప్రశ్నను నేను పరిశీలించాను. మీ ఆరోగ్య సంరక్షణ కొరకు మేము నిరంతరం సిద్ధంగా ఉన్నాము. "
            f"తగినంత నీరు త్రాగడం, సమతుల్య పోషకాహారం తీసుకోవడం మరియు రోజూ తగినంత విశ్రాంతి పొందడం ద్వారా త్వరగా కోలుకోవచ్చు. "
            f"మీకు నిర్దిష్ట లక్షణాలు లేదా అపాయింట్‌మెంట్ అవసరమైతే, పైన ఉన్న 'Book an Appointment' ద్వారా నిపుణులను సంప్రదించవచ్చు."
        )
    elif language.startswith("hi"):
        resp = (
            f"मैंने आपके प्रश्न का विश्लेषण किया है। आपके बेहतर स्वास्थ्य के लिए हम पूरी तरह तत्पर हैं। "
            f"भरपूर पानी पिएं, पौष्टिक आहार लें और पर्याप्त विश्राम करें। "
            f"यदि आपको किसी विशेषज्ञ डॉक्टर से जांच करानी हो या दवा की सलाह चाहिए, तो आप 'Book an Appointment' से परामर्श बुक कर सकते हैं।"
        )
    else:
        resp = (
            f"Thank you for sharing your query. Based on clinical best practices, staying well-hydrated, maintaining balanced nutrition, and getting adequate rest are foundational for quick recovery. "
            f"If your symptoms persist, cause discomfort, or if you would like a personalized prescription, you can easily connect with our specialists using 'Book an Appointment' (Virtual Meet or Direct Visit)."
        )

    card = {
        "cardType": "CLINICAL_GUIDANCE",
        "data": {
            "topic": "General Health & Wellness Guidance",
            "recommendedDept": "General Medicine",
            "homeCare": ["Adequate Hydration", "Nutritious Balanced Diet", "Rest & Recovery"],
            "action": "Consult a Specialist if symptoms persist"
        }
    }

    return resp, card
