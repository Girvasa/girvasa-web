export interface SubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  description: string;
  maxUnits: number;
  pricePaise: number;
  currency: string;
  billingInterval: "MONTHLY" | "ANNUAL";
  featuresSummary: string;
  active: boolean;
}

export interface SelfServeRegistrationRequest {
  adminName: string;
  adminMobile: string;
  adminEmail?: string;
  societyName: string;
  societyCode?: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  planCode: string;
}

export interface SelfServeRegistrationResponse {
  societyId: string;
  societyCode: string;
  societyName: string;
  onboardingStatus: "WIZARD_STEP_1" | "WIZARD_STEP_2" | "WIZARD_STEP_3" | "WIZARD_STEP_4" | "WIZARD_COMPLETED";
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  planCode: string;
  planName: string;
  subscriptionStatus: string;
  trialEndsAt: string;
}

export interface OnboardingProgressResponse {
  societyId: string;
  societyName: string;
  societyCode: string;
  onboardingStatus: "WIZARD_STEP_1" | "WIZARD_STEP_2" | "WIZARD_STEP_3" | "WIZARD_STEP_4" | "WIZARD_COMPLETED";
  verificationStatus: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  totalBuildings: number;
  totalUnits: number;
  totalMembers: number;
  completed: boolean;
}

export interface SocietySubscriptionDetailResponse {
  id: string;
  societyId: string;
  plan: SubscriptionPlanDto;
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  trialEndsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  daysRemaining: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
  gatewayPaymentId?: string;
}

export interface RenewSubscriptionRequest {
  planCode: string;
  billingMonths: number;
  paymentMethod?: string;
}
