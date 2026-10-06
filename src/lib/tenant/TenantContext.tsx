"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CurrentSocietyContext, UserSocietyMembership } from "@/types/tenant";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "../auth/tokenStorage";
import { useAuth } from "../auth/AuthContext";

interface TenantContextType {
  societies: UserSocietyMembership[];
  currentSociety: CurrentSocietyContext | null;
  activeSocietyId: string | null;
  isLoadingTenant: boolean;
  switchSociety: (societyId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [societies, setSocieties] = useState<UserSocietyMembership[]>([]);
  const [currentSociety, setCurrentSociety] = useState<CurrentSocietyContext | null>(null);
  const [activeSocietyId, setActiveSocietyIdState] = useState<string | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(true);

  const loadCurrentContext = useCallback(async (societyId: string) => {
    tokenStorage.setActiveSocietyId(societyId);
    setActiveSocietyIdState(societyId);
    try {
      const ctx = await endpoints.tenant.getCurrentSocietyContext();
      setCurrentSociety(ctx);
    } catch {
      setCurrentSociety(null);
    }
  }, []);

  const refreshTenant = useCallback(async () => {
    if (!isAuthenticated) {
      setSocieties([]);
      setCurrentSociety(null);
      setActiveSocietyIdState(null);
      setIsLoadingTenant(false);
      return;
    }

    setIsLoadingTenant(true);
    try {
      const userSocieties = await endpoints.tenant.getUserSocieties();
      setSocieties(userSocieties || []);

      if (userSocieties && userSocieties.length > 0) {
        const storedSocietyId = tokenStorage.getActiveSocietyId();
        const validMembership = userSocieties.find((s) => s.societyId === storedSocietyId);
        const targetId = validMembership ? validMembership.societyId : userSocieties[0].societyId;
        await loadCurrentContext(targetId);
      } else {
        tokenStorage.clearActiveSocietyId();
        setActiveSocietyIdState(null);
        setCurrentSociety(null);
      }
    } catch {
      setSocieties([]);
      setCurrentSociety(null);
    } finally {
      setIsLoadingTenant(false);
    }
  }, [isAuthenticated, loadCurrentContext]);

  useEffect(() => {
    refreshTenant();
  }, [refreshTenant]);

  const switchSociety = async (societyId: string) => {
    setIsLoadingTenant(true);
    await loadCurrentContext(societyId);
    setIsLoadingTenant(false);
  };

  return (
    <TenantContext.Provider
      value={{
        societies,
        currentSociety,
        activeSocietyId,
        isLoadingTenant,
        switchSociety,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
