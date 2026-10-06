export type MembershipStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
export type SocietyStatus = "ACTIVE" | "ONBOARDING" | "SUSPENDED" | "ARCHIVED";

export interface UserSocietyMembership {
  societyId: string;
  societyCode: string;
  societyName: string;
  roles: string[];
  membershipStatus: MembershipStatus;
  joinedAt: string;
}

export interface CurrentSocietyContext {
  societyId: string;
  societyCode: string;
  societyName: string;
  legalName?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  pincode?: string;
  status: SocietyStatus;
  membershipId: string;
  membershipStatus: MembershipStatus;
  roles: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
}

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
}
