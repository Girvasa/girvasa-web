"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Receipt, Search, Eye, Calendar, DollarSign } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { BillSummaryResponse, BillDetailResponse } from "@/types/billing";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BillingPage() {
  const { activeSocietyId } = useTenant();
  const [bills, setBills] = useState<BillSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchBills = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.billing.getBills({
        status: statusFilter || undefined,
      });
      setBills(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load maintenance bills.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleViewBill = async (billId: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await endpoints.billing.getBill(billId);
      setSelectedBill(detail);
    } catch (err: any) {
      alert(err.detail || "Failed to load bill details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="info">Partially Paid</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "OVERDUE":
        return <Badge variant="danger">Overdue</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<BillSummaryResponse>[] = [
    {
      header: "Bill Number",
      accessor: (b) => <span className="font-mono font-semibold text-blue-600">{b.billNumber}</span>,
    },
    {
      header: "Unit / Apartment",
      accessor: (b) => (
        <div>
          <span className="font-semibold text-slate-900">{b.unitNumber}</span>
          <span className="text-[11px] text-slate-400 block">{b.buildingName}</span>
        </div>
      ),
    },
    {
      header: "Billing Period",
      accessor: (b) => <span className="font-medium text-slate-700">{b.periodName || "Monthly Dues"}</span>,
    },
    {
      header: "Total Billed",
      accessor: (b) => <span className="font-semibold text-slate-900">{formatCurrency(b.totalAmount)}</span>,
    },
    {
      header: "Outstanding",
      accessor: (b) => (
        <span
          className={
            b.outstandingAmount > 0 ? "font-bold text-rose-600" : "font-medium text-emerald-600"
          }
        >
          {formatCurrency(b.outstandingAmount)}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessor: (b) => <span>{formatDate(b.dueDate)}</span>,
    },
    {
      header: "Status",
      accessor: (b) => getStatusBadge(b.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewBill(b.id)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            Line Items
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Maintenance Billing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Society maintenance invoices, line items breakdown, and dues tracking.
          </p>
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Invoice Statuses"
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Partially Paid", value: "PARTIALLY_PAID" },
              { label: "Paid", value: "PAID" },
              { label: "Overdue", value: "OVERDUE" },
              { label: "Draft", value: "DRAFT" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchBills} />
      ) : (
        <Table
          columns={columns}
          data={bills}
          keyExtractor={(b) => b.id}
          isLoading={isLoading}
          emptyMessage="No maintenance bills found for this society."
        />
      )}

      {/* Bill detail modal */}
      <Modal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        title={`Invoice: ${selectedBill?.billNumber}`}
        description={`Unit: ${selectedBill?.unitNumber} • Due Date: ${formatDate(selectedBill?.dueDate)}`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedBill(null)}>
            Close
          </Button>
        }
      >
        {selectedBill && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
              <div>
                <span className="text-slate-400 block">Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedBill.subtotal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Taxes & Fees</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedBill.taxAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Due</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedBill.totalAmount)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Line Items Breakdown
              </h4>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {selectedBill.lineItems?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.chargeHeadName}</div>
                      {item.quantity && item.rate && (
                        <div className="text-[11px] text-slate-400">
                          {item.quantity} × {formatCurrency(item.rate)}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-900">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
