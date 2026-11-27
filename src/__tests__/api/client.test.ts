import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ApiClient, ApiError } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import * as sessionSync from "@/lib/auth/sessionSync";

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient("http://localhost:8080/api/v1");
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should attach Authorization and X-Society-Id headers when tokens exist", async () => {
    tokenStorage.setAccessToken("jwt-bearer-token");
    tokenStorage.setActiveSocietyId("soc-uuid-111");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: { id: "123", name: "Test" } }),
    });
    global.fetch = fetchMock;

    const result = await client.get<any>("/test-endpoint");

    expect(fetchMock).toHaveBeenCalled();
    const callArgs = fetchMock.mock.calls[0];
    const headers = callArgs[1].headers;

    expect(headers["Authorization"]).toBe("Bearer jwt-bearer-token");
    expect(headers["X-Society-Id"]).toBe("soc-uuid-111");
    expect(headers["X-Request-Id"]).toBeDefined();
    expect(result).toEqual({ id: "123", name: "Test" });
  });

  it("should parse RFC 9457 ProblemDetail and throw ApiError on 400 Bad Request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers({ "content-type": "application/problem+json" }),
      json: async () => ({
        type: "https://api.girvasa.io/errors/invalid-parameter",
        title: "Bad Request",
        status: 400,
        code: "INVALID_PARAMETER",
        detail: "Unit ID is required",
        requestId: "req-err-999",
      }),
    });
    global.fetch = fetchMock;

    await expect(client.get("/invalid")).rejects.toThrow(ApiError);

    try {
      await client.get("/invalid");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(400);
      expect(err.code).toBe("INVALID_PARAMETER");
      expect(err.detail).toBe("Unit ID is required");
      expect(err.requestId).toBe("req-err-999");
    }
  });

  it("should throw ApiError with 403 on Access Denied without logging credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: new Headers({ "content-type": "application/problem+json" }),
      json: async () => ({
        type: "https://api.girvasa.io/errors/access-denied",
        title: "Forbidden",
        status: 403,
        code: "ACCESS_DENIED",
        detail: "Caller lacks billing.view permission in this society.",
      }),
    });
    global.fetch = fetchMock;

    try {
      await client.get("/billing/bills");
    } catch (err: any) {
      expect(err.status).toBe(403);
      expect(err.code).toBe("ACCESS_DENIED");
    }
  });

  it("should failover to fallback Dev Tunnel URL when primary encounters a network error", async () => {
    const fallbackClient = new ApiClient(
      "http://localhost:8080/api/v1",
      "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1"
    );

    const fetchMock = vi
      .fn()
      // First call (localhost) fails with connection refused
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      // Second call (Dev Tunnel fallback) succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: { status: "UP", service: "girvasa-backend" } }),
      });
    global.fetch = fetchMock;

    const result = await fallbackClient.get<any>("/health");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // 1st call went to localhost
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/v1/health");
    // 2nd call went to dev tunnel fallback
    expect(fetchMock.mock.calls[1][0]).toBe("https://r68trjbh-8080.usw3.devtunnels.ms/api/v1/health");
    expect(result).toEqual({ status: "UP", service: "girvasa-backend" });
    expect(fallbackClient.isFallbackActive()).toBe(true);
  });

  it("should route subsequent requests directly to fallback Dev Tunnel during cooldown", async () => {
    const fallbackClient = new ApiClient(
      "http://localhost:8080/api/v1",
      "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1"
    );

    const fetchMock = vi
      .fn()
      // First request: primary fails, fallback succeeds
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: { ping: "pong1" } }),
      })
      // Second request: directly hits fallback without trying localhost
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: { ping: "pong2" } }),
      });
    global.fetch = fetchMock;

    await fallbackClient.get<any>("/ping");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Second request
    const result2 = await fallbackClient.get<any>("/ping");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // 3rd overall call went directly to fallback URL
    expect(fetchMock.mock.calls[2][0]).toBe("https://r68trjbh-8080.usw3.devtunnels.ms/api/v1/ping");
    expect(result2).toEqual({ ping: "pong2" });
  });

  it("should failover to fallback URL when primary returns HTTP 502/503 Bad Gateway", async () => {
    const fallbackClient = new ApiClient(
      "http://localhost:8080/api/v1",
      "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1"
    );

    const fetchMock = vi
      .fn()
      // Primary returns 502 Bad Gateway
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers(),
        text: async () => "Bad Gateway",
      })
      // Fallback returns 200 OK
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: { message: "recovered" } }),
      });
    global.fetch = fetchMock;

    const result = await fallbackClient.get<any>("/service");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/v1/service");
    expect(fetchMock.mock.calls[1][0]).toBe("https://r68trjbh-8080.usw3.devtunnels.ms/api/v1/service");
    expect(result).toEqual({ message: "recovered" });
  });

  it("should reset to primary URL when resetToPrimary is called", () => {
    const fallbackClient = new ApiClient(
      "http://localhost:8080/api/v1",
      "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1"
    );

    (fallbackClient as any).fallbackActive = true;
    (fallbackClient as any).lastPrimaryFailureTime = Date.now();
    expect(fallbackClient.isFallbackActive()).toBe(true);

    fallbackClient.resetToPrimary();
    expect(fallbackClient.isFallbackActive()).toBe(false);
    expect(fallbackClient.getBaseUrl()).toBe("http://localhost:8080/api/v1");
  });

  it("should coalesce concurrent 401 responses into one refresh request and broadcast SESSION_TOKEN_REFRESH", async () => {
    tokenStorage.setAccessToken("expired-access-token");
    tokenStorage.setRefreshToken("valid-refresh-token");
    tokenStorage.setActiveSocietyId("soc-100");

    const broadcastSpy = vi.spyOn(sessionSync, "broadcastSessionEvent");

    const lockNames: string[] = [];
    const originalLocks = (navigator as any).locks;
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (name: string, cb: () => Promise<any>) => {
          lockNames.push(name);
          return await cb();
        },
      },
    });

    try {
      let refreshCount = 0;
      const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const auth = (init?.headers as Record<string, string>)?.["Authorization"];
        if (url.endsWith("/auth/refresh")) {
          refreshCount++;
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              data: {
                accessToken: "fresh-access-token",
                refreshToken: "rotated-refresh-token",
              },
            }),
          };
        }
        if (auth === "Bearer expired-access-token") {
          return {
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            headers: new Headers({ "content-type": "application/problem+json" }),
            json: async () => ({ status: 401, code: "UNAUTHORIZED", detail: "Token expired" }),
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ data: { ok: true, endpoint: url } }),
        };
      });
      global.fetch = fetchMock;

      const [resA, resB] = await Promise.all([
        client.get<any>("/bills"),
        client.get<any>("/notices"),
      ]);

      expect(refreshCount).toBe(1);
      expect(lockNames).toEqual(["girvasa_auth_refresh_lock"]);
      expect(tokenStorage.getAccessToken()).toBe("fresh-access-token");
      expect(tokenStorage.getRefreshToken()).toBe("rotated-refresh-token");
      expect(broadcastSpy).toHaveBeenCalledWith("SESSION_TOKEN_REFRESH");
      expect(resA).toEqual({ ok: true, endpoint: "http://localhost:8080/api/v1/bills" });
      expect(resB).toEqual({ ok: true, endpoint: "http://localhost:8080/api/v1/notices" });
    } finally {
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
    }
  });

  it("should reuse token refreshed by another tab once cross-tab lock is acquired", async () => {
    tokenStorage.setAccessToken("stale-access-token");
    tokenStorage.setRefreshToken("old-refresh-token");

    const originalLocks = (navigator as any).locks;
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (_name: string, cb: () => Promise<any>) => {
          // Simulate sibling tab completing token rotation before this tab executes callback
          tokenStorage.setAccessToken("sibling-tab-access-token");
          tokenStorage.setRefreshToken("sibling-tab-refresh-token");
          return await cb();
        },
      },
    });

    try {
      const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        const auth = (init?.headers as Record<string, string>)?.["Authorization"];
        if (auth === "Bearer stale-access-token") {
          return {
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            headers: new Headers({ "content-type": "application/problem+json" }),
            json: async () => ({ status: 401, code: "UNAUTHORIZED", detail: "Token expired" }),
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ data: { verifiedWith: auth } }),
        };
      });
      global.fetch = fetchMock;

      const result = await client.get<any>("/me");
      const calledUrls = fetchMock.mock.calls.map((c) => c[0]);
      expect(calledUrls.some((u) => String(u).includes("/auth/refresh"))).toBe(false);
      expect(result).toEqual({ verifiedWith: "Bearer sibling-tab-access-token" });
    } finally {
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
    }
  });

  it("should clear tokens, clear active society ID, and broadcast SESSION_LOGOUT when refresh fails", async () => {
    tokenStorage.setAccessToken("expired-access-token");
    tokenStorage.setRefreshToken("revoked-refresh-token");
    tokenStorage.setActiveSocietyId("soc-999");

    const broadcastSpy = vi.spyOn(sessionSync, "broadcastSessionEvent");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: new Headers({ "content-type": "application/problem+json" }),
      json: async () => ({ status: 401, code: "TOKEN_REVOKED", detail: "Session revoked" }),
    });

    await expect(client.get("/me")).rejects.toThrow(ApiError);
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.getActiveSocietyId()).toBeNull();
    expect(broadcastSpy).toHaveBeenCalledWith("SESSION_LOGOUT");
  });
});
