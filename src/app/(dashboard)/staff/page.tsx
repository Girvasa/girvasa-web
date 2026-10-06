"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserCog, Search } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { StaffResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function StaffPage() {
  const { activeSocietyId } = useTenant();
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchStaff = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.staff.getStaff();
      setStaff(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load staff members.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filtered = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<StaffResponse>[] = [
    {
      header: "Staff Member",
      accessor: (s) => (
        <div>
          <span className="font-semibold text-slate-900">{s.fullName}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{s.phone}</span>
        </div>
      ),
    },
    {
      header: "Category / Role",
      accessor: (s) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
          {s.category}
        </span>
      ),
    },
    {
      header: "Assigned Area",
      accessor: (s) => <span>{s.assignedArea || "All Society Grounds"}</span>,
    },
    {
      header: "Status",
      accessor: (s) => (s.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Society Maintenance Staff</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of housekeeping, electrical, plumbing, security, and gardening staff.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStaff} />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="No staff members registered."
        />
      )}
    </div>
  );
}
