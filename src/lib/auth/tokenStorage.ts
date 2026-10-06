const ACCESS_TOKEN_KEY = "girvasa_access_token";
const REFRESH_TOKEN_KEY = "girvasa_refresh_token";
const ACTIVE_SOCIETY_KEY = "girvasa_active_society_id";

class TokenStorage {
  private memoryAccessToken: string | null = null;

  getAccessToken(): string | null {
    if (this.memoryAccessToken) {
      return this.memoryAccessToken;
    }
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  setAccessToken(token: string): void {
    this.memoryAccessToken = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  clearTokens(): void {
    this.memoryAccessToken = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  getActiveSocietyId(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACTIVE_SOCIETY_KEY);
    }
    return null;
  }

  setActiveSocietyId(societyId: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_SOCIETY_KEY, societyId);
    }
  }

  clearActiveSocietyId(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_SOCIETY_KEY);
    }
  }
}

export const tokenStorage = new TokenStorage();
