import React, { useState, useRef } from 'react';
import {
  User,
  Calendar,
  Home,
  Phone,
  ClipboardList,
  Stethoscope,
  Globe,
  Camera,
  Upload,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface PatientOpFormProps {
  onSubmitSuccess: (patientData: any) => void;
}

// Multilingual translations for the OP Form
const OP_FORM_TRANSLATIONS: Record<string, {
  title: string;
  subTitle: string;
  langTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  photoLabel: string;
  photoClick: string;
  addressLabel: string;
  addressPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  symptomsLabel: string;
  symptomsPlaceholder: string;
  speakSymptoms: string;
  listening: string;
  continueButton: string;
  validating: string;
}> = {
  en: {
    title: 'PATIENT OP FORM',
    subTitle: 'MEDIFLOW HOSPITAL OUTPATIENT REGISTRATION',
    langTitle: 'Choose your preferred language',
    nameLabel: 'NAME :',
    namePlaceholder: 'Enter your full name',
    ageLabel: 'AGE :',
    agePlaceholder: 'Years',
    genderLabel: 'GENDER :',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    photoLabel: 'PHOTO',
    photoClick: 'Optional photo upload',
    addressLabel: 'ADDRESS :',
    addressPlaceholder: 'Enter complete residential address',
    phoneLabel: 'PHONE NUMBER :',
    phonePlaceholder: '+91 XXXXX XXXXX',
    reasonLabel: 'REASON :',
    reasonPlaceholder: 'Reason for outpatient visit',
    symptomsLabel: 'SYMPTOMS :',
    symptomsPlaceholder: 'Describe your current symptoms or health concerns...',
    speakSymptoms: 'Speak Symptoms',
    listening: 'Listening... (Speak now)',
    continueButton: 'Continue',
    validating: 'Validating & Continuing...'
  },
  te: {
    title: 'రోగి అవుట్‌పేషెంట్ ఫారం (PATIENT OP FORM)',
    subTitle: 'మెడిఫ్లో హాస్పిటల్ అవుట్‌పేషెంట్ రిజిస్ట్రేషన్',
    langTitle: 'మీ ప్రాధాన్య భాషను ఎంచుకోండి (Language)',
    nameLabel: 'పేరు (NAME) :',
    namePlaceholder: 'మీ పూర్తి పేరును నమోదు చేయండి',
    ageLabel: 'వయస్సు (AGE) :',
    agePlaceholder: 'సంవత్సరాలు',
    genderLabel: 'లింగం (GENDER) :',
    genderMale: 'పురుషుడు',
    genderFemale: 'స్త్రీ',
    genderOther: 'ఇతరులు',
    photoLabel: 'ఫోటో',
    photoClick: 'ఫోటో అప్‌లోడ్ (ఐచ్ఛికం)',
    addressLabel: 'చిరునామా (ADDRESS) :',
    addressPlaceholder: 'పూర్తి నివాస చిరునామా రాయండి',
    phoneLabel: 'ఫోన్ నంబర్ (PHONE) :',
    phonePlaceholder: '+91 XXXXX XXXXX',
    reasonLabel: 'కారణం (REASON) :',
    reasonPlaceholder: 'హాస్పిటల్ సందర్శనకు గల కారణం',
    symptomsLabel: 'లక్షణాలు (SYMPTOMS) :',
    symptomsPlaceholder: 'మీ ఆరోగ్య సమస్యలు లేదా లక్షణాలను వివరించండి...',
    speakSymptoms: 'లక్షణాలు మాట్లాడండి',
    listening: 'వింటున్నాము... (మాట్లాడండి)',
    continueButton: 'కొనసాగించండి (Continue)',
    validating: 'నమోదు చేయబడుతోంది...'
  },
  hi: {
    title: 'रोगी ओपीडी फॉर्म (PATIENT OP FORM)',
    subTitle: 'मेडीफ्लो हॉस्पिटल बाह्य रोगी पंजीकरण',
    langTitle: 'अपनी पसंदीदा भाषा चुनें (Language)',
    nameLabel: 'नाम (NAME) :',
    namePlaceholder: 'अपना पूरा नाम दर्ज करें',
    ageLabel: 'आयु (AGE) :',
    agePlaceholder: 'वर्ष',
    genderLabel: 'लिंग (GENDER) :',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    photoLabel: 'फोटो',
    photoClick: 'फोटो अपलोड (वैकल्पिक)',
    addressLabel: 'पता (ADDRESS) :',
    addressPlaceholder: 'पूरा आवासीय पता दर्ज करें',
    phoneLabel: 'फ़ोन नंबर (PHONE) :',
    phonePlaceholder: '+91 XXXXX XXXXX',
    reasonLabel: 'कारण (REASON) :',
    reasonPlaceholder: 'परामर्श का मुख्य कारण',
    symptomsLabel: 'लक्षण (SYMPTOMS) :',
    symptomsPlaceholder: 'अपनी स्वास्थ्य संबंधी तकलीफ या लक्षण बताएं...',
    speakSymptoms: 'लक्षण बोलें',
    listening: 'सुन रहे हैं... (बोलिए)',
    continueButton: 'आगे बढ़ें (Continue)',
    validating: 'सत्यापित किया जा रहा है...'
  }
};

export const PatientOpForm: React.FC<PatientOpFormProps> = ({ onSubmitSuccess }) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const { setPatientSession } = useAuth();

  const langKey = currentLanguage.startsWith('te') ? 'te' : currentLanguage.startsWith('hi') ? 'hi' : 'en';
  const t = OP_FORM_TRANSLATIONS[langKey] || OP_FORM_TRANSLATIONS.en;

  // 1. NO AUTOFILL — ALL INITIAL FIELDS ARE EMPTY
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [gender, setGender] = useState<string>('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync voice transcript to symptoms
  React.useEffect(() => {
    if (transcript) {
      setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter patient full name.';
    }
    if (!age || Number(age) <= 0 || Number(age) > 125) {
      newErrors.age = 'Please enter a valid age.';
    }
    if (!gender) {
      newErrors.gender = 'Please select a gender option.';
    }
    if (!address.trim()) {
      newErrors.address = 'Please provide your residential address.';
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = 'Please enter a valid contact phone number.';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Please state the reason for your visit.';
    }
    if (!symptoms.trim()) {
      newErrors.symptoms = 'Please describe your symptoms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const generatedUhid = `MF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const patientData = {
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      address: address.trim(),
      contactNumber: phoneNumber.trim(),
      reason: reason.trim(),
      symptoms: symptoms.trim(),
      primaryLanguage: currentLanguage,
      uhid: generatedUhid,
      photoUrl: photoPreview,
      activeAppointment: null // No token or appointment yet until booked!
    };

    // 1. Dispatch registration to backend persistent store
    try {
      await api.registerPatient(patientData);
    } catch (err) {
      console.warn('[OP Form] Backend register dispatch handled:', err);
    }

    // 2. Save patient profile into session
    setPatientSession(patientData);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(patientData);
    }, 400);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '3.5px solid #1e3a8a',
        boxShadow: '0 20px 45px rgba(30, 58, 138, 0.25), 0 0 0 1px rgba(30, 58, 138, 0.1)',
        overflow: 'hidden',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* OP Card Header — Matches Reference Image */}
      <div
        style={{
          padding: '1.25rem 2rem',
          borderBottom: '2.5px solid #1e3a8a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Medical Cross (+) Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3.5px solid #1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e3a8a',
              fontWeight: 900,
              fontSize: '28px',
              lineHeight: 1,
              background: '#ffffff',
              boxShadow: '0 2px 6px rgba(30, 58, 138, 0.15)'
            }}
          >
            +
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                letterSpacing: '0.03em',
                color: '#1e3a8a',
                margin: 0,
                borderBottom: '3px solid #1e3a8a',
                paddingBottom: '2px',
                display: 'inline-block'
              }}
            >
              {t.title}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Top-Right Language / Globe Icon Selection (Optional Selection) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}
        >
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={14} color="#1e3a8a" />
            <span>{t.langTitle}</span>
          </label>
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '2px solid #1e3a8a',
              background: '#ffffff',
              color: '#1e3a8a',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Error Banner if any */}
      {Object.keys(errors).length > 0 && (
        <div
          style={{
            margin: '1.25rem 2rem 0 2rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid #ef4444',
            color: '#b91c1c',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} color="#ef4444" />
          <span>Please fill in all required fields marked below to continue.</span>
        </div>
      )}

      {/* Form Content — Starts completely EMPTY */}
      <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem 2rem 2rem', background: 'transparent' }}>
        {/* Top Row: Name + Age + Photo box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* NAME FIELD */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem' }}>
                  <User size={18} color="#1e3a8a" />
                  <span>{t.nameLabel}</span>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder={t.namePlaceholder}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    borderBottom: errors.fullName ? '2px solid #ef4444' : '2px solid #1e3a8a',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    outline: 'none'
                  }}
                />
              </div>
              {errors.fullName && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '142px', display: 'block', marginTop: '2px' }}>
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* AGE FIELD */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem' }}>
                  <Calendar size={18} color="#1e3a8a" />
                  <span>{t.ageLabel}</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                  }}
                  placeholder={t.agePlaceholder}
                  style={{
                    width: '120px',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    borderBottom: errors.age ? '2px solid #ef4444' : '2px solid #1e3a8a',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    outline: 'none'
                  }}
                />
              </div>
              {errors.age && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '142px', display: 'block', marginTop: '2px' }}>
                  {errors.age}
                </span>
              )}
            </div>

            {/* GENDER FIELD */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚥</span>
                  <span>{t.genderLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'Male', label: t.genderMale },
                    { key: 'Female', label: t.genderFemale },
                    { key: 'Other', label: t.genderOther }
                  ].map((g) => (
                    <label
                      key={g.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: gender === g.key ? '#1e3a8a' : '#475569'
                      }}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g.key}
                        onChange={() => {
                          setGender(g.key);
                          if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }));
                        }}
                        style={{ accentColor: '#1e3a8a', width: '17px', height: '17px', cursor: 'pointer' }}
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.gender && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '142px', display: 'block', marginTop: '2px' }}>
                  {errors.gender}
                </span>
              )}
            </div>
          </div>

          {/* Photo Box — Top Right matching Reference Image */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '130px',
              height: '145px',
              border: '2.5px solid #1e3a8a',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
            title="Click to upload patient photo (Optional)"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Patient Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#1e3a8a' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '2px solid #1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff'
                  }}
                >
                  <User size={26} color="#1e3a8a" />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}>{t.photoLabel}</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{t.photoClick}</span>
              </div>
            )}
          </div>
        </div>

        {/* ADDRESS FIELD */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem', marginBottom: '4px' }}>
            <Home size={18} color="#1e3a8a" />
            <span>{t.addressLabel}</span>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
            }}
            placeholder={t.addressPlaceholder}
            style={{
              width: '100%',
              padding: '0.5rem 0',
              border: 'none',
              borderBottom: errors.address ? '2px solid #ef4444' : '2px solid #1e3a8a',
              background: 'transparent',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          {errors.address && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '2px' }}>
              {errors.address}
            </span>
          )}
        </div>

        {/* PHONE NUMBER FIELD */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem', marginBottom: '4px' }}>
            <Phone size={18} color="#1e3a8a" />
            <span>{t.phoneLabel}</span>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
            }}
            placeholder={t.phonePlaceholder}
            style={{
              width: '100%',
              padding: '0.5rem 0',
              border: 'none',
              borderBottom: errors.phoneNumber ? '2px solid #ef4444' : '2px solid #1e3a8a',
              background: 'transparent',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          {errors.phoneNumber && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '2px' }}>
              {errors.phoneNumber}
            </span>
          )}
        </div>

        {/* REASON FIELD */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem', marginBottom: '4px' }}>
            <ClipboardList size={18} color="#1e3a8a" />
            <span>{t.reasonLabel}</span>
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
            }}
            placeholder={t.reasonPlaceholder}
            style={{
              width: '100%',
              padding: '0.5rem 0',
              border: 'none',
              borderBottom: errors.reason ? '2px solid #ef4444' : '2px solid #1e3a8a',
              background: 'transparent',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          {errors.reason && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '2px' }}>
              {errors.reason}
            </span>
          )}
        </div>

        {/* SYMPTOMS FIELD with Speech Voice Assist */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 800, fontSize: '0.92rem' }}>
              <Stethoscope size={18} color="#1e3a8a" />
              <span>{t.symptomsLabel}</span>
            </div>

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : () => startListening((text) => {
                setSymptoms((prev) => (prev ? `${prev} ${text}` : text));
                if (errors.symptoms) setErrors((prev) => ({ ...prev, symptoms: '' }));
              })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                background: isListening ? '#ef4444' : 'rgba(30, 58, 138, 0.1)',
                border: '1px solid #1e3a8a',
                color: isListening ? '#ffffff' : '#1e3a8a',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isListening ? t.listening : t.speakSymptoms}</span>
            </button>
          </div>

          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (errors.symptoms) setErrors((prev) => ({ ...prev, symptoms: '' }));
            }}
            placeholder={t.symptomsPlaceholder}
            style={{
              width: '100%',
              padding: '0.5rem 0',
              border: 'none',
              borderBottom: errors.symptoms ? '2px solid #ef4444' : '2px solid #1e3a8a',
              background: 'transparent',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
          {errors.symptoms && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '2px' }}>
              {errors.symptoms}
            </span>
          )}
        </div>

        {/* Submit / Continue Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.9rem 2.4rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '0.02em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(30, 58, 138, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>{isSubmitting ? t.validating : t.continueButton}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
