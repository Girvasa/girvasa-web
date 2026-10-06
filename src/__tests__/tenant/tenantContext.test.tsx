import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TenantProvider, useTenant } from "@/lib/tenant/TenantContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { endpoints } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/auth/tokenStorage";

describe("TenantContext isolation & switching", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
    vi.restoreAllMocks();
  });

  it("should discover user societies and resolve active tenant context", async () => {
    tokenStorage.setAccessToken("valid-token");

    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "user-1",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      fullName: "Society Admin",
      status: "ACTIVE",
      createdAt: "2026-09-27T10:00:00Z",
    });

    vi.spyOn(endpoints.tenant, "getUserSocieties").mockResolvedValue([
      {
        societyId: "soc-1",
        societyCode: "SOC-001",
        societyName: "Palm Grove",
        roles: ["SOCIETY_ADMIN"],
        membershipStatus: "ACTIVE",
        joinedAt: "2026-09-27T10:00:00Z",
      },
      {
        societyId: "soc-2",
        societyCode: "SOC-002",
        societyName: "Silver Oaks",
        roles: ["RESIDENT"],
        membershipStatus: "ACTIVE",
        joinedAt: "2026-09-28T10:00:00Z",
      },
    ]);

    vi.spyOn(endpoints.tenant, "getCurrentSocietyContext").mockResolvedValue({
      societyId: "soc-1",
      societyCode: "SOC-001",
      societyName: "Palm Grove",
      status: "ACTIVE",
      membershipId: "mem-1",
      membershipStatus: "ACTIVE",
      roles: ["SOCIETY_ADMIN"],
      permissions: ["billing.view"],
      isPlatformAdmin: false,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <TenantProvider>{children}</TenantProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useTenant(), { wrapper });

    await act(async () => {
      await result.current.refreshTenant();
    });

    expect(result.current.societies).toHaveLength(2);
    expect(result.current.currentSociety?.societyCode).toBe("SOC-001");
    expect(tokenStorage.getActiveSocietyId()).toBe("soc-1");
  });

  it("should switch society context safely without leaking cross-tenant state", async () => {
    tokenStorage.setAccessToken("valid-token");

    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "user-1",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      fullName: "Society Admin",
      status: "ACTIVE",
      createdAt: "2026-09-27T10:00:00Z",
    });

    vi.spyOn(endpoints.tenant, "getUserSocieties").mockResolvedValue([
      {
        societyId: "soc-1",
        societyCode: "SOC-001",
        societyName: "Palm Grove",
        roles: ["SOCIETY_ADMIN"],
        membershipStatus: "ACTIVE",
        joinedAt: "2026-09-27T10:00:00Z",
      },
      {
        societyId: "soc-2",
        societyCode: "SOC-002",
        societyName: "Silver Oaks",
        roles: ["RESIDENT"],
        membershipStatus: "ACTIVE",
        joinedAt: "2026-09-28T10:00:00Z",
      },
    ]);

    vi.spyOn(endpoints.tenant, "getCurrentSocietyContext").mockImplementation(async () => {
      const activeId = tokenStorage.getActiveSocietyId();
      if (activeId === "soc-2") {
        return {
          societyId: "soc-2",
          societyCode: "SOC-002",
          societyName: "Silver Oaks",
          status: "ACTIVE",
          membershipId: "mem-2",
          membershipStatus: "ACTIVE",
          roles: ["RESIDENT"],
          permissions: [],
          isPlatformAdmin: false,
        };
      }
      return {
        societyId: "soc-1",
        societyCode: "SOC-001",
        societyName: "Palm Grove",
        status: "ACTIVE",
        membershipId: "mem-1",
        membershipStatus: "ACTIVE",
        roles: ["SOCIETY_ADMIN"],
        permissions: ["billing.view"],
        isPlatformAdmin: false,
      };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <TenantProvider>{children}</TenantProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useTenant(), { wrapper });

    await act(async () => {
      await result.current.refreshTenant();
    });

    expect(result.current.currentSociety?.societyCode).toBe("SOC-001");

    await act(async () => {
      await result.current.switchSociety("soc-2");
    });

    expect(tokenStorage.getActiveSocietyId()).toBe("soc-2");
    expect(result.current.currentSociety?.societyCode).toBe("SOC-002");
    expect(result.current.currentSociety?.roles).toEqual(["RESIDENT"]);
  });
});
