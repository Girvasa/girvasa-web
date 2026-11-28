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

export type OtpIntent = "SIGN_IN" | "REGISTRATION" | "PIN_RESET" | "PIN_CHANGE";

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: UserSummary;
  hasPinConfigured?: boolean;
  deviceTrusted?: boolean;
}

export interface UserCheckRequestDto {
  mobileNumber: string;
  deviceId?: string;
  clientType?: "WEB" | "MOBILE";
}

export interface UserCheckResponseDto {
  registered: boolean;
  status: string;
  maskedPhone?: string;
  recommendedAction?: string;
  hasPinConfigured?: boolean;
  deviceTrusted?: boolean;
}

export interface OtpRequestDto {
  mobileNumber: string;
  channel?: "SMS" | "WHATSAPP";
  intent?: OtpIntent;
}

export interface OtpResponseDto {
  requestId?: string;
  challengeId?: string;
  expiresInSeconds?: number;
  resendAfterSeconds?: number;
  message?: string;
}

export interface OtpVerifyRequestDto {
  requestId?: string;
  mobileNumber: string;
  otp: string;
  otpCode?: string;
  clientType?: "WEB" | "MOBILE";
  deviceId?: string;
  deviceName?: string;
}

export interface PinSetupRequestDto {
  pin: string;
  deviceId?: string;
  deviceName?: string;
  clientType?: "WEB" | "MOBILE";
}

export interface PinLoginRequestDto {
  mobileNumber: string;
  pin: string;
  deviceId?: string;
  clientType?: "WEB" | "MOBILE";
}

export interface PinResetRequestDto {
  mobileNumber: string;
  otp: string;
  newPin: string;
  deviceId?: string;
  deviceName?: string;
  clientType?: "WEB" | "MOBILE";
}

export interface PinChangeRequestDto {
  currentPin: string;
  otp: string;
  newPin: string;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
  clientType?: "WEB" | "MOBILE";
}
