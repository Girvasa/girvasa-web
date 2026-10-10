import { api } from "./client";
import { AuthTokensResponse, OtpResponseDto, UserResponse } from "@/types/auth";
import { CurrentSocietyContext, UserSocietyMembership } from "@/types/tenant";
import { BuildingResponse, UnitResponse, WingResponse } from "@/types/structure";
import { MemberResponse, CreateMemberRequest } from "@/types/member";
import { BillDetailResponse, BillSummaryResponse } from "@/types/billing";
import { PaymentCreateRequest, PaymentDetailResponse, PaymentSummaryResponse } from "@/types/payment";
import { ComplaintResponse } from "@/types/complaint";
import { VisitResponse } from "@/types/visitor";
import { NoticeResponse, CreateNoticeRequest } from "@/types/notice";
import {
  AmenityBookingResponse,
  AmenityResponse,
  AuditLogResponse,
  DocumentResponse,
  EventResponse,
  ParkingAreaResponse,
  ParkingSlotResponse,
  PollResponse,
  StaffResponse,
  VendorResponse,
} from "@/types/operation";
import { ExecutiveDashboardResponse } from "@/types/report";
import {
  SubscriptionPlanDto,
  SelfServeRegistrationRequest,
  SelfServeRegistrationResponse,
  OnboardingProgressResponse,
} from "@/types/subscription";

export const endpoints = {
  // Auth
  auth: {
    requestOtp: (mobileNumber: string) =>
      api.post<OtpResponseDto>("/auth/otp/request", { mobileNumber }, { skipAuth: true, skipTenant: true }),
    verifyOtp: (mobileNumber: string, otpCode: string, requestId?: string) =>
      api.post<AuthTokensResponse>(
        "/auth/otp/verify",
        {
          mobileNumber,
          otp: otpCode,
          ...(requestId ? { requestId } : {}),
        },
        { skipAuth: true, skipTenant: true }
      ),
    logout: () => api.post<{ message: string }>("/auth/logout"),
    getCurrentUser: () => api.get<UserResponse>("/auth/me", { skipTenant: true }),
  },

  // Tenant / Societies
  tenant: {
    getUserSocieties: () =>
      api.get<UserSocietyMembership[]>("/auth/societies", { skipTenant: true }),
    getCurrentSocietyContext: () =>
      api.get<CurrentSocietyContext>("/societies/current"),
  },

  // Executive Dashboard & Reporting
  dashboard: {
    getExecutiveSummary: () =>
      api.get<ExecutiveDashboardResponse>("/reports/analytics/dashboard"),
  },
  reports: {
    getAccountingSummary: (params?: any) =>
      api.get<any>("/reports/accounting/summary", { params }),
    getCategorySummary: (params?: any) =>
      api.get<any>("/reports/accounting/category-summary", { params }),
  },

  // Structure: Buildings, Wings, Units
  structure: {
    getBuildings: (includeInactive = false) =>
      api.get<BuildingResponse[]>("/buildings", { params: { includeInactive } }),
    createBuilding: (data: any) =>
      api.post<BuildingResponse>("/buildings", data),
    getWings: (buildingId: string) =>
      api.get<WingResponse[]>(`/buildings/${buildingId}/wings`),
    getUnits: (params?: {
      buildingId?: string;
      floorNumber?: number;
      unitType?: string;
      status?: string;
      search?: string;
      includeInactive?: boolean;
    }) => api.get<UnitResponse[]>("/units", { params }),
    getUnit: (unitId: string) =>
      api.get<UnitResponse>(`/units/${unitId}`),
    createUnit: (data: any) =>
      api.post<UnitResponse>("/units", data),
  },

  // Residents / Members
  members: {
    getMembers: (params?: {
      status?: string;
      role?: string;
      search?: string;
      page?: number;
      limit?: number;
    }) => api.get<MemberResponse[]>("/members", { params }),
    getMember: (memberId: string) =>
      api.get<MemberResponse>(`/members/${memberId}`),
    createMember: (data: CreateMemberRequest) =>
      api.post<MemberResponse>("/members", data),
    approveMember: (memberId: string) =>
      api.post<MemberResponse>(`/members/${memberId}/approve`),
    suspendMember: (memberId: string, reason?: string) =>
      api.post<MemberResponse>(`/members/${memberId}/suspend`, { reason }),
    terminateMember: (memberId: string, reason?: string) =>
      api.post<MemberResponse>(`/members/${memberId}/terminate`, { reason }),
  },

  // Billing
  billing: {
    getBills: (params?: {
      billingPeriodId?: string;
      unitId?: string;
      status?: string;
    }) => api.get<BillSummaryResponse[]>("/billing/bills", { params }),
    getBill: (billId: string) =>
      api.get<BillDetailResponse>(`/billing/bills/${billId}`),
    getBillingPeriods: () =>
      api.get<any[]>("/billing/periods"),
    generateBills: (billingPeriodId: string) =>
      api.post<any>(`/billing/periods/${billingPeriodId}/generate-bills`, {}),
  },

  // Payments
  payments: {
    getPayments: (params?: {
      unitId?: string;
      status?: string;
      method?: string;
      fromDate?: string;
      toDate?: string;
    }) => api.get<PaymentSummaryResponse[]>("/payments", { params }),
    getPayment: (paymentId: string) =>
      api.get<PaymentDetailResponse>(`/payments/${paymentId}`),
    createPayment: (data: PaymentCreateRequest, idempotencyKey?: string) =>
      api.post<PaymentDetailResponse>("/payments", data, {
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    reversePayment: (paymentId: string, reason: string) =>
      api.post<PaymentDetailResponse>(`/payments/${paymentId}/reverse`, { reason }),
  },

  // Complaints
  complaints: {
    getComplaints: (params?: {
      status?: string;
      priority?: string;
      categoryId?: string;
      unitId?: string;
      reportedByUserId?: string;
      assignedToUserId?: string;
      fromDate?: string;
      toDate?: string;
    }) => api.get<ComplaintResponse[]>("/complaints", { params }),
    getComplaint: (id: string) =>
      api.get<ComplaintResponse>(`/complaints/${id}`),
    createComplaint: (data: any, idempotencyKey?: string) =>
      api.post<ComplaintResponse>("/complaints", data, {
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    updateStatus: (id: string, status: string, notes?: string) =>
      api.patch<ComplaintResponse>(`/complaints/${id}/status`, { status, notes }),
    assign: (id: string, assignedToUserId: string) =>
      api.patch<ComplaintResponse>(`/complaints/${id}/assign`, { assignedToUserId }),
  },

  // Visitors
  visitors: {
    getVisits: (params?: {
      status?: string;
      unitId?: string;
      date?: string;
    }) => api.get<VisitResponse[]>("/visits", { params }),
    createVisit: (data: any, idempotencyKey?: string) =>
      api.post<VisitResponse>("/visits", data, {
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    checkIn: (visitId: string) =>
      api.post<VisitResponse>(`/visits/${visitId}/check-in`),
    checkOut: (visitId: string) =>
      api.post<VisitResponse>(`/visits/${visitId}/check-out`),
  },

  // Notices
  notices: {
    getNotices: (params?: { status?: string }) =>
      api.get<NoticeResponse[]>("/notices", { params }),
    getNotice: (id: string) =>
      api.get<NoticeResponse>(`/notices/${id}`),
    createNotice: (data: CreateNoticeRequest) =>
      api.post<NoticeResponse>("/notices", data),
    publishNotice: (id: string) =>
      api.post<NoticeResponse>(`/notices/${id}/publish`),
    archiveNotice: (id: string) =>
      api.post<NoticeResponse>(`/notices/${id}/archive`),
    cancelNotice: (id: string) =>
      api.post<NoticeResponse>(`/notices/${id}/cancel`),
  },

  // Amenities
  amenities: {
    getAmenities: async () => {
      const res = await api.get<any>("/amenities");
      return Array.isArray(res) ? res : res?.content || [];
    },
    createAmenity: (data: any) =>
      api.post<AmenityResponse>("/amenities", data),
    getBookings: async (params?: { status?: string; amenityId?: string }) => {
      const res = await api.get<any>("/amenity-bookings", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
    approveBooking: (id: string) =>
      api.post<AmenityBookingResponse>(`/amenity-bookings/${id}/approve`),
    cancelBooking: (id: string, reason?: string) =>
      api.post<AmenityBookingResponse>(`/amenity-bookings/${id}/cancel`, { reason }),
  },

  // Events & Polls
  events: {
    getEvents: async (params?: any) => {
      const res = await api.get<any>("/events", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
    createEvent: (data: any) => api.post<EventResponse>("/events", data),
  },
  polls: {
    getPolls: async (params?: any) => {
      const res = await api.get<any>("/polls", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
    getPoll: (id: string) => api.get<PollResponse>(`/polls/${id}`),
    createPoll: (data: any) => api.post<PollResponse>("/polls", data),
    vote: (id: string, optionIds: string[]) => api.post(`/polls/${id}/votes`, { optionIds }),
  },

  // Documents
  documents: {
    getDocuments: (params?: { category?: string; search?: string }) =>
      api.get<DocumentResponse[]>("/documents", { params }),
    uploadDocument: (formData: FormData) =>
      api.post<DocumentResponse>("/documents", formData),
    getCategories: async () => {
      const res = await api.get<any>("/document-categories");
      return Array.isArray(res) ? res : res?.content || [];
    },
  },

  // Staff & Vendors
  staff: {
    getStaff: async (params?: any) => {
      const res = await api.get<any>("/staff", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
    getCategories: async () => {
      const res = await api.get<any>("/staff-categories");
      return Array.isArray(res) ? res : res?.content || [];
    },
    createStaff: (data: any) => api.post<StaffResponse>("/staff", data),
  },
  vendors: {
    getVendors: async (params?: any) => {
      const res = await api.get<any>("/vendors", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
    createVendor: (data: any) => api.post<VendorResponse>("/vendors", data),
  },

  // Parking
  parking: {
    getAreas: async () => {
      const res = await api.get<any>("/parking-areas");
      return Array.isArray(res) ? res : res?.content || [];
    },
    getSlots: async (areaId?: string) => {
      const res = await api.get<any>("/parking-slots", { params: { areaId } });
      return Array.isArray(res) ? res : res?.content || [];
    },
  },

  // Audit
  audit: {
    getLogs: async (params?: { eventType?: string; page?: number; limit?: number }) => {
      const res = await api.get<any>("/audit/events", { params });
      return Array.isArray(res) ? res : res?.content || [];
    },
  },

  // Subscription & Self-Serve Onboarding
  subscription: {
    getPublicPlans: () =>
      api.get<SubscriptionPlanDto[]>("/public/plans", { skipAuth: true, skipTenant: true }),
    registerSocietyWithTrial: (payload: SelfServeRegistrationRequest) =>
      api.post<SelfServeRegistrationResponse>("/public/onboarding/register", payload, { skipAuth: true, skipTenant: true }),
    getOnboardingProgress: () =>
      api.get<OnboardingProgressResponse>("/societies/current/onboarding"),
    updateOnboardingStep: (targetStep: string) =>
      api.patch<OnboardingProgressResponse>("/societies/current/onboarding/step", { targetStep }),
  },
};
