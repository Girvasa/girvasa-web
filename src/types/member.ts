import { MembershipStatus } from "./tenant";

export interface MemberResponse {
  id: string;
  societyId: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  email?: string | null;
  status: MembershipStatus;
  roles: string[];
  unitNumber?: string | null;
  unitId?: string | null;
  buildingName?: string | null;
  joinedAt: string;
}

export interface CreateMemberRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
  unitId?: string;
  role: string;
}
