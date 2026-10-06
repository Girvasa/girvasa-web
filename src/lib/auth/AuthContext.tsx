"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserResponse, OtpResponseDto } from "@/types/auth";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "./tokenStorage";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (mobileNumber: string) => Promise<OtpResponseDto>;
  verifyOtp: (mobileNumber: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await endpoints.auth.getCurrentUser();
      setUser(userData);
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const requestOtp = async (mobileNumber: string): Promise<OtpResponseDto> => {
    return await endpoints.auth.requestOtp(mobileNumber);
  };

  const verifyOtp = async (mobileNumber: string, otpCode: string): Promise<void> => {
    const tokens = await endpoints.auth.verifyOtp(mobileNumber, otpCode);
    if (tokens.accessToken) {
      tokenStorage.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      tokenStorage.setRefreshToken(tokens.refreshToken);
    }
    await refreshUser();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
