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
  description: string;
  eventDate: string;
  venue?: string;
  organizerName?: string;
  rsvpCount?: number;
}

export interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
}

export interface PollResponse {
  id: string;
  societyId: string;
  question: string;
  description?: string;
  isAnonymous: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  options: PollOption[];
  totalVotes: number;
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
  actorUserId?: string;
  actorName?: string;
  targetEntity?: string;
  targetEntityId?: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
}
