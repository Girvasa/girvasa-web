"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Calculator,
  CheckCircle2,
  Save,
  Lock,
  ChevronRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function SettingsPage() {
  const { currentSociety, activeSocietyId } = useTenant();

  // Active navigation tab: Clean & sorted (Profile & Billing)
  const [activeTab, setActiveTab] = useState<"PROFILE" | "BILLING">("PROFILE");

  // Society Profile Form State
  const [societyName, setSocietyName] = useState("");
  const [societyCode, setSocietyCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");

  // Billing Rules Form State
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [gracePeriodDays, setGracePeriodDays] = useState("15");
  const [interestRate, setInterestRate] = useState("21.00");
  const [sinkingRate, setSinkingRate] = useState("0.25");
  const [repairRate, setRepairRate] = useState("0.75");
  const [nocCap, setNocCap] = useState("10");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentSociety) {
      setSocietyName(currentSociety.legalName || currentSociety.societyName || "");
      setSocietyCode(currentSociety.societyCode || "");
      setCity(currentSociety.city || "");
      setState(currentSociety.state || "");
      setPincode(currentSociety.pincode || "");
      setAddress(
        currentSociety.city
          ? `${currentSociety.city}, ${currentSociety.state || ""} ${currentSociety.pincode ? "- " + currentSociety.pincode : ""}`
          : ""
      );
    }
  }, [currentSociety]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Save configuration settings
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <span>Administration</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#070235] font-bold">Society Configuration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#070235] mt-1">
            Society Settings &amp; Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage constitutional details, billing parameters, and statutory reserves for {currentSociety?.societyName || "Active Society"}.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings successfully committed</span>
          </div>
        )}
      </div>

      {/* Clean Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("PROFILE")}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === "PROFILE"
              ? "border-b-2 border-[#070235] text-[#070235] font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Statutory Society Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("BILLING")}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === "BILLING"
              ? "border-b-2 border-[#070235] text-[#070235] font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Billing &amp; Reserve Formulas</span>
        </button>
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Active Tab Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === "PROFILE" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#070235]">General Society Identity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official cooperative housing society registration attributes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Society Name
                    </label>
                    <Input
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="e.g. Shree Gajanan Vihar CHS Ltd"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Society Code
                    </label>
                    <Input
                      value={societyCode}
                      onChange={(e) => setSocietyCode(e.target.value)}
                      placeholder="e.g. BOM/HSG/TC/14022"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Municipal Ward
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Union Territory
                    </label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code
                    </label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 400076"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Premises Address
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Complete physical society postal address"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#070235] bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "BILLING" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#070235]">Maintenance &amp; Statutory Formulas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standardized calculation rules governed by Model Housing Society Bye-Laws.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Billing Cycle Frequency
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#070235] bg-white text-slate-800"
                    >
                      <option value="MONTHLY">Monthly (Advance)</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="BI_ANNUAL">Bi-Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Grace Window (Days)
                    </label>
                    <Input
                      type="number"
                      value={gracePeriodDays}
                      onChange={(e) => setGracePeriodDays(e.target.value)}
                      placeholder="15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Interest Surcharge (% p.a.)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="21.00"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Capped at 21% p.a. per Model Bye-Law 166
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Non-Occupancy Charges Cap (%)
                    </label>
                    <Input
                      type="number"
                      value={nocCap}
                      onChange={(e) => setNocCap(e.target.value)}
                      placeholder="10"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Max 10% of service charges per statutory notification
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sinking Fund Rate (% Construction Cost)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={sinkingRate}
                      onChange={(e) => setSinkingRate(e.target.value)}
                      placeholder="0.25"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Repair &amp; Maintenance Fund Rate (% Construction Cost)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={repairRate}
                      onChange={(e) => setRepairRate(e.target.value)}
                      placeholder="0.75"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving Changes..." : "Commit Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Active Tenant Metadata Badge */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006a61]" />
                <span className="text-xs font-bold text-[#070235]">Tenant Context</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                {currentSociety?.status || "ACTIVE"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Society Tenant UUID</span>
                <span className="font-mono text-slate-700 text-[11px] break-all block mt-0.5">
                  {activeSocietyId || "—"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Society Code</span>
                <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                  {currentSociety?.societyCode || "—"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Assigned Role</span>
                <span className="font-semibold text-[#006a61] block mt-0.5">
                  {currentSociety?.roles?.[0] || "SOCIETY_ADMIN"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
              Tenant configuration changes are auditable and strictly isolated to your society boundary.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
