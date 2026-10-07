"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { AccessDenied } from "@/components/common/AccessDenied";
import { endpoints } from "@/lib/api/endpoints";
import { AuditLogResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  const { activeSocietyId } = useTenant();
  const { canAccessModule } = usePermission();
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchAuditLogs = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.audit.getLogs();
      setLogs(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    if (canAccessModule("audit")) {
      fetchAuditLogs();
    }
  }, [fetchAuditLogs, canAccessModule]);

  if (!canAccessModule("audit")) {
    return <AccessDenied message="Audit logs are strictly restricted to Society Administrators and Platform Auditors." />;
  }

  const filtered = logs.filter(
    (l: any) =>
      l.eventType?.toLowerCase().includes(search.toLowerCase()) ||
      (l.userName || l.actorName)?.toLowerCase().includes(search.toLowerCase()) ||
      (l.metadata || l.description || l.action)?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<AuditLogResponse>[] = [
    {
      header: "Timestamp",
      accessor: (l: any) => <span className="font-mono text-xs">{formatDateTime(l.createdAt || l.timestamp)}</span>,
    },
    {
      header: "Security / Business Event",
      accessor: (l: any) => (
        <span className="font-mono font-semibold text-blue-600 text-xs">
          {l.eventType}
        </span>
      ),
    },
    {
      header: "Actor",
      accessor: (l: any) => <span className="font-medium text-slate-800">{l.userName || l.actorName || l.actorUserId || "System"}</span>,
    },
    {
      header: "Target Entity",
      accessor: (l: any) => (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
          {l.resource || l.targetEntity || "General"}
        </span>
      ),
    },
    {
      header: "Audit Description",
      accessor: (l: any) => (
        <span className="text-slate-600 truncate max-w-sm block">
          {l.metadata || l.description || l.action || "—"}
        </span>
      ),
    },
    {
      header: "IP Address",
      accessor: (l: any) => <span className="font-mono text-slate-400 text-xs">{l.ipAddress || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Security & Operational Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all financial actions, permission changes, logins, and tenant modifications.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchAuditLogs} />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No audit log entries recorded."
        />
      )}
    </div>
  );
}
