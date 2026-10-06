import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { endpoints } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/auth/tokenStorage";

describe("AuthContext lifecycle", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
    vi.restoreAllMocks();
  });

  it("should request OTP challenge via endpoints.auth.requestOtp", async () => {
    vi.spyOn(endpoints.auth, "requestOtp").mockResolvedValue({
      challengeId: "ch-123",
      expiresInSeconds: 300,
      message: "OTP dispatched",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.requestOtp("+919876543210");
    });

    expect(endpoints.auth.requestOtp).toHaveBeenCalledWith("+919876543210");
    expect(response.message).toBe("OTP dispatched");
  });

  it("should verify OTP, store JWT tokens, and populate authenticated user", async () => {
    vi.spyOn(endpoints.auth, "verifyOtp").mockResolvedValue({
      accessToken: "mocked-access-token",
      refreshToken: "mocked-refresh-token",
      expiresInSeconds: 900,
      user: {
        id: "user-123",
        mobileNumber: "+919876543210",
        status: "ACTIVE",
      },
    });

    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "user-123",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      fullName: "Admin User",
      email: "admin@girvasa.io",
      status: "ACTIVE",
      createdAt: "2026-09-27T10:00:00Z",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verifyOtp("+919876543210", "123456");
    });

    expect(tokenStorage.getAccessToken()).toBe("mocked-access-token");
    expect(tokenStorage.getRefreshToken()).toBe("mocked-refresh-token");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.fullName).toBe("Admin User");
  });

  it("should clear tokens on logout", async () => {
    tokenStorage.setAccessToken("active-token");
    tokenStorage.setActiveSocietyId("active-soc");
    vi.spyOn(endpoints.auth, "logout").mockResolvedValue({ message: "Logged out" });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getActiveSocietyId()).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
