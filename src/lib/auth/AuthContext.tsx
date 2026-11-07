"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserResponse, OtpResponseDto } from "@/types/auth";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "./tokenStorage";
import { broadcastSessionEvent, registerSessionSync } from "./sessionSync";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (mobileNumber: string, channel?: "SMS" | "WHATSAPP") => Promise<OtpResponseDto>;
  verifyOtp: (mobileNumber: string, otpCode: string, requestId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

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

    const unbind = registerSessionSync({
      onLogin: () => {
        refreshUser();
      },
      onLogout: () => {
        tokenStorage.clearTokens();
        tokenStorage.clearActiveSocietyId();
        setUser(null);
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
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  requestOtp: async () => ({}),
  verifyOtp: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
