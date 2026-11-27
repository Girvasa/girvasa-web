import { ProblemDetail } from "@/types/api";
import { tokenStorage } from "../auth/tokenStorage";
import { broadcastSessionEvent } from "../auth/sessionSync";
import { getDevMockResponse } from "./devMockData";

export class ApiError extends Error {
  status: number;
  code?: string;
  title?: string;
  detail: string;
  requestId?: string;
  errors?: ProblemDetail["errors"];

  constructor(status: number, detail: string, problem?: ProblemDetail) {
    super(detail || "An unexpected error occurred");
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    if (problem) {
      this.code = problem.code;
      this.title = problem.title;
      this.requestId = problem.requestId;
      this.errors = problem.errors || problem.invalidParams;
    }
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  skipTenant?: boolean;
}

export const DEV_TUNNEL_FALLBACK_URL = "https://girvasa-backend-dev.onrender.com/api/v1";
export const DEFAULT_PRIMARY_URL = "http://localhost:8080/api/v1";

function normalizeBaseUrl(raw?: string, defaultFallback: string = DEFAULT_PRIMARY_URL): string {
  let url = (raw || "").trim();
  if (!url) return defaultFallback;
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
}

const PRIMARY_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_PRIMARY_URL,
  DEFAULT_PRIMARY_URL
);

const FALLBACK_BASE_URL = process.env.NEXT_PUBLIC_API_FALLBACK_URL
  ? normalizeBaseUrl(process.env.NEXT_PUBLIC_API_FALLBACK_URL, PRIMARY_BASE_URL)
  : process.env.NODE_ENV !== "production"
  ? normalizeBaseUrl(DEV_TUNNEL_FALLBACK_URL, DEV_TUNNEL_FALLBACK_URL)
  : "";

export class ApiClient {
  private primaryUrl: string;
  private fallbackUrl: string;
  private fallbackActive: boolean = false;
  private lastPrimaryFailureTime: number = 0;
  private readonly PRIMARY_COOLDOWN_MS: number = 30000;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(
    baseUrl: string = PRIMARY_BASE_URL,
    fallbackUrl: string = FALLBACK_BASE_URL
  ) {
    this.primaryUrl = normalizeBaseUrl(baseUrl, DEFAULT_PRIMARY_URL);
    this.fallbackUrl = fallbackUrl ? normalizeBaseUrl(fallbackUrl, "") : "";
  }

  isFallbackActive(): boolean {
    if (!this.fallbackUrl || this.primaryUrl === this.fallbackUrl) {
      return false;
    }
    if (!this.fallbackActive) {
      return false;
    }
    const now = Date.now();
    if (now - this.lastPrimaryFailureTime > this.PRIMARY_COOLDOWN_MS) {
      // Cooldown expired; give primary another opportunity
      this.fallbackActive = false;
      return false;
    }
    return true;
  }

  resetToPrimary(): void {
    this.fallbackActive = false;
    this.lastPrimaryFailureTime = 0;
  }

  getPrimaryUrl(): string {
    return this.primaryUrl;
  }

  getFallbackUrl(): string {
    return this.fallbackUrl;
  }

  getBaseUrl(): string {
    if (typeof window !== "undefined") {
      const custom =
        (window as any).__GIRVASA_API_BASE_URL__ ||
        localStorage.getItem("girvasa_api_base_url");
      if (custom) return normalizeBaseUrl(custom, this.primaryUrl);
    }
    return this.isFallbackActive() ? this.fallbackUrl : this.primaryUrl;
  }

  setBaseUrl(url: string) {
    this.primaryUrl = normalizeBaseUrl(url, DEFAULT_PRIMARY_URL);
    this.resetToPrimary();
  }

  setFallbackUrl(url: string) {
    this.fallbackUrl = normalizeBaseUrl(url, DEV_TUNNEL_FALLBACK_URL);
  }

  private async withCrossTabRefreshLock<R>(fn: () => Promise<R>): Promise<R> {
    const locks =
      typeof navigator !== "undefined"
        ? (
            navigator as Navigator & {
              locks?: {
                request: <T>(
                  name: string,
                  callback: () => Promise<T>
                ) => Promise<T>;
              };
            }
          ).locks
        : undefined;
    if (locks?.request) {
      return locks.request("girvasa_auth_refresh_lock", fn);
    }
    return fn();
  }

  private extractBearerToken(headers: Record<string, string>): string | undefined {
    const auth = headers["Authorization"] || headers["authorization"];
    if (!auth) return undefined;
    return auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;
  }

  private performSingleFlightRefresh(
    staleAccessToken?: string
  ): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.withCrossTabRefreshLock(async () => {
      // Re-read storage after acquiring the cross-tab lock in case another tab rotated tokens.
      const latestAccessToken = tokenStorage.getAccessToken();
      if (
        latestAccessToken &&
        staleAccessToken &&
        latestAccessToken !== staleAccessToken
      ) {
        return latestAccessToken;
      }

      const latestRefreshToken = tokenStorage.getRefreshToken();
      if (!latestRefreshToken) {
        return null;
      }

      const refreshRes = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Tunnel-Skip-Anti-Phishing-Page": "true",
        },
        body: JSON.stringify({
          refreshToken: latestRefreshToken,
          clientType: "WEB",
        }),
      });

      if (!refreshRes.ok) {
        return null;
      }

      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.data?.accessToken as string | undefined;
      const newRefreshToken = refreshData.data?.refreshToken as string | undefined;
      if (!newAccessToken) {
        return null;
      }

      tokenStorage.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        tokenStorage.setRefreshToken(newRefreshToken);
      }
      broadcastSessionEvent("SESSION_TOKEN_REFRESH");
      return newAccessToken;
    })
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private redirectToLoginOnExpiredSession(): void {
    tokenStorage.clearTokens();
    tokenStorage.clearActiveSocietyId();
    broadcastSessionEvent("SESSION_LOGOUT");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      try {
        window.location.href = "/login";
      } catch {
        // jsdom navigation fallback
      }
    }
  }

  private generateRequestId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "req-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
  }

  private buildUrl(endpoint: string, base: string): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      if (endpoint.startsWith(this.primaryUrl)) {
        return endpoint.replace(this.primaryUrl, base);
      }
      if (endpoint.startsWith(this.fallbackUrl)) {
        return endpoint.replace(this.fallbackUrl, base);
      }
      return endpoint;
    }
    return `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth, skipTenant, headers, ...customConfig } = options;

    const currentBase = this.getBaseUrl();
    let url = this.buildUrl(endpoint, currentBase);

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Request-Id": this.generateRequestId(),
      "X-Tunnel-Skip-Anti-Phishing-Page": "true",
    };

    if (!skipAuth) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    if (!skipTenant) {
      const societyId = tokenStorage.getActiveSocietyId();
      if (societyId) {
        requestHeaders["X-Society-Id"] = societyId;
      }
    }

    if (headers) {
      Object.assign(requestHeaders, headers);
    }

    const config: RequestInit = {
      ...customConfig,
      headers: requestHeaders,
    };

    let response: Response;
    const canFallback =
      Boolean(this.fallbackUrl) &&
      this.fallbackUrl !== this.primaryUrl &&
      !this.isFallbackActive();

function createTimeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortController === "undefined") return undefined;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    if (typeof (timer as any)?.unref === "function") {
      (timer as any).unref();
    }
    return controller.signal;
  } catch {
    return undefined;
  }
}

    try {
      const fetchConfig =
        this.isFallbackActive() && !config.signal
          ? { ...config, signal: createTimeoutSignal(3000) }
          : config;
      response = await fetch(url, fetchConfig);
      if (!response) {
        throw new Error("No response from primary API");
      }

      // If primary returned a bad gateway / gateway timeout (502, 503, 504), fail over
      if (canFallback && (response.status === 502 || response.status === 503 || response.status === 504)) {
        console.warn(
          `[ApiClient] Primary API (${this.primaryUrl}) returned HTTP ${response.status}. Retrying via fallback Dev Tunnel (${this.fallbackUrl})...`
        );
        this.fallbackActive = true;
        this.lastPrimaryFailureTime = Date.now();
        const fallbackTargetUrl = url.includes("?")
          ? `${this.buildUrl(endpoint, this.fallbackUrl)}?${url.split("?")[1]}`
          : this.buildUrl(endpoint, this.fallbackUrl);
        response = await fetch(fallbackTargetUrl, config);
        if (!response) {
          throw new Error("No response from fallback API");
        }
      }
    } catch (networkErr: any) {
      if (canFallback) {
        console.warn(
          `[ApiClient] Primary API (${this.primaryUrl}) is unreachable (${networkErr?.message || networkErr}). Failing over to Dev Tunnel (${this.fallbackUrl})...`
        );
        this.fallbackActive = true;
        this.lastPrimaryFailureTime = Date.now();
        const fallbackTargetUrl = url.includes("?")
          ? `${this.buildUrl(endpoint, this.fallbackUrl)}?${url.split("?")[1]}`
          : this.buildUrl(endpoint, this.fallbackUrl);

        try {
          const timeoutSignal = !config.signal ? createTimeoutSignal(3000) : config.signal;
          response = await fetch(fallbackTargetUrl, { ...config, signal: timeoutSignal });
          if (!response) {
            throw new Error("No response from fallback API");
          }
        } catch (fallbackErr: any) {
          console.error("API Fallback Network Error:", fallbackErr, "Target URL:", fallbackTargetUrl);
          if (process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_ENABLE_DEV_MOCKS === "true") {
            const devMock = getDevMockResponse<T>(endpoint, { ...options, ...customConfig });
            if (devMock !== undefined) {
              console.info(`[ApiClient] Both servers unreachable. Serving offline dev mock for: ${endpoint}`);
              return devMock;
            }
          }
          throw new ApiError(0, "Network error: unable to reach both primary and fallback Girvasa API services.");
        }
      } else {
        console.error("API Network Error:", networkErr, "Target URL:", url);
        if (process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_ENABLE_DEV_MOCKS === "true") {
          const devMock = getDevMockResponse<T>(endpoint, { ...options, ...customConfig });
          if (devMock !== undefined) {
            console.info(`[ApiClient] Primary server unreachable. Serving offline dev mock for: ${endpoint}`);
            return devMock;
          }
        }
        throw new ApiError(0, "Network error: unable to reach the Girvasa API service.");
      }
    }

    if (!response) {
      if (process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_ENABLE_DEV_MOCKS === "true") {
        const devMock = getDevMockResponse<T>(endpoint, { ...options, ...customConfig });
        if (devMock !== undefined) {
          return devMock;
        }
      }
      throw new ApiError(0, "Network error: unable to reach the Girvasa API service.");
    }

    // Handle 401 Unauthorized with cross-tab single-flight token refresh
    if (
      response.status === 401 &&
      !skipAuth &&
      !endpoint.includes("/auth/refresh") &&
      !endpoint.includes("/auth/otp")
    ) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        this.redirectToLoginOnExpiredSession();
        throw new ApiError(401, "Authentication required. Please log in.");
      }

      const staleAccessToken = this.extractBearerToken(
        requestHeaders as Record<string, string>
      );
      const newToken = await this.performSingleFlightRefresh(staleAccessToken);
      if (!newToken) {
        this.redirectToLoginOnExpiredSession();
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      const retriedConfig = {
        ...config,
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${newToken}`,
        },
      };
      const retriedUrl = url.includes("?")
        ? `${this.buildUrl(endpoint, this.getBaseUrl())}?${url.split("?")[1]}`
        : this.buildUrl(endpoint, this.getBaseUrl());
      const retriedResponse = await fetch(retriedUrl, retriedConfig);
      return this.parseResponse<T>(retriedResponse, endpoint, {
        ...options,
        ...customConfig,
      });
    }

    return this.parseResponse<T>(response, endpoint, { ...options, ...customConfig });
  }

  private async parseResponse<T>(response: Response, endpoint?: string, options?: any): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    let payload: any;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      if (response.status === 402 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("subscription:updated", {
            detail: { expired: true, code: payload?.code || "SUBSCRIPTION_EXPIRED" },
          })
        );
      }

      if (
        (process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_ENABLE_DEV_MOCKS === "true") &&
        response.status >= 502 &&
        response.status <= 504 &&
        endpoint
      ) {
        const devMock = getDevMockResponse<T>(endpoint, options);
        if (devMock !== undefined) {
          console.info(`[ApiClient] Gateway HTTP ${response.status}: serving offline dev mock for ${endpoint}`);
          return devMock;
        }
      }

      if (payload && typeof payload === "object") {
        const detail =
          payload.detail ||
          payload.message ||
          (payload.errors && payload.errors[0]?.message) ||
          response.statusText ||
          "Request failed";
        throw new ApiError(response.status, detail, payload);
      }
      throw new ApiError(response.status, response.statusText || "Request failed");
    }

    if (payload && typeof payload === "object" && "data" in payload) {
      return payload.data as T;
    }

    return payload as T;
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
