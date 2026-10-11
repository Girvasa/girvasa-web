export type AmenityBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";

export interface AmenityResponse {
  id: string;
  societyId: string;
  name: string;
  description?: string;
  capacity?: number;
  hourlyFee?: number;
  isActive: boolean;
}

export interface AmenityBookingResponse {
  id: string;
  amenityId: string;
  amenityName: string;
  unitId?: string;
  unitNumber?: string;
  bookedByName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalFee: number;
  status: AmenityBookingStatus;
  createdAt: string;
}

export interface EventResponse {
  id: string;
  societyId: string;
  title: string;
  description?: string;
  eventType?: string;
  status?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  eventDate?: string;
  venue?: string;
  amenityName?: string;
  organizerName?: string;
  rsvpCount?: number;
  maxAttendees?: number;
  isRsvpRequired?: boolean;
}

export interface PollOption {
  id: string;
  optionText: string;
  voteCount?: number;
}

export interface PollResponse {
  id: string;
  societyId: string;
  title?: string;
  question?: string;
  description?: string;
  pollType?: string;
  status?: string;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  options?: PollOption[];
  totalVotes?: number;
  totalVoters?: number;
  hasVoted?: boolean;
}

export interface DocumentResponse {
  id: string;
  societyId: string;
  title: string;
  category: string;
  fileKey: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedByName: string;
  createdAt: string;
}

export interface StaffResponse {
  id: string;
  societyId: string;
  fullName: string;
  phone: string;
  category: string;
  isActive: boolean;
  assignedArea?: string;
}

export interface VendorResponse {
  id: string;
  societyId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  category: string;
  contractStatus: string;
}

export interface ParkingAreaResponse {
  id: string;
  societyId: string;
  name: string;
  code: string;
  totalSlots: number;
}

export interface ParkingSlotResponse {
  id: string;
  parkingAreaId: string;
  parkingAreaName?: string;
  slotNumber: string;
  slotType: string;
  unitId?: string;
  unitNumber?: string;
  isOccupied: boolean;
}

export interface AuditLogResponse {
  id: string;
  societyId?: string;
  eventType: string;
  userId?: string;
  userName?: string;
  actorUserId?: string;
  actorName?: string;
  resource?: string;
  resourceId?: string;
  targetEntity?: string;
  targetEntityId?: string;
  action?: string;
  description?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface AuditPageResponse {
  content: AuditLogResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

