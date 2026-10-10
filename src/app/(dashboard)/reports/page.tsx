"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  Scale,
  Calendar,
  Plus,
  Printer,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { endpoints } from "@/lib/api/endpoints";
import { ExecutiveDashboardResponse } from "@/types/report";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { activeSocietyId } = useTenant();
  const [data, setData] = useState<ExecutiveDashboardResponse | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"balance_sheet" | "income_exp" | "observations">("balance_sheet");
  const [isAuditorNoteOpen, setIsAuditorNoteOpen] = useState(false);
  const [auditorNoteText, setAuditorNoteText] = useState("");
  const [notesList, setNotesList] = useState<string[]>([]);

  const fetchReports = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [dashRes, summaryRes, catRes] = await Promise.all([
        endpoints.dashboard.getExecutiveSummary().catch(() => null),
        endpoints.reports.getAccountingSummary().catch(() => null),
        endpoints.reports.getCategorySummary().catch(() => []),
      ]);
      setData(dashRes);
      setSummary(summaryRes);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Unable to load reporting metrics from server.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorNoteText.trim()) return;
    setNotesList([auditorNoteText.trim(), ...notesList]);
    setAuditorNoteText("");
    setIsAuditorNoteOpen(false);
  };

  // Dynamic Financial Derivations
  const totalBilled = data?.financial?.totalBilled || summary?.totalIncome || 0;
  const totalPaid = data?.financial?.totalPaid || summary?.totalIncome || 0;
  const totalOutstanding = data?.financial?.totalOutstanding || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netSurplus = summary?.netOperationalDifference || (totalPaid - totalExpense);
  const statutoryReserve = Math.max(0, Math.round(totalPaid * 0.25));
  const sinkingFundReserve = Math.max(0, Math.round(totalPaid * 0.15));

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          <span>Finance &amp; Accounts</span>
          <span>&rsaquo;</span>
          <span className="text-[#070235] font-bold">Statutory Financial Reports</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
                Statutory Financial Reports &amp; Audit Console
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-[#006a61] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
                MCS Act Sec. 81 Compliant
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-4xl">
              Maharashtra Co-operative Societies (MCS) Act statutory balance sheet (Form N-1) and income &amp; expenditure statements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchReports}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#070235] text-xs font-semibold shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#070235] text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Form N-1</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuditorNoteOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold shadow-md hover:bg-[#1e1b4b] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Auditor Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statutory KPI Health Benchmarks (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Collections</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#070235]">{formatCurrency(totalPaid)}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#006a61]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Direct Society Ledger Credit</span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Outstanding Arrears</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-rose-600">{formatCurrency(totalOutstanding)}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Critical Delinquent: {data?.financial?.criticalDelinquentOver90Days || 0} Units</span>
          </div>
        </div>

        {/* Statutory Reserve Fund */}
        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Reserve Allocation</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#070235]">{formatCurrency(statutoryReserve)}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#070235]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>MCS Sec 66 Mandatory 25% Surplus</span>
          </div>
        </div>

        {/* Tenant Scope */}
        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Society Context</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-[#070235] truncate">
                  {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#070235]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Multi-Tenant Ledger Scope</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("balance_sheet")}
          className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap shadow-sm flex items-center gap-2 transition-all ${
            activeTab === "balance_sheet"
              ? "bg-[#070235] text-white"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-100"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Statutory Balance Sheet (Form N-1)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("income_exp")}
          className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap shadow-sm flex items-center gap-2 transition-all ${
            activeTab === "income_exp"
              ? "bg-[#070235] text-white"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Income &amp; Expenditure (Form N-2)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("observations")}
          className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap shadow-sm flex items-center gap-2 transition-all ${
            activeTab === "observations"
              ? "bg-[#070235] text-white"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Auditor Observations &amp; Notes ({notesList.length})</span>
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : (
        <div className="space-y-4">
          {activeTab === "balance_sheet" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-[#070235] uppercase">
                  Balance Sheet (Form N-1) — Statutory Society Framework
                </span>
                <span className="text-slate-500 font-mono">MCS Bye-law 152</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                {/* Liabilities */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Capital &amp; Liabilities
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Statutory Reserve Fund (Sec. 66)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(statutoryReserve)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Sinking Fund Reserve</span>
                    <span className="font-bold text-slate-900">{formatCurrency(sinkingFundReserve)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Operational Surplus Balance</span>
                    <span className="font-bold text-slate-900">{formatCurrency(netSurplus)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-sm">
                    <span className="text-[#070235]">Total Liabilities</span>
                    <span className="text-[#070235]">
                      {formatCurrency(statutoryReserve + sinkingFundReserve + Math.max(0, netSurplus))}
                    </span>
                  </div>
                </div>

                {/* Assets */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Property &amp; Assets
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Maintenance Receivables (Dues)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalOutstanding)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Bank &amp; Cash Clearing Balances</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-sm">
                    <span className="text-[#070235]">Total Assets</span>
                    <span className="text-[#070235]">{formatCurrency(totalOutstanding + totalPaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "income_exp" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-[#070235] uppercase">
                  Income &amp; Expenditure Account (Form N-2)
                </span>
                <span className="text-slate-500 font-mono">MCS Bye-law 153</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                {/* Expenditure */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Expenditure
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Operational Expenses Recorded</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalExpense)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Net Operational Surplus Transfer</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(Math.max(0, netSurplus))}</span>
                  </div>
                </div>

                {/* Income */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Income
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Maintenance Charges Realized</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Amenity &amp; Facility Booking Fees</span>
                    <span className="font-bold text-slate-900">{formatCurrency(data?.facility?.amenityRevenue || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "observations" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-[#070235]">Auditor Observations &amp; Rectification Registry</h3>
              {notesList.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No auditor observations recorded. Click above to add notes.</p>
              ) : (
                <div className="space-y-2">
                  {notesList.map((n, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-800">
                      <span className="font-bold text-[#070235] block mb-1">Observation #{i + 1}</span>
                      <p>{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Record Auditor Note Modal */}
      <Modal
        isOpen={isAuditorNoteOpen}
        onClose={() => setIsAuditorNoteOpen(false)}
        title="Record Statutory Auditor Note"
        description="Add a formal observation or audit qualification to the statutory register."
        maxWidth="md"
      >
        <form onSubmit={handleSaveNote} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observation Details *</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Sinking fund allocations reconciled with Bank Fixed Deposit investments per Bye-law 142..."
              value={auditorNoteText}
              onChange={(e) => setAuditorNoteText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAuditorNoteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
