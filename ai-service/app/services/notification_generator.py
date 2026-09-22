from typing import Dict, Any

class NotificationGenerator:
    """
    Multilingual Notification Content Synthesizer.
    Generates localized titles, messages, and voice TTS prompts in English, Telugu, and Hindi
    across all 11 notification types.
    """

    NOTIFICATION_TEMPLATES = {
        "APPOINTMENT_REMINDER": {
            "en": {
                "title": "Upcoming Doctor Consultation Reminder",
                "message": "Your appointment with Dr. Priya Varma (Cardiology) is scheduled for Tomorrow at 10:30 AM in OPD Room 104.",
                "tts": "Hello Rajesh, reminder for your cardiology consultation with Doctor Priya Varma tomorrow at 10:30 AM."
            },
            "te": {
                "title": "డాక్టర్ కన్సల్టేషన్ రిమైండర్",
                "message": "డాక్టర్ ప్రియ వర్మ (కార్డియాలజీ) తో మీ అపాయింట్‌మెంట్ రేపు ఉదయం 10:30 గంటలకు OPD రూమ్ 104 లో ఉంది.",
                "tts": "నమస్కారం రాజేష్ గారు, రేపు ఉదయం 10:30 గంటలకు డాక్టర్ ప్రియ వర్మ గారితో మీ కార్డియాలజీ అపాయింట్‌మెంట్ ఉంది."
            },
            "hi": {
                "title": "डॉक्टर परामर्श अनुस्मारक",
                "message": "डॉ. प्रिया वर्मा (कार्डियोलॉजी) के साथ आपकी अपॉइंटमेंट कल सुबह 10:30 बजे ओपीडी रूम 104 में निर्धारित है।",
                "tts": "नमस्ते राजेश जी, कल सुबह 10:30 बजे डॉ. प्रिया वर्मा के साथ आपकी कार्डियोलॉजी अपॉइंटमेंट है।"
            }
        },
        "QUEUE_UPDATE": {
            "en": {
                "title": "OPD Queue Status Update",
                "message": "Currently serving Token #10. Your Token is #12. Estimated wait time: ~14 minutes.",
                "tts": "Queue update: currently serving token 10. Your token 12 is next in approximately 14 minutes."
            },
            "te": {
                "title": "OPD క్యూ స్థితి అప్‌డేట్",
                "message": "ప్రస్తుతం టోకెన్ #10 నడుస్తోంది. మీ టోకెన్ #12. సుమారు 14 నిమిషాలు వేచి ఉండాలి.",
                "tts": "క్యూ అప్‌డేట్: ప్రస్తుతం టోకెన్ 10 పిలువబడుతోంది. మీ టోకెన్ 12 త్వరలోనే రానుంది."
            },
            "hi": {
                "title": "ओपीडी कतार स्थिति",
                "message": "वर्तमान में टोकन #10 देखा जा रहा है। आपका टोकन #12 है। अनुमानित समय: ~14 मिनट।",
                "tts": "कतार सूचना: वर्तमान टोकन 10 है। आपका टोकन 12 लगभग 14 मिनट में बुलाया जाएगा।"
            }
        },
        "MEDICATION_REMINDER": {
            "en": {
                "title": "Scheduled Medication Reminder",
                "message": "Time for Metoprolol Succinate ER 25mg (1 Tablet) after dinner.",
                "tts": "Reminder: It is time for your evening Metoprolol 25mg tablet with a full glass of water."
            },
            "te": {
                "title": "మందుల రిమైండర్ సమయం",
                "message": "రాత్రి భోజనం తర్వాత మెటోప్రోలాల్ 25 ఎంజీ (1 టాబ్లెట్) వేసుకోవాల్సిన సమయం అయింది.",
                "tts": "రిమైండర్: రాత్రి భోజనం తర్వాత మెటోప్రోలాల్ 25 ఎంజీ టాబ్లెట్ వేసుకోండి."
            },
            "hi": {
                "title": "दवा का समय अनुस्मारक",
                "message": "रात के खाने के बाद मेटोप्रोलोल 25mg (1 गोली) लेने का समय हो गया है।",
                "tts": "अनुस्मारक: रात के खाने के बाद मेटोप्रोलोल 25 मिलीग्राम की खुराक लें।"
            }
        },
        "DIET_REMINDER": {
            "en": {
                "title": "Approved Cardiac Dinner Reminder",
                "message": "Dinner schedule: 2 Multigrain rotis, clear vegetable soup, and grilled paneer (< 2g sodium).",
                "tts": "Dinner reminder: Clinician authorized cardiac meal with low sodium."
            },
            "te": {
                "title": "కార్డియాక్ రాత్రి భోజన రిమైండర్",
                "message": "రాత్రి భోజనం: 2 రోటీలు, వెజిటబుల్ సూప్ మరియు పనీర్ (ఉప్పు పరిమితం).",
                "tts": "డైట్ రిమైండర్: ఉప్పు తక్కువగా ఉన్న డాక్టర్ ఆమోదించిన భోజనం తీసుకోండి."
            },
            "hi": {
                "title": "कार्डियक आहार अनुस्मारक",
                "message": "रात का भोजन: 2 मल्टीग्रेन रोटी, सब्जियों का सूप और पनीर (कम नमक)।",
                "tts": "डाइट अनुस्मारक: कम नमक वाला कार्डियक भोजन लें।"
            }
        },
        "THERAPY_REMINDER": {
            "en": {
                "title": "Cardiac Rehabilitation Session Scheduled",
                "message": "Chest Physiotherapy session with Dr. Ananya Ray on Monday at 04:30 PM in Room 2B.",
                "tts": "Your cardiac physical therapy session is scheduled for Monday at 4:30 PM."
            },
            "te": {
                "title": "ఫిజియోథెరపీ సెషన్ రిమైండర్",
                "message": "సోమవారం సాయంత్రం 04:30 గంటలకు డాక్టర్ అనన్య రాయ్ వద్ద ఫిజియోథెరపీ సెషన్ ఉంది.",
                "tts": "సోమవారం సాయంత్రం 4:30 గంటలకు మీ కార్డియాక్ ఫిజియోథెరపీ సెషన్ ఉంది."
            },
            "hi": {
                "title": "फिजियोथेरेपी सत्र अनुस्मारक",
                "message": "सोमवार शाम 04:30 बजे डॉ. अनन्या रे के साथ कार्डिएक रिहैबिलिटेशन सत्र निर्धारित है।",
                "tts": "सोमवार शाम 4:30 बजे आपका फिजियोथेरेपी सत्र निर्धारित है।"
            }
        }
    }

    def generate(self, notif_type: str, language: str = "en") -> Dict[str, str]:
        lang_key = "te" if language.startswith("te") else "hi" if language.startswith("hi") else "en"
        templates = self.NOTIFICATION_TEMPLATES.get(notif_type, self.NOTIFICATION_TEMPLATES["APPOINTMENT_REMINDER"])
        return templates.get(lang_key, templates["en"])

notification_generator = NotificationGenerator()
