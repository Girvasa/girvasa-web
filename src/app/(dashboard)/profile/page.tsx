"use client";

import React from "react";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Key,
  Smartphone,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { currentSociety } = useTenant();

  const assignedRoles = currentSociety?.roles && currentSociety.roles.length > 0
    ? currentSociety.roles
    : ["MEMBER"];

  const granularPermissions = currentSociety?.permissions || [];

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[#131b2e]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#47464f] uppercase tracking-wider">
            <span>Identity &amp; Governance</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787680]" />
            <span className="text-[#070235] font-bold">User Dossier &amp; Access Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#070235] mt-1">
            User Profile &amp; Access Credentials
          </h1>
          <p className="text-xs sm:text-sm text-[#47464f] mt-0.5">
            Personal identity verification, role-based access control (RBAC), and active session attributes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
            Authenticated Session Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Personal info & Society context */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Identity Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-[#070235]">Personal Identity Details</span>
              <span className="text-xs text-[#787680]">Girvasa Identity Service</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#070235] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-[#070235]">
                  {user?.fullName || "Member User"}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#47464f]">
                  <span className="font-mono text-slate-400">UID: {user?.id?.substring(0, 12) || "—"}</span>
                  <span>•</span>
                  <span className="text-[#006a61] font-semibold">
                    {assignedRoles[0] || "Resident"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[#787680] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#006a61]" /> Registered Mobile
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#131b2e]">
                    {user?.mobileNumber || "—"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    OTP Verified
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[#787680] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#006a61]" /> Email Address
                </span>
                <span className="font-medium text-xs text-[#131b2e] block truncate">
                  {user?.email || "No email linked"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[#787680] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#006a61]" /> Society Induction Date
                </span>
                <span className="font-medium text-xs text-[#131b2e] block">
                  {user?.createdAt ? formatDate(user.createdAt) : "Active Account"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[#787680] text-[10px] uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#006a61]" /> Active Society Tenant
                </span>
                <span className="font-medium text-xs text-[#131b2e] block truncate">
                  {currentSociety?.societyName || "Active Society Context"}
                </span>
              </div>
            </div>
          </div>

          {/* Session Security Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-[#070235]">Active Session &amp; Hardware Token</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Session Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#070235]" />
                <div>
                  <span className="font-bold text-[#131b2e] block">Girvasa Portal Session</span>
                  <span className="text-slate-400 text-[10px]">Secure HTTPS Transport • Authenticated User Context</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Permissions Matrix */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#070235]" />
                <h3 className="text-sm font-bold text-[#070235]">Assigned Roles &amp; Authorizations</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#86f2e4]/30 text-[#006f66] text-[10px] font-bold">
                {assignedRoles.length} Roles
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#787680] block mb-2">
                Society Tenant Roles
              </span>
              <div className="flex flex-wrap gap-2">
                {assignedRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-lg bg-[#070235] text-white text-xs font-bold shadow-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#787680] block">
                Active Granular Permissions ({granularPermissions.length} Capabilities)
              </span>
              {granularPermissions.length > 0 ? (
                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs">
                  {granularPermissions.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-100/60 font-mono text-[11px] text-[#070235]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#006a61] shrink-0" />
                      <span className="font-semibold">{perm}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
                  <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-700">No Granular Permissions Assigned</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Permissions are inherited from your society roles.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
