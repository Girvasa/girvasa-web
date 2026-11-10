"use client";

import React from "react";
import { Smartphone, ShieldAlert, LogOut, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTenant } from "@/lib/tenant/TenantContext";
import { Button } from "@/components/common/Button";

export const WebAccessGatekeeper: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentSociety, societies, switchSociety } = useTenant();

  // Find other societies where the user has an Admin or Accountant role
  const adminSocieties = (societies || []).filter((soc) => {
    if (soc.societyId === currentSociety?.societyId) return false;
    const socRoles = soc.roles || [];
    return socRoles.some((r) =>
      ["SOCIETY_ADMIN", "COMMITTEE_MEMBER", "FACILITY_MANAGER", "ACCOUNTANT", "PLATFORM_SUPER_ADMIN"].includes(r)
    );
  });

  const currentRole = currentSociety?.roles?.[0] || "RESIDENT";

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <header className="mx-auto w-full max-w-4xl flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#107A48] text-white font-bold shadow-md shadow-[#107A48]/20">
            G
          </div>
          <div>
            <div className="font-bold text-slate-900 text-lg tracking-tight leading-none">GIRVASA</div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-[#107A48] mt-0.5">Society OS</div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Gatekeeper Card */}
      <main className="mx-auto w-full max-w-2xl my-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center">
          {/* Badge & Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#107A48] ring-8 ring-emerald-50/50">
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mobile App Access Only</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Web Portal is Reserved for Administrators & Accountants
          </h1>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            The Girvasa Web App is an ERP management workstation designed exclusively for{" "}
            <span className="font-semibold text-slate-800">Society Secretaries / Admins</span> and{" "}
            <span className="font-semibold text-slate-800">Accountants</span>.
          </p>

          {/* Current Membership Context */}
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left max-w-md mx-auto">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current Session Context
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {currentSociety?.societyName || "Society Workspace"}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Code: {currentSociety?.societyCode || "—"}
                </div>
              </div>
              <span className="inline-flex items-center rounded-lg bg-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-700">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Role Instructions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#107A48]" />
                <span>For Residents</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-normal">
                Pay maintenance dues, approve visitor entry, raise complaint tickets, and book amenities directly on the Girvasa Mobile App.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>For Security Guards</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-normal">
                Use the dedicated Gate OS Mobile / Tablet kiosk at the guardhouse for visitor check-in, pass validation, and boom barriers.
              </p>
            </div>
          </div>

          {/* Switch society option if available */}
          {adminSocieties.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6 text-left max-w-md mx-auto">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                You have administrative access in other societies:
              </div>
              <div className="space-y-2">
                {adminSocieties.map((soc) => (
                  <button
                    key={soc.societyId}
                    onClick={() => switchSociety(soc.societyId)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 hover:border-[#107A48] hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-[#107A48]" />
                      <span>{soc.societyName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({soc.societyCode})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sign Out CTA */}
          <div className="mt-8">
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-4xl border-t border-slate-200/80 pt-4 text-center text-xs text-slate-400">
        Girvasa Society OS • Multi-Tenant Enterprise Platform
      </footer>
    </div>
  );
};
