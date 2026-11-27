"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { UserResponse, OtpResponseDto } from "@/types/auth";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "./tokenStorage";
import { broadcastSessionEvent, registerSessionSync, claimPrimaryTab, isPrimaryTab, getTabId } from "./sessionSync";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTabSuperseded?: boolean;
  claimCurrentTab?: () => void;
  requestOtp: (mobileNumber: string, channel?: "SMS" | "WHATSAPP") => Promise<OtpResponseDto>;
  verifyOtp: (mobileNumber: string, otpCode: string, requestId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTabSuperseded, setIsTabSuperseded] = useState<boolean>(false);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  // Keep an active reference to `user` so cross-tab session listeners don't require `user` in dependency arrays
  const userRef = useRef<UserResponse | null>(user);
  userRef.current = user;

  // Deduplicate in-flight profile queries to prevent parallel request spam
  const inFlightRefreshRef = useRef<Promise<void> | null>(null);

  const claimCurrentTab = useCallback(() => {
    claimPrimaryTab();
    setIsTabSuperseded(false);
  }, []);

  /**
   * Passive profile refresh to synchronize authenticated user state.
   * Isolated from login/credentials verification; guards against concurrent execution
   * and terminates session gracefully if user is banned (SUSPENDED / DEACTIVATED).
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Reuse existing in-flight request if one is already pending
    if (inFlightRefreshRef.current) {
      return inFlightRefreshRef.current;
    }

    const refreshPromise = (async () => {
      try {
        const userData = await endpoints.auth.getCurrentUser();

        // Ensure token wasn't cleared while awaiting response
        if (!tokenStorage.getAccessToken()) {
          setUser(null);
          return;
        }

        // Handle banned / suspended / deactivated accounts immediately
        if (userData.status === "SUSPENDED" || userData.status === "DEACTIVATED") {
          tokenStorage.clearTokens();
          tokenStorage.clearActiveSocietyId();
          setUser(null);
          if (typeof window !== "undefined") {
            try {
              window.location.href = "/login?error=account_suspended";
            } catch {
              // jsdom navigation fallback
            }
          }
          return;
        }

        setUser(userData);
      } catch (err: any) {
        // If 401 Unauthorized or 403 Forbidden (banned or invalid token), wipe session
        if (err?.status === 401 || err?.status === 403) {
          tokenStorage.clearTokens();
          tokenStorage.clearActiveSocietyId();
          setUser(null);
        } else if (!tokenStorage.getAccessToken()) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
        inFlightRefreshRef.current = null;
      }
    })();

    inFlightRefreshRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  useEffect(() => {
    // Only attempt session restoration on mount if access token exists
    if (tokenStorage.getAccessToken()) {
      refreshUser();
      if (!isPrimaryTab()) {
        setIsTabSuperseded(true);
      } else {
        claimPrimaryTab();
      }
    } else {
      setIsLoading(false);
    }

    const unbind = registerSessionSync({
      onLogin: () => {
        // Received login event from another tab: synchronize session
        refreshUser();
      },
      onLogout: () => {
        tokenStorage.clearTokens();
        tokenStorage.clearActiveSocietyId();
        setUser(null);
        setIsTabSuperseded(false);
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const publicPaths = ["/", "/login", "/register", "/about", "/features", "/pricing", "/contact", "/demo", "/privacy", "/terms"];
          if (!publicPaths.includes(path)) {
            try {
              window.location.href = "/login";
            } catch {
              // jsdom navigation environment fallback
            }
          }
        }
      },
      onSyncCheck: () => {
        // Check session consistency across background tabs without adding `user` to effect dependencies
        const token = tokenStorage.getAccessToken();
        if (token && !userRef.current) {
          refreshUser();
        } else if (!token && userRef.current) {
          setUser(null);
        }
      },
      onTabSuperseded: () => {
        if (tokenStorage.getAccessToken()) {
          setIsTabSuperseded(true);
        }
      },
      onTabRestored: () => {
        setIsTabSuperseded(false);
      },
    });

    return unbind;
  }, [refreshUser]);

  const requestOtp = async (mobileNumber: string, channel: "SMS" | "WHATSAPP" = "SMS"): Promise<OtpResponseDto> => {
    const res = await endpoints.auth.requestOtp(mobileNumber, channel);
    const challengeId = res.requestId || res.challengeId;
    if (challengeId) {
      setLastRequestId(challengeId);
    }
    return res;
  };

  /**
   * Explicit isolated login handler.
   * Authenticates OTP challenge, verifies account status, seeds credentials, and sets primary tab.
   */
  const verifyOtp = async (mobileNumber: string, otpCode: string, requestId?: string): Promise<void> => {
    const effectiveRequestId = requestId || lastRequestId || undefined;
    const tokens = await endpoints.auth.verifyOtp(mobileNumber, otpCode, effectiveRequestId);

    // Reject banned / suspended accounts before persisting tokens
    if (tokens.user && (tokens.user.status === "SUSPENDED" || tokens.user.status === "DEACTIVATED")) {
      tokenStorage.clearTokens();
      tokenStorage.clearActiveSocietyId();
      setUser(null);
      throw new Error(`Your account is ${tokens.user.status.toLowerCase()}. Please contact society management.`);
    }

    if (tokens.accessToken) {
      tokenStorage.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      tokenStorage.setRefreshToken(tokens.refreshToken);
    }
    claimPrimaryTab();
    setIsTabSuperseded(false);

    // Populate user profile for the newly established session
    await refreshUser();
    broadcastSessionEvent("SESSION_LOGIN");
  };

  const logout = async () => {
    try {
      await endpoints.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clearTokens();
      tokenStorage.clearActiveSocietyId();
      setUser(null);
      setIsTabSuperseded(false);
      broadcastSessionEvent("SESSION_LOGOUT");
      if (typeof window !== "undefined") {
        try {
          window.location.href = "/login";
        } catch {
          // jsdom navigation environment fallback
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isTabSuperseded,
        claimCurrentTab,
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
      {isTabSuperseded && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Active in Another Tab</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Girvasa is currently active in another browser tab or window. To maintain transaction integrity and prevent state conflicts, only one web tab can be active at a time.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={claimCurrentTab}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Use Girvasa in This Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isTabSuperseded: false,
  claimCurrentTab: () => {},
  requestOtp: async () => ({}),
  verifyOtp: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
