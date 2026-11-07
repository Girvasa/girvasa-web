import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { TenantProvider, useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { endpoints } from "@/lib/api/endpoints";

describe("Super Admin Authentication & RBAC Verification", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
    vi.restoreAllMocks();
  });

  it("should perform Super Admin OTP request and verification seamlessly", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <TenantProvider>{children}</TenantProvider>
      </AuthProvider>
    );

    const { result } = renderHook(
      () => {
        const auth = useAuth();
        const tenant = useTenant();
        const rbac = usePermission();
        return { auth, tenant, rbac };
      },
      { wrapper }
    );

    // Initial state: unauthenticated
    expect(result.current.auth.isAuthenticated).toBe(false);
    expect(result.current.rbac.isWebAuthorized).toBe(false);

    // 1. Super Admin requests OTP challenge
    let otpResponse: any;
    await act(async () => {
      otpResponse = await result.current.auth.requestOtp("+919876543210", "SMS");
    });

    expect(otpResponse).toBeDefined();
    expect(otpResponse.requestId || otpResponse.challengeId).toBeDefined();

    // 2. Super Admin verifies OTP code 123456
    await act(async () => {
      await result.current.auth.verifyOtp("+919876543210", "123456");
    });

    // 3. Verify authenticated user identity
    expect(result.current.auth.isAuthenticated).toBe(true);
    expect(result.current.auth.user).toBeDefined();
    expect(result.current.auth.user?.fullName).toContain("Super Admin");
    expect(tokenStorage.getAccessToken()).toBeTruthy();

    // 4. Verify Society Tenant Context for Super Admin
    await act(async () => {
      await result.current.tenant.refreshTenant();
    });

    expect(result.current.tenant.currentSociety).toBeDefined();
    expect(result.current.tenant.currentSociety?.roles).toContain("PLATFORM_SUPER_ADMIN");
    expect(result.current.tenant.currentSociety?.isPlatformAdmin).toBe(true);

    // 5. Verify RBAC permissions for Platform Super Admin
    expect(result.current.rbac.isPlatformSuperAdmin).toBe(true);
    expect(result.current.rbac.isWebAuthorized).toBe(true);

    // Platform Super Admin must have unrestricted access across ALL modules
    expect(result.current.rbac.canAccessModule("dashboard")).toBe(true);
    expect(result.current.rbac.canAccessModule("platform_watch")).toBe(true);
    expect(result.current.rbac.canAccessModule("audit")).toBe(true);
    expect(result.current.rbac.canAccessModule("billing")).toBe(true);
    expect(result.current.rbac.canAccessModule("residents")).toBe(true);
    expect(result.current.rbac.canAccessModule("settings")).toBe(true);
    expect(result.current.rbac.canAccessModule("complaints")).toBe(true);
    expect(result.current.rbac.canAccessModule("visitors")).toBe(true);
  });
});
