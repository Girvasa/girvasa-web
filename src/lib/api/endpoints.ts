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

export const endpoints = {
  // Auth
  auth: {
    requestOtp: (mobileNumber: string) =>
      api.post<OtpResponseDto>("/auth/otp/request", { mobileNumber }, { skipAuth: true, skipTenant: true }),
    verifyOtp: (mobileNumber: string, otpCode: string) =>
      api.post<AuthTokensResponse>("/auth/otp/verify", { mobileNumber, otpCode }, { skipAuth: true, skipTenant: true }),
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

  // Executive Dashboard
  dashboard: {
    getExecutiveSummary: () =>
      api.get<ExecutiveDashboardResponse>("/reports/analytics/dashboard"),
  },

  // Structure: Buildings, Wings, Units
  structure: {
    getBuildings: (includeInactive = false) =>
      api.get<BuildingResponse[]>("/buildings", { params: { includeInactive } }),
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
    }) => api.get<VisitResponse[]>("/visitors/visits", { params }),
    checkIn: (visitId: string) =>
      api.post<VisitResponse>(`/visitors/visits/${visitId}/check-in`),
    checkOut: (visitId: string) =>
      api.post<VisitResponse>(`/visitors/visits/${visitId}/check-out`),
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
    getAmenities: () =>
      api.get<AmenityResponse[]>("/amenities"),
    getBookings: (params?: { status?: string; amenityId?: string }) =>
      api.get<AmenityBookingResponse[]>("/amenity-bookings", { params }),
    approveBooking: (id: string) =>
      api.post<AmenityBookingResponse>(`/amenity-bookings/${id}/approve`),
    cancelBooking: (id: string, reason?: string) =>
      api.post<AmenityBookingResponse>(`/amenity-bookings/${id}/cancel`, { reason }),
  },

  // Events & Polls
  events: {
    getEvents: () => api.get<EventResponse[]>("/events"),
  },
  polls: {
    getPolls: () => api.get<PollResponse[]>("/polls"),
    getPoll: (id: string) => api.get<PollResponse>(`/polls/${id}`),
  },

  // Documents
  documents: {
    getDocuments: (params?: { category?: string; search?: string }) =>
      api.get<DocumentResponse[]>("/documents", { params }),
  },

  // Staff & Vendors
  staff: {
    getStaff: (params?: { category?: string; isActive?: boolean }) =>
      api.get<StaffResponse[]>("/staff", { params }),
  },
  vendors: {
    getVendors: (params?: { category?: string }) =>
      api.get<VendorResponse[]>("/vendors", { params }),
  },

  // Parking
  parking: {
    getAreas: () => api.get<ParkingAreaResponse[]>("/parking/areas"),
    getSlots: (areaId?: string) =>
      api.get<ParkingSlotResponse[]>("/parking/slots", { params: { areaId } }),
  },

  // Audit
  audit: {
    getLogs: (params?: { eventType?: string; page?: number; limit?: number }) =>
      api.get<AuditLogResponse[]>("/audit", { params }),
  },
};
