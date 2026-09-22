import React, { createContext, useContext, useState } from 'react';
import { LanguageCode } from '@mediflow/shared';

export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  isRegional: boolean;
  bcp47Locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: LanguageCode.ENGLISH, label: 'English', nativeName: 'English', isRegional: false, bcp47Locale: 'en-US' },
  { code: LanguageCode.TELUGU, label: 'Telugu', nativeName: 'తెలుగు', isRegional: true, bcp47Locale: 'te-IN' },
  { code: LanguageCode.HINDI, label: 'Hindi', nativeName: 'हिन्दी', isRegional: true, bcp47Locale: 'hi-IN' },
  { code: 'te-en', label: 'Telugu + English', nativeName: 'Telugu (Code-mixed)', isRegional: true, bcp47Locale: 'te-IN' },
  { code: 'hi-en', label: 'Hindi + English', nativeName: 'Hinglish', isRegional: true, bcp47Locale: 'hi-IN' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', isRegional: true, bcp47Locale: 'ta-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', isRegional: true, bcp47Locale: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', isRegional: true, bcp47Locale: 'ml-IN' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', isRegional: true, bcp47Locale: 'mr-IN' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', isRegional: true, bcp47Locale: 'bn-IN' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', isRegional: true, bcp47Locale: 'gu-IN' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isRegional: true, bcp47Locale: 'pa-IN' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', isRegional: false, bcp47Locale: 'es-ES' },
  { code: 'fr', label: 'French', nativeName: 'Français', isRegional: false, bcp47Locale: 'fr-FR' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', isRegional: false, bcp47Locale: 'de-DE' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', isRegional: false, bcp47Locale: 'ar-SA' }
];

// Extensible Client-Side Language Detector
export const detectClientLanguage = (text: string): string => {
  if (!text) return 'en';
  const clean = text.trim();
  if (/[\u0C00-\u0C7F]/.test(clean)) return 'te';
  if (/[\u0900-\u097F]/.test(clean)) return 'hi';
  if (/[\u0B80-\u0BFF]/.test(clean)) return 'ta';
  if (/[\u0C80-\u0CFF]/.test(clean)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(clean)) return 'ml';
  if (/[\u0980-\u09FF]/.test(clean)) return 'bn';
  if (/[\u0A80-\u0AFF]/.test(clean)) return 'gu';
  if (/[\u0A00-\u0A7F]/.test(clean)) return 'pa';
  if (/[\u0600-\u06FF]/.test(clean)) return 'ar';

  const lower = clean.toLowerCase();
  const teluguMarkers = ['naku', 'undi', 'chesanu', 'gundelo', 'noppi', 'mandulu', 'daktar'];
  const hindiMarkers = ['mujhe', 'hai', 'nahi', 'dard', 'bukhar', 'dawaim', 'kripya', 'chhati'];
  const spanishMarkers = ['dolor', 'pecho', 'fiebre', 'pastilla', 'medicamento', 'gracias'];
  const frenchMarkers = ['douleur', 'poitrine', 'fievre', 'medecin', 'merci'];

  if (teluguMarkers.some(m => lower.includes(m))) return 'te-en';
  if (hindiMarkers.some(m => lower.includes(m))) return 'hi-en';
  if (spanishMarkers.some(m => lower.includes(m))) return 'es';
  if (frenchMarkers.some(m => lower.includes(m))) return 'fr';

  return 'en';
};

interface LanguageContextType {
  currentLanguage: string;
  detectedLanguage: string;
  isAutoDetected: boolean;
  languageDetails: LanguageOption;
  setLanguage: (lang: string) => void;
  updateDetectedLanguage: (lang: string) => void;
  resetToAutoDetection: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(LanguageCode.ENGLISH);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    setIsAutoDetected(false);
  };

  const updateDetectedLanguage = (lang: string) => {
    setDetectedLanguage(lang);
    if (isAutoDetected) {
      setCurrentLanguage(lang);
    }
  };

  const resetToAutoDetection = () => {
    setIsAutoDetected(true);
    setCurrentLanguage(detectedLanguage || 'en');
  };

  const languageDetails =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        detectedLanguage,
        isAutoDetected,
        languageDetails,
        setLanguage,
        updateDetectedLanguage,
        resetToAutoDetection
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
