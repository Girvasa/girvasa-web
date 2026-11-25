"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Landmark,
  Smartphone,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { SubscriptionOrderResponse } from "@/types/payment";
import { SubscriptionPlanDto } from "@/types/subscription";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export const CANONICAL_SUBSCRIPTION_PLANS: SubscriptionPlanDto[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    code: "STARTER_100",
    name: "Starter Plan",
    description: "Essential digital gate security, notices & maintenance billing up to 100 units.",
    maxUnits: 100,
    pricePaise: 149900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Visitor & Gate Security, Resident App, Maintenance Billing",
    active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    code: "GROWTH_300",
    name: "Growth Plan",
    description: "Full management suite, Zero-Fee UPI collections, Amenities & Accounting up to 300 units.",
    maxUnits: 300,
    pricePaise: 349900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "All Starter features + Zero-Fee Direct Collections, Amenities, Staff/Vendors",
    active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    code: "ENTERPRISE",
    name: "Enterprise Plan",
    description: "Multi-tower township governance, unlimited flats, polls & priority SLA.",
    maxUnits: 999999,
    pricePaise: 799900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Everything in Growth + Unlimited Units, Polls, Dedicated Account Manager",
    active: true,
  },
];

interface SubscriptionCheckoutPanelProps {
  initialPlanCode?: string;
  plans?: SubscriptionPlanDto[];
  compact?: boolean;
  darkSurface?: boolean;
  ctaLabel?: string;
  onOrderUpdated?: (order: SubscriptionOrderResponse) => void;
}

export function SubscriptionCheckoutPanel({
  initialPlanCode = "GROWTH_300",
  plans: externalPlans,
  compact = false,
  darkSurface = false,
  ctaLabel,
  onOrderUpdated,
}: SubscriptionCheckoutPanelProps) {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>(
    externalPlans && externalPlans.length > 0 ? externalPlans : CANONICAL_SUBSCRIPTION_PLANS
  );
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(initialPlanCode || "GROWTH_300");
  const [billingMonths, setBillingMonths] = useState<number>(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState<SubscriptionOrderResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<SubscriptionOrderResponse[]>([]);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "BANK_TRANSFER">("UPI");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (externalPlans && externalPlans.length > 0) {
      setPlans(externalPlans);
    } else {
      endpoints.subscription
        .getPublicPlans()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setPlans(res.filter((p) => p.active !== false));
          }
        })
        .catch(() => {
          // Keep canonical fallback plans
        });
    }
  }, [externalPlans]);

  useEffect(() => {
    if (initialPlanCode) {
      setSelectedPlanCode(initialPlanCode);
    }
  }, [initialPlanCode]);

  const loadHistory = useCallback(async () => {
    try {
      const list = await endpoints.subscriptions.listMyRequests();
      if (Array.isArray(list)) {
        setRecentOrders(list);
      }
    } catch {
      // Optional history fetch; ignore if unauthenticated or mock
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const activePlan =
    plans.find((p) => p.code === selectedPlanCode) || plans[0] || CANONICAL_SUBSCRIPTION_PLANS[1];
  const monthlyRupees = Math.round((activePlan?.pricePaise || 349900) / 100);
  const totalPayable = monthlyRupees * billingMonths;

  const copyValue = (label: string, val?: string) => {
    if (!val) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(val).catch(() => {});
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateCheckoutOrder = async () => {
    setErrorMsg(null);
    setIsCreatingOrder(true);
    try {
      const order = await endpoints.subscriptions.createCheckoutOrder({
        planCode: activePlan.code,
        billingMonths,
      });
      setActiveOrder(order);
      setUtrNumber("");
      onOrderUpdated?.(order);
      loadHistory();
    } catch (err: any) {
      setErrorMsg(
        err?.detail ||
          err?.message ||
          "Could not generate payment checkout order. Check your connection and retry."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    const normalizedUtr = utrNumber.trim().toUpperCase();
    if (!/^[A-Za-z0-9._-]{6,100}$/.test(normalizedUtr)) {
      setErrorMsg("Enter a valid 6-100 character UPI UTR or Bank NEFT/IMPS reference number.");
      return;
    }

    setErrorMsg(null);
    setIsSubmittingUtr(true);
    try {
      const updated = await endpoints.subscriptions.submitUtr(activeOrder.requestId, {
        utrNumber: normalizedUtr,
        paymentMethod,
      });
      setActiveOrder(updated);
      onOrderUpdated?.(updated);
      loadHistory();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription:updated"));
      }
    } catch (err: any) {
      setErrorMsg(
        err?.detail || err?.message || "Failed to submit UTR reference. Please verify and retry."
      );
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  return (
    <div className={`space-y-4 text-xs ${darkSurface ? "text-slate-100" : "text-slate-800"}`}>
      {!activeOrder && (
        <>
          {/* Step 1: Select Any Plan */}
          <div>
            <label
              className={`block text-xs font-semibold mb-2 ${
                darkSurface ? "text-slate-200" : "text-slate-700"
              }`}
            >
              1. Choose Society Subscription Plan (Any Tier)
            </label>
            <div className={`grid grid-cols-1 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"} gap-3`}>
              {plans.map((p) => {
                const isSelected = activePlan.code === p.code;
                const pricePerMonth = Math.round(p.pricePaise / 100);
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedPlanCode(p.code)}
                    className={`relative text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? darkSurface
                          ? "bg-emerald-900/40 border-emerald-400 ring-1 ring-emerald-400 text-white"
                          : "bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600 text-slate-900"
                        : darkSurface
                        ? "bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500"
                        : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs">{p.name}</span>
                      {p.code === "GROWTH_300" && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-base font-extrabold mt-1 ${
                        darkSurface ? "text-emerald-300" : "text-indigo-700"
                      }`}
                    >
                      ₹{pricePerMonth.toLocaleString("en-IN")}
                      <span className="text-[11px] font-normal opacity-80"> / month</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {p.maxUnits >= 999999 ? "Unlimited flats" : `Up to ${p.maxUnits} flats`}
                    </div>
                    {!compact && (
                      <p className="text-[10px] opacity-75 mt-1.5 line-clamp-2">{p.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Duration */}
          <div>
            <label
              className={`block text-xs font-semibold mb-2 ${
                darkSurface ? "text-slate-200" : "text-slate-700"
              }`}
            >
              2. Select Billing Duration (Zero Gateway Fee)
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { months: 1, label: "1 Month" },
                { months: 12, label: "12 Months (Annual)" },
              ].map((opt) => {
                const selected = billingMonths === opt.months;
                const amt = monthlyRupees * opt.months;
                return (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setBillingMonths(opt.months)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? darkSurface
                          ? "bg-blue-900/40 border-blue-400 ring-1 ring-blue-400 text-white"
                          : "bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950"
                        : darkSurface
                        ? "bg-slate-900/60 border-slate-700 text-slate-300"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-[11px] opacity-80">
                      Total Payable: ₹{amt.toLocaleString("en-IN")} (₹0 Fee)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            type="button"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={handleCreateCheckoutOrder}
            isLoading={isCreatingOrder}
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            {ctaLabel ||
              `Show Zero-Fee UPI & Bank Payment Options (₹${totalPayable.toLocaleString("en-IN")})`}
          </Button>
        </>
      )}

      {/* Active Order Payment Options + UTR Submission */}
      {activeOrder && (
        <div className="space-y-3 text-slate-800">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {activeOrder.planName || activeOrder.planCode} ({activeOrder.billingMonths} mo) •{" "}
                  {activeOrder.orderReference}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {activeOrder.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrder(null);
                    setErrorMsg(null);
                  }}
                  className="text-[11px] text-indigo-700 hover:underline font-semibold"
                >
                  Change Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Option A: Direct UPI */}
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Option A: Direct UPI (GPay / PhonePe / Paytm)</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Payable Amount:{" "}
                  <span className="font-bold text-slate-900">
                    ₹{Number(activeOrder.amount).toLocaleString("en-IN")} (₹0 Fee)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                    {activeOrder.payeeUpiId || "girvasa@upi"}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyValue("UPI VPA", activeOrder.payeeUpiId || "girvasa@upi")}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === "UPI VPA" ? "Copied" : "Copy UPI ID"}</span>
                  </button>
                </div>
                {activeOrder.upiUri && (
                  <a
                    href={activeOrder.upiUri}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700"
                  >
                    <span>Open UPI App to Pay ₹{Number(activeOrder.amount).toLocaleString("en-IN")}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Option B: Bank NEFT / IMPS */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Option B: Bank Transfer (NEFT / IMPS / RTGS)</span>
                </div>
                <div>
                  Beneficiary: <span className="font-semibold text-slate-900">{activeOrder.payeeName || "Girvasa Technologies"}</span>
                </div>
                <div>
                  Bank &amp; IFSC:{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    {activeOrder.bankName || "HDFC Bank"} ({activeOrder.ifscCode || "HDFC0000001"})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                  <span className="font-mono font-semibold text-slate-900">
                    A/c: {activeOrder.bankAccountNumber || "50200000000001"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyValue("Account Number", activeOrder.bankAccountNumber || "50200000000001")
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === "Account Number" ? "Copied" : "Copy A/c"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeOrder.status === "PENDING_VERIFICATION" ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>UTR Submitted: {activeOrder.utrReference} ({activeOrder.paymentMethod})</span>
              </div>
              <div>
                Your payment reference is queued for Platform Super Admin bank reconciliation. Your society&apos;s{" "}
                <strong>{activeOrder.planName || activeOrder.planCode}</strong> subscription will activate automatically upon verification.
              </div>
            </div>
          ) : activeOrder.status === "VERIFIED" ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-bold">
              ✓ Payment Verified! Your {activeOrder.planName || activeOrder.planCode} subscription is ACTIVE.
            </div>
          ) : (
            <form onSubmit={handleSubmitUtr} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="font-bold text-slate-800">
                3. Enter 12-Digit UTR / Bank Transfer Reference After Paying
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="e.g. 432912345678 or NEFT reference"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    required
                  />
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "UPI" | "BANK_TRANSFER")}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs bg-white text-slate-900"
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">NEFT / IMPS / RTGS</option>
                </select>
              </div>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white"
                isLoading={isSubmittingUtr}
              >
                Submit UTR for Plan Activation
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Existing Society Checkout History */}
      {recentOrders.length > 0 && !compact && (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Recent Subscription Payment Requests</span>
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-1 text-indigo-700 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
            {recentOrders.slice(0, 5).map((item) => (
              <div
                key={item.requestId}
                className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]"
              >
                <div>
                  <span className="font-bold text-slate-900">{item.planName || item.planCode}</span>
                  <span className="text-slate-500 ml-1.5">
                    • {item.orderReference} • ₹{Number(item.amount).toLocaleString("en-IN")}
                  </span>
                  {item.utrReference && (
                    <span className="ml-1.5 font-mono text-slate-700">(UTR: {item.utrReference})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "PENDING_VERIFICATION"
                        ? "bg-amber-100 text-amber-800"
                        : item.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.status === "INITIATED" && (
                    <button
                      type="button"
                      onClick={() => setActiveOrder(item)}
                      className="text-indigo-700 font-semibold hover:underline"
                    >
                      Pay / Submit UTR
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

