export type BillStatus = "DRAFT" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export interface BillLineItem {
  id: string;
  chargeHeadId?: string;
  chargeHeadName: string;
  amount: number;
  rate?: number;
  quantity?: number;
  taxAmount?: number;
}

export interface BillSummaryResponse {
  id: string;
  societyId: string;
  unitId: string;
  unitNumber: string;
  buildingName: string;
  billNumber: string;
  billingPeriodId: string;
  periodName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: BillStatus;
  createdAt: string;
}

export interface BillDetailResponse extends BillSummaryResponse {
  lineItems: BillLineItem[];
}
