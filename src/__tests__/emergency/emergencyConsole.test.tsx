import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmergenciesPage from "@/app/(dashboard)/emergencies/page";
import { EmergencyAlertBanner } from "@/components/emergency/EmergencyAlertBanner";
import * as usePermissionModule from "@/lib/rbac/usePermission";
import * as useAuthModule from "@/lib/auth/AuthContext";
import * as TenantContextModule from "@/lib/tenant/TenantContext";
import { endpoints } from "@/lib/api/endpoints";
import {
  EmergencyAlert,
  EmergencyAlertSummary,
  EmergencySafetyAcknowledgment,
} from "@/types/emergency";

vi.mock("@/lib/rbac/usePermission");
vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/tenant/TenantContext");

const sampleAlert: EmergencyAlert = {
  id: "alert-101",
  societyId: "soc-1",
  triggeredByUserId: "guard-user-1",
  triggeredByName: "Ramesh Security",
  emergencyType: "FIRE",
  severity: "CRITICAL",
  title: "Electrical Smoke in Tower B Shaft",
  instructions: "Evacuate via staircases immediately.",
  status: "ACTIVE",
  createdAt: "2026-11-25T10:00:00Z",
  updatedAt: "2026-11-25T10:00:00Z",
};

const sampleSummary: EmergencyAlertSummary = {
  alertId: "alert-101",
  societyId: "soc-1",
  status: "ACTIVE",
  totalMembers: 120,
  totalResponses: 90,
  safeCount: 70,
  evacuatedCount: 12,
  trappedCount: 2,
  needsAssistanceCount: 6,
  unaccountedCount: 30,
  generatedAt: "2026-11-25T10:05:00Z",
};

const sampleAcks: EmergencySafetyAcknowledgment[] = [
  {
    id: "ack-1",
    societyId: "soc-1",
    alertId: "alert-101",
    userId: "res-1",
    userName: "Rohan Sharma",
    safetyStatus: "TRAPPED",
    locationDetails: "Tower B - 402",
    notes: "Smoke in stairwell",
    acknowledgedAt: "2026-11-25T10:03:00Z",
  },
  {
    id: "ack-2",
    societyId: "soc-1",
    alertId: "alert-101",
    userId: "res-2",
    userName: "Meera Nair",
    safetyStatus: "SAFE",
    locationDetails: "Main Lawn",
    acknowledgedAt: "2026-11-25T10:04:00Z",
  },
];

describe("Web Emergency SOS Console & Global Banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      societies: [],
      currentSociety: {
        societyId: "soc-1",
        societyCode: "EMR-001",
        societyName: "Emerald Heights",
        status: "ACTIVE",
        membershipId: "mem-1",
        membershipStatus: "ACTIVE",
        roles: ["SOCIETY_ADMIN"],
        permissions: ["*"],
        isPlatformAdmin: false,
      },
      activeSocietyId: "soc-1",
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: {
        id: "admin-user-1",
        fullName: "Admin User",
        mobileNumber: "+919999999999",
        status: "ACTIVE",
      } as any,
      isAuthenticated: true,
      isLoading: false,
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    vi.spyOn(endpoints.settings, "getSetting").mockImplementation(async (key: string) => {
      if (key === "society.contact.emergency_phone") {
        return { key, value: "+91 98000 11223" };
      }
      return { key, value: "Central Clubhouse Lawn" };
    });
  });

  it("Global EmergencyAlertBanner renders active alert with summary and supports self check-in", async () => {
    vi.spyOn(endpoints.emergencies, "getAlerts").mockResolvedValue([sampleAlert]);
    vi.spyOn(endpoints.emergencies, "getSummary").mockResolvedValue(sampleSummary);
    vi.spyOn(endpoints.emergencies, "getMySafetyStatus").mockResolvedValue(null);
    const checkInSpy = vi
      .spyOn(endpoints.emergencies, "submitSafetyStatus")
      .mockResolvedValue(sampleAcks[1]);

    render(<EmergencyAlertBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("global-emergency-banner")).toBeDefined();
      expect(screen.getByText("Electrical Smoke in Tower B Shaft")).toBeDefined();
      expect(screen.getByText(/82 Safe/i)).toBeDefined();
      expect(screen.getByText(/8 Need Help/i)).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /I'm Safe/i }));

    await waitFor(() => {
      expect(checkInSpy).toHaveBeenCalledWith("alert-101", {
        safetyStatus: "SAFE",
        locationDetails: "Society Admin Web Desk",
      });
    });
  });

  it("Global EmergencyAlertBanner stays hidden when no active alert exists", async () => {
    vi.spyOn(endpoints.emergencies, "getAlerts").mockResolvedValue([]);

    const { container } = render(<EmergencyAlertBanner />);

    await waitFor(() => {
      expect(endpoints.emergencies.getAlerts).toHaveBeenCalled();
    });
    expect(container.firstChild).toBeNull();
  });

  it("EmergenciesPage denies unauthorized users and displays live muster + rescue queue for Society Admin", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: false,
      isPlatformAdmin: false,
      isSocietyAdmin: false,
      isAccountant: false,
      isWebAuthorized: false,
      permissions: [],
      roles: ["RESIDENT"],
      hasPermission: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false),
      canAccessModule: vi.fn().mockReturnValue(false),
    });

    const { unmount } = render(<EmergenciesPage />);
    expect(screen.getByText(/Access Restricted/i)).toBeDefined();
    unmount();

    // Now render as Society Admin
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: false,
      isPlatformAdmin: false,
      isSocietyAdmin: true,
      isAccountant: false,
      isWebAuthorized: true,
      permissions: [
        "emergency.alert.view",
        "emergency.alert.create",
        "emergency.alert.manage",
        "emergency.safety.respond",
      ],
      roles: ["SOCIETY_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn((r: string | string[]) =>
        Array.isArray(r) ? r.includes("SOCIETY_ADMIN") : r === "SOCIETY_ADMIN"
      ),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    vi.spyOn(endpoints.emergencies, "getAlerts").mockResolvedValue([sampleAlert]);
    vi.spyOn(endpoints.emergencies, "getSummary").mockResolvedValue(sampleSummary);
    vi.spyOn(endpoints.emergencies, "getMySafetyStatus").mockResolvedValue(null);
    vi.spyOn(endpoints.emergencies, "getAcknowledgments").mockResolvedValue(sampleAcks);
    const resolveSpy = vi
      .spyOn(endpoints.emergencies, "resolveAlert")
      .mockResolvedValue({ ...sampleAlert, status: "RESOLVED" });

    render(<EmergenciesPage />);

    await waitFor(() => {
      expect(screen.getByText("Central Clubhouse Lawn")).toBeDefined();
      expect(screen.getByText("+91 98000 11223")).toBeDefined();
      expect(screen.getByText("82")).toBeDefined(); // 70 safe + 12 evacuated
      expect(screen.getByText("8")).toBeDefined(); // 2 trapped + 6 needsAssistance
      expect(screen.getByText("Rohan Sharma")).toBeDefined();
      expect(screen.getByText("Tower B - 402")).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Mark All Clear/i }));
    fireEvent.click(screen.getByRole("button", { name: /Confirm All Clear/i }));

    await waitFor(() => {
      expect(resolveSpy).toHaveBeenCalledWith("alert-101", { resolutionNotes: undefined });
    });
  });

  it("Accountant sees muster roll and can check in, without Resolve/Cancel authority controls", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: false,
      isPlatformAdmin: false,
      isSocietyAdmin: false,
      isAccountant: true,
      isWebAuthorized: true,
      permissions: ["emergency.alert.view", "emergency.alert.create", "emergency.safety.respond"],
      roles: ["ACCOUNTANT"],
      hasPermission: vi.fn((p: string) =>
        ["emergency.alert.view", "emergency.alert.create", "emergency.safety.respond"].includes(p)
      ),
      hasRole: vi.fn((r: string | string[]) =>
        Array.isArray(r) ? r.includes("ACCOUNTANT") : r === "ACCOUNTANT"
      ),
      canAccessModule: vi.fn((m: string) => m === "emergencies"),
    });

    vi.spyOn(endpoints.emergencies, "getAlerts").mockResolvedValue([sampleAlert]);
    vi.spyOn(endpoints.emergencies, "getSummary").mockResolvedValue(sampleSummary);
    vi.spyOn(endpoints.emergencies, "getMySafetyStatus").mockResolvedValue(null);

    render(<EmergenciesPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText("Electrical Smoke in Tower B Shaft").length
      ).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /I'm Safe/i })).toBeDefined();
    });

    expect(screen.queryByRole("button", { name: /Mark All Clear/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Cancel False Alarm/i })).toBeNull();
    expect(screen.queryByText(/Rescue Dispatch & Safety Roster/i)).toBeNull();
  });
});
