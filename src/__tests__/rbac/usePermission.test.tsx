import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermission } from "@/lib/rbac/usePermission";
import * as TenantContextModule from "@/lib/tenant/TenantContext";

describe("usePermission RBAC evaluation", () => {
  it("should evaluate permissions and roles accurately for regular society admin", () => {
    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      societies: [],
      currentSociety: {
        societyId: "soc-1",
        societyCode: "SOC-001",
        societyName: "Emerald Heights",
        status: "ACTIVE",
        membershipId: "mem-1",
        membershipStatus: "ACTIVE",
        roles: ["SOCIETY_ADMIN"],
        permissions: ["billing.view", "billing.create", "payment.view", "resident.view"],
        isPlatformAdmin: false,
      },
      activeSocietyId: "soc-1",
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.hasPermission("billing.view")).toBe(true);
    expect(result.current.hasPermission("audit.delete")).toBe(false);
    expect(result.current.hasRole("SOCIETY_ADMIN")).toBe(true);
    expect(result.current.hasRole("SECURITY_GUARD")).toBe(false);
    expect(result.current.canAccessModule("billing")).toBe(true);
    expect(result.current.canAccessModule("residents")).toBe(true);
  });

  it("should permit all operations when user isPlatformAdmin", () => {
    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      societies: [],
      currentSociety: {
        societyId: "soc-2",
        societyCode: "SOC-002",
        societyName: "Grand Residency",
        status: "ACTIVE",
        membershipId: "mem-2",
        membershipStatus: "ACTIVE",
        roles: ["PLATFORM_SUPER_ADMIN"],
        permissions: [],
        isPlatformAdmin: true,
      },
      activeSocietyId: "soc-2",
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.hasPermission("any.arbitrary.permission")).toBe(true);
    expect(result.current.hasRole("ANY_ROLE")).toBe(true);
    expect(result.current.canAccessModule("audit")).toBe(true);
  });
});
