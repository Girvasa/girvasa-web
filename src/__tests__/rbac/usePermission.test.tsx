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
    expect(result.current.isWebAuthorized).toBe(true);
    expect(result.current.isSocietyAdmin).toBe(true);
    expect(result.current.isAccountant).toBe(false);
    expect(result.current.isPlatformSuperAdmin).toBe(false);

    // Can access administrative and financial modules
    expect(result.current.canAccessModule("dashboard")).toBe(true);
    expect(result.current.canAccessModule("buildings")).toBe(true);
    expect(result.current.canAccessModule("units")).toBe(true);
    expect(result.current.canAccessModule("residents")).toBe(true);
    expect(result.current.canAccessModule("billing")).toBe(true);
    expect(result.current.canAccessModule("payments")).toBe(true);
    expect(result.current.canAccessModule("reports")).toBe(true);
    expect(result.current.canAccessModule("complaints")).toBe(true);
    expect(result.current.canAccessModule("settings")).toBe(true);
    expect(result.current.canAccessModule("audit")).toBe(true);

    // Cannot access platform-level developer watch
    expect(result.current.canAccessModule("platform_watch")).toBe(false);
  });

  it("should accurately restrict accountant role to finance and dues reference", () => {
    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      societies: [],
      currentSociety: {
        societyId: "soc-acc",
        societyCode: "SOC-ACC",
        societyName: "Emerald Heights",
        status: "ACTIVE",
        membershipId: "mem-acc",
        membershipStatus: "ACTIVE",
        roles: ["ACCOUNTANT"],
        permissions: ["billing.view", "payment.view"],
        isPlatformAdmin: false,
      },
      activeSocietyId: "soc-acc",
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.isWebAuthorized).toBe(true);
    expect(result.current.isAccountant).toBe(true);
    expect(result.current.isSocietyAdmin).toBe(false);
    expect(result.current.isPlatformSuperAdmin).toBe(false);

    // Accountant CAN access finance, billing, reports, units, and residents
    expect(result.current.canAccessModule("dashboard")).toBe(true);
    expect(result.current.canAccessModule("billing")).toBe(true);
    expect(result.current.canAccessModule("payments")).toBe(true);
    expect(result.current.canAccessModule("reports")).toBe(true);
    expect(result.current.canAccessModule("units")).toBe(true);
    expect(result.current.canAccessModule("residents")).toBe(true);
    expect(result.current.canAccessModule("documents")).toBe(true);

    // Accountant CANNOT access operational governance or platform watch
    expect(result.current.canAccessModule("buildings")).toBe(false);
    expect(result.current.canAccessModule("complaints")).toBe(false);
    expect(result.current.canAccessModule("visitors")).toBe(false);
    expect(result.current.canAccessModule("amenities")).toBe(false);
    expect(result.current.canAccessModule("parking")).toBe(false);
    expect(result.current.canAccessModule("staff")).toBe(false);
    expect(result.current.canAccessModule("vendors")).toBe(false);
    expect(result.current.canAccessModule("settings")).toBe(false);
    expect(result.current.canAccessModule("platform_watch")).toBe(false);
  });

  it("should deny web portal access to resident-only and guard-only users", () => {
    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      societies: [],
      currentSociety: {
        societyId: "soc-res",
        societyCode: "SOC-RES",
        societyName: "Emerald Heights",
        status: "ACTIVE",
        membershipId: "mem-res",
        membershipStatus: "ACTIVE",
        roles: ["RESIDENT"],
        permissions: [],
        isPlatformAdmin: false,
      },
      activeSocietyId: "soc-res",
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.isWebAuthorized).toBe(false);
    expect(result.current.isSocietyAdmin).toBe(false);
    expect(result.current.isAccountant).toBe(false);
    expect(result.current.canAccessModule("dashboard")).toBe(false);
    expect(result.current.canAccessModule("billing")).toBe(false);
    expect(result.current.canAccessModule("settings")).toBe(false);
    expect(result.current.canAccessModule("platform_watch")).toBe(false);
  });

  it("should permit all operations when user isPlatformAdmin or has PLATFORM_SUPER_ADMIN", () => {
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

    expect(result.current.isWebAuthorized).toBe(true);
    expect(result.current.isPlatformSuperAdmin).toBe(true);
    expect(result.current.hasPermission("any.arbitrary.permission")).toBe(true);
    expect(result.current.hasRole("ANY_ROLE")).toBe(true);
    expect(result.current.canAccessModule("audit")).toBe(true);
    expect(result.current.canAccessModule("platform_watch")).toBe(true);
    expect(result.current.canAccessModule("settings")).toBe(true);
    expect(result.current.canAccessModule("billing")).toBe(true);
  });
});
