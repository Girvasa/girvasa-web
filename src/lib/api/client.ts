import { ProblemDetail } from "@/types/api";
import { tokenStorage } from "../auth/tokenStorage";

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

function normalizeBaseUrl(raw?: string): string {
  let url = (raw || "").trim();
  if (!url) return "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1";
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
}

const DEFAULT_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://r68trjbh-8080.usw3.devtunnels.ms/api/v1"
);

export class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  getBaseUrl(): string {
    if (typeof window !== "undefined") {
      const custom =
        (window as any).__GIRVASA_API_BASE_URL__ ||
        localStorage.getItem("girvasa_api_base_url");
      if (custom) return normalizeBaseUrl(custom);
    }
    return this.baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = normalizeBaseUrl(url);
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private subscribeTokenRefresh(cb: (token: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private generateRequestId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "req-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth, skipTenant, headers, ...customConfig } = options;

    let url = endpoint.startsWith("http")
      ? endpoint
      : `${this.getBaseUrl()}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

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
    try {
      response = await fetch(url, config);
    } catch (networkErr: any) {
      console.error("API Network Error:", networkErr, "Target URL:", url);
      throw new ApiError(0, "Network error: unable to reach the Girvasa API service.");
    }

    // Handle 401 Unauthorized with token refresh
    if (response.status === 401 && !skipAuth && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/otp")) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshRes = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newAccessToken = refreshData.data?.accessToken;
              const newRefreshToken = refreshData.data?.refreshToken;
              if (newAccessToken) {
                tokenStorage.setAccessToken(newAccessToken);
                if (newRefreshToken) {
                  tokenStorage.setRefreshToken(newRefreshToken);
                }
                this.isRefreshing = false;
                this.onTokenRefreshed(newAccessToken);
              } else {
                throw new Error("No access token returned");
              }
            } else {
              throw new Error("Refresh token expired");
            }
          } catch {
            this.isRefreshing = false;
            this.onTokenRefreshed(null);
            tokenStorage.clearTokens();
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              try {
                window.location.href = "/login";
              } catch {
                // jsdom navigation fallback
              }
            }
            throw new ApiError(401, "Session expired. Please log in again.");
          }
        }

        // Wait for token refresh completion
        return new Promise<T>((resolve, reject) => {
          this.subscribeTokenRefresh(async (newToken) => {
            if (newToken) {
              try {
                const retriedConfig = {
                  ...config,
                  headers: {
                    ...requestHeaders,
                    Authorization: `Bearer ${newToken}`,
                  },
                };
                const retriedResponse = await fetch(url, retriedConfig);
                const data = await this.parseResponse<T>(retriedResponse);
                resolve(data);
              } catch (retryErr) {
                reject(retryErr);
              }
            } else {
              reject(new ApiError(401, "Authentication session expired."));
            }
          });
        });
      } else {
        tokenStorage.clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          try {
            window.location.href = "/login";
          } catch {
            // jsdom navigation fallback
          }
        }
        throw new ApiError(401, "Authentication required. Please log in.");
      }
    }

    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
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
