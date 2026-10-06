export type VisitStatus = "EXPECTED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "DENIED";

export interface VisitResponse {
  id: string;
  societyId: string;
  visitorName: string;
  visitorPhone: string;
  visitorType: string;
  unitId?: string;
  unitNumber?: string;
  purpose?: string;
  vehicleNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: VisitStatus;
  passCode?: string;
  createdAt: string;
}
