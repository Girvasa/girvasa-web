export type EmergencyType =
  | "FIRE"
  | "EARTHQUAKE"
  | "GAS_LEAK"
  | "SECURITY_THREAT"
  | "MEDICAL_EMERGENCY"
  | "FLOOD"
  | "OTHER";

export type EmergencySeverity = "CRITICAL" | "EXTREME";

export type EmergencyStatus = "ACTIVE" | "RESOLVED" | "CANCELLED";

export type SafetyStatus =
  | "SAFE"
  | "TRAPPED"
  | "NEEDS_ASSISTANCE"
  | "EVACUATED";

export interface EmergencyAlert {
  id: string;
  societyId: string;
  triggeredByUserId: string;
  triggeredByName?: string | null;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  title: string;
  instructions: string;
  status: EmergencyStatus;
  resolvedAt?: string | null;
  resolvedByUserId?: string | null;
  resolutionNotes?: string | null;
  cancelledAt?: string | null;
  cancelledByUserId?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAlertSummary {
  alertId: string;
  societyId: string;
  status: EmergencyStatus;
  totalMembers: number;
  totalResponses: number;
  safeCount: number;
  trappedCount: number;
  needsAssistanceCount: number;
  evacuatedCount: number;
  unaccountedCount: number;
  generatedAt: string;
}

export interface EmergencySafetyAcknowledgment {
  id: string;
  societyId: string;
  alertId: string;
  userId: string;
  userName?: string | null;
  safetyStatus: SafetyStatus;
  locationDetails?: string | null;
  notes?: string | null;
  acknowledgedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmergencyAlertRequest {
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  title: string;
  instructions: string;
}

export interface ResolveEmergencyAlertRequest {
  resolutionNotes?: string;
}

export interface CancelEmergencyAlertRequest {
  cancellationReason: string;
}

export interface EmergencySafetyStatusRequest {
  safetyStatus: SafetyStatus;
  locationDetails?: string;
  notes?: string;
}

