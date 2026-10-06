"use client";

import React from "react";
import { Building2, Shield, MapPin, Globe } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function SettingsPage() {
  const { currentSociety } = useTenant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Society Settings & Metadata</h1>
        <p className="text-xs text-slate-500 mt-1">
          Housing society registration details, legal entity information, and tenant configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tenant Society Identity" subtitle="Core registration identifiers">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Society Display Name</span>
              <span className="text-base font-bold text-slate-900">
                {currentSociety?.societyName || "Housing Society"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Legal Entity Registered Name</span>
              <span className="font-semibold text-slate-800">
                {currentSociety?.legalName || currentSociety?.societyName || "—"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Society Tenant Code</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {currentSociety?.societyCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tenant Status</span>
                <Badge variant="success">{currentSociety?.status || "ACTIVE"}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Geographic & Postal Location" subtitle="Registered physical society address">
          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  {currentSociety?.city}, {currentSociety?.state}
                </span>
                <span className="text-slate-500">
                  Postal Code: {currentSociety?.pincode || "—"} • Country: {currentSociety?.countryCode || "IN"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">Multi-Tenant Isolation Enforced</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                All data, accounting ledgers, gate logs, and member profiles are strictly bound to this tenant context.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
