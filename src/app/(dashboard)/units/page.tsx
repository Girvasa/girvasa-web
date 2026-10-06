"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Home, Search, Eye } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { UnitResponse, BuildingResponse } from "@/types/structure";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function UnitsPage() {
  const { activeSocietyId } = useTenant();
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<UnitResponse | null>(null);

  const fetchUnits = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [unitsData, buildingsData] = await Promise.all([
        endpoints.structure.getUnits({
          buildingId: selectedBuildingId || undefined,
          status: selectedStatus || undefined,
          search: search || undefined,
        }),
        endpoints.structure.getBuildings(),
      ]);
      setUnits(unitsData || []);
      setBuildings(buildingsData || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society units.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, selectedBuildingId, selectedStatus, search]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OCCUPIED":
        return <Badge variant="success">Occupied</Badge>;
      case "VACANT":
        return <Badge variant="warning">Vacant</Badge>;
      case "UNDER_MAINTENANCE":
        return <Badge variant="info">Maintenance</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<UnitResponse>[] = [
    {
      header: "Unit Number",
      accessor: (u) => <span className="font-bold text-slate-900">{u.unitNumber}</span>,
    },
    {
      header: "Building / Wing",
      accessor: (u) => (
        <div>
          <div className="font-medium text-slate-800">{u.buildingName || "Building"}</div>
          {u.wingName && <div className="text-[11px] text-slate-400">Wing: {u.wingName}</div>}
        </div>
      ),
    },
    {
      header: "Floor",
      accessor: (u) => <span>Floor {u.floorNumber}</span>,
    },
    {
      header: "Type",
      accessor: (u) => <span className="capitalize text-slate-700">{u.unitType?.toLowerCase()}</span>,
    },
    {
      header: "Area",
      accessor: (u) => <span>{u.squareFeet ? `${u.squareFeet} sq ft` : "—"}</span>,
    },
    {
      header: "Status",
      accessor: (u) => getStatusBadge(u.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (u) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUnit(u)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Units & Apartments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of flats, apartments, and commercial units with occupancy statuses.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by unit number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          value={selectedBuildingId}
          onChange={(e) => setSelectedBuildingId(e.target.value)}
          placeholder="All Buildings"
          options={buildings.map((b) => ({ label: b.name, value: b.id }))}
        />
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          placeholder="All Occupancy Statuses"
          options={[
            { label: "Occupied", value: "OCCUPIED" },
            { label: "Vacant", value: "VACANT" },
            { label: "Under Maintenance", value: "UNDER_MAINTENANCE" },
            { label: "Inactive", value: "INACTIVE" },
          ]}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchUnits} />
      ) : (
        <Table
          columns={columns}
          data={units}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          emptyMessage="No units matching the selected criteria."
        />
      )}

      {/* Unit details modal */}
      <Modal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        title={`Unit ${selectedUnit?.unitNumber}`}
        description={`${selectedUnit?.buildingName || "Building"} • Floor ${selectedUnit?.floorNumber}`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedUnit(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Occupancy Status</span>
              {selectedUnit && getStatusBadge(selectedUnit.status)}
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Unit Classification</span>
              <span className="font-semibold text-slate-800 capitalize">
                {selectedUnit?.unitType?.toLowerCase()}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Carpet / Super Area</span>
              <span className="font-semibold text-slate-800">
                {selectedUnit?.squareFeet ? `${selectedUnit.squareFeet} sq ft` : "Not specified"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Floor Level</span>
              <span className="font-semibold text-slate-800">Floor {selectedUnit?.floorNumber}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
