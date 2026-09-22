import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Prescription, ExtractedPrescriptionItem, MedicationFrequency, FoodTiming } from '@mediflow/shared';
import { ShieldCheck, AlertTriangle, Edit2, Trash2, CheckCircle2, Clock, Pill } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  onVerified: () => void;
}

export const PrescriptionVerifyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prescription,
  onVerified
}) => {
  const [items, setItems] = useState<ExtractedPrescriptionItem[]>(
    prescription.extractedItems || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (index: number, field: keyof ExtractedPrescriptionItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmVerification = async () => {
    setIsSubmitting(true);
    try {
      await api.verifyPrescription(prescription.id, {
        verifiedItems: items,
        verificationRole: 'PATIENT'
      });
      onVerified();
    } catch (err) {
      console.error('Failed to confirm prescription verification', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify OCR-Extracted Prescription"
      maxWidth="820px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Safety Disclaimer Banner */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}
        >
          <ShieldCheck size={24} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
              Clinical Verification Required Before Activating Reminders
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.5' }}>
              MediFlow AI extracted the following medicine items. Items with handwritten ambiguity are highlighted below in amber. Please verify or correct names, dosages, and daily frequencies before submitting.
            </p>
          </div>
        </div>

        {/* Medicines Verification List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="glass-card"
              style={{
                border: item.isAmbiguous
                  ? '1.5px solid #f59e0b'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                background: item.isAmbiguous
                  ? 'rgba(245, 158, 11, 0.06)'
                  : 'rgba(17, 24, 39, 0.75)',
                padding: '1.25rem',
                position: 'relative'
              }}
            >
              {/* Top Item Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: '0.85rem' }}>
                <div className="flex items-center gap-2">
                  <Pill size={18} color={item.isAmbiguous ? '#fbbf24' : '#38bdf8'} />
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.98rem' }}>
                    Medicine #{idx + 1}: {item.medicineName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.isAmbiguous ? (
                    <span className="badge badge-urgent flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>Review Handwriting ({Math.round(item.confidence * 100)}%)</span>
                    </span>
                  ) : (
                    <span className="badge badge-routine">
                      ✓ High Confidence ({Math.round(item.confidence * 100)}%)
                    </span>
                  )}

                  <button
                    onClick={() => handleRemoveItem(idx)}
                    style={{ color: '#64748b', padding: '4px', cursor: 'pointer' }}
                    title="Remove Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid-cols-3" style={{ gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Medicine / Drug Name
                  </label>
                  <input
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => handleFieldChange(idx, 'medicineName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Dosage (e.g. 25mg, 500mg)
                  </label>
                  <input
                    type="text"
                    value={item.dosage}
                    onChange={(e) => handleFieldChange(idx, 'dosage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Frequency Pattern
                  </label>
                  <input
                    type="text"
                    value={item.frequencyLabel}
                    onChange={(e) => handleFieldChange(idx, 'frequencyLabel', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Food Timing
                  </label>
                  <select
                    value={item.timing}
                    onChange={(e) => handleFieldChange(idx, 'timing', e.target.value as FoodTiming)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value={FoodTiming.AFTER_MEALS}>After Meals (Post-prandial)</option>
                    <option value={FoodTiming.BEFORE_MEALS}>Before Meals (Pre-prandial)</option>
                    <option value={FoodTiming.WITH_MEALS}>With Meals</option>
                    <option value={FoodTiming.EMPTY_STOMACH}>Empty Stomach (Early morning)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={item.durationDays}
                    onChange={(e) => handleFieldChange(idx, 'durationDays', parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={item.instructions || ''}
                    onChange={(e) => handleFieldChange(idx, 'instructions', e.target.value)}
                    placeholder="e.g. Swallow whole with water"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between" style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleConfirmVerification}
            disabled={isSubmitting || items.length === 0}
            className="btn btn-emerald flex items-center gap-2"
          >
            <ShieldCheck size={18} />
            <span>Verify Prescription & Activate Reminders</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
