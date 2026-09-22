import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Bill, BillingStatus } from '@mediflow/shared';
import {
  Receipt,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  Printer,
  Sparkles,
  ChevronRight,
  FileCheck2,
  QrCode
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const ItemizedInvoice: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('4527.50');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    api.getPatientBills('pat-001').then((res) => {
      setBills(res);
      if (res.length > 0) setSelectedBill(res[0]);
    });
  }, []);

  const handleOpenPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.balanceDue.toString());
    setPaymentSuccess(false);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = () => {
    if (!selectedBill) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      const payVal = parseFloat(paymentAmount);
      const curTotal = selectedBill.totalAmount ?? selectedBill.totalPayable ?? 0;
      const curPaid = selectedBill.paidAmount ?? selectedBill.amountPaid ?? 0;
      const newPaid = curPaid + payVal;
      const newBal = Math.max(0, curTotal - newPaid);
      const newStatus = newBal === 0 ? BillingStatus.PAID : BillingStatus.PARTIALLY_PAID;

      const updatedBill: Bill = {
        ...selectedBill,
        amountPaid: newPaid,
        paidAmount: newPaid,
        totalPayable: curTotal,
        totalAmount: curTotal,
        balanceDue: newBal,
        status: newStatus
      };

      setSelectedBill(updatedBill);
      setBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (!selectedBill) {
    return <div className="glass-panel" style={{ padding: '1.5rem' }}>Loading billing statements...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Official Hospital Tax Invoice Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Hospital Letterhead */}
        <div
          className="flex items-start justify-between flex-wrap gap-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Building size={24} color="#0ea5e9" />
              <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', fontWeight: 800 }}>
                MediFlow Multi-Speciality Super Speciality Hospital
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Road No. 12, Banjara Hills, Hyderabad, Telangana 500034 • Emergency: +91 40 2345 6789
            </p>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              GSTIN: <strong>36AAAAA0000A1Z5</strong> • NABH Accredited • Tax Reg: HYD-MED-2026-8812
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-urgent" style={{ fontSize: '0.85rem' }}>
              {selectedBill.status.replace(/_/g, ' ')}
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
              Invoice #{selectedBill.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Issued: {new Date(selectedBill.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Patient & Admission Details Grid */}
        <div
          className="grid-cols-2"
          style={{
            background: 'rgba(11, 15, 25, 0.6)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Patient Name: <strong style={{ color: '#f8fafc' }}>Rajesh Sharma</strong></div>
            <div>UHID: <strong style={{ color: '#38bdf8' }}>MF-2026-8812</strong> • Age/Gender: <strong>44y / Male</strong></div>
            <div>Primary Diagnosis: <strong>Post-Angioplasty Stent Placement</strong></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Attending Specialist: <strong style={{ color: '#f8fafc' }}>Dr. Priya Varma, MD, DM (Cardiology)</strong></div>
            <div>Room Allocation: <strong>Semi-Private Ward (Room SP-201, Bed 1)</strong></div>
            <div>Insurance Policy: <strong style={{ color: '#34d399' }}>Star Health (#SH-8812 - Pre-Approved)</strong></div>
          </div>
        </div>

        {/* Itemized Services Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Service Description & Category</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Unit Rate (₹)</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {selectedBill.items.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#f8fafc' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{index + 1}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{item.itemName || item.description}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Category: {item.category}</div>
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#cbd5e1' }}>
                  ₹{item.unitPrice.toFixed(2)}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                  ₹{item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation & Balance Summary Cards */}
        <div className="flex justify-end" style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <div className="flex justify-between" style={{ color: '#cbd5e1' }}>
              <span>Services Subtotal:</span>
              <span>₹{selectedBill.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between" style={{ color: '#cbd5e1' }}>
              <span>Applicable Taxes & GST (5%):</span>
              <span>₹{selectedBill.taxAmount.toFixed(2)}</span>
            </div>

            {selectedBill.discountAmount > 0 && (
              <div className="flex justify-between" style={{ color: '#34d399' }}>
                <span>Staff Authorized Concession:</span>
                <span>-₹{selectedBill.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
              <span>Total Approved Charges:</span>
              <span style={{ color: '#38bdf8' }}>₹{(selectedBill.totalAmount ?? selectedBill.totalPayable ?? 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between" style={{ color: '#34d399' }}>
              <span>Amount Paid To Date:</span>
              <span>₹{(selectedBill.paidAmount ?? selectedBill.amountPaid ?? 0).toFixed(2)}</span>
            </div>

            <div
              className="flex justify-between"
              style={{
                borderTop: '1.5px solid rgba(239, 68, 68, 0.4)',
                paddingTop: '0.5rem',
                fontWeight: 800,
                color: '#ef4444',
                fontSize: '1.15rem'
              }}
            >
              <span>Outstanding Balance Due:</span>
              <span>₹{selectedBill.balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Action Buttons Bar */}
        <div
          className="flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} color="#34d399" />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Authorized hospital tariff records • Zero price hallucination compliance
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handlePrintInvoice} className="btn btn-secondary flex items-center gap-2">
              <Printer size={16} />
              <span>Print / Export PDF Statement</span>
            </button>

            {selectedBill.balanceDue > 0 && (
              <button
                onClick={() => handleOpenPayment(selectedBill)}
                className="btn btn-emerald flex items-center gap-2"
                style={{ padding: '0.65rem 1.4rem' }}
              >
                <CreditCard size={18} />
                <span>Pay Outstanding Balance (₹{selectedBill.balanceDue.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Online Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Hospital Bill Payment: Invoice #${selectedBill.invoiceNumber}`}
        maxWidth="520px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!paymentSuccess ? (
            <>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div className="flex justify-between">
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Outstanding Balance:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444' }}>
                    ₹{selectedBill.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Select Payment Method:
                </label>
                <div className="grid-cols-3" style={{ gap: '0.5rem' }}>
                  {['UPI', 'Credit/Debit Card', 'NetBanking'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        background: paymentMethod === method ? '#0ea5e9' : 'rgba(15,23,42,0.8)',
                        color: paymentMethod === method ? '#ffffff' : '#cbd5e1',
                        border: paymentMethod === method ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="glass-card flex flex-col items-center justify-center text-center" style={{ padding: '1.25rem' }}>
                  <QrCode size={110} color="#38bdf8" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginTop: '8px' }}>
                    UPI ID: mediflow.hospital@hdfcbank
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    Scan with Google Pay, PhonePe, or Paytm
                  </p>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Payment Amount (₹):
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f8fafc',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
                <button onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                  className="btn btn-emerald flex items-center gap-2"
                >
                  <CreditCard size={16} />
                  <span>{isProcessingPayment ? 'Processing Gateway...' : `Authorize Payment of ₹${paymentAmount}`}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-3" style={{ padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 size={36} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 700 }}>
                Payment Successfully Received!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '380px' }}>
                Receipt #RCP-{Date.now()} has been generated and sent to your registered phone number.
              </p>

              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
              >
                Back to Statement
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
