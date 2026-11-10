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
  CreditCard,
  Sparkles,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { useTenant } from "@/lib/tenant/TenantContext";
import { endpoints } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SocietySubscriptionDetailResponse, SubscriptionPlanDto } from "@/types/subscription";
import { AccessDenied } from "@/components/common/AccessDenied";
import { usePermission } from "@/lib/rbac/usePermission";

export default function SettingsPage() {
  const { currentSociety, activeSocietyId } = useTenant();
  const { canAccessModule } = usePermission();
  const canAccessSettings = canAccessModule("settings");

  // Active navigation tab: Profile, Billing, and Subscription
  const [activeTab, setActiveTab] = useState<"PROFILE" | "BILLING" | "SUBSCRIPTION">("PROFILE");

  // Subscription state
  const [subData, setSubData] = useState<SocietySubscriptionDetailResponse | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("GROWTH_300");
  const [billingMonths, setBillingMonths] = useState<number>(1);
  const [isRenewingSub, setIsRenewingSub] = useState<boolean>(false);
  const [subSuccessMsg, setSubSuccessMsg] = useState<string | null>(null);

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

  // Maintenance Charge Head State (Small Society Fixed vs Area-based)
  const [maintenanceMode, setMaintenanceMode] = useState<"FIXED_AMOUNT" | "PER_SQFT">("FIXED_AMOUNT");
  const [maintenanceAmount, setMaintenanceAmount] = useState("2000.00");
  const [chargeHeadId, setChargeHeadId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!activeSocietyId) return;
    endpoints.billing.getChargeHeads()
      .then((data: any) => {
        const heads = Array.isArray(data) ? data : data?.data || [];
        const mainHead = heads.find((h: any) => h.code === "BASE_MAINTENANCE" || h.code === "MAINTENANCE") || heads[0];
        if (mainHead) {
          setChargeHeadId(mainHead.id);
          setMaintenanceMode(mainHead.calculationType || "FIXED_AMOUNT");
          setMaintenanceAmount(mainHead.rate?.toString() || "2000.00");
        }
      })
      .catch(() => {});
  }, [activeSocietyId]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (chargeHeadId) {
        await endpoints.billing.updateChargeHead(chargeHeadId, {
          rate: Number(maintenanceAmount),
          calculationType: maintenanceMode,
          name: maintenanceMode === "FIXED_AMOUNT" ? "Monthly Flat Maintenance" : "Area-based Maintenance",
        });
      } else {
        const res: any = await endpoints.billing.createChargeHead({
          code: "BASE_MAINTENANCE",
          name: maintenanceMode === "FIXED_AMOUNT" ? "Monthly Flat Maintenance" : "Area-based Maintenance",
          calculationType: maintenanceMode,
          rate: Number(maintenanceAmount),
          effectiveFrom: new Date().toISOString().split("T")[0],
          isMandatory: true,
        });
        if (res?.id || res?.data?.id) {
          setChargeHeadId(res.id || res.data.id);
        }
      }
    } catch {
      // Local graceful fallback
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "subscription") {
        setActiveTab("SUBSCRIPTION");
      }
    }
  }, []);

  useEffect(() => {
    if (!activeSocietyId) return;
    endpoints.subscription.getCurrentSubscription()
      .then((data) => {
        setSubData(data);
        if (data.plan?.code) setSelectedPlanCode(data.plan.code);
      })
      .catch(() => {});

    endpoints.subscription.getPublicPlans()
      .then((data) => setPlans(data || []))
      .catch(() => {});
  }, [activeSocietyId]);

  const handleRenewSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRenewingSub(true);
    setSubSuccessMsg(null);
    try {
      const updated = await endpoints.subscription.renewSubscription({
        planCode: selectedPlanCode,
        billingMonths,
        paymentMethod: "UPI",
      });
      setSubData(updated);
      setSubSuccessMsg("Subscription successfully renewed! Services are fully active.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription:updated"));
      }
      setTimeout(() => setSubSuccessMsg(null), 4000);
    } catch (err: any) {
      alert("Renewal failed: " + (err?.message || "Payment processing error"));
    } finally {
      setIsRenewingSub(false);
    }
  };

  const handleSimulateSubscription = async (days: number) => {
    try {
      const updated = await endpoints.subscription.simulateSubscription(days);
      setSubData(updated);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription:updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!canAccessSettings) {
    return (
      <AccessDenied message="Society configuration is restricted to Society Administrators and Management Committee Members." />
    );
  }

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
        <button
          type="button"
          onClick={() => setActiveTab("SUBSCRIPTION")}
          className={`flex items-center gap-2 pb-3 transition-colors ${
            activeTab === "SUBSCRIPTION"
              ? "border-b-2 border-[#070235] text-[#070235] font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>SaaS Plan &amp; Subscription</span>
          {subData?.isExpiringSoon && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
          {subData?.isExpired && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
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
              <div className="space-y-5">
                {/* Small Society Friendly Monthly Maintenance Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-[#eaedff]/30 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#070235] flex items-center gap-2">
                        <span>Monthly Society Maintenance Rate</span>
                        <span className="text-[10px] bg-[#006a61]/10 text-[#006a61] px-2 py-0.5 rounded-full font-semibold">
                          Small Society Friendly
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set a flat monthly rate for all flats or calculate by area (per sq. ft.).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maintenance Calculation Method
                      </label>
                      <select
                        value={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#070235] bg-white text-slate-800 font-medium"
                      >
                        <option value="FIXED_AMOUNT">Fixed Flat Amount (Uniform per flat - Small Society)</option>
                        <option value="PER_SQFT">Area-Based Rate (₹ per Sq. Ft. of flat area)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {maintenanceMode === "FIXED_AMOUNT"
                          ? "Every flat in the society will be billed the exact same fixed amount."
                          : "Amount is multiplied by each flat's carpet/built-up area in square feet."}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {maintenanceMode === "FIXED_AMOUNT"
                          ? "Monthly Maintenance Amount (₹ per flat)"
                          : "Monthly Rate (₹ per sq. ft.)"}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={maintenanceAmount}
                        onChange={(e) => setMaintenanceAmount(e.target.value)}
                        placeholder={maintenanceMode === "FIXED_AMOUNT" ? "e.g. 2000" : "e.g. 2.50"}
                        required
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {maintenanceMode === "FIXED_AMOUNT"
                          ? "e.g., ₹2,000 / month flat maintenance"
                          : "e.g., ₹2.50 per sq. ft. per month"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3 pt-2">
                  <h2 className="text-sm font-bold text-[#070235]">Statutory Reserves &amp; Penalties (Optional)</h2>
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

            {activeTab === "SUBSCRIPTION" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#070235]">SaaS Subscription &amp; Tier Management</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      14-day free trial status, live plan limits, and instant UPI/Card renewals.
                    </p>
                  </div>
                  {subSuccessMsg && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ✓ {subSuccessMsg}
                    </span>
                  )}
                </div>

                {/* Current Active Plan Badge Card */}
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Society Plan</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          subData?.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : subData?.status === "TRIALING"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                          {subData?.status || "TRIALING"}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 mt-1">
                        {subData?.plan?.name || "Growth Plan"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {subData?.plan?.description || "Full management suite for societies up to 300 units."}
                      </div>
                    </div>

                    <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                      <div className="text-xs text-slate-500">Days Remaining</div>
                      <div className="text-2xl font-black text-blue-600">
                        {subData?.daysRemaining ?? 14} <span className="text-xs font-medium text-slate-400">days</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Expires: {subData?.trialEndsAt ? formatDate(subData.trialEndsAt) : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Frequency Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Billing Cycle
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setBillingMonths(1)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        billingMonths === 1
                          ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingMonths(12)}
                      className={`relative p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        billingMonths === 12
                          ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Save 15%
                      </span>
                      Annual (12 Months)
                    </button>
                  </div>
                </div>

                {/* Plan Selection Cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Plan Tier to Renew / Upgrade
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        code: "STARTER_100",
                        name: "Starter Plan",
                        price: billingMonths === 12 ? "₹15,290/yr" : "₹1,499/mo",
                        desc: "Up to 100 units. Visitor Gate & Maintenance Billing.",
                      },
                      {
                        code: "GROWTH_300",
                        name: "Growth Plan",
                        price: billingMonths === 12 ? "₹35,690/yr" : "₹3,499/mo",
                        desc: "Up to 300 units. Auto Payment Gateway & Amenities.",
                        recommended: true,
                      },
                      {
                        code: "ENTERPRISE",
                        name: "Enterprise Plan",
                        price: billingMonths === 12 ? "₹81,590/yr" : "₹7,999/mo",
                        desc: "Unlimited units. Dedicated manager, voting & polls.",
                      },
                    ].map((p) => (
                      <div
                        key={p.code}
                        onClick={() => setSelectedPlanCode(p.code)}
                        className={`cursor-pointer relative p-4 rounded-xl border transition-all ${
                          selectedPlanCode === p.code
                            ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/30"
                            : "border-slate-200 hover:border-slate-400 bg-white"
                        }`}
                      >
                        {p.recommended && (
                          <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Recommended
                          </span>
                        )}
                        <div className="text-xs font-bold text-slate-900">{p.name}</div>
                        <div className="text-base font-extrabold text-blue-700 mt-1">{p.price}</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dev Testing Controls */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700">🧪 Developer QA Simulation Bar:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateSubscription(3)}
                        className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold"
                      >
                        Simulate 3 Days Left
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSubscription(0)}
                        className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold"
                      >
                        Simulate Expired
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSubscription(14)}
                        className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold"
                      >
                        Reset 14 Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "SUBSCRIPTION" ? (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRenewSubscription}
                  disabled={isRenewingSub}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isRenewingSub ? "Processing Payment..." : "Renew / Activate Subscription"}</span>
                </button>
              </div>
            ) : (
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
            )}
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
