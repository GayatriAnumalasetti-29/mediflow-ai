import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Trash2, Eye, ShieldCheck, AlertCircle } from 'lucide-react';

interface UploadedDocument {
  id: string;
  name: string;
  category: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY' | 'RADIOLOGY';
  size: string;
  uploadedAt: string;
  status: 'ANALYZED' | 'PENDING';
}

export const DocumentUploader: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: 'doc-1',
      name: 'cardiac_prescription_discharge.pdf',
      category: 'PRESCRIPTION',
      size: '1.4 MB',
      uploadedAt: 'Today, 09:30 AM',
      status: 'ANALYZED'
    },
    {
      id: 'doc-2',
      name: 'ecg_12_lead_report_aug2026.png',
      category: 'LAB_REPORT',
      size: '2.8 MB',
      uploadedAt: 'Today, 10:15 AM',
      status: 'ANALYZED'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('PRESCRIPTION');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      addNewDocument(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addNewDocument(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const addNewDocument = (name: string, size: string) => {
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name,
      category: selectedCategory as any,
      size,
      uploadedAt: 'Just now',
      status: 'ANALYZED'
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
          Medical Document & Report Vault
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Upload historical clinical reports, lab test PDFs, and prescription images for secure AI transcription and care plan tracking.
        </p>
      </div>

      {/* Category Picker */}
      <div className="flex gap-2" style={{ marginBottom: '1.25rem' }}>
        {['PRESCRIPTION', 'LAB_REPORT', 'RADIOLOGY', 'DISCHARGE_SUMMARY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: selectedCategory === cat ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
              color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
              border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #0ea5e9' : '2px dashed rgba(255,255,255,0.15)',
          background: isDragging ? 'rgba(14, 165, 233, 0.1)' : 'rgba(11, 15, 25, 0.6)',
          borderRadius: '16px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '1.75rem'
        }}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <Upload size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto' }} />
        <p style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
          Drag & Drop medical documents here, or click to browse
        </p>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
          Supports PDF, PNG, JPG, JPEG up to 25MB
        </p>
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Document List Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
          Uploaded Clinical Records ({documents.length})
        </h3>

        {documents.map((doc) => (
          <div key={doc.id} className="glass-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(14, 165, 233, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={20} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  {doc.category.replace(/_/g, ' ')} • {doc.size} • {doc.uploadedAt}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                <CheckCircle size={12} /> AI Transcribed
              </span>
              <button
                onClick={() => handleDelete(doc.id)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', color: '#f87171' }}
                title="Delete Document"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
