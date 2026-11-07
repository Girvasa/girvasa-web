/**
 * Society OS Platform Administration Types
 * Data contracts for Super Admin Console (/platform/admin)
 */

export interface AppVersionConfig {
  minAndroidVersion: string;
  latestAndroidVersion: string;
  minIosVersion: string;
  latestIosVersion: string;
  forceUpdateEnabled: boolean;
  playStoreUrl: string;
  appStoreUrl: string;
  maintenanceNotice: string;
}

export interface FeatureFlagItem {
  key: string;
  name: string;
  description: string;
  category: "MOBILE" | "WEB" | "FINANCE" | "OPERATIONS";
  enabledGlobal: boolean;
  societiesOverridden: number;
}

export interface SmsGatewayConfig {
  provider: "MSG91" | "TWILIO" | "KALEYRA" | "WHATSAPP_CLOUD";
  senderId: string;
  dltEntityId: string;
  authKeyMasked: string;
  dailyQuota: number;
  usedToday: number;
  deliverySuccessRate: number;
  whatsappEnabled: boolean;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  channels: ("PUSH" | "SMS" | "IN_APP")[];
  targetAudience: "ALL" | "SOCIETY_ADMINS" | "RESIDENTS" | "SECURITY_STAFF";
  priority: "NORMAL" | "HIGH" | "URGENT";
  societyId?: string; // optional scope, empty for platform-wide
}

export interface PlatformUserItem {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  societyId: string;
  societyName: string;
  unitNumber?: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  lastLoginAt?: string;
  createdAt: string;
}

export interface DeletedUserItem {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  societyId: string;
  societyName: string;
  role: string;
  deletedAt: string;
  deletedBy: string;
  deletionReason: string;
  canUndo: boolean;
}

export interface MaintenanceConfig {
  isMaintenanceMode: boolean;
  scheduledStart: string;
  scheduledEnd: string;
  title: string;
  bannerMessage: string;
  allowAdminBypass: boolean;
  affectedServices: string[];
}

export interface PaymentGatewayConfig {
  activeProvider: "RAZORPAY" | "CASHFREE" | "PAYU" | "STRIPE";
  keyId: string;
  keySecretMasked: string;
  webhookSecretMasked: string;
  testMode: boolean;
  autoSettlement: boolean;
  settlementUtrPrefix: string;
}

export interface SocietyBankAccountItem {
  societyId: string;
  societyName: string;
  accountNumberMasked: string;
  rawAccountNumber?: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  verificationStatus: "VERIFIED" | "PENDING_PENNY_DROP" | "FAILED" | "MANUALLY_OVERRIDDEN";
  lastVerifiedAt?: string;
}

export interface SubscriptionRateItem {
  planCode: string;
  planName: string;
  ratePerUnitPaise: number; // in paise (e.g. 2000 = ₹20.00)
  flatFeePaise: number;
  billingCyclesSupported: ("MONTHLY" | "QUARTERLY" | "ANNUAL")[];
  annualDiscountPercent: number;
  trialDays: number;
  features: string[];
  activeSocietiesCount: number;
}

export interface ApiKeyIntegrationItem {
  keyName: string;
  service: string;
  maskedKey: string;
  lastRotatedAt: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "REVOKED";
  expiresAt?: string;
}

export interface SecurityStepUpAuthRequest {
  superAdminOtp: string;
  actionReason: string;
}

export interface ImpersonationSession {
  isImpersonating: boolean;
  originalAdminId: string;
  originalAdminName: string;
  targetUserId: string;
  targetUserName: string;
  targetRole: string;
  targetSocietyId: string;
  targetSocietyName: string;
  startedAt: string;
  expiresAt: string;
}

export interface SocietyLifecycleItem {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  totalUnits: number;
  status: "ACTIVE" | "SUSPENDED" | "DELINQUENT" | "FROZEN";
  planCode: string;
  primaryAdminUserId: string;
  primaryAdminName: string;
  primaryAdminMobile: string;
  suspensionReason?: string;
  createdAt: string;
}

export interface PendingApprovalItem {
  id: string;
  actionType: "PAYMENT_GATEWAY_CHANGE" | "SOCIETY_BANK_OVERRIDE" | "SUBSCRIPTION_RATE_CHANGE" | "SOCIETY_SUSPENSION";
  title: string;
  description: string;
  proposedByAdminId: string;
  proposedByAdminName: string;
  proposedAt: string;
  payload: any;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedByAdminName?: string;
  reviewedAt?: string;
}

export interface UnreconciledTransactionItem {
  id: string;
  transactionId: string;
  gatewayReference: string;
  societyId: string;
  societyName: string;
  unitNumber: string;
  residentName: string;
  amountPaise: number;
  status: "GATEWAY_SUCCESS_UNALLOCATED" | "PENDING_WEBHOOK" | "FAILED";
  createdAt: string;
}

export interface BackgroundJobItem {
  jobId: string;
  jobName: string;
  scheduleCron: string;
  lastRunAt: string;
  nextRunAt: string;
  status: "COMPLETED" | "RUNNING" | "FAILED" | "SCHEDULED";
  recordsProcessed: number;
  failureReason?: string;
}
