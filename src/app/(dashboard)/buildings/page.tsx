"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Building2, Layers, Search, Eye } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { BuildingResponse, WingResponse } from "@/types/structure";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function BuildingsPage() {
  const { activeSocietyId } = useTenant();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingResponse | null>(null);
  const [wings, setWings] = useState<WingResponse[]>([]);
  const [isLoadingWings, setIsLoadingWings] = useState(false);

  const fetchBuildings = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.structure.getBuildings();
      setBuildings(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society buildings.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleViewBuilding = async (building: BuildingResponse) => {
    setSelectedBuilding(building);
    setIsLoadingWings(true);
    try {
      const wingsData = await endpoints.structure.getWings(building.id);
      setWings(wingsData || []);
    } catch {
      setWings([]);
    } finally {
      setIsLoadingWings(false);
    }
  };

  const filteredBuildings = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<BuildingResponse>[] = [
    {
      header: "Building Code",
      accessor: (b) => <span className="font-mono font-semibold text-blue-600">{b.code}</span>,
    },
    {
      header: "Building / Tower Name",
      accessor: (b) => <span className="font-medium text-slate-900">{b.name}</span>,
    },
    {
      header: "Total Floors",
      accessor: (b) => <span>{b.totalFloors} floors</span>,
    },
    {
      header: "Total Units",
      accessor: (b) => <span className="font-semibold text-slate-800">{b.totalUnits} units</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewBuilding(b)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            Wings
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Buildings & Wings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage society structural infrastructure, towers, and building wings.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search buildings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchBuildings} />
      ) : (
        <Table
          columns={columns}
          data={filteredBuildings}
          keyExtractor={(b) => b.id}
          isLoading={isLoading}
          emptyMessage="No buildings registered in this society."
        />
      )}

      {/* Building detail & wings modal */}
      <Modal
        isOpen={!!selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        title={selectedBuilding?.name}
        description={`Building Code: ${selectedBuilding?.code} • ${selectedBuilding?.totalFloors} Floors`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedBuilding(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
            Configured Wings & Towers
          </h4>

          {isLoadingWings ? (
            <div className="text-xs text-slate-400 py-4 text-center">Loading wings...</div>
          ) : wings.length === 0 ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-500">
              No distinct wings configured for this building.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {wings.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{w.name}</span>
                    <span className="ml-2 font-mono text-slate-400">({w.code})</span>
                  </div>
                  <span className="text-slate-600">{w.totalFloors} Floors</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
