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

export interface SocietyPaymentGatewayConfigResponse {
  id: string;
  societyId: string;
  gatewayProvider: string;
  linkedAccountId?: string;
  merchantName?: string;
  accountNumberMask?: string;
  ifscCode?: string;
  bankName?: string;
  kycStatus: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface SocietyPaymentGatewayConfigUpdateRequest {
  merchantName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  linkedAccountId?: string;
  isActive?: boolean;
}

export interface PaymentOrderResult {
  gatewayName: string;
  externalOrderId: string;
  orderReference: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface SubscriptionOrderResponse {
  societyId: string;
  planCode: string;
  planName: string;
  billingMonths: number;
  orderReference: string;
  externalOrderId: string;
  gatewayName: string;
  amount: number;
  currency: string;
  keyId?: string;
}

