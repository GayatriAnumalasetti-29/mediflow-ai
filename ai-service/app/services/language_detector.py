import re
from typing import Dict, Any, List

class LanguageDetector:
    """
    Multilingual & Code-Mixing Detection Engine.
    Supports English, Telugu, Hindi, Tamil, Kannada, Marathi, Bengali,
    as well as romanized transliterated code-mixed speech/text.
    """
    
    UNICODE_RANGES = {
        "te": re.compile(r'[\u0C00-\u0C7F]'),  # Telugu
        "hi": re.compile(r'[\u0900-\u097F]'),  # Hindi / Devanagari (Marathi)
        "ta": re.compile(r'[\u0B80-\u0BFF]'),  # Tamil
        "kn": re.compile(r'[\u0C80-\u0CFF]'),  # Kannada
        "bn": re.compile(r'[\u0980-\u09FF]'),  # Bengali
        "ml": re.compile(r'[\u0D00-\u0D7F]'),  # Malayalam
        "gu": re.compile(r'[\u0A80-\u0AFF]'),  # Gujarati
        "pa": re.compile(r'[\u0A00-\u0A7F]'),  # Punjabi (Gurmukhi)
        "ar": re.compile(r'[\u0600-\u06FF]')   # Arabic
    }
    
    SPANISH_MARKERS = {"hola", "tengo", "mucho", "dolor", "pecho", "fiebre", "cita", "pastilla", "medicamento", "gracias", "ayuda"}
    FRENCH_MARKERS = {"bonjour", "jai", "douleur", "poitrine", "fievre", "medecin", "medicament", "merci", "aide"}
    GERMAN_MARKERS = {"hallo", "ich", "habe", "schmerz", "brust", "fieber", "arzt", "termin", "medikament", "danke", "hilfe"}

    TELUGU_ROMAN_MARKERS = {
        "naku", "undi", "chesanu", "chesindi", "eppudu", "ekkada", "gundelo", 
        "noppi", "mandulu", "taggaledu", "baga", "kallu", "chusthunnara",
        "vesukunnanu", "padukunnanu", "ayindi", "kastamga", "thala", "raktham"
    }
    
    HINDI_ROMAN_MARKERS = {
        "mujhe", "hai", "nahi", "raha", "rahi", "hogi", "dard", "dawaim", 
        "bukhar", "sir", "kripya", "batao", "kab", "kahan", "khana",
        "peena", "takleef", "kamzori", "aaram", "saans", "chhati", "bhookh"
    }

    TAMIL_ROMAN_MARKERS = {
        "enakku", "irukku", "marundhu", "vali", "epdi", "enge", "mudiyala"
    }

    KANNADA_ROMAN_MARKERS = {
        "nanage", "ide", "oota", "novvu", "beku", "hege", "yaavaga"
    }

    def detect(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "detected_language": "en",
                "confidence": 1.0,
                "is_code_mixed": False,
                "language_name": "English"
            }

        cleaned = text.strip()
        words = set(re.findall(r'\b\w+\b', cleaned.lower()))
        has_ascii_words = any(re.match(r'^[a-zA-Z0-9]+$', w) for w in words)
        
        # 1. Native Unicode Script Detection
        for lang_code, pattern in self.UNICODE_RANGES.items():
            if pattern.search(cleaned):
                is_mixed = has_ascii_words and len(words) > 1
                return {
                    "detected_language": f"{lang_code}-en" if is_mixed else lang_code,
                    "confidence": 0.99,
                    "is_code_mixed": is_mixed,
                    "language_name": self._get_lang_name(lang_code) + (" + English" if is_mixed else "")
                }

        # 2. Romanized Script & Global Language Detection via Scored Matching
        lang_scores = {
            "te-en": len(words.intersection(self.TELUGU_ROMAN_MARKERS)),
            "hi-en": len(words.intersection(self.HINDI_ROMAN_MARKERS)),
            "ta-en": len(words.intersection(self.TAMIL_ROMAN_MARKERS)),
            "kn-en": len(words.intersection(self.KANNADA_ROMAN_MARKERS)),
            "es": len(words.intersection(self.SPANISH_MARKERS)),
            "fr": len(words.intersection(self.FRENCH_MARKERS)),
            "de": len(words.intersection(self.GERMAN_MARKERS)),
        }

        best_lang, best_score = max(lang_scores.items(), key=lambda x: x[1])

        if best_score >= 1:
            if best_lang == "te-en":
                return {
                    "detected_language": "te-en",
                    "confidence": min(0.95, 0.85 + (best_score * 0.05)),
                    "is_code_mixed": True,
                    "language_name": "Telugu + English (Code-mixed)",
                    "transliterated_to_english": cleaned
                }
            elif best_lang == "hi-en":
                return {
                    "detected_language": "hi-en",
                    "confidence": min(0.95, 0.85 + (best_score * 0.05)),
                    "is_code_mixed": True,
                    "language_name": "Hindi + English (Hinglish)",
                    "transliterated_to_english": cleaned
                }
            elif best_lang == "ta-en":
                return {
                    "detected_language": "ta-en",
                    "confidence": 0.90,
                    "is_code_mixed": True,
                    "language_name": "Tamil + English",
                    "transliterated_to_english": cleaned
                }
            elif best_lang == "kn-en":
                return {
                    "detected_language": "kn-en",
                    "confidence": 0.90,
                    "is_code_mixed": True,
                    "language_name": "Kannada + English",
                    "transliterated_to_english": cleaned
                }
            elif best_lang == "es":
                return {
                    "detected_language": "es",
                    "confidence": 0.92,
                    "is_code_mixed": False,
                    "language_name": "Spanish"
                }
            elif best_lang == "fr":
                return {
                    "detected_language": "fr",
                    "confidence": 0.92,
                    "is_code_mixed": False,
                    "language_name": "French"
                }
            elif best_lang == "de":
                return {
                    "detected_language": "de",
                    "confidence": 0.92,
                    "is_code_mixed": False,
                    "language_name": "German"
                }

        # 3. Default English
        return {
            "detected_language": "en",
            "confidence": 0.98,
            "is_code_mixed": False,
            "language_name": "English"
        }

    def _get_lang_name(self, code: str) -> str:
        names = {
            "en": "English",
            "te": "Telugu",
            "hi": "Hindi",
            "ta": "Tamil",
            "kn": "Kannada",
            "bn": "Bengali",
            "ml": "Malayalam",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "ar": "Arabic",
            "es": "Spanish",
            "fr": "French",
            "de": "German"
        }
        return names.get(code, f"Language ({code})")

language_detector = LanguageDetector()
