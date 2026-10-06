export type PaymentStatus = "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
export type PaymentMethod = "UPI" | "NET_BANKING" | "CARD" | "CASH" | "CHEQUE" | "BANK_TRANSFER";

export interface PaymentAllocation {
  id: string;
  billId: string;
  billNumber: string;
  allocatedAmount: number;
  status: string;
  allocatedAt: string;
}

export interface PaymentSummaryResponse {
  id: string;
  societyId: string;
  paymentNumber: string;
  unitId?: string;
  unitNumber?: string;
  amount: number;
  unallocatedAmount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receiptNumber?: string;
  paidAt: string;
  createdAt: string;
}

export interface PaymentDetailResponse extends PaymentSummaryResponse {
  allocations: PaymentAllocation[];
}

export interface PaymentCreateRequest {
  unitId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  billAllocations?: {
    billId: string;
    amount: number;
  }[];
  notes?: string;
}
