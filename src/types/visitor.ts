export type VisitStatus = "EXPECTED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "DENIED";

export interface VisitorInfo {
  id?: string;
  fullName?: string;
  mobileNumber?: string;
  avatarUrl?: string;
}

export interface VisitResponse {
  id: string;
  societyId?: string;
  visitNumber?: string;
  visitorName?: string;
  visitorPhone?: string;
  visitor?: VisitorInfo;
  visitorType?: string;
  categoryName?: string;
  unitId?: string;
  unitNumber?: string;
  hostUnitNumber?: string;
  hostUserName?: string;
  purpose?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  checkInTime?: string;
  checkedInAt?: string;
  checkOutTime?: string;
  checkedOutAt?: string;
  status: VisitStatus;
  passCode?: string;
  createdAt?: string;
}
