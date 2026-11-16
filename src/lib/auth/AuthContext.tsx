"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const claimCurrentTab = useCallback(() => {
    claimPrimaryTab();
    setIsTabSuperseded(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await endpoints.auth.getCurrentUser();
      if (tokenStorage.getAccessToken()) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    if (tokenStorage.getAccessToken()) {
      if (!isPrimaryTab()) {
        setIsTabSuperseded(true);
      } else {
        claimPrimaryTab();
      }
    }

    const unbind = registerSessionSync({
      onLogin: () => {
        refreshUser();
      },
      onLogout: () => {
        tokenStorage.clearTokens();
        tokenStorage.clearActiveSocietyId();
        setUser(null);
        setIsTabSuperseded(false);
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (
            path.startsWith("/dashboard") ||
            path.startsWith("/platform") ||
            path.startsWith("/billing") ||
            path.startsWith("/residents") ||
            path.startsWith("/settings") ||
            path.startsWith("/audit") ||
            path.startsWith("/units")
          ) {
            try {
              window.location.href = "/login";
            } catch {
              // jsdom navigation environment fallback
            }
          }
        }
      },
      onSyncCheck: () => {
        const token = tokenStorage.getAccessToken();
        if (token && !user) {
          refreshUser();
        } else if (!token && user) {
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
  }, [refreshUser, user]);

  const requestOtp = async (mobileNumber: string, channel: "SMS" | "WHATSAPP" = "SMS"): Promise<OtpResponseDto> => {
    const res = await endpoints.auth.requestOtp(mobileNumber, channel);
    const challengeId = res.requestId || res.challengeId;
    if (challengeId) {
      setLastRequestId(challengeId);
    }
    return res;
  };

  const verifyOtp = async (mobileNumber: string, otpCode: string, requestId?: string): Promise<void> => {
    const effectiveRequestId = requestId || lastRequestId || undefined;
    const tokens = await endpoints.auth.verifyOtp(mobileNumber, otpCode, effectiveRequestId);
    if (tokens.accessToken) {
      tokenStorage.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      tokenStorage.setRefreshToken(tokens.refreshToken);
    }
    claimPrimaryTab();
    setIsTabSuperseded(false);
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
