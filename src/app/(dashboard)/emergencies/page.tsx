"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { AccessDenied } from "@/components/common/AccessDenied";
import { endpoints } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDateTime } from "@/lib/utils";
import {
  EmergencyAlert,
  EmergencyAlertSummary,
  EmergencySafetyAcknowledgment,
  EmergencySeverity,
  EmergencyType,
  SafetyStatus,
} from "@/types/emergency";

const EMERGENCY_TYPES: { value: EmergencyType; label: string; defaultInstructions: string }[] = [
  {
    value: "FIRE",
    label: "Fire Alarm",
    defaultInstructions: "Evacuate immediately via staircases. Do NOT use elevators.",
  },
  {
    value: "MEDICAL_EMERGENCY",
    label: "Medical Emergency",
    defaultInstructions: "Clear tower lobby access for ambulance and first-aid team.",
  },
  {
    value: "SECURITY_THREAT",
    label: "Security Threat",
    defaultInstructions: "Lock main doors, remain indoors, and await security clearance.",
  },
  {
    value: "GAS_LEAK",
    label: "Gas Leak",
    defaultInstructions: "Shut off gas valves, avoid switches/flames, and vacate the wing.",
  },
  {
    value: "EARTHQUAKE",
    label: "Earthquake",
    defaultInstructions: "Drop, cover, and hold. Move to open assembly zone once shaking stops.",
  },
  {
    value: "FLOOD",
    label: "Waterlogging / Flood",
    defaultInstructions: "Avoid basements and submerged electrical rooms.",
  },
  {
    value: "OTHER",
    label: "Other Emergency",
    defaultInstructions: "Follow instructions from Estate Security & Management.",
  },
];

export default function EmergenciesPage() {
  const { user } = useAuth();
  const { activeSocietyId, currentSociety } = useTenant();
  const { canAccessModule, hasPermission, isPlatformSuperAdmin, isSocietyAdmin } = usePermission();

  const canAccess = canAccessModule("emergencies");
  const canManage = isPlatformSuperAdmin || isSocietyAdmin || hasPermission("emergency.alert.manage");
  const canTrigger = canManage || hasPermission("emergency.alert.create");

  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [summary, setSummary] = useState<EmergencyAlertSummary | null>(null);
  const [acknowledgments, setAcknowledgments] = useState<EmergencySafetyAcknowledgment[]>([]);
  const [myAck, setMyAck] = useState<EmergencySafetyAcknowledgment | null>(null);
  const [emergencyPhone, setEmergencyPhone] = useState<string | null>(null);
  const [assemblyZone, setAssemblyZone] = useState<string>("Main Society Open Lawn / Assembly Point");
  const [rescueFilter, setRescueFilter] = useState<"ALL" | "PRIORITY">("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Trigger modal state
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<EmergencyType>("FIRE");
  const [triggerSeverity, setTriggerSeverity] = useState<EmergencySeverity>("CRITICAL");
  const [triggerTitle, setTriggerTitle] = useState("");
  const [triggerInstructions, setTriggerInstructions] = useState(EMERGENCY_TYPES[0].defaultInstructions);

  // Resolve / Cancel modal state
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Self check-in location input
  const [checkInLocation, setCheckInLocation] = useState("Society Admin Office");

  const loadAlertDetails = useCallback(
    async (alert: EmergencyAlert | null) => {
      if (!alert) {
        setSummary(null);
        setAcknowledgments([]);
        setMyAck(null);
        return;
      }

      const [sumRes, myRes, ackRes] = await Promise.allSettled([
        endpoints.emergencies.getSummary(alert.id),
        endpoints.emergencies.getMySafetyStatus(alert.id),
        canManage ? endpoints.emergencies.getAcknowledgments(alert.id) : Promise.resolve([]),
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (myRes.status === "fulfilled") setMyAck(myRes.value);
      if (ackRes.status === "fulfilled") {
        const sorted = [...(ackRes.value || [])].sort((a, b) => {
          const aUrgent = a.safetyStatus === "TRAPPED" || a.safetyStatus === "NEEDS_ASSISTANCE" ? 0 : 1;
          const bUrgent = b.safetyStatus === "TRAPPED" || b.safetyStatus === "NEEDS_ASSISTANCE" ? 0 : 1;
          return aUrgent - bUrgent;
        });
        setAcknowledgments(sorted);
      }
    },
    [canManage]
  );

  const loadConsole = useCallback(async () => {
    if (!activeSocietyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [allList, phoneSetting, zoneSetting] = await Promise.allSettled([
        endpoints.emergencies.getAlerts({ page: 0, size: 20 }),
        endpoints.settings.getSetting("society.contact.emergency_phone"),
        endpoints.settings.getSetting("society.emergency.assembly_zone"),
      ]);

      if (phoneSetting.status === "fulfilled" && phoneSetting.value?.value) {
        setEmergencyPhone(phoneSetting.value.value);
      }
      if (zoneSetting.status === "fulfilled" && zoneSetting.value?.value) {
        setAssemblyZone(zoneSetting.value.value);
      }

      if (allList.status === "fulfilled") {
        const list = allList.value || [];
        setAlerts(list);
        const active = list.find((a) => a.status === "ACTIVE") || list[0] || null;
        setSelectedAlert(active);
        await loadAlertDetails(active);
      } else {
        setBannerMsg({
          type: "error",
          text: "Unable to load emergency incidents. Please try refreshing.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, loadAlertDetails]);

  useEffect(() => {
    if (canAccess) {
      loadConsole();
    }
  }, [canAccess, loadConsole]);

  if (!canAccess) {
    return <AccessDenied />;
  }

  const activeAlert = alerts.find((a) => a.status === "ACTIVE") || null;
  const focusedAlert = selectedAlert || activeAlert;
  const canResolveFocused =
    !!focusedAlert &&
    focusedAlert.status === "ACTIVE" &&
    (canManage || (!!user?.id && focusedAlert.triggeredByUserId === user.id));

  const handleSelectAlert = async (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
    await loadAlertDetails(alert);
  };

  const handleTriggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerTitle.trim() || !triggerInstructions.trim()) return;
    setIsSubmitting(true);
    setBannerMsg(null);
    try {
      const created = await endpoints.emergencies.triggerAlert({
        emergencyType: triggerType,
        severity: triggerSeverity,
        title: triggerTitle.trim(),
        instructions: triggerInstructions.trim(),
      });
      setIsTriggerOpen(false);
      setTriggerTitle("");
      setBannerMsg({
        type: "success",
        text: `Emergency SOS "${created.title}" broadcast to all society members.`,
      });
      window.dispatchEvent(new CustomEvent("emergency:updated"));
      await loadConsole();
    } catch (err: any) {
      setBannerMsg({
        type: "error",
        text: err?.detail || err?.message || "Failed to broadcast emergency alert.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSafetyCheckIn = async (status: SafetyStatus) => {
    if (!focusedAlert) return;
    setIsSubmitting(true);
    setBannerMsg(null);
    try {
      const updated = await endpoints.emergencies.submitSafetyStatus(focusedAlert.id, {
        safetyStatus: status,
        locationDetails: checkInLocation.trim() || "Web Command Console",
      });
      setMyAck(updated);
      setBannerMsg({
        type: "success",
        text: `Safety check-in recorded: ${status.replace(/_/g, " ")}.`,
      });
      await loadAlertDetails(focusedAlert);
      window.dispatchEvent(new CustomEvent("emergency:updated"));
    } catch (err: any) {
      setBannerMsg({
        type: "error",
        text: err?.detail || err?.message || "Failed to submit safety status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedAlert) return;
    setIsSubmitting(true);
    setBannerMsg(null);
    try {
      await endpoints.emergencies.resolveAlert(focusedAlert.id, {
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      setIsResolveOpen(false);
      setResolutionNotes("");
      setBannerMsg({
        type: "success",
        text: "Incident marked RESOLVED and all-clear notified.",
      });
      window.dispatchEvent(new CustomEvent("emergency:updated"));
      await loadConsole();
    } catch (err: any) {
      setBannerMsg({
        type: "error",
        text: err?.detail || err?.message || "Unable to resolve emergency alert.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedAlert || !cancellationReason.trim()) return;
    setIsSubmitting(true);
    setBannerMsg(null);
    try {
      await endpoints.emergencies.cancelAlert(focusedAlert.id, {
        cancellationReason: cancellationReason.trim(),
      });
      setIsCancelOpen(false);
      setCancellationReason("");
      setBannerMsg({
        type: "success",
        text: "False alarm cancelled cleanly.",
      });
      window.dispatchEvent(new CustomEvent("emergency:updated"));
      await loadConsole();
    } catch (err: any) {
      setBannerMsg({
        type: "error",
        text: err?.detail || err?.message || "Unable to cancel emergency alert.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleAcks =
    rescueFilter === "PRIORITY"
      ? acknowledgments.filter(
          (a) => a.safetyStatus === "TRAPPED" || a.safetyStatus === "NEEDS_ASSISTANCE"
        )
      : acknowledgments;

  const safeOrEvacuated = summary ? summary.safeCount + summary.evacuatedCount : 0;
  const needHelp = summary ? summary.trappedCount + summary.needsAssistanceCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Emergency SOS & Muster Console</h1>
            {activeAlert ? (
              <Badge variant="danger">ACTIVE INCIDENT</Badge>
            ) : (
              <Badge variant="success">ALL CLEAR</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time emergency broadcast control, live resident safety muster roll, and rescue dispatch queue for{" "}
            <span className="font-semibold text-slate-700">
              {currentSociety?.societyName || "your society"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadConsole} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {canTrigger && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setTriggerTitle("");
                setIsTriggerOpen(true);
              }}
            >
              <Siren className="w-4 h-4 mr-1.5" />
              Trigger Society SOS
            </Button>
          )}
        </div>
      </div>

      {/* Society Config Chips */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-[#107A48]" />
          <span className="font-semibold">Assembly Zone:</span>
          <span>{assemblyZone}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-700">
          <Phone className="w-3.5 h-3.5 text-red-600" />
          <span className="font-semibold">Emergency Helpline:</span>
          <span>{emergencyPhone || "Not configured (National Helpline: 112)"}</span>
        </div>
      </div>

      {bannerMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between ${
            bannerMsg.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <span>{bannerMsg.text}</span>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="text-xs font-semibold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Focused Incident Command Card */}
      {focusedAlert ? (
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            focusedAlert.status === "ACTIVE"
              ? "border-red-300 bg-gradient-to-br from-red-50 via-white to-rose-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    focusedAlert.status === "ACTIVE"
                      ? "danger"
                      : focusedAlert.status === "RESOLVED"
                      ? "success"
                      : "warning"
                  }
                >
                  {focusedAlert.status}
                </Badge>
                <Badge variant="neutral">{focusedAlert.emergencyType.replace(/_/g, " ")}</Badge>
                <Badge variant="danger">{focusedAlert.severity}</Badge>
                <span className="text-xs text-slate-500">
                  Triggered {formatDateTime(focusedAlert.createdAt)}
                  {focusedAlert.triggeredByName ? ` by ${focusedAlert.triggeredByName}` : ""}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{focusedAlert.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                {focusedAlert.instructions}
              </p>
              {focusedAlert.resolutionNotes && (
                <p className="text-xs text-emerald-700 font-medium">
                  Resolution notes: {focusedAlert.resolutionNotes}
                </p>
              )}
              {focusedAlert.cancellationReason && (
                <p className="text-xs text-amber-700 font-medium">
                  Cancellation reason: {focusedAlert.cancellationReason}
                </p>
              )}
            </div>

            {canResolveFocused && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsResolveOpen(true)}
                  disabled={isSubmitting}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Mark All Clear (Resolve)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelOpen(true)}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Cancel False Alarm
                </Button>
              </div>
            )}
          </div>

          {/* Headcount Summary KPIs */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Active Society Members</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{summary.totalMembers}</div>
                <div className="text-xs text-slate-500 mt-0.5">{summary.totalResponses} responses logged</div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span>Safe & Evacuated</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-800 mt-1">{safeOrEvacuated}</div>
                <div className="text-xs text-emerald-700 mt-0.5">
                  {summary.safeCount} safe • {summary.evacuatedCount} evacuated
                </div>
              </div>

              <div className="rounded-xl bg-red-50/80 border border-red-200 p-4">
                <div className="flex items-center justify-between text-xs text-red-700 font-semibold">
                  <span>Need Urgent Rescue</span>
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-700 mt-1">{needHelp}</div>
                <div className="text-xs text-red-700 mt-0.5">
                  {summary.trappedCount} trapped • {summary.needsAssistanceCount} need assistance
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4">
                <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                  <span>Unaccounted</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-900 mt-1">{summary.unaccountedCount}</div>
                <div className="text-xs text-amber-800 mt-0.5">Awaiting check-in</div>
              </div>
            </div>
          )}

          {/* Safety Check-in Strip */}
          {focusedAlert.status === "ACTIVE" && (
            <div className="mt-6 rounded-xl bg-white border border-slate-200 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Your Check-In Status {myAck ? `(${myAck.safetyStatus})` : ""}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={checkInLocation}
                      onChange={(e) => setCheckInLocation(e.target.value)}
                      placeholder="Your location (e.g. Society Office, Gate 1)"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-[#107A48]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={() => handleSafetyCheckIn("SAFE")}
                  >
                    I&apos;m Safe
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isSubmitting}
                    onClick={() => handleSafetyCheckIn("EVACUATED")}
                  >
                    Evacuated
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleSafetyCheckIn("NEEDS_ASSISTANCE")}
                  >
                    Need Assistance
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isSubmitting}
                    onClick={() => handleSafetyCheckIn("TRAPPED")}
                  >
                    Trapped / SOS
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-[#107A48] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">All Clear — No Active Society Emergency</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Your society is currently operating normally. If an urgent fire, medical, or security emergency arises, trigger a broadcast above to alert every resident immediately.
          </p>
        </div>
      )}

      {/* Rescue Dispatch Queue (Authorized Managers / Security) */}
      {canManage && focusedAlert && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Rescue Dispatch & Safety Roster</span>
              </h3>
              <p className="text-xs text-slate-500">
                Prioritizes residents reporting TRAPPED or NEEDS ASSISTANCE so security teams know exact flats/locations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRescueFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  rescueFilter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Responses ({acknowledgments.length})
              </button>
              <button
                type="button"
                onClick={() => setRescueFilter("PRIORITY")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  rescueFilter === "PRIORITY"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Priority Rescue Only
              </button>
            </div>
          </div>

          {visibleAcks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching member safety responses recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Member</th>
                    <th className="px-6 py-3 font-semibold">Safety Status</th>
                    <th className="px-6 py-3 font-semibold">Location / Unit</th>
                    <th className="px-6 py-3 font-semibold">Notes</th>
                    <th className="px-6 py-3 font-semibold">Checked In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleAcks.map((ack) => {
                    const isUrgent =
                      ack.safetyStatus === "TRAPPED" || ack.safetyStatus === "NEEDS_ASSISTANCE";
                    return (
                      <tr key={ack.id} className={isUrgent ? "bg-red-50/50" : ""}>
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {ack.userName || ack.userId}
                        </td>
                        <td className="px-6 py-3">
                          <Badge
                            variant={
                              ack.safetyStatus === "TRAPPED" ||
                              ack.safetyStatus === "NEEDS_ASSISTANCE"
                                ? "danger"
                                : "success"
                            }
                          >
                            {ack.safetyStatus.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-slate-700">
                          {ack.locationDetails || "Not specified"}
                        </td>
                        <td className="px-6 py-3 text-slate-600">{ack.notes || "—"}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">
                          {formatDateTime(ack.acknowledgedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Incident History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Recent Emergency Broadcast History</h3>
        </div>
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No emergency alerts recorded in this society yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Incident</th>
                  <th className="px-6 py-3 font-semibold">Type / Severity</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Reported By</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => handleSelectAlert(alert)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      focusedAlert?.id === alert.id ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">{alert.title}</td>
                    <td className="px-6 py-3 text-xs text-slate-600">
                      {alert.emergencyType.replace(/_/g, " ")} • {alert.severity}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          alert.status === "ACTIVE"
                            ? "danger"
                            : alert.status === "RESOLVED"
                            ? "success"
                            : "warning"
                        }
                      >
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {alert.triggeredByName || alert.triggeredByUserId}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {formatDateTime(alert.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trigger SOS Modal */}
      <Modal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        title="Broadcast Society Emergency SOS"
        description="Immediately dispatches CRITICAL in-app and push notifications to every active member."
      >
        <form onSubmit={handleTriggerSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Type
              </label>
              <select
                value={triggerType}
                onChange={(e) => {
                  const val = e.target.value as EmergencyType;
                  setTriggerType(val);
                  const found = EMERGENCY_TYPES.find((t) => t.value === val);
                  if (found) setTriggerInstructions(found.defaultInstructions);
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
              >
                {EMERGENCY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={triggerSeverity}
                onChange={(e) => setTriggerSeverity(e.target.value as EmergencySeverity)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="EXTREME">EXTREME</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Headline *
            </label>
            <input
              type="text"
              required
              maxLength={250}
              value={triggerTitle}
              onChange={(e) => setTriggerTitle(e.target.value)}
              placeholder="e.g., Electrical Smoke in Tower B Basement"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Safety Instructions *
            </label>
            <textarea
              required
              rows={3}
              value={triggerInstructions}
              onChange={(e) => setTriggerInstructions(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsTriggerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              <Siren className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Broadcasting..." : "Confirm & Broadcast SOS"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        title="Resolve Incident (All Clear)"
        description="Marks the active incident RESOLVED and clears active evacuation banners across web and mobile."
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g., Fire brigade verified all clear; lift power restored."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsResolveOpen(false)}>
              Keep Active
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Confirm All Clear
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel False Alarm Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel False Alarm"
        description="Provide a mandatory audit reason for cancelling this active SOS broadcast."
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              required
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Accidental SOS test trigger during gate training."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCancelOpen(false)}>
              Keep Active
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              Cancel False Alarm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

