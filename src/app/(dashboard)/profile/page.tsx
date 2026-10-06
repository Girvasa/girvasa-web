"use client";

import React from "react";
import { User, Phone, Mail, ShieldCheck, Calendar } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { currentSociety } = useTenant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">User Profile & Access Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Personal identity details, verified contact attributes, and role permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Personal Information" subtitle="Platform-wide identity profile">
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-500/20">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.fullName || "Authenticated Resident"}</h3>
                <span className="text-[11px] text-slate-500">ID: {user?.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Mobile Number
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-medium text-slate-900">{user?.mobileNumber}</span>
                {user?.phoneVerified && <Badge variant="success">Verified</Badge>}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Email Address
              </span>
              <span className="text-slate-900">{user?.email || "Not specified"}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Account Created
              </span>
              <span className="text-slate-900">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </Card>

        <Card title="Society Roles & Authorizations" subtitle="Active tenant permissions">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Assigned Society Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {currentSociety?.roles?.map((role) => (
                  <Badge key={role} variant="info">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-slate-400 block mb-1.5">Active Functional Permissions</span>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1">
                {currentSociety?.permissions?.map((perm) => (
                  <div key={perm} className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
