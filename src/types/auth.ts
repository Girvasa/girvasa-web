export type UserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DEACTIVATED";

export interface UserSummary {
  id: string;
  mobileNumber: string;
  status: UserStatus;
}

export interface UserResponse {
  id: string;
  mobileNumber: string;
  phoneVerified: boolean;
  fullName?: string | null;
  email?: string | null;
  profileImageKey?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: UserSummary;
}

export interface OtpRequestDto {
  mobileNumber: string;
}

export interface OtpResponseDto {
  challengeId?: string;
  expiresInSeconds?: number;
  message?: string;
}

export interface OtpVerifyRequestDto {
  mobileNumber: string;
  otpCode: string;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
}
