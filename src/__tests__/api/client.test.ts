import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ApiClient, ApiError } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/tokenStorage";

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
});
