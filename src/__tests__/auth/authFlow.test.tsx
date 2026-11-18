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

  it("should request OTP challenge via SMS and WhatsApp endpoints.auth.requestOtp", async () => {
    const spy = vi.spyOn(endpoints.auth, "requestOtp").mockResolvedValue({
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

    expect(spy).toHaveBeenCalledWith("+919876543210", "SMS");
    expect(response.message).toBe("OTP dispatched");

    // Test WhatsApp channel
    await act(async () => {
      await result.current.requestOtp("+919876543210", "WHATSAPP");
    });
    expect(spy).toHaveBeenCalledWith("+919876543210", "WHATSAPP");
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

  it("should not re-trigger refreshUser endlessly when user state is updated (no infinite loop)", async () => {
    tokenStorage.setAccessToken("valid-token");
    const getMeSpy = vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "user-123",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      fullName: "Stable User",
      status: "ACTIVE",
      createdAt: "2026-09-27T10:00:00Z",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial mount effect to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.user?.fullName).toBe("Stable User");
    // Crucial check: getCurrentUser was called exactly once on mount, NOT in an infinite loop
    expect(getMeSpy).toHaveBeenCalledTimes(1);
  });

  it("should deduplicate concurrent refreshUser invocations to prevent request flooding", async () => {
    tokenStorage.setAccessToken("valid-token");
    let callCount = 0;
    vi.spyOn(endpoints.auth, "getCurrentUser").mockImplementation(async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 30));
      return {
        id: "user-123",
        mobileNumber: "+919876543210",
        phoneVerified: true,
        status: "ACTIVE",
        createdAt: "2026-09-27T10:00:00Z",
      };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Trigger multiple concurrent refresh calls simultaneously
    await act(async () => {
      await Promise.all([
        result.current.refreshUser(),
        result.current.refreshUser(),
        result.current.refreshUser(),
      ]);
    });

    // In-flight deduplication ensures only one API query was sent
    expect(callCount).toBe(1);
  });

  it("should immediately revoke tokens and refuse login if user account is suspended", async () => {
    vi.spyOn(endpoints.auth, "verifyOtp").mockResolvedValue({
      accessToken: "suspended-access-token",
      refreshToken: "suspended-refresh-token",
      expiresInSeconds: 900,
      user: {
        id: "user-banned",
        mobileNumber: "+919876543210",
        status: "SUSPENDED",
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.verifyOtp("+919876543210", "123456");
      })
    ).rejects.toThrow(/suspended/i);

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should clear session and tokens if getCurrentUser returns suspended or deactivated status", async () => {
    tokenStorage.setAccessToken("active-token");
    tokenStorage.setActiveSocietyId("active-soc");

    vi.spyOn(endpoints.auth, "getCurrentUser").mockResolvedValue({
      id: "user-123",
      mobileNumber: "+919876543210",
      phoneVerified: true,
      status: "DEACTIVATED",
      createdAt: "2026-09-27T10:00:00Z",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getActiveSocietyId()).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
