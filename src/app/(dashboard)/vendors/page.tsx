"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Briefcase, Search } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { VendorResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function VendorsPage() {
  const { activeSocietyId } = useTenant();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchVendors = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.vendors.getVendors();
      setVendors(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load vendor partners.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filtered = vendors.filter(
    (v) =>
      v.businessName.toLowerCase().includes(search.toLowerCase()) ||
      v.category?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<VendorResponse>[] = [
    {
      header: "Vendor / Enterprise",
      accessor: (v) => (
        <div>
          <span className="font-semibold text-slate-900">{v.businessName}</span>
          <span className="text-[11px] text-slate-400 block">Contact: {v.contactPerson}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (v) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
          {v.category}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: (v) => <span className="font-mono text-slate-700">{v.phone}</span>,
    },
    {
      header: "Contract Status",
      accessor: (v) => {
        const isActive = v.contractStatus === "ACTIVE";
        return <Badge variant={isActive ? "success" : "neutral"}>{v.contractStatus || "Active"}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Vendors & Service Contractors</h1>
          <p className="text-xs text-slate-500 mt-1">
            Third-party facility management agencies, AMC providers, and contractors.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchVendors} />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          emptyMessage="No vendor contractors registered."
        />
      )}
    </div>
  );
}
