export interface TariffItem {
  code: string;
  category: 'CONSULTATION' | 'ROOM_BED' | 'DIAGNOSTICS' | 'PROCEDURE' | 'PHARMACY' | 'THERAPY' | 'NURSING';
  name: string;
  unitPrice: number;
  taxPercent: number;
  description: string;
}

export const HOSPITAL_TARIFF_CATALOG: TariffItem[] = [
  // 1. Consultations
  { code: 'CON-CARD-01', category: 'CONSULTATION', name: 'Cardiology Specialist OPD Consultation', unitPrice: 800, taxPercent: 0, description: 'Senior Interventional Cardiologist' },
  { code: 'CON-NEUR-01', category: 'CONSULTATION', name: 'Neurology Specialist OPD Consultation', unitPrice: 900, taxPercent: 0, description: 'Clinical Neurologist' },
  { code: 'CON-ORTH-01', category: 'CONSULTATION', name: 'Orthopedics Specialist OPD Consultation', unitPrice: 750, taxPercent: 0, description: 'Joint Replacement Surgeon' },

  // 2. Room & Bed Charges
  { code: 'BED-SEMI-01', category: 'ROOM_BED', name: 'Semi-Private Inpatient Ward (Room SP-201)', unitPrice: 3500, taxPercent: 5, description: 'Per Day Tariff including nursing care' },
  { code: 'BED-DELUXE-01', category: 'ROOM_BED', name: 'Deluxe Private Suite (Room DLX-301)', unitPrice: 6500, taxPercent: 5, description: 'Per Day Tariff with attendant couch' },
  { code: 'BED-ICU-01', category: 'ROOM_BED', name: 'Cardiac Intensive Care Unit (ICU-102)', unitPrice: 12000, taxPercent: 5, description: 'Per Day Tariff with full hemodynamic monitoring' },

  // 3. Diagnostics & Lab Tests
  { code: 'LAB-ECG-01', category: 'DIAGNOSTICS', name: '12-Lead Electrocardiogram (ECG)', unitPrice: 450, taxPercent: 0, description: 'Standard resting 12-lead ECG Doppler' },
  { code: 'LAB-ECHO-01', category: 'DIAGNOSTICS', name: '2D-Echocardiogram with Color Doppler', unitPrice: 2200, taxPercent: 0, description: 'Transthoracic cardiac ultrasound' },
  { code: 'LAB-BLD-01', category: 'DIAGNOSTICS', name: 'Comprehensive Cardiac Lipid & Metabolic Profile', unitPrice: 1150, taxPercent: 0, description: 'Lipid panel, HbA1c, Serum Creatinine' },

  // 4. Procedures & Cath Lab
  { code: 'PRC-PCI-01', category: 'PROCEDURE', name: 'Coronary Angiogram & Drug-Eluting Stent (DES) Placement', unitPrice: 145000, taxPercent: 5, description: 'Cath lab procedural charge & certified DES stent' },

  // 5. Verified Medicines & Pharmacy
  { code: 'MED-ATOR-20', category: 'PHARMACY', name: 'Atorvastatin Calcium 20mg (30 Tablets)', unitPrice: 180, taxPercent: 12, description: 'Lipid lowering statin' },
  { code: 'MED-METO-25', category: 'PHARMACY', name: 'Metoprolol Succinate ER 25mg (30 Tablets)', unitPrice: 145, taxPercent: 12, description: 'Beta-blocker antihypertensive' },
  { code: 'MED-ECOS-75', category: 'PHARMACY', name: 'Ecosprin 75mg (30 Tablets)', unitPrice: 42.50, taxPercent: 12, description: 'Antiplatelet aspirin' },

  // 6. Rehabilitation & Physical Therapy
  { code: 'THR-CARD-01', category: 'THERAPY', name: 'Cardiac Rehabilitation & Chest Physiotherapy Session', unitPrice: 600, taxPercent: 0, description: 'Supervised cardiopulmonary rehab with Dr. Ananya Ray' }
];

export const getTariffItemByCode = (code: string): TariffItem | undefined => {
  return HOSPITAL_TARIFF_CATALOG.find((t) => t.code === code);
};
