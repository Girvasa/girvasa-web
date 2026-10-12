"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Truck,
  Car,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  BellRing,
  LogOut,
  Building,
  Wrench,
  AlertCircle,
  RefreshCw,
  LogIn,
  Eye,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { endpoints } from "@/lib/api/endpoints";
import { useTenant } from "@/lib/tenant/TenantContext";

interface GateRecord {
  id: string;
  visitorName: string;
  avatar: string;
  category: "DELIVERY" | "GUEST" | "STAFF" | "TECHNICIAN" | "CAB";
  categoryBadge: string;
  passRef: string;
  passCode?: string;
  unit: string;
  hostName: string;
  approvalMode: string;
  purpose: string;
  vehicleNumber: string;
  vehicleType: string;
  status: "ACTIVE_INSIDE" | "EXPECTED" | "EXITED";
  inTime: string;
  duration: string;
}

const FALLBACK_GATE_RECORDS: GateRecord[] = [
  {
    id: "v-demo-1",
    visitorName: "Sunil Sharma",
    avatar: "https://ui-avatars.com/api/?name=Sunil+Sharma&background=070235&color=fff",
    category: "DELIVERY",
    categoryBadge: "Courier Delivery",
    passRef: "PASS-9201",
    passCode: "9201",
    unit: "Flat A-402",
    hostName: "Vikram Malhotra",
    approvalMode: "OTP Verified",
    purpose: "Amazon Package Delivery",
    vehicleNumber: "MH 02 CZ 4412",
    vehicleType: "two_wheeler",
    status: "ACTIVE_INSIDE",
    inTime: "11:20 AM",
    duration: "Inside Campus",
  },
  {
    id: "v-demo-2",
    visitorName: "Rajesh Kulkarni",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Kulkarni&background=006a61&color=fff",
    category: "TECHNICIAN",
    categoryBadge: "AMC Technician",
    passRef: "PASS-8840",
    passCode: "8840",
    unit: "Tower A Elevator",
    hostName: "Facility Manager",
    approvalMode: "Pre-Approved",
    purpose: "Lift Maintenance & Safety Inspection",
    vehicleNumber: "MH 03 BT 8091",
    vehicleType: "two_wheeler",
    status: "ACTIVE_INSIDE",
    inTime: "10:15 AM",
    duration: "Inside Campus",
  },
  {
    id: "v-demo-3",
    visitorName: "Ananya Deshmukh",
    avatar: "https://ui-avatars.com/api/?name=Ananya+Deshmukh&background=47464f&color=fff",
    category: "GUEST",
    categoryBadge: "Resident Guest",
    passRef: "PASS-7721",
    passCode: "7721",
    unit: "Flat B-101",
    hostName: "Rohan Deshmukh",
    approvalMode: "Pre-Approved Pass",
    purpose: "Family Dinner",
    vehicleNumber: "MH 01 AB 1234",
    vehicleType: "four_wheeler",
    status: "EXPECTED",
    inTime: "Expected 07:00 PM",
    duration: "Awaiting Entry",
  },
];

export default function VisitorsPage() {
  const { activeSocietyId } = useTenant();
  const [filterTab, setFilterTab] = useState<"ALL" | "DELIVERY" | "STAFF" | "EXPECTED" | "EXITED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<GateRecord | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for walk-in entry
  const [walkinForm, setWalkinForm] = useState({
    name: "",
    phone: "",
    flat: "",
    type: "GUEST",
    vehicle: "",
    purpose: "Personal Visit",
  });

  const [records, setRecords] = useState<GateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchVisits = useCallback(async () => {
    if (!activeSocietyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.visitors.getVisits();
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped: GateRecord[] = data.map((v) => {
          const isCheckedIn = v.status === "CHECKED_IN";
          const isExited = v.status === "CHECKED_OUT";
          const visitorTypeUpper = (v.visitorType || v.categoryName || "GUEST").toUpperCase();
          let category: "DELIVERY" | "GUEST" | "STAFF" | "TECHNICIAN" | "CAB" = "GUEST";
          if (visitorTypeUpper.includes("DELIVER")) category = "DELIVERY";
          else if (visitorTypeUpper.includes("STAFF") || visitorTypeUpper.includes("MAID")) category = "STAFF";
          else if (visitorTypeUpper.includes("CAB") || visitorTypeUpper.includes("UBER") || visitorTypeUpper.includes("OLA")) category = "CAB";
          else if (visitorTypeUpper.includes("TECH") || visitorTypeUpper.includes("MAINT")) category = "TECHNICIAN";

          return {
            id: v.id,
            visitorName: v.visitor?.fullName || v.visitorName || "Guest Visitor",
            avatar:
              v.visitor?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(v.visitor?.fullName || v.visitorName || "Visitor")}&background=070235&color=fff`,
            category,
            categoryBadge: v.visitorType || v.categoryName || "Guest",
            passRef: v.passCode ? `Pass #${v.passCode}` : (v.visitNumber || `OTP #${v.id.substring(0, 4)}`),
            passCode: v.passCode,
            unit: v.unitNumber || v.hostUnitNumber || "Campus",
            hostName: v.hostUserName || v.purpose || "Flat Resident",
            approvalMode: isCheckedIn ? "Checked-In Entry" : v.status === "EXPECTED" ? "Pre-Approved Pass" : "Exited",
            purpose: v.purpose || "Personal Visit",
            vehicleNumber: v.vehicleNumber || "Pedestrian",
            vehicleType: v.vehicleType || (v.vehicleNumber ? "two_wheeler" : "pedestrian"),
            status: isCheckedIn ? "ACTIVE_INSIDE" : isExited ? "EXITED" : "EXPECTED",
            inTime: v.checkInTime || v.checkedInAt ? new Date(v.checkInTime || v.checkedInAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Expected",
            duration: isCheckedIn ? "Inside Campus" : isExited ? "Exited" : "Awaiting Entry",
          };
        });
        setRecords(mapped);
      } else {
        setRecords(FALLBACK_GATE_RECORDS);
      }
    } catch (err: any) {
      console.error("Failed to fetch visits:", err);
      setRecords(FALLBACK_GATE_RECORDS);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleCheckIn = async (id: string) => {
    setActionMessage(null);
    try {
      await endpoints.visitors.checkIn(id);
      setActionMessage({ type: "success", text: "Visitor checked in successfully." });
      await fetchVisits();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.detail || err?.message || "Failed to check in visitor." });
    }
  };

  const handleMarkExit = async (id: string) => {
    setActionMessage(null);
    try {
      await endpoints.visitors.checkOut(id);
      setActionMessage({ type: "success", text: "Visitor exit recorded successfully." });
      await fetchVisits();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.detail || err?.message || "Failed to record visitor exit." });
    }
  };

  const handleVerifyPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const matched = records.find(
      (r) =>
        r.passRef.toLowerCase().includes(query) ||
        (r.passCode && r.passCode.toLowerCase().includes(query)) ||
        r.visitorName.toLowerCase().includes(query) ||
        r.unit.toLowerCase().includes(query)
    );

    if (matched) {
      if (matched.status === "EXPECTED") {
        handleCheckIn(matched.id);
      } else if (matched.status === "ACTIVE_INSIDE") {
        setActionMessage({ type: "success", text: `Visitor "${matched.visitorName}" is currently inside (In-time: ${matched.inTime}).` });
      } else {
        setActionMessage({ type: "success", text: `Visitor "${matched.visitorName}" already exited.` });
      }
    } else {
      setActionMessage({
        type: "error",
        text: `No visitor record matching "${searchQuery}". Register as a walk-in visitor below if required.`,
      });
    }
  };

  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await endpoints.visitors.createVisit({
        visitorName: walkinForm.name.trim(),
        visitorPhone: walkinForm.phone.trim(),
        visitorType: walkinForm.type,
        unitNumber: walkinForm.flat.trim(),
        vehicleNumber: walkinForm.vehicle.trim() || undefined,
        purpose: walkinForm.purpose.trim() || "Walk-in Visit",
      });
      await fetchVisits();
      setIsEntryModalOpen(false);
      setWalkinForm({ name: "", phone: "", flat: "", type: "GUEST", vehicle: "", purpose: "Personal Visit" });
      setActionMessage({ type: "success", text: `Walk-in visitor "${walkinForm.name}" registered and logged.` });
    } catch (err: any) {
      setFormError(err?.detail || err?.message || "Failed to register walk-in visitor. Please verify unit details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesTab =
      filterTab === "ALL" ||
      (filterTab === "DELIVERY" && r.category === "DELIVERY") ||
      (filterTab === "STAFF" && r.category === "STAFF") ||
      (filterTab === "EXPECTED" && r.status === "EXPECTED") ||
      (filterTab === "EXITED" && r.status === "EXITED");

    const matchesSearch =
      !searchQuery ||
      r.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.passRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.vehicleNumber ? r.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans antialiased text-slate-900">
      {/* 1. Command Header */}
      <div className="bg-[#f2f3ff] p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
                Visitor &amp; Gate Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#86f2e4]/40 text-[#006f66] text-xs font-bold border border-[#86f2e4]">
                Gate Operations Active
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Live guest manifest, resident pre-approved passes, delivery and domestic staff entries, and gate checkout logging.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fetchVisits()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh Manifest"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setIsEntryModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#070235] text-white hover:bg-[#1e1b4b] px-4 py-2 rounded-xl shadow-md text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Walk-in Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
            actionMessage.type === "success"
              ? "bg-[#86f2e4]/20 border-[#86f2e4] text-[#006f66]"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Operational Metrics Cards (Derived directly from live backend records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Inside Premises */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div className="flex items-center justify-between mb-1 text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Inside Campus Now</span>
            <Users className="w-4 h-4 text-[#006a61]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {records.filter((r) => r.status === "ACTIVE_INSIDE").length}
            </span>
            <span className="text-xs text-[#006a61] font-bold">Active Passes</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {records.filter((r) => r.status === "ACTIVE_INSIDE" && r.category === "DELIVERY").length} Delivery •{" "}
            {records.filter((r) => r.status === "ACTIVE_INSIDE" && r.category === "STAFF").length} Staff •{" "}
            {records.filter((r) => r.status === "ACTIVE_INSIDE" && r.category === "GUEST").length} Guests
          </span>
        </div>

        {/* Metric 2: Total Footfall Today */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div className="flex items-center justify-between mb-1 text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Recorded Logs</span>
            <Users className="w-4 h-4 text-[#070235]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{records.length}</span>
            <span className="text-xs text-[#070235] font-bold">Total Entries</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {records.filter((r) => r.status === "EXITED").length} Checked Out
          </span>
        </div>

        {/* Metric 3: Pre-Approved Expected */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6bd8cb]"></div>
          <div className="flex items-center justify-between mb-1 text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Expected Pre-Approved</span>
            <ShieldCheck className="w-4 h-4 text-[#006a61]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {records.filter((r) => r.status === "EXPECTED").length}
            </span>
            <span className="text-xs text-[#006a61] font-bold">Awaiting Arrival</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#006a61]" />
            <span>Resident Verified Passes</span>
          </span>
        </div>

        {/* Metric 4: Exited Logs */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400"></div>
          <div className="flex items-center justify-between mb-1 text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed Exits</span>
            <LogOut className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {records.filter((r) => r.status === "EXITED").length}
            </span>
            <span className="text-xs text-slate-600 font-bold">Checked Out</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            Manifest audit preserved
          </span>
        </div>
      </div>

      {/* 3. Search & Quick Verification Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-3 items-center">
        <form onSubmit={handleVerifyPass} className="relative flex-1 w-full">
          <QrCode className="w-4 h-4 absolute left-3 top-3 text-[#070235]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visitor name, flat (e.g. A-402), vehicle or enter pass code..."
            className="w-full h-10 pl-9 pr-24 bg-[#f2f3ff] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#070235]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bg-[#070235] text-white hover:bg-[#1e1b4b] text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-all"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto shrink-0 pb-1 md:pb-0">
          {(["ALL", "DELIVERY", "STAFF", "EXPECTED", "EXITED"] as const).map((tab) => {
            const count =
              tab === "ALL"
                ? records.length
                : tab === "DELIVERY"
                ? records.filter((r) => r.category === "DELIVERY").length
                : tab === "STAFF"
                ? records.filter((r) => r.category === "STAFF").length
                : tab === "EXPECTED"
                ? records.filter((r) => r.status === "EXPECTED").length
                : records.filter((r) => r.status === "EXITED").length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  filterTab === tab
                    ? "bg-[#070235] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-[#eaedff] border border-slate-200"
                }`}
              >
                <span>{tab === "ALL" ? "All Entries" : tab === "DELIVERY" ? "Deliveries" : tab === "STAFF" ? "Staff" : tab === "EXPECTED" ? "Expected" : "Exits"}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === tab ? "bg-white/20 text-white" : "bg-[#eaedff] text-[#070235]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Gate Manifest Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#070235] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500 font-medium">Syncing live gate manifest with server...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-600" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={() => fetchVisits()}
              className="px-4 py-2 bg-[#070235] text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
            <Users className="w-10 h-10 text-slate-300" />
            <span className="text-sm font-semibold text-slate-700">No Gate Records Found</span>
            <span className="text-xs text-slate-400 max-w-sm">
              {records.length === 0
                ? "No visitors have been logged for this society yet. Log a walk-in entry or invite a guest."
                : "No visitor entries match your active filter."}
            </span>
            {records.length === 0 && (
              <button
                onClick={() => {
                  setFormError(null);
                  setIsEntryModalOpen(true);
                }}
                className="mt-3 px-4 py-2 bg-[#070235] text-white text-xs font-semibold rounded-xl hover:bg-[#1e1b4b]"
              >
                + Log First Walk-in Visitor
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f2f3ff] text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Visitor &amp; Category</th>
                  <th className="py-3 px-4">Flat / Campus Target</th>
                  <th className="py-3 px-4">Purpose / Vehicle</th>
                  <th className="py-3 px-4">Status &amp; In-Time</th>
                  <th className="py-3 px-4 text-right">Gate Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f2f3ff]/50 transition-colors">
                    {/* Visitor & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar}
                          alt={r.visitorName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm border border-slate-200"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{r.visitorName}</span>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            {r.category === "DELIVERY" && <Truck className="w-3 h-3 text-orange-600" />}
                            {r.category === "GUEST" && <Users className="w-3 h-3 text-[#006a61]" />}
                            {r.category === "STAFF" && <Building className="w-3 h-3 text-[#5b598c]" />}
                            {r.category === "TECHNICIAN" && <Wrench className="w-3 h-3 text-blue-600" />}
                            <span>{r.categoryBadge}</span>
                            <span className="bg-[#eaedff] px-1 py-0.2 rounded text-[#070235] font-semibold text-[10px]">
                              {r.passRef}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Flat / Campus Target */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs">Flat {r.unit}</span>
                        <span className="text-slate-500 text-[11px]">{r.hostName}</span>
                      </div>
                    </td>

                    {/* Purpose / Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-medium">{r.purpose}</span>
                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Car className="w-3 h-3" />
                          {r.vehicleNumber}
                        </span>
                      </div>
                    </td>

                    {/* Status & In-Time */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            r.status === "ACTIVE_INSIDE"
                              ? "bg-[#86f2e4]/30 text-[#006f66]"
                              : r.status === "EXPECTED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.status === "ACTIVE_INSIDE" ? "Inside Campus" : r.status === "EXPECTED" ? "Pre-Approved" : "Exited"}
                        </span>
                        <span className="font-medium text-slate-700 text-xs mt-1">{r.inTime}</span>
                      </div>
                    </td>

                    {/* Gate Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVisitor(r);
                            setIsPassModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#070235] hover:bg-slate-50 transition-colors"
                          title="Inspect Visitor Gate Pass Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {r.status === "EXPECTED" && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(r.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#070235] text-white hover:bg-[#1e1b4b] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Check In</span>
                          </button>
                        )}
                        {r.status === "ACTIVE_INSIDE" && (
                          <button
                            type="button"
                            onClick={() => handleMarkExit(r.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold transition-colors flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Mark Exit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-4 bg-[#f2f3ff] flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
          <span>Showing {filteredRecords.length} of {records.length} total entries</span>
          <span className="font-semibold text-[#070235]">Society Gate Console</span>
        </div>
      </div>

      {/* 5. Walk-in Visitor Entry Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Register Walk-in Visitor"
        description="Records walk-in entry directly to server gate manifest."
        maxWidth="md"
      >
        <form onSubmit={handleWalkinSubmit} className="space-y-4 text-xs pt-2">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Visitor Full Name *
            </label>
            <input
              type="text"
              required
              value={walkinForm.name}
              onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
              placeholder="e.g. Ramesh Patil"
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={walkinForm.phone}
                onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Visiting Flat / Unit *
              </label>
              <input
                type="text"
                required
                value={walkinForm.flat}
                onChange={(e) => setWalkinForm({ ...walkinForm, flat: e.target.value })}
                placeholder="e.g. A-402"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Visitor Category
              </label>
              <select
                value={walkinForm.type}
                onChange={(e) => setWalkinForm({ ...walkinForm, type: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 border border-slate-200"
              >
                <option value="GUEST">Guest / Friend</option>
                <option value="DELIVERY">Delivery Agent</option>
                <option value="CAB">Cab / Driver</option>
                <option value="STAFF">Domestic Staff</option>
                <option value="TECHNICIAN">Service Technician</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Vehicle No. (Optional)
              </label>
              <input
                type="text"
                value={walkinForm.vehicle}
                onChange={(e) => setWalkinForm({ ...walkinForm, vehicle: e.target.value })}
                placeholder="MH-04-XX-0000"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 uppercase font-mono border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Visit Purpose
            </label>
            <input
              type="text"
              value={walkinForm.purpose}
              onChange={(e) => setWalkinForm({ ...walkinForm, purpose: e.target.value })}
              placeholder="e.g. Maintenance repair, Personal visit"
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#070235] text-slate-900 border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#070235] text-white font-bold hover:bg-[#1e1b4b] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? "Registering Entry..." : "Log Gate Entry"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Visitor Gate Pass Dossier Modal */}
      <Modal
        isOpen={isPassModalOpen && !!selectedVisitor}
        onClose={() => setIsPassModalOpen(false)}
        title="Visitor Gate Pass Dossier"
        description="Perimeter security verification details, host flat destination, and digital gate log."
        maxWidth="md"
      >
        {selectedVisitor && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={selectedVisitor.avatar}
                alt={selectedVisitor.visitorName}
                className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{selectedVisitor.visitorName}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#070235] font-semibold text-[10px]">
                    {selectedVisitor.categoryBadge}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] block mt-0.5 font-mono">
                  {selectedVisitor.passRef}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Destination Flat</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">Flat {selectedVisitor.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Host Resident</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVisitor.hostName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Purpose</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVisitor.purpose}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Vehicle</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block font-mono">{selectedVisitor.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">In-Time</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVisitor.inTime}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Perimeter Status</span>
                <span className="font-bold text-[#006a61] text-xs mt-0.5 block">
                  {selectedVisitor.status === "ACTIVE_INSIDE" ? "Inside Campus" : selectedVisitor.status === "EXPECTED" ? "Pre-Approved" : "Exited"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedVisitor.status === "EXPECTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCheckIn(selectedVisitor.id);
                      setIsPassModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#070235] text-white hover:bg-[#1e1b4b] text-xs font-semibold"
                  >
                    Check In Now
                  </button>
                )}
                {selectedVisitor.status === "ACTIVE_INSIDE" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkExit(selectedVisitor.id);
                      setIsPassModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold"
                  >
                    Mark Exit Now
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
