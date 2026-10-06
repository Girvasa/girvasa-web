import { describe, it, expect, beforeEach } from "vitest";
import { tokenStorage } from "@/lib/auth/tokenStorage";

describe("TokenStorage", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
  });

  it("should store and retrieve access token", () => {
    tokenStorage.setAccessToken("test-access-token-123");
    expect(tokenStorage.getAccessToken()).toBe("test-access-token-123");
  });

  it("should store and retrieve refresh token", () => {
    tokenStorage.setRefreshToken("test-refresh-token-456");
    expect(tokenStorage.getRefreshToken()).toBe("test-refresh-token-456");
  });

  it("should clear all tokens upon logout", () => {
    tokenStorage.setAccessToken("test-access-token");
    tokenStorage.setRefreshToken("test-refresh-token");
    tokenStorage.clearTokens();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("should store and retrieve active society ID", () => {
    const societyId = "77c59573-f938-4bbf-85f2-959c279430c6";
    tokenStorage.setActiveSocietyId(societyId);
    expect(tokenStorage.getActiveSocietyId()).toBe(societyId);

    tokenStorage.clearActiveSocietyId();
    expect(tokenStorage.getActiveSocietyId()).toBeNull();
  });
});
