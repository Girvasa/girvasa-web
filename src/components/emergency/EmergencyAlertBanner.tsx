"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  RefreshCw,
  Siren,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { useTenant } from "@/lib/tenant/TenantContext";
import { EmergencyAlert, EmergencyAlertSummary, SafetyStatus } from "@/types/emergency";

export const EmergencyAlertBanner: React.FC = () => {
  const { activeSocietyId } = useTenant();
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [summary, setSummary] = useState<EmergencyAlertSummary | null>(null);
  const [myStatus, setMyStatus] = useState<SafetyStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadEmergencyState = useCallback(async () => {
    if (!activeSocietyId) {
      setActiveAlert(null);
      setSummary(null);
      setMyStatus(null);
      return;
    }
    try {
      const alerts = await endpoints.emergencies.getAlerts({
        status: "ACTIVE",
        page: 0,
        size: 5,
      });
      const firstActive = alerts?.[0] ?? null;
      setActiveAlert(firstActive);
      if (firstActive) {
        const [sumRes, meRes] = await Promise.allSettled([
          endpoints.emergencies.getSummary(firstActive.id),
          endpoints.emergencies.getMySafetyStatus(firstActive.id),
        ]);
        if (sumRes.status === "fulfilled") setSummary(sumRes.value);
        if (meRes.status === "fulfilled" && meRes.value) {
          setMyStatus(meRes.value.safetyStatus);
        }
      } else {
        setSummary(null);
        setMyStatus(null);
      }
    } catch {
      // Non-blocking in shell: keep existing state cleanly
    }
  }, [activeSocietyId]);

  useEffect(() => {
    loadEmergencyState();
    const timer = window.setInterval(loadEmergencyState, 30000);
    const onUpdated = () => loadEmergencyState();
    window.addEventListener("emergency:updated", onUpdated);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("emergency:updated", onUpdated);
    };
  }, [loadEmergencyState]);

  const handleQuickCheckIn = async (status: SafetyStatus) => {
    if (!activeAlert) return;
    setIsUpdating(true);
    setFeedback(null);
    try {
      await endpoints.emergencies.submitSafetyStatus(activeAlert.id, {
        safetyStatus: status,
        locationDetails: "Society Admin Web Desk",
      });
      setMyStatus(status);
      setFeedback({
        type: "success",
        text:
          status === "SAFE"
            ? "Marked SAFE on society muster roll."
            : "Distress alert sent to gate & rescue desk!",
      });
      window.dispatchEvent(new CustomEvent("emergency:updated"));
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.detail || err?.message || "Failed to update safety status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!activeAlert) {
    return null;
  }

  const priorityRescueCount = summary
    ? summary.trappedCount + summary.needsAssistanceCount
    : 0;
  const safeCount = summary ? summary.safeCount + summary.evacuatedCount : 0;

  return (
    <div
      role="alert"
      data-testid="global-emergency-banner"
      className="mb-5 rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-950 via-red-900 to-rose-900 text-white p-4 sm:p-5 shadow-lg"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/30 border border-red-400/60 text-red-100">
            <Siren className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                {activeAlert.severity} • {activeAlert.emergencyType.replace(/_/g, " ")}
              </span>
              {activeAlert.triggeredByName && (
                <span className="text-xs text-red-200">
                  Reported by <strong>{activeAlert.triggeredByName}</strong>
                </span>
              )}
              {summary && (
                <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] text-red-100">
                  <span>{safeCount} Safe</span>
                  <span>•</span>
                  <span className={priorityRescueCount > 0 ? "font-bold text-amber-300" : ""}>
                    {priorityRescueCount} Need Help
                  </span>
                  <span>•</span>
                  <span>{summary.unaccountedCount} Unaccounted</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-snug text-white">
              {activeAlert.title}
            </h2>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl">
              {activeAlert.instructions}
            </p>
            {feedback && (
              <p
                className={`text-xs font-semibold pt-1 ${
                  feedback.type === "error" ? "text-amber-300" : "text-emerald-300"
                }`}
              >
                {feedback.text}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleQuickCheckIn("SAFE")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              myStatus === "SAFE"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-600/90 hover:bg-emerald-500 text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{myStatus === "SAFE" ? "Marked Safe" : "I'm Safe"}</span>
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleQuickCheckIn("NEEDS_ASSISTANCE")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 text-xs font-bold transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Need Help</span>
          </button>
          <Link
            href="/emergencies"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-red-900 hover:bg-red-50 px-3.5 py-2 text-xs font-bold shadow-sm transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Open SOS Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={loadEmergencyState}
            aria-label="Refresh emergency status"
            className="rounded-xl p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

