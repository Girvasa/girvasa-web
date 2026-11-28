import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { endpoints } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/auth/tokenStorage";

describe("PIN & Trusted Device Web Auth Flows", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("checkUser forwards persistent browser deviceId and detects trusted PIN configuration", async () => {
    const devId = tokenStorage.getOrCreateDeviceId();
    expect(devId).toBeTruthy();

    const checkSpy = vi.spyOn(endpoints.auth, "checkUser").mockResolvedValue({
      registered: true,
      status: "ACTIVE",
      maskedPhone: "+91******3210",
      recommendedAction: "PROCEED_TO_PIN",
      hasPinConfigured: true,
      deviceTrusted: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: any;
    await act(async () => {
      res = await result.current.checkUser?.("+919876543210");
    });

    expect(checkSpy).toHaveBeenCalledWith("+919876543210");
    expect(res.registered).toBe(true);
    expect(res.hasPinConfigured).toBe(true);
    expect(res.deviceTrusted).toBe(true);
  });

  it("verifyOtp marks needsPinSetup=true when backend indicates PIN is not configured", async () => {
    vi.spyOn(endpoints.auth, "verifyOtp").mockResolvedValue({
      accessToken: "first-login-access",
      refreshToken: "first-login-refresh",
      expiresInSeconds: 604800,
      hasPinConfigured: false,
      deviceTrusted: true,
      user: {
        id: "usr-new-1",
        mobileNumber: "+919876543210",
        status: "ACTIVE",
      },
    });
    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "usr-new-1",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      status: "ACTIVE",
      createdAt: "2026-11-28T00:00:00Z",
    });
    const setupSpy = vi.spyOn(endpoints.auth, "setupPin").mockResolvedValue({
      hasPinConfigured: true,
      deviceTrusted: true,
      message: "PIN configured",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.verifyOtp("+919876543210", "123456");
    });

    expect(result.current.needsPinSetup).toBe(true);

    await act(async () => {
      await result.current.setupPin?.("4927");
    });

    expect(setupSpy).toHaveBeenCalledWith("4927");
    expect(result.current.needsPinSetup).toBe(false);
  });

  it("loginWithPin authenticates cleanly without SMS OTP and reset/change PIN work with OTP", async () => {
    vi.spyOn(endpoints.auth, "loginWithPin").mockResolvedValue({
      accessToken: "pin-access-jwt",
      refreshToken: "pin-refresh-jwt",
      expiresInSeconds: 604800,
      hasPinConfigured: true,
      deviceTrusted: true,
      user: {
        id: "usr-pin-1",
        mobileNumber: "+919876543210",
        status: "ACTIVE",
      },
    });
    vi.spyOn(endpoints.auth, "resetPin").mockResolvedValue({
      accessToken: "reset-access-jwt",
      refreshToken: "reset-refresh-jwt",
      expiresInSeconds: 604800,
      hasPinConfigured: true,
      deviceTrusted: true,
      user: {
        id: "usr-pin-1",
        mobileNumber: "+919876543210",
        status: "ACTIVE",
      },
    });
    vi.spyOn(endpoints.auth, "changePin").mockResolvedValue({
      accessToken: "changed-access-jwt",
      refreshToken: "changed-refresh-jwt",
      expiresInSeconds: 604800,
      hasPinConfigured: true,
      deviceTrusted: true,
      user: {
        id: "usr-pin-1",
        mobileNumber: "+919876543210",
        status: "ACTIVE",
      },
    });
    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "usr-pin-1",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      status: "ACTIVE",
      createdAt: "2026-11-28T00:00:00Z",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginWithPin?.("+919876543210", "4927");
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(tokenStorage.getAccessToken()).toBe("pin-access-jwt");

    await act(async () => {
      await result.current.resetPinWithOtp?.("+919876543210", "654321", "8159");
    });
    expect(tokenStorage.getAccessToken()).toBe("reset-access-jwt");

    await act(async () => {
      await result.current.changePinWithOtp?.("8159", "112233", "7391");
    });
    expect(tokenStorage.getAccessToken()).toBe("changed-access-jwt");
  });
});
