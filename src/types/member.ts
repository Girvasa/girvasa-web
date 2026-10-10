import { MembershipStatus } from "./tenant";

export interface MemberOccupancyDto {
  unitId?: string;
  unitNumber?: string;
  buildingName?: string;
  occupancyType?: string;
}

export interface MemberUserSummaryDto {
  id?: string;
  mobileNumber?: string;
  fullName?: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface MemberRoleDto {
  code?: string;
  name?: string;
}

export interface MemberResponse {
  id: string;
  societyId?: string;
  userId?: string;
  fullName?: string;
  mobileNumber?: string;
  email?: string | null;
  status: MembershipStatus;
  roles?: (string | MemberRoleDto)[];
  user?: MemberUserSummaryDto;
  occupancies?: MemberOccupancyDto[];
  unitNumber?: string | null;
  unitId?: string | null;
  buildingName?: string | null;
  joinedAt?: string;
  createdAt?: string;
}

export interface CreateMemberRequest {
  fullName?: string;
  mobileNumber: string;
  email?: string;
  unitId?: string;
  role?: string;
  roleCodes?: string[];
  status?: MembershipStatus;
  userId?: string;
}
