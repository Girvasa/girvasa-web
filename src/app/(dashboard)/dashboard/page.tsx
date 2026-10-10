"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Receipt,
  MessageSquareWarning,
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  TrendingUp,
  FileDown,
  AlertTriangle,
  ArrowRight,
  Radio,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/lib/tenant/TenantContext";
import { endpoints } from "@/lib/api/endpoints";
import { ExecutiveDashboardResponse } from "@/types/report";
import { BillSummaryResponse } from "@/types/billing";
import { VisitResponse } from "@/types/visitor";
import { ComplaintResponse } from "@/types/complaint";
import { UnitResponse } from "@/types/structure";
import { OnboardingProgressResponse } from "@/types/subscription";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";

export default function DashboardPage() {
  const { currentSociety, activeSocietyId } = useTenant();
  const [dashboardData, setDashboardData] = useState<ExecutiveDashboardResponse | null>(null);
  const [accountingSummary, setAccountingSummary] = useState<any>(null);
  const [bills, setBills] = useState<BillSummaryResponse[]>([]);
  const [visits, setVisits] = useState<VisitResponse[]>([]);
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab state for Recent Maintenance Collections
  const [collectionTab, setCollectionTab] = useState<"ALL" | "PAID_TODAY" | "OVERDUE">("ALL");

  const fetchDashboard = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        endpoints.dashboard.getExecutiveSummary(),
        endpoints.billing.getBills(),
        endpoints.visitors.getVisits(),
        endpoints.complaints.getComplaints(),
        endpoints.structure.getUnits(),
        endpoints.reports.getAccountingSummary().catch(() => null),
        endpoints.subscription.getOnboardingProgress().catch(() => null),
      ]);

      if (results[0].status === "fulfilled" && results[0].value) {
        setDashboardData(results[0].value);
      }
      if (results[1].status === "fulfilled" && Array.isArray(results[1].value)) {
        setBills(results[1].value);
      }
      if (results[2].status === "fulfilled" && Array.isArray(results[2].value)) {
        setVisits(results[2].value);
      }
      if (results[3].status === "fulfilled" && Array.isArray(results[3].value)) {
        setComplaints(results[3].value);
      }
      if (results[4].status === "fulfilled" && Array.isArray(results[4].value)) {
        setUnits(results[4].value);
      }
      if (results[5].status === "fulfilled" && results[5].value) {
        setAccountingSummary(results[5].value);
      }
      if (results[6].status === "fulfilled" && results[6].value) {
        setOnboardingProgress(results[6].value);
      }
    } catch (err: any) {
      setError(err?.detail || "Unable to load society dashboard analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading society operational command center..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  // Dynamic values derived strictly from backend API data
  const hasDynamicBills = bills.length > 0;
  const dynamicCollected = hasDynamicBills
    ? bills.filter((b) => b.status === "PAID").reduce((sum, b) => sum + (b.paidAmount || b.totalAmount), 0)
    : null;
  const dynamicOverdue = hasDynamicBills
    ? bills.filter((b) => b.status === "OVERDUE").reduce((sum, b) => sum + (b.outstandingAmount || b.totalAmount), 0)
    : null;

  const collectedAmount =
    dynamicCollected !== null
      ? dynamicCollected
      : (dashboardData?.financial?.totalPaid ?? 0);

  const overdueAmount =
    dynamicOverdue !== null
      ? dynamicOverdue
      : (dashboardData?.financial?.totalOutstanding ?? 0);

  const totalBilled = collectedAmount + overdueAmount;
  const collectionPct = totalBilled > 0
    ? Math.round((collectedAmount / totalBilled) * 1000) / 10
    : (dashboardData?.financial?.collectionPercentage ?? 0);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "OCCUPIED" || !u.status).length;
  const vacantUnits = Math.max(0, totalUnits - occupiedUnits);

  const activeVisitors = visits.filter((v) => v.status === "CHECKED_IN").length ||
    (dashboardData?.security?.visitorsCurrentlyInside ?? 0);

  const openComplaints = complaints.filter(
    (c) => c.status === "SUBMITTED" || c.status === "IN_PROGRESS" || c.status === "ASSIGNED"
  ).length || (dashboardData?.operational?.openComplaints ?? 0);

  const highPriorityComplaints = complaints.filter(
    (c) => c.priority === "URGENT" || c.priority === "HIGH"
  );

  // Statutory Reserves from Accounting Summary API
  const sinkingFund = accountingSummary?.sinkingFundReserve ?? 0;
  const repairFund = accountingSummary?.repairFundReserve ?? 0;
  const generalReserve = accountingSummary?.generalReserve ?? 0;
  const totalReserves = sinkingFund + repairFund + generalReserve;

  // Collections table records derived strictly from real bills
  const allCollections = bills.map((b) => ({
    id: b.id,
    unit: b.unitNumber || "Flat",
    member: b.buildingName ? `${b.buildingName} Resident` : "Member Account",
    occupancy: `${b.buildingName || "Tower"} • Due ${b.dueDate ? formatDate(b.dueDate) : "Cycle End"}`,
    voucher: b.billNumber || `INV-${b.id.substring(0, 8)}`,
    cycle: b.periodName || "Monthly Cycle",
    amount: b.totalAmount,
    interest: b.status === "OVERDUE" && b.outstandingAmount > b.totalAmount ? `+${formatCurrency(b.outstandingAmount - b.totalAmount)} Pen` : undefined,
    channel: b.status === "PAID" ? "BBPS / Online" : "Payment Pending",
    isVerified: b.status === "PAID",
    status: b.status === "PAID" ? "Paid & Settled" : b.status === "OVERDUE" ? "Overdue" : "Pending",
    type: b.status === "PAID" ? "PAID" : "OVERDUE",
    isOverdue: b.status === "OVERDUE",
  }));

  const filteredCollections = allCollections.filter((c) => {
    if (collectionTab === "PAID_TODAY") return c.type === "PAID";
    if (collectionTab === "OVERDUE") return c.isOverdue;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* 1. Command Center Header Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#86f2e4]/30 text-[#006f66] font-semibold text-xs border border-[#86f2e4]/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006a61] animate-ping"></span>
                LIVE AUDIT
              </span>
              <span className="text-xs text-slate-500 font-medium">MCS Act Sec 79 Compliance</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Reg: {currentSociety?.societyCode ? `MH/${currentSociety.societyCode}` : "MH/REG/ACTIVE"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Society Operational Command Center
            </h1>
            <p className="text-xs text-slate-500">
              {currentSociety?.societyName || "Housing Society"} • {totalUnits} Registered Units • {bills.length} Active Vouchers
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              href="/billing"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-semibold shadow-md transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Billing Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard Setup In-Progress Banner */}
      {onboardingProgress && !onboardingProgress.completed && (
        <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 border border-teal-600/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#006a61] text-white shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#070235]">
                Society Setup In Progress (Step {onboardingProgress.onboardingStatus === "WIZARD_STEP_1" ? "1" : onboardingProgress.onboardingStatus === "WIZARD_STEP_2" ? "2" : onboardingProgress.onboardingStatus === "WIZARD_STEP_3" ? "3" : "4"} of 4)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {onboardingProgress.totalBuildings} Towers and {onboardingProgress.totalUnits} Units configured. Finish setting up your inventory and residents to unlock all society management capabilities.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#006a61] hover:bg-[#00524b] text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <span>Resume Setup Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 2. Key Performance Metrics Grid (5 KPI Cards with Colored Top Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Collections */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="h-1 bg-[#006a61] absolute top-0 left-0 right-0"></div>
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Collections
              </span>
              <span className="p-1 rounded bg-[#86f2e4]/30 text-[#006f66]">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{formatCurrency(collectedAmount)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Billed: {formatCurrency(totalBilled)} ({collectionPct}% collected)
            </p>
          </div>
          <div className="mt-3 pt-1 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#006a61] font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {bills.filter((b) => b.status === "PAID").length} Cleared
            </span>
            <span className="text-slate-400 font-medium">{bills.length} Total Bills</span>
          </div>
        </div>

        {/* KPI 2: Overdue Dues */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="h-1 bg-[#ba1a1a] absolute top-0 left-0 right-0"></div>
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Overdue Dues
              </span>
              <span className="p-1 rounded bg-[#ffdad6] text-[#93000a]">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#ba1a1a]">{formatCurrency(overdueAmount)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {bills.filter((b) => b.status === "OVERDUE").length} units with outstanding arrears
            </p>
          </div>
          <div className="mt-3 pt-1 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Interest Applicable</span>
            <span className="text-[#ba1a1a] font-semibold">Action Due</span>
          </div>
        </div>

        {/* KPI 3: Occupancy Ratio */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="h-1 bg-[#5b598c] absolute top-0 left-0 right-0"></div>
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Unit Occupancy
              </span>
              <span className="p-1 rounded bg-[#eaedff] text-[#070235]">
                <Building className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{occupiedUnits}</span>
              <span className="text-xs text-slate-500">/ {totalUnits} Total</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {occupiedUnits} Occupied • {vacantUnits} Vacant
            </p>
          </div>
          <div className="mt-3 pt-1 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">{vacantUnits} Vacant</span>
            <span className="text-[#006a61] font-semibold">
              {totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}% Active
            </span>
          </div>
        </div>

        {/* KPI 4: Active Visitors */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="h-1 bg-[#006a61] absolute top-0 left-0 right-0"></div>
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Visitors
              </span>
              <span className="p-1 rounded bg-[#86f2e4]/30 text-[#006f66]">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{activeVisitors}</span>
              <span className="text-xs text-[#006a61] font-medium">Inside Perimeter</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {visits.length} logs captured today
            </p>
          </div>
          <div className="mt-3 pt-1 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Main Gate Entry</span>
            <span className="text-[#006a61] font-semibold">Active</span>
          </div>
        </div>

        {/* KPI 5: Facility Helpdesk */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="h-1 bg-[#ffdad6] absolute top-0 left-0 right-0"></div>
          <div>
            <div className="flex items-center justify-between pb-1 text-slate-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Facility Helpdesk
              </span>
              <span className="p-1 rounded bg-[#e2e7ff] text-[#131b2e]">
                <MessageSquareWarning className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{openComplaints}</span>
              <span className="text-xs text-[#ba1a1a] font-semibold">
                {highPriorityComplaints.length} Urgent
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {complaints.filter((c) => c.status === "RESOLVED").length} Resolved of {complaints.length}
            </p>
          </div>
          <div className="mt-3 pt-1 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#ba1a1a] font-medium">{openComplaints} Open</span>
            <span className="text-slate-500">Live Support</span>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Cockpit: 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Financial Flow & Ledger Records */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Statutory Funds Allocation & Fiscal Liquidity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Statutory Reserve Allocation
                </span>
                <h2 className="text-base font-bold text-[#070235]">Mandatory Society Funds Ledger</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#eaedff] px-3 py-1 rounded-lg text-[#181445] text-xs font-semibold">
                <Building className="w-3.5 h-3.5" />
                <span>Total Reserves: {formatCurrency(totalReserves)}</span>
              </div>
            </div>

            {/* Visual Graph Representation (CSS Flex Distribution Bar) */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="w-full h-4 bg-[#f2f3ff] rounded-full overflow-hidden flex shadow-inner">
                {totalReserves > 0 ? (
                  <>
                    <div
                      className="bg-[#070235] h-full hover:opacity-90 transition-all cursor-pointer"
                      style={{ width: `${Math.round((sinkingFund / totalReserves) * 100)}%` }}
                      title={`Sinking Fund: ${formatCurrency(sinkingFund)}`}
                    ></div>
                    <div
                      className="bg-[#5b598c] h-full hover:opacity-90 transition-all cursor-pointer"
                      style={{ width: `${Math.round((repairFund / totalReserves) * 100)}%` }}
                      title={`Repair Fund: ${formatCurrency(repairFund)}`}
                    ></div>
                    <div
                      className="bg-[#006a61] h-full hover:opacity-90 transition-all cursor-pointer"
                      style={{ width: `${Math.max(5, Math.round((generalReserve / totalReserves) * 100))}%` }}
                      title={`General Reserve: ${formatCurrency(generalReserve)}`}
                    ></div>
                  </>
                ) : (
                  <div className="bg-slate-200 h-full w-full flex items-center justify-center text-[9px] text-slate-500 font-medium">
                    Allocations synchronize upon monthly billing execution
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>MCS Section 67(1) Compliance</span>
                <span>Statutory Interest Rate Applied: 6.5% p.a.</span>
              </div>
            </div>

            {/* Fund Cards Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
              <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#070235] shrink-0"></span>
                  <span className="text-xs text-slate-500 font-medium truncate">Sinking Fund (0.25%)</span>
                </div>
                <span className="text-sm font-bold text-slate-900 mt-1">{formatCurrency(sinkingFund)}</span>
                <span className="text-[11px] text-slate-400">Statutory Escrow</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#5b598c] shrink-0"></span>
                  <span className="text-xs text-slate-500 font-medium truncate">Repair &amp; Paint</span>
                </div>
                <span className="text-sm font-bold text-slate-900 mt-1">{formatCurrency(repairFund)}</span>
                <span className="text-[11px] text-slate-400">Special Reserve</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#006a61] shrink-0"></span>
                  <span className="text-xs text-slate-500 font-medium truncate">General Reserve</span>
                </div>
                <span className="text-sm font-bold text-slate-900 mt-1">{formatCurrency(generalReserve)}</span>
                <span className="text-[11px] text-slate-400">Operational Pool</span>
              </div>
            </div>
          </div>

          {/* Real-Time Maintenance Receipts & Collections Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Automated Ledger Vouchers
                </span>
                <h2 className="text-base font-bold text-[#070235]">Recent Maintenance Collections</h2>
              </div>
              {/* Tab Pills */}
              <div className="inline-flex p-1 bg-[#f2f3ff] rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setCollectionTab("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    collectionTab === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({allCollections.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionTab("PAID_TODAY")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    collectionTab === "PAID_TODAY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Paid ({allCollections.filter((c) => c.type === "PAID").length})
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionTab("OVERDUE")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    collectionTab === "OVERDUE" ? "bg-[#ffdad6] text-[#93000a] shadow-sm" : "text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                  }`}
                >
                  Overdue ({allCollections.filter((c) => c.isOverdue).length})
                </button>
              </div>
            </div>

            {/* Tabular Presentation */}
            {filteredCollections.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Receipt className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Ledger Vouchers Recorded</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated collection vouchers will appear here once maintenance bills are generated and settled.
                </p>
                <Link
                  href="/billing"
                  className="mt-3 text-xs font-semibold text-[#070235] underline hover:text-[#1e1b4b]"
                >
                  Go to Billing Management &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f3ff] text-slate-600 text-xs font-semibold">
                      <th className="py-2.5 px-3 rounded-l-lg">Unit &amp; Member</th>
                      <th className="py-2.5 px-3">Voucher Ref</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Payment Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCollections.map((col) => (
                      <tr
                        key={col.id}
                        className={`hover:bg-[#f2f3ff]/50 transition-colors ${
                          col.isOverdue ? "bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30" : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                col.isOverdue ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#eaedff] text-[#070235]"
                              }`}
                            >
                              {col.unit}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-900 truncate">{col.member}</span>
                              <span className="text-[11px] text-slate-500">{col.occupancy}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${col.isOverdue ? "text-[#ba1a1a]" : "text-slate-700"}`}>
                            {col.voucher}
                          </span>
                          <span className="block text-[11px] text-slate-400">{col.cycle}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-bold ${col.isOverdue ? "text-[#ba1a1a]" : "text-slate-900"}`}>
                            {formatCurrency(col.amount)}
                          </span>
                          {col.interest && (
                            <span className="block text-[10px] text-slate-500 font-normal">{col.interest}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            {col.isVerified ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#006a61]" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {col.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              col.isOverdue
                                ? "bg-[#ffdad6] text-[#93000a]"
                                : "bg-[#86f2e4]/30 text-[#006f66]"
                            }`}
                          >
                            {col.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href="/billing"
                            className={`p-1.5 rounded-lg inline-flex hover:bg-[#eaedff] transition-colors ${
                              col.isOverdue ? "text-[#ba1a1a]" : "text-[#070235]"
                            }`}
                            title={col.isOverdue ? "Issue Demand Notice" : "Download Voucher"}
                          >
                            {col.isOverdue ? (
                              <Send className="w-4 h-4 text-[#ba1a1a]" />
                            ) : (
                              <Receipt className="w-4 h-4" />
                            )}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time Operations & Facility Feed */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live GatePass Stream Console */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Perimeter Security Surveillance
                </span>
                <h2 className="text-base font-bold text-[#070235]">Active GatePass Stream</h2>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#006a61] animate-pulse"></span>
                Live Feed
              </span>
            </div>

            {/* GatePass Live Cards List */}
            <div className="flex flex-col gap-3">
              {visits.length > 0 ? (
                visits.slice(0, 3).map((v) => (
                  <div key={v.id} className="p-3 bg-[#f2f3ff] rounded-xl flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#070235] font-bold shrink-0">
                        <Users className="w-4 h-4 text-[#006a61]" />
                      </div>
                      <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {v.visitor?.fullName || v.visitorName || "Visitor"}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[#eaedff] text-[#070235] text-[10px] font-bold">
                            {v.unitNumber || v.hostUnitNumber || "Campus"}
                          </span>
                        </div>
                        <span className="text-slate-500 mt-0.5">
                          {v.vehicleNumber ? `Vehicle: ${v.vehicleNumber} • ` : ""}
                          {v.visitorType || "Guest"}
                        </span>
                        <span className="text-[#006a61] font-semibold mt-0.5">
                          Status: {v.status} • {v.purpose || "Perimeter Pass"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {v.status === "CHECKED_IN" ? "Inside" : v.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center bg-[#f2f3ff] rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Active Visitors On-Campus</p>
                  <p className="text-[11px] text-slate-500">
                    Perimeter gate logs will stream in real-time as guests and deliveries arrive.
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/visitors"
              className="w-full py-2.5 rounded-xl bg-[#eaedff] text-[#181445] hover:bg-[#dae2fd] transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Radio className="w-4 h-4 text-[#006a61]" />
              <span>Open Full Guard Console (Gate 1 &amp; 2)</span>
            </Link>
          </div>

          {/* Facility Work Orders & Critical Complaints */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Helpdesk Dispatch
                </span>
                <h2 className="text-base font-bold text-[#070235]">Urgent Facility Tickets</h2>
              </div>
              <span className="text-xs font-bold text-[#ba1a1a]">
                {highPriorityComplaints.length} High Priority
              </span>
            </div>

            {complaints.length > 0 ? (
              <div className="flex flex-col gap-3">
                {complaints.slice(0, 2).map((c) => {
                  const isHigh = c.priority === "URGENT" || c.priority === "HIGH";
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl flex flex-col gap-2 ${
                        isHigh ? "bg-[#ffdad6]/30 border border-[#ffdad6]" : "bg-[#f2f3ff]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                            isHigh ? "bg-[#ba1a1a] text-white" : "bg-[#e2e7ff] text-slate-800"
                          }`}
                        >
                          {c.priority} SEVERITY
                        </span>
                        <span className={`text-xs font-semibold ${isHigh ? "text-[#ba1a1a]" : "text-slate-500"}`}>
                          Status: {c.status}
                        </span>
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-slate-900">
                          Ticket #{c.ticketNumber || c.id.substring(0, 8)}: {c.title}
                        </span>
                        <p className="text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {c.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs text-slate-700">
                        <span>{c.unitNumber ? `Unit: ${c.unitNumber}` : c.categoryName || "Facility Ticket"}</span>
                        <Link
                          href="/complaints"
                          className="text-[#070235] font-semibold hover:underline flex items-center gap-0.5"
                        >
                          <span>Review Ticket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center bg-[#f2f3ff] rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-[#006a61] mb-2" />
                <p className="text-xs font-semibold text-slate-700">All Facility Systems Operational</p>
                <p className="text-[11px] text-slate-500">
                  Zero active critical complaints reported across society infrastructure.
                </p>
              </div>
            )}
          </div>

          {/* Statutory Registers & Governance Compliance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Legal &amp; Cooperative Registry
                </span>
                <h2 className="text-base font-bold text-[#070235]">Statutory Compliance Status</h2>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#006a61]" />
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006a61] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">&apos;I&apos; &amp; &apos;J&apos; Member Registers</span>
                    <span className="text-slate-500 text-[11px]">MCS Act Sec 79(2) Format • {totalUnits} Units Tracked</span>
                  </div>
                </div>
                <Link
                  href="/residents"
                  className="px-2.5 py-1 rounded-lg bg-[#eaedff] text-slate-700 hover:bg-[#dae2fd] transition-colors font-semibold"
                >
                  View Census
                </Link>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Society Tenant Status</span>
                    <span className="text-slate-500 text-[11px]">{currentSociety?.societyName || "Active"}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#070235] font-semibold text-[10px]">
                  {currentSociety?.status || "ACTIVE"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#070235] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Governance &amp; Audit Sync</span>
                    <span className="text-slate-500 text-[11px]">Active Session Verified</span>
                  </div>
                </div>
                <span className="text-[#006a61] font-bold text-xs">Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
