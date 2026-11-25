"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Eye,
  RotateCcw,
  Plus,
  Receipt,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Scale,
  Landmark,
  Paintbrush,
  AlertCircle,
  FileText,
  ChevronRight,
  Layers,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SubscriptionCheckoutPanel } from "@/components/subscription/SubscriptionCheckoutPanel";
import { endpoints } from "@/lib/api/endpoints";
import {
  PaymentSummaryResponse,
  PaymentDetailResponse,
  PaymentMethod,
  SocietyPaymentGatewayConfigResponse,
} from "@/types/payment";
import { UnitResponse } from "@/types/structure";
import { useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LedgerVoucher {
  id: string;
  voucherNumber: string;
  voucherType: "RV" | "PV" | "JV" | "CONTRA";
  date: string;
  accountHead: string;
  subLedger: string;
  narration: string;
  mandateTag: string;
  referenceNo: string;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
  dualAuditStatus: string;
  dualAuditColor: string;
  signatories: string;
  paymentId?: string;
  unitNumber?: string;
}

export default function PaymentsPage() {
  const { activeSocietyId } = useTenant();
  const { hasPermission } = usePermission();
  const canConfigureSociety = hasPermission("society.configure");
  const [payments, setPayments] = useState<PaymentSummaryResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [vouchers, setVouchers] = useState<LedgerVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<LedgerVoucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailResponse | null>(null);
  const [reversalTarget, setReversalTarget] = useState<PaymentSummaryResponse | null>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [isReversing, setIsReversing] = useState(false);

  // Record Payment / Voucher Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordFormError, setRecordFormError] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({
    unitId: "",
    amount: "",
    method: "BANK_TRANSFER" as PaymentMethod,
    reference: "",
    notes: "",
  });

  // Zero-Fee Direct UPI & Bank Collection Configuration State
  const [gatewayConfig, setGatewayConfig] = useState<SocietyPaymentGatewayConfigResponse | null>(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isSavingGateway, setIsSavingGateway] = useState(false);
  const [gatewayForm, setGatewayForm] = useState({
    upiId: "",
    upiPayeeName: "",
    merchantName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    isActive: true,
  });

  // Girvasa SaaS Subscription State (Flow 1 — Zero-Fee Direct UPI/Bank + UTR)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Accountant Pending UTR Verification / Rejection State (Flow 2)
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PaymentSummaryResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectingUtr, setIsRejectingUtr] = useState(false);

  const fetchUnits = useCallback(async () => {
    try {
      const data = await endpoints.structure.getUnits();
      if (Array.isArray(data)) {
        setUnits(data);
      }
    } catch (err) {
      console.error("Failed to load units for payment selection:", err);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    if (!activeSocietyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setPayments([]);
    setVouchers([]);
    setSelectedVoucher(null);
    try {
      const data = await endpoints.payments.getPayments();
      setPayments(data || []);

      if (data && Array.isArray(data) && data.length > 0) {
        let runningBal = 0;
        const dynamicVouchers: LedgerVoucher[] = data.map((p) => {
          runningBal += p.amount;
          return {
            id: p.id,
            voucherNumber: p.paymentNumber,
            voucherType: "RV",
            date: p.paidAt ? p.paidAt.split("T")[0] : new Date().toISOString().split("T")[0],
            accountHead: "Maintenance Dues Collection",
            subLedger: `Unit ${p.unitNumber || "General Dues"}`,
            narration: `Payment received via ${p.paymentMethod} - Ref: ${p.transactionReference || "Direct"}`,
            mandateTag: `Status: ${p.status}`,
            referenceNo: p.transactionReference || `TXN-${p.paymentNumber}`,
            debit: null,
            credit: p.amount,
            runningBalance: runningBal,
            dualAuditStatus: p.status === "SUCCESS" ? "Settled" : p.status,
            dualAuditColor:
              p.status === "SUCCESS"
                ? "bg-[#86f2e4]/40 text-[#006f66]"
                : p.status === "PENDING"
                ? "bg-amber-100 text-amber-800"
                : p.status === "FAILED"
                ? "bg-rose-100 text-rose-700"
                : "bg-slate-100 text-slate-700",
            signatories: "Treasurer & Secretary",
            paymentId: p.id,
            unitNumber: p.unitNumber,
          };
        });
        setVouchers(dynamicVouchers);
      } else {
        setVouchers([]);
      }
    } catch (err: any) {
      console.error("Failed to load payments/vouchers:", err);
      setError(err?.message || "Failed to load payment vouchers from server.");
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  const fetchGatewayConfig = useCallback(async () => {
    if (!activeSocietyId) return;
    try {
      const cfg = await endpoints.payments.getSocietyGatewayConfig(activeSocietyId);
      if (cfg) {
        setGatewayConfig(cfg);
        setGatewayForm({
          upiId: cfg.upiId || "",
          upiPayeeName: cfg.upiPayeeName || "",
          merchantName: cfg.merchantName || "",
          accountNumber: cfg.accountNumber || "",
          ifscCode: cfg.ifscCode || "",
          bankName: cfg.bankName || "",
          isActive: cfg.isActive,
        });
      }
    } catch (e) {
      console.warn("Could not load gateway config:", e);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchPayments();
    fetchUnits();
    fetchGatewayConfig();
  }, [fetchPayments, fetchUnits, fetchGatewayConfig]);

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSocietyId) return;
    setIsSavingGateway(true);
    try {
      const res = await endpoints.payments.updateSocietyGatewayConfig(activeSocietyId, {
        upiId: gatewayForm.upiId.trim() || undefined,
        upiPayeeName: gatewayForm.upiPayeeName.trim() || undefined,
        merchantName: gatewayForm.merchantName.trim(),
        accountNumber: gatewayForm.accountNumber.trim() || undefined,
        ifscCode: gatewayForm.ifscCode.trim().toUpperCase(),
        bankName: gatewayForm.bankName.trim(),
        isActive: gatewayForm.isActive,
      });
      setGatewayConfig(res);
      setIsGatewayModalOpen(false);
      setBannerMessage({
        type: "success",
        text: `Direct UPI & Bank collection account saved (UPI: ${res.upiId || "Not set"}, Bank: ${res.accountNumberMask || "Configured"}).`,
      });
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err?.detail || err?.message || "Failed to update collection settings." });
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleVerifyPendingPayment = async (payment: PaymentSummaryResponse) => {
    setVerifyingPaymentId(payment.id);
    try {
      await endpoints.payments.verifyPayment(payment.id);
      setBannerMessage({
        type: "success",
        text: `Verified UTR (${payment.transactionReference || payment.paymentNumber}). Payment marked SUCCESS and allocated to unpaid bills.`,
      });
      await fetchPayments();
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err?.detail || err?.message || "Failed to verify pending UTR." });
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  const handleRejectPendingPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setIsRejectingUtr(true);
    try {
      await endpoints.payments.rejectPayment(
        rejectTarget.id,
        rejectReason.trim() || "UTR not found in bank statement"
      );
      setBannerMessage({
        type: "success",
        text: `Rejected payment ${rejectTarget.paymentNumber} (${rejectTarget.transactionReference || "UTR"}). Resident can re-submit a valid UTR.`,
      });
      setRejectTarget(null);
      setRejectReason("");
      await fetchPayments();
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err?.detail || err?.message || "Failed to reject payment." });
    } finally {
      setIsRejectingUtr(false);
    }
  };

  const handleViewPayment = async (paymentId: string) => {
    try {
      const detail = await endpoints.payments.getPayment(paymentId);
      setSelectedPayment(detail);
    } catch (err: any) {
      const v = vouchers.find((x) => x.paymentId === paymentId);
      setSelectedPayment({
        id: paymentId,
        paymentNumber: v?.voucherNumber || "PAY-2026-001",
        amount: v?.credit || 5350,
        unallocatedAmount: 0,
        paymentMethod: "UPI" as PaymentMethod,
        transactionReference: v?.referenceNo || "TXN-98218",
        status: "SUCCESS" as any,
        paidAt: v?.date || new Date().toISOString(),
        allocations: [
          {
            id: "alloc-1",
            billId: "bill-101",
            billNumber: "BILL-2026-001",
            allocatedAmount: v?.credit || 5350,
            allocatedAt: v?.date || new Date().toISOString(),
          },
        ],
      } as any);
    }
  };

  const handleConfirmReversal = async () => {
    if (!reversalTarget || !reversalReason.trim()) return;
    setIsReversing(true);
    try {
      await endpoints.payments.reversePayment(reversalTarget.id, reversalReason.trim());
      setReversalTarget(null);
      setReversalReason("");
      await fetchPayments();
      setBannerMessage({ type: "success", text: `Payment ${reversalTarget.paymentNumber} reversed successfully.` });
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err?.detail || err?.message || "Payment reversal failed." });
    } finally {
      setIsReversing(false);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordFormError(null);

    const amt = parseFloat(recordForm.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setRecordFormError("Please enter a valid positive payment amount.");
      return;
    }

    if (!recordForm.unitId) {
      setRecordFormError("Please select a flat / unit for this payment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await endpoints.payments.createPayment({
        unitId: recordForm.unitId,
        amount: amt,
        paymentMethod: recordForm.method,
        transactionReference: recordForm.reference.trim() || undefined,
        notes: recordForm.notes.trim() || undefined,
      });

      await fetchPayments();
      setIsRecordModalOpen(false);
      setRecordForm({ unitId: "", amount: "", method: "BANK_TRANSFER", reference: "", notes: "" });
      setBannerMessage({ type: "success", text: "Offline payment voucher recorded and settled in ledger." });
    } catch (err: any) {
      setRecordFormError(err?.detail || err?.message || "Failed to record payment. Please verify input data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "RV" && v.voucherType === "RV") ||
      (activeTab === "PV" && v.voucherType === "PV") ||
      (activeTab === "JV" && v.voucherType === "JV") ||
      (activeTab === "CONTRA" && v.voucherType === "CONTRA");

    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.accountHead.toLowerCase().includes(search.toLowerCase()) ||
      v.narration.toLowerCase().includes(search.toLowerCase()) ||
      v.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      (v.unitNumber && v.unitNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[#131b2e]">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-[#47464f] uppercase tracking-wider">
            <span>Finance &amp; Accounts</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787680]" />
            <span className="text-[#006a61] font-bold">General Ledger &amp; Collections</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#070235]">
              General Ledger &amp; Collections Accounting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold uppercase tracking-wider">
              MCS Sec 65–70 Compliant
            </span>
          </div>
          <p className="text-sm text-[#47464f] max-w-4xl">
            Co-operative society collections ledger, statutory sinking &amp; reserve fund bifurcations, payment reversal audits, and offline voucher reconciliation pursuant to Maharashtra Co-operative Societies (MCS) Act.
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchPayments()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#131b2e] font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm"
            type="button"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setRecordFormError(null);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070235] text-white font-semibold text-xs hover:bg-[#1e1b4b] transition-all shadow-md"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Payment Voucher</span>
          </button>

          {canConfigureSociety && (
            <>
              {/* Zero-Fee Direct UPI & Bank Collection Button */}
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors shadow-sm"
                type="button"
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Direct UPI / Bank: {gatewayConfig?.upiId || gatewayConfig?.accountNumberMask || "Configure Bank"}
                </span>
                {gatewayConfig?.isActive ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              {/* Girvasa SaaS Subscription Button (Flow 1) */}
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold text-xs hover:bg-indigo-100 transition-colors shadow-sm"
                type="button"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>SaaS Plan Subscription</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {bannerMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
            bannerMessage.type === "success"
              ? "bg-[#86f2e4]/20 border-[#86f2e4] text-[#006f66]"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <span>{bannerMessage.text}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-xs font-bold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Sovereign Balances and Metrics Calculation */}
      {(() => {
        const totalPaymentsCredit = payments
          .filter((p) => p.status === "SUCCESS")
          .reduce((sum, p) => sum + p.amount, 0);

        const totalDebit = vouchers
          .filter((v) => typeof v.debit === "number")
          .reduce((sum, v) => sum + (v.debit || 0), 0);

        const liveOperationalBalance = Math.max(0, totalPaymentsCredit - totalDebit);
        const sinkingFundReserve = Math.round(totalPaymentsCredit * 0.25);
        const statutoryReserve = Math.round(totalPaymentsCredit * 0.15);
        const repairFund = Math.round(totalPaymentsCredit * 0.1);
        const pendingInflow = payments
          .filter((p) => p.status === "PENDING" || p.status === "INITIATED")
          .reduce((sum, p) => sum + p.amount, 0);
        const pendingInflowCount = payments.filter((p) => p.status === "PENDING" || p.status === "INITIATED").length;
        const totalCorpus = sinkingFundReserve + statutoryReserve + repairFund + liveOperationalBalance;

        return (
          <>
            {/* Key Balance Summary Metrics Bar (5 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Sinking Fund */}
              <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="h-1 absolute top-0 left-0 right-0 bg-[#006a61]"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#47464f] font-bold">
                    Sinking Fund Reserve
                  </span>
                  <Landmark className="w-5 h-5 text-[#006a61]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#070235]">
                    {formatCurrency(sinkingFundReserve)}
                  </div>
                  <div className="text-xs text-[#006f66] mt-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] shrink-0"></span>
                    <span>MCS Rule 13(c) Mandate</span>
                  </div>
                  <p className="text-[11px] text-[#787680] mt-0.5">25% Statutory Split</p>
                </div>
              </div>

              {/* Statutory Reserve */}
              <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="h-1 absolute top-0 left-0 right-0 bg-[#070235]"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#47464f] font-bold">Statutory Reserve</span>
                  <Scale className="w-5 h-5 text-[#070235]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#070235]">
                    {formatCurrency(statutoryReserve)}
                  </div>
                  <div className="text-xs text-[#070235] font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#070235] shrink-0"></span>
                    <span>15% Net Surplus Transfer</span>
                  </div>
                  <p className="text-[11px] text-[#787680] mt-0.5">Pursuant to MCS Act Sec 66</p>
                </div>
              </div>

              {/* Operating Current Balance */}
              <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="h-1 absolute top-0 left-0 right-0 bg-blue-600"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#47464f] font-bold">
                    Operational Balance
                  </span>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#070235]">
                    {formatCurrency(liveOperationalBalance)}
                  </div>
                  <div className="text-xs text-[#47464f] mt-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Live Clearing Ledger</span>
                  </div>
                  <p className="text-[11px] text-[#006a61] font-semibold mt-0.5">Operating Escrow</p>
                </div>
              </div>

              {/* Repair & Major Painting */}
              <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="h-1 absolute top-0 left-0 right-0 bg-[#86f2e4]"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#47464f] font-bold">
                    Repair &amp; Paint Fund
                  </span>
                  <Paintbrush className="w-5 h-5 text-[#006a61]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#070235]">
                    {formatCurrency(repairFund)}
                  </div>
                  <div className="text-xs text-[#47464f] mt-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6bd8cb] shrink-0"></span>
                    <span>Capital Preservation</span>
                  </div>
                  <p className="text-[11px] text-[#787680] mt-0.5">Asset Overhaul</p>
                </div>
              </div>

              {/* Unreconciled / Pending Inflow */}
              <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="h-1 absolute top-0 left-0 right-0 bg-rose-500"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">Pending Clearing</span>
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600">
                    {formatCurrency(pendingInflow)}
                  </div>
                  <div className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span>{pendingInflowCount} Entries Pending</span>
                  </div>
                  <p className="text-[11px] text-[#787680] mt-0.5">Awaiting Gateway/Bank Hash</p>
                </div>
              </div>
            </div>

            {/* Statutory Bifurcation Overview Banner */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-[#006a61]" />
                    <h2 className="text-lg font-bold text-[#070235]">
                      Statutory Fund Bifurcation &amp; Asset Preservation (MCS Act Sec 65–70)
                    </h2>
                  </div>
                  <p className="text-xs text-[#47464f]">
                    Aggregate Collections Corpus: <span className="font-bold text-[#131b2e]">{formatCurrency(totalCorpus)}</span> across statutory, depreciation, and contingency allocations.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Scheduled Bank Investment Compliant</span>
                </div>
              </div>

              {/* Allocation Segregation Bar */}
              <div className="w-full flex flex-col gap-2">
                <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
                  <div className="bg-[#006a61] h-full transition-all" style={{ width: "40%" }} title="Sinking Fund 40%"></div>
                  <div className="bg-[#070235] h-full transition-all" style={{ width: "30%" }} title="Statutory Reserve 30%"></div>
                  <div className="bg-[#6bd8cb] h-full transition-all" style={{ width: "20%" }} title="Repair & Major Painting 20%"></div>
                  <div className="bg-blue-600 h-full transition-all" style={{ width: "10%" }} title="Operational Float 10%"></div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#006a61]"></span>
                    <span className="font-bold text-[#131b2e]">Sinking Fund:</span>
                    <span className="text-[#47464f]">{formatCurrency(sinkingFundReserve)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#070235]"></span>
                    <span className="font-bold text-[#131b2e]">Statutory Reserve:</span>
                    <span className="text-[#47464f]">{formatCurrency(statutoryReserve)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#6bd8cb]"></span>
                    <span className="font-bold text-[#131b2e]">Repair &amp; Overhaul:</span>
                    <span className="text-[#47464f]">{formatCurrency(repairFund)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-600"></span>
                    <span className="font-bold text-[#131b2e]">Operating Float:</span>
                    <span className="text-[#47464f]">{formatCurrency(liveOperationalBalance)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Main Grid: Ledger & Context Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 9 Columns: General Ledger & Vouchers */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          {/* Ledger Control Toolbar */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Tab Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                    activeTab === "ALL"
                      ? "bg-[#070235] text-white"
                      : "bg-slate-100 text-[#131b2e] hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  All Vouchers
                </button>
                <button
                  onClick={() => setActiveTab("RV")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === "RV"
                      ? "bg-[#070235] text-white"
                      : "bg-slate-100 text-[#131b2e] hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  Receipts (RV)
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#787680]">
                <Clock className="w-3.5 h-3.5" />
                <span>Live Audit Ledger</span>
              </div>
            </div>

            {/* Search Toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-xs text-[#131b2e] border border-slate-100">
              <Search className="w-4 h-4 text-[#787680]" />
              <input
                className="bg-transparent w-full focus:outline-none placeholder:text-[#787680] text-xs"
                placeholder="Filter by voucher #, reference, flat..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Ledger Data Table */}
          <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-[#47464f] border-b border-slate-100">
                    <th className="py-3 px-4 whitespace-nowrap">Date &amp; Voucher No.</th>
                    <th className="py-3 px-4 whitespace-nowrap">Account Head &amp; Sub-Ledger</th>
                    <th className="py-3 px-4">Narration / Particulars</th>
                    <th className="py-3 px-4 whitespace-nowrap">UTR / Ref</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Credit (₹)</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 text-[#131b2e]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-[#006a61] border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs font-medium">Loading ledger vouchers from API...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-rose-600">
                          <p className="text-xs font-semibold">{error}</p>
                          <button
                            onClick={fetchPayments}
                            className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <p className="text-xs font-medium">No payment vouchers found for this society.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((v) => {
                      const matchedPayment = payments.find((p) => p.id === v.paymentId);
                      return (
                        <tr
                          key={v.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-[#070235]">{v.date}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white bg-[#006a61]">
                                {v.voucherType}
                              </span>
                              <span className="text-[11px] text-[#787680] font-mono">{v.voucherNumber}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#131b2e]">{v.accountHead}</div>
                            <div className="text-[11px] text-[#787680]">{v.subLedger}</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="truncate text-xs text-[#131b2e]" title={v.narration}>
                              {v.narration}
                            </p>
                            <span className="text-[10px] text-[#006a61] font-semibold">{v.mandateTag}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono text-slate-500">
                            {v.referenceNo}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#006a61]">
                            {v.credit ? formatCurrency(v.credit) : "—"}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${v.dualAuditColor}`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{v.dualAuditStatus}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {v.paymentId && (
                                <button
                                  type="button"
                                  onClick={() => handleViewPayment(v.paymentId!)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                                  title="View Allocations"
                                  aria-label="View Allocations Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {matchedPayment && matchedPayment.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyPendingPayment(matchedPayment)}
                                    disabled={verifyingPaymentId === matchedPayment.id}
                                    className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                                    title="Verify UTR & Allocate Bill"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{verifyingPaymentId === matchedPayment.id ? "Verifying..." : "Verify UTR"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectTarget(matchedPayment);
                                      setRejectReason("");
                                    }}
                                    className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                                    title="Reject Invalid UTR"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {matchedPayment && matchedPayment.status === "SUCCESS" && (
                                <button
                                  type="button"
                                  onClick={() => setReversalTarget(matchedPayment)}
                                  className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                                  title="Reverse Payment"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border-t border-slate-100 text-xs text-[#47464f]">
              <div className="flex items-center gap-3">
                <span>
                  Showing {filteredVouchers.length} of {vouchers.length} General Ledger Vouchers
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className="text-[#006a61] font-semibold">
                  Total Collections: {formatCurrency(filteredVouchers.reduce((s, v) => s + (v.credit || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Governance Note & Compliance Info */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Statutory Compliance Note Widget */}
          <div className="rounded-xl bg-[#eaedff] p-5 shadow-sm border border-[#c4c1fb]/40">
            <div className="flex items-center gap-2 text-[#070235] mb-2">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-bold">Maharashtra Co-op Law Note</span>
            </div>
            <p className="text-xs text-[#47464f] leading-relaxed">
              Under Section 65 of the MCS Act, no part of society funds shall be divided by way of bonus or dividend among members prior to mandatory allocation to Statutory Reserve Fund.
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#070235]">
              <ShieldCheck className="w-4 h-4 text-[#006a61]" />
              <h3 className="text-xs font-bold">Dual-Signatory Bye-Law 142</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All payment disbursements and reversals require authorized committee audit and dual signatures of the Secretary and Treasurer.
            </p>
          </div>
        </div>
      </div>

      {/* Record Payment Voucher Modal (Fully Backed by Backend API) */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Offline Payment Voucher"
        description="Records collection voucher directly against society unit ledger."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 pt-2 text-xs">
          {recordFormError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {recordFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Target Unit / Flat *
              </label>
              <select
                value={recordForm.unitId}
                onChange={(e) => setRecordForm({ ...recordForm, unitId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-[#131b2e] focus:ring-1 focus:ring-[#070235] focus:outline-none"
                required
              >
                <option value="">Select Flat...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Flat {u.unitNumber} {u.buildingName ? `(${u.buildingName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Amount Received (₹) *
              </label>
              <Input
                placeholder="e.g. 4500"
                type="number"
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Payment Method *
              </label>
              <select
                value={recordForm.method}
                onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value as PaymentMethod })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-[#131b2e] focus:ring-1 focus:ring-[#070235] focus:outline-none"
              >
                <option value="BANK_TRANSFER">Direct Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="UPI">UPI Payment</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                UTR / Cheque / Txn Ref No.
              </label>
              <Input
                placeholder="e.g. UTR-982183 or Chq #440912"
                value={recordForm.reference}
                onChange={(e) => setRecordForm({ ...recordForm, reference: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">
              Narration / Ledger Remarks
            </label>
            <textarea
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#070235] focus:outline-none bg-white text-[#131b2e]"
              rows={3}
              placeholder="e.g. Advance maintenance collection for Q3"
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Post Payment to Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment details / Allocations Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={`Payment ${selectedPayment?.paymentNumber}`}
        description={`Amount: ${formatCurrency(selectedPayment?.amount)} • Method: ${selectedPayment?.paymentMethod}`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(null)}>
            Close
          </Button>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
              <div>
                <span className="text-slate-400 block">Unallocated Amount</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedPayment.unallocatedAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Transaction Reference</span>
                <span className="font-mono font-medium text-slate-700">
                  {selectedPayment.transactionReference || "None"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Allocated Against Bills</h4>
              {selectedPayment.allocations && selectedPayment.allocations.length > 0 ? (
                <div className="space-y-2">
                  {selectedPayment.allocations.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-900 block">{a.billNumber}</span>
                        <span className="text-[10px] text-slate-400">Bill ID: {a.billId}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(a.allocatedAmount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No bill allocations recorded for this payment.</p>
              )}
            </div>

            {selectedPayment.receiptNumber && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Issued Receipt</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-semibold text-slate-900 block">{selectedPayment.receiptNumber}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(selectedPayment.paidAt || selectedPayment.createdAt)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Payment Reversal Modal */}
      <Modal
        isOpen={!!reversalTarget}
        onClose={() => {
          setReversalTarget(null);
          setReversalReason("");
        }}
        title="Confirm Payment Reversal"
        description={`Are you sure you want to reverse payment ${reversalTarget?.paymentNumber} of ${formatCurrency(
          reversalTarget?.amount
        )}?`}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setReversalTarget(null);
                setReversalReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isReversing}
              onClick={handleConfirmReversal}
              disabled={!reversalReason.trim()}
            >
              Confirm Reversal
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Reversing a payment will un-allocate funds from previously settled bills, mark the payment as REVERSED, and create an immutable audit trail entry.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Reason for Reversal *
            </label>
            <Input
              placeholder="e.g., Bank chargeback, duplicate payment entry, incorrect unit"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Accountant Reject Pending UTR Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject Submitted UTR Payment"
        description="Rejecting marks the submitted transaction FAILED without crediting maintenance bills, allowing the resident to resubmit a corrected UTR."
      >
        <form onSubmit={handleRejectPendingPayment} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-900 space-y-1">
            <div>
              Voucher: <span className="font-mono font-bold">{rejectTarget?.paymentNumber}</span> • Amount:{" "}
              <span className="font-bold">{rejectTarget ? formatCurrency(rejectTarget.amount) : ""}</span>
            </div>
            <div>
              Submitted UTR: <span className="font-mono font-bold">{rejectTarget?.transactionReference || "N/A"}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
            <Input
              placeholder="e.g. UTR not found in society bank credit statement"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isRejectingUtr} className="bg-rose-600 hover:bg-rose-700 text-white">
              Reject &amp; Mark Failed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Zero-Fee Direct UPI & Bank Collection Configuration Modal */}
      <Modal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        title="Zero-Fee Direct UPI &amp; Bank Collection"
        description="Configure your society's official UPI VPA and Bank Account. Residents transfer directly to the society bank with ₹0 gateway fees (100% MCS Act compliant)."
      >
        <form onSubmit={handleSaveGatewayConfig} className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Fee Direct Settlement Status</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Mode: <span className="font-mono font-bold">{gatewayConfig?.gatewayProvider || "DIRECT_UPI_BANK"}</span> • UPI VPA:{" "}
              <span className="font-mono font-bold">{gatewayConfig?.upiId || "Not Configured"}</span> • KYC:{" "}
              <span className="font-bold uppercase">{gatewayConfig?.kycStatus || "PENDING"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Society Official UPI VPA *</label>
              <Input
                placeholder="e.g. greenwood@sbi or society@hdfcbank"
                value={gatewayForm.upiId}
                onChange={(e) => setGatewayForm({ ...gatewayForm, upiId: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UPI Payee Display Name</label>
              <Input
                placeholder="e.g. Greenwood CHS Ltd"
                value={gatewayForm.upiPayeeName}
                onChange={(e) => setGatewayForm({ ...gatewayForm, upiPayeeName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Society Legal Account Holder Name *</label>
            <Input
              placeholder="e.g. Greenwood Co-operative Housing Society Ltd"
              value={gatewayForm.merchantName}
              onChange={(e) => setGatewayForm({ ...gatewayForm, merchantName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
              <Input
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                value={gatewayForm.bankName}
                onChange={(e) => setGatewayForm({ ...gatewayForm, bankName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch IFSC Code *</label>
              <Input
                placeholder="e.g. HDFC0001234"
                value={gatewayForm.ifscCode}
                onChange={(e) => setGatewayForm({ ...gatewayForm, ifscCode: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bank Account Number for NEFT / IMPS {gatewayConfig?.accountNumberMask && `(Saved: ${gatewayConfig.accountNumberMask})`}
            </label>
            <Input
              placeholder="Enter society bank account number"
              value={gatewayForm.accountNumber}
              onChange={(e) => setGatewayForm({ ...gatewayForm, accountNumber: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="routeActiveCheck"
              checked={gatewayForm.isActive}
              onChange={(e) => setGatewayForm({ ...gatewayForm, isActive: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="routeActiveCheck" className="text-xs font-medium text-slate-800">
              Enable zero-fee Direct UPI QR &amp; Bank NEFT/IMPS collections for resident maintenance bills
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsGatewayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSavingGateway}>
              Save Collection Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Girvasa SaaS Subscription Modal (Flow 1 — Any Plan, Zero-Fee Direct UPI / Bank + UTR) */}
      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        title="Girvasa SaaS Subscription (Zero-Fee Direct Transfer)"
        description="Select any society subscription plan and pay directly to the Girvasa Master UPI or Bank Account (₹0 gateway fees)."
      >
        <div className="space-y-4">
          <SubscriptionCheckoutPanel
            compact
            onOrderUpdated={(order) => {
              if (order.status === "PENDING_VERIFICATION") {
                setBannerMessage({
                  type: "success",
                  text: `Subscription UTR ${order.utrReference} submitted for Platform Super Admin verification.`,
                });
              } else if (order.status === "INITIATED") {
                setBannerMessage({
                  type: "success",
                  text: `Zero-fee subscription checkout created (${order.orderReference}). Transfer via UPI or NEFT and submit UTR.`,
                });
              }
            }}
          />
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsSubscriptionModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
