import { BillItemCategory, BillingStatus } from '../enums';

export interface BillItem {
  id: string;
  category: BillItemCategory;
  description: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  authorizedByStaffId?: string;
  dateAdded: string;
  itemName?: string;
}

export interface Bill {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0941"
  patientId: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: BillingStatus;
  insuranceClaimId?: string;
  createdAt: string;
  updatedAt: string;
  // Convenience aliases for UI/API
  totalAmount?: number;
  paidAmount?: number;
}
