"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserCheck, Search, LogIn, LogOut } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { VisitResponse } from "@/types/visitor";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDateTime } from "@/lib/utils";

export default function VisitorsPage() {
  const { activeSocietyId } = useTenant();
  const [visits, setVisits] = useState<VisitResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchVisits = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.visitors.getVisits({
        status: statusFilter || undefined,
      });
      setVisits(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load visitor logs.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, statusFilter]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleCheckIn = async (id: string) => {
    try {
      await endpoints.visitors.checkIn(id);
      await fetchVisits();
    } catch (err: any) {
      alert(err.detail || "Check-in failed");
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await endpoints.visitors.checkOut(id);
      await fetchVisits();
    } catch (err: any) {
      alert(err.detail || "Check-out failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return <Badge variant="success">Inside Society</Badge>;
      case "EXPECTED":
        return <Badge variant="info">Expected</Badge>;
      case "CHECKED_OUT":
        return <Badge variant="neutral">Checked Out</Badge>;
      case "DENIED":
        return <Badge variant="danger">Denied Entry</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<VisitResponse>[] = [
    {
      header: "Visitor",
      accessor: (v) => (
        <div>
          <span className="font-semibold text-slate-900">{v.visitorName}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{v.visitorPhone}</span>
        </div>
      ),
    },
    {
      header: "Unit Destination",
      accessor: (v) => <span className="font-medium text-slate-800">{v.unitNumber || "General"}</span>,
    },
    {
      header: "Type & Purpose",
      accessor: (v) => (
        <div>
          <span className="capitalize text-slate-800 font-medium">{v.visitorType || "Guest"}</span>
          {v.purpose && <span className="text-[11px] text-slate-400 block">{v.purpose}</span>}
        </div>
      ),
    },
    {
      header: "Vehicle #",
      accessor: (v) => <span className="font-mono text-slate-700">{v.vehicleNumber || "—"}</span>,
    },
    {
      header: "Pass Code",
      accessor: (v) => <span className="font-mono font-bold text-blue-600">{v.passCode || "—"}</span>,
    },
    {
      header: "Entry / Exit",
      accessor: (v) => (
        <div className="text-[11px]">
          <div>In: {formatDateTime(v.checkInTime)}</div>
          {v.checkOutTime && <div>Out: {formatDateTime(v.checkOutTime)}</div>}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (v) => getStatusBadge(v.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (v) => (
        <div className="flex justify-end space-x-1.5">
          {v.status === "EXPECTED" && (
            <Button variant="outline" size="sm" onClick={() => handleCheckIn(v.id)}>
              <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Check In
            </Button>
          )}
          {v.status === "CHECKED_IN" && (
            <Button variant="outline" size="sm" onClick={() => handleCheckOut(v.id)}>
              <LogOut className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Check Out
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Visitor & Gate Security</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gate log of guest arrivals, service deliveries, passes, and vehicle tracking.
          </p>
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Visit Statuses"
            options={[
              { label: "Inside Society", value: "CHECKED_IN" },
              { label: "Expected", value: "EXPECTED" },
              { label: "Checked Out", value: "CHECKED_OUT" },
              { label: "Denied", value: "DENIED" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchVisits} />
      ) : (
        <Table
          columns={columns}
          data={visits}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          emptyMessage="No visitors recorded for this period."
        />
      )}
    </div>
  );
}
