"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CreditCard, Eye, RotateCcw, Plus, Receipt } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { PaymentSummaryResponse, PaymentDetailResponse } from "@/types/payment";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const { activeSocietyId } = useTenant();
  const [payments, setPayments] = useState<PaymentSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailResponse | null>(null);
  const [reversalTarget, setReversalTarget] = useState<PaymentSummaryResponse | null>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [isReversing, setIsReversing] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.payments.getPayments({
        status: statusFilter || undefined,
      });
      setPayments(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society payments.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleViewPayment = async (paymentId: string) => {
    try {
      const detail = await endpoints.payments.getPayment(paymentId);
      setSelectedPayment(detail);
    } catch (err: any) {
      alert(err.detail || "Failed to load payment details");
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
    } catch (err: any) {
      alert(err.detail || "Reversal failed");
    } finally {
      setIsReversing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge variant="success">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "REVERSED":
        return <Badge variant="danger">Reversed</Badge>;
      case "FAILED":
        return <Badge variant="neutral">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<PaymentSummaryResponse>[] = [
    {
      header: "Payment Reference",
      accessor: (p) => (
        <div>
          <span className="font-mono font-semibold text-blue-600 block">{p.paymentNumber}</span>
          {p.transactionReference && (
            <span className="text-[10px] text-slate-400 font-mono">Ref: {p.transactionReference}</span>
          )}
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: (p) => <span className="font-medium text-slate-900">{p.unitNumber || "General"}</span>,
    },
    {
      header: "Amount Paid",
      accessor: (p) => <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>,
    },
    {
      header: "Method",
      accessor: (p) => (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      header: "Paid Date",
      accessor: (p) => <span>{formatDate(p.paidAt || p.createdAt)}</span>,
    },
    {
      header: "Status",
      accessor: (p) => getStatusBadge(p.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (p) => (
        <div className="flex justify-end space-x-1.5">
          <Button variant="ghost" size="sm" onClick={() => handleViewPayment(p.id)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            Allocations
          </Button>
          {p.status === "SUCCESS" && (
            <Button variant="outline" size="sm" onClick={() => setReversalTarget(p)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Reverse
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Payments & Collections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Collection ledger, digital gateway transactions, allocations against bills, and reversals.
          </p>
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Payment Statuses"
            options={[
              { label: "Confirmed (Success)", value: "SUCCESS" },
              { label: "Pending", value: "PENDING" },
              { label: "Reversed", value: "REVERSED" },
              { label: "Failed", value: "FAILED" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchPayments} />
      ) : (
        <Table
          columns={columns}
          data={payments}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="No payment records recorded."
        />
      )}

      {/* Payment details modal */}
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
                <span className="text-slate-400 block">Status</span>
                {getStatusBadge(selectedPayment.status)}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Allocations Across Maintenance Invoices
              </h4>
              {selectedPayment.allocations && selectedPayment.allocations.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {selectedPayment.allocations.map((alloc) => (
                    <div key={alloc.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{alloc.billNumber}</span>
                        <span className="text-slate-400 block text-[10px]">
                          Allocated: {formatDate(alloc.allocatedAt)}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(alloc.allocatedAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">No active bill allocations mapped.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reversal Confirmation Modal */}
      <Modal
        isOpen={!!reversalTarget}
        onClose={() => setReversalTarget(null)}
        title="Confirm Payment Reversal"
        description="Reversing this confirmed payment will atomically unallocate dues, restore bill outstanding balances, and update unit ledger."
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            Payment Ref: <strong className="font-mono">{reversalTarget?.paymentNumber}</strong>
            <br />
            Amount: <strong>{formatCurrency(reversalTarget?.amount)}</strong>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Reversal Reason (Mandatory Audit Trail)
            </label>
            <input
              type="text"
              placeholder="e.g. Chargeback, Bank bounce, Incorrect allocation"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setReversalTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReversal}
              isLoading={isReversing}
              disabled={!reversalReason.trim()}
            >
              Confirm Reversal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
