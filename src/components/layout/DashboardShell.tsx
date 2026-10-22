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
import { Loader2 } from "lucide-react";

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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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
  );
};
