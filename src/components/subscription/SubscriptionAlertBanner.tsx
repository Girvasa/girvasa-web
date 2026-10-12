"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  X,
  HelpCircle,
} from "lucide-react";
import { useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { endpoints } from "@/lib/api/endpoints";
import { SocietySubscriptionDetailResponse } from "@/types/subscription";
import { formatCurrency, formatDate } from "@/lib/utils";

export const SubscriptionAlertBanner: React.FC = () => {
  const { activeSocietyId, currentSociety } = useTenant();
  const { hasRole, isPlatformAdmin } = usePermission();
  const [subscription, setSubscription] = useState<SocietySubscriptionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("GROWTH_300");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const isSocietyAdmin = isPlatformAdmin || hasRole("SOCIETY_ADMIN");

  const loadSubscription = useCallback(async () => {
    if (!activeSocietyId) return;
    try {
      const data = await endpoints.subscription.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      console.error("Failed to load society subscription state:", err);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    loadSubscription();
    const handleUpdate = () => {
      loadSubscription();
    };
    window.addEventListener("subscription:updated", handleUpdate);
    return () => window.removeEventListener("subscription:updated", handleUpdate);
  }, [loadSubscription]);

  const handleRenewNow = async (planCode: string) => {
    setIsRenewing(true);
    try {
      const updated = await endpoints.subscription.renewSubscription({
        planCode,
        billingMonths: 1,
        paymentMethod: "UPI",
      });
      setSubscription(updated);
      window.dispatchEvent(new CustomEvent("subscription:updated"));
    } catch (err: any) {
      alert("Failed to renew plan: " + (err?.message || "Payment error"));
    } finally {
      setIsRenewing(false);
    }
  };

  const handleSimulate = async (days: number) => {
    try {
      const updated = await endpoints.subscription.simulateSubscription(days);
      setSubscription(updated);
      setBannerDismissed(false);
      window.dispatchEvent(new CustomEvent("subscription:updated"));
    } catch (err: any) {
      console.error("Simulation error:", err);
    }
  };

  if (!subscription) {
    return null;
  }

  // 1. STATE: Expired (Lockout Screen / Overlay)
  if (subscription.isExpired) {
    if (isSocietyAdmin) {
      return (
        <div className="relative z-50 mb-6 rounded-2xl border-2 border-red-500/80 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/30 text-red-400 border border-red-500/50 shrink-0">
                <Lock className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    🔒 Society Subscription Expired
                  </h2>
                  <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/40 uppercase">
                    Access Restricted
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  The 14-day free trial for <strong>{currentSociety?.societyName || "your society"}</strong> has ended.
                  Gate security verification, automated billing, and resident mobile access are currently paused.
                  Select a subscription plan below to renew and instantly restore full access.
                </p>

                {/* Plan Selector */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { code: "STARTER_100", name: "Starter Plan", price: "₹1,499/mo", units: "Up to 100 flats" },
                    { code: "GROWTH_300", name: "Growth Plan", price: "₹3,499/mo", units: "Up to 300 flats", popular: true },
                    { code: "ENTERPRISE", name: "Enterprise Plan", price: "₹7,999/mo", units: "Unlimited flats" },
                  ].map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSelectedPlan(p.code)}
                      className={`relative flex flex-col p-3 rounded-xl text-left border transition-all ${
                        selectedPlan === p.code
                          ? "bg-blue-600/20 border-blue-400 ring-2 ring-blue-500"
                          : "bg-slate-900/60 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2 right-2 rounded-full bg-blue-500 px-2 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                          Recommended
                        </span>
                      )}
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-sm font-extrabold text-blue-400 mt-0.5">{p.price}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.units}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRenewNow(selectedPlan)}
                disabled={isRenewing}
                className="inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isRenewing ? "Reactivating..." : "Pay & Reactivate Society"}</span>
              </button>

              <Link
                href="/settings?tab=subscription"
                className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all text-center"
              >
                <span>View Full Plan Comparison</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Dev Demo Helpers */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>🧪 Developer QA Testing Bar:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleSimulate(3)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
              >
                Simulate 3-Day Warning
              </button>
              <button
                type="button"
                onClick={() => handleSimulate(14)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300"
              >
                Reset to 14-Day Active Trial
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Expired view for non-admin (Residents / Guards)
    return (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Society Services Temporarily Paused</h3>
            <p className="text-xs text-red-700 mt-0.5">
              The subscription for <strong>{currentSociety?.societyName || "this society"}</strong> is currently pending renewal.
              Please contact your Society Management Committee to restore portal and mobile app access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. STATE: Expiring Soon (3–5 Days Remaining Warning Banner)
  if (subscription.isExpiringSoon && !bannerDismissed) {
    return (
      <div className="relative mb-5 overflow-hidden rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 p-4 text-amber-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shrink-0 shadow-xs">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                  ⚠️ Trial Period Ending Soon
                </span>
                <span className="rounded-full bg-amber-200 px-2 py-0.2 text-[10px] font-bold text-amber-900 border border-amber-300">
                  {subscription.daysRemaining} days remaining
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Your society&apos;s free trial expires on <strong>{formatDate(subscription.trialEndsAt)}</strong>.
                Renew your plan now to prevent interruption of gate security, resident app services, and billing runs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/settings?tab=subscription"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Renew Plan Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="rounded-lg p-1 text-amber-700 hover:bg-amber-200/50"
              title="Dismiss warning for now"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dev Quick Test Toolbar */}
        <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-amber-700">
          <span>Dev QA Toolbar:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSimulate(0)}
              className="underline hover:text-amber-900"
            >
              [Test Expired Lockout]
            </button>
            <button
              type="button"
              onClick={() => handleSimulate(14)}
              className="underline hover:text-amber-900"
            >
              [Reset to 14 Days]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
