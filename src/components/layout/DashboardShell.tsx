"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SubscriptionAlertBanner } from "@/components/subscription/SubscriptionAlertBanner";
import { WebAccessGatekeeper } from "./WebAccessGatekeeper";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { Loader2, Eye, LogOut } from "lucide-react";

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoadingTenant } = useTenant();
  const { isWebAuthorized } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const [impersonation, setImpersonation] = useState<{
    targetUserName: string;
    targetRole: string;
    targetSocietyName: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("girvasa_impersonation");
      if (raw) {
        try {
          setImpersonation(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleExitImpersonation = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("girvasa_impersonation");
      const backupToken = localStorage.getItem("girvasa_super_admin_backup_token");
      if (backupToken) {
        localStorage.setItem("girvasa_access_token", backupToken);
        localStorage.removeItem("girvasa_super_admin_backup_token");
      }
      window.location.href = "/platform/admin";
    }
  };

  if (isLoading || isLoadingTenant) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#107A48] text-white font-bold shadow-lg shadow-[#107A48]/30">
            G
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#107A48]" />
          <p className="text-xs font-medium text-slate-500">Initializing Girvasa Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Restrict web application access to Society Admin, Accountant, and Platform Super Admin
  if (!isWebAuthorized) {
    return <WebAccessGatekeeper />;
  }


  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      {/* Ghost Support Mode Persistent Impersonation Banner */}
      {impersonation && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse text-slate-950" />
            <span>
              GHOST SUPPORT MODE: You are currently impersonating <span className="underline">{impersonation.targetUserName}</span> ({impersonation.targetRole}) in {impersonation.targetSocietyName}. All mutations are tagged with Super Admin audit trace.
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 bg-slate-950 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Impersonation</span>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <SubscriptionAlertBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

