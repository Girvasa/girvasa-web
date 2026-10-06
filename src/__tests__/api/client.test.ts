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
});
