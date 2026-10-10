"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  Plus,
  Download,
  Building,
  CheckCircle2,
} from "lucide-react";
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
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for creating unit
  const [newUnitData, setNewUnitData] = useState({
    buildingId: "",
    unitNumber: "",
    floorNumber: 1,
    unitType: "RESIDENTIAL",
    configuration: "2BHK",
    areaSqft: 950,
  });

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
      const bList = buildingsData || [];
      setBuildings(bList);
      if (bList.length > 0 && !newUnitData.buildingId) {
        setNewUnitData((prev) => ({ ...prev, buildingId: bList[0].id }));
      }
    } catch (err: any) {
      setError(err?.detail || "Unable to load society units.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, selectedBuildingId, selectedStatus, search, newUnitData.buildingId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newUnitData.unitNumber.trim()) {
      setFormError("Unit number is required.");
      return;
    }
    if (!newUnitData.buildingId) {
      setFormError("Please select a target building.");
      return;
    }
    setIsSubmitting(true);
    try {
      await endpoints.structure.createUnit({
        buildingId: newUnitData.buildingId,
        unitNumber: newUnitData.unitNumber.trim(),
        floorNumber: Number(newUnitData.floorNumber),
        unitType: newUnitData.unitType,
        configuration: newUnitData.configuration,
        areaSqft: Number(newUnitData.areaSqft),
      });
      setIsAddUnitModalOpen(false);
      setNewUnitData({
        buildingId: buildings[0]?.id || "",
        unitNumber: "",
        floorNumber: 1,
        unitType: "RESIDENTIAL",
        configuration: "2BHK",
        areaSqft: 950,
      });
      fetchUnits();
    } catch (err: any) {
      setFormError(err?.detail || err?.message || "Failed to create unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "OCCUPIED":
        return <Badge variant="success">Occupied</Badge>;
      case "VACANT":
        return <Badge variant="neutral">Vacant</Badge>;
      case "UNDER_MAINTENANCE":
        return <Badge variant="warning">Maintenance</Badge>;
      default:
        return <Badge variant="info">{status || "Registered"}</Badge>;
    }
  };

  const columns: Column<UnitResponse>[] = [
    {
      header: "Unit Number",
      accessor: (u) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#070235] text-sm">{u.unitNumber}</span>
          <span className="text-[10px] text-slate-400 font-mono">ID: #{u.id?.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      header: "Building & Wing",
      accessor: (u) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{u.buildingName || "Main Building"}</span>
          <span className="text-[11px] text-[#006a61] font-medium">{u.wingName ? `Wing ${u.wingName}` : "Wing —"}</span>
        </div>
      ),
    },
    {
      header: "Floor Level",
      accessor: (u) => <span className="text-xs text-slate-700">Floor {u.floorNumber}</span>,
    },
    {
      header: "Classification",
      accessor: (u) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-700 font-semibold uppercase">
          {u.configuration || u.unitType || "Residential"}
        </span>
      ),
    },
    {
      header: "Assessable Area",
      accessor: (u) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900">
            {u.squareFeet ? `${u.squareFeet} sq.ft` : "—"}
          </span>
        </div>
      ),
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
            <Eye className="w-3.5 h-3.5 mr-1 text-[#006a61]" />
            Dossier
          </Button>
        </div>
      ),
    },
  ];

  const handleExportCsv = () => {
    if (units.length === 0) return;
    const header = "Unit Number,Building,Floor,Type,Area (sq ft),Status\n";
    const rows = units
      .map(
        (u) =>
          `"${u.unitNumber}","${u.buildingName || ""}","${u.floorNumber || ""}","${u.unitType || ""}","${u.squareFeet || ""}","${u.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `unit_roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          <span>Society Management</span>
          <span>&rsaquo;</span>
          <span>Buildings &amp; Wings</span>
          <span>&rsaquo;</span>
          <span className="text-[#070235] font-bold">Units Inventory</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Units &amp; Apartments Spatial Inventory
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Directory of flats, apartments, built-up sq.ft assessments, share certificates, and occupancy statuses.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#070235] text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Unit Roster (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddUnitModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold shadow-md hover:bg-[#1e1b4b] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Flat / Unit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by flat (e.g. A-402, B-701)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-48">
            <Select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              placeholder="All Buildings"
              options={buildings.map((b) => ({ label: b.name, value: b.id }))}
            />
          </div>
          <div className="w-48">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="All Occupancy Statuses"
              options={[
                { label: "Occupied", value: "OCCUPIED" },
                { label: "Vacant", value: "VACANT" },
                { label: "Under Maintenance", value: "UNDER_MAINTENANCE" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
      </div>

      {/* Unit details modal */}
      <Modal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        title={`Flat Dossier • Unit ${selectedUnit?.unitNumber}`}
        description={`${selectedUnit?.buildingName || "Building"} • Floor ${selectedUnit?.floorNumber}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Occupancy Status</span>
              {selectedUnit && getStatusBadge(selectedUnit.status)}
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Unit Classification</span>
              <span className="font-semibold text-slate-800 uppercase">
                {selectedUnit?.configuration || selectedUnit?.unitType || "Residential"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Built-Up Assessable Area</span>
              <span className="font-semibold text-slate-800">
                {selectedUnit?.squareFeet ? `${selectedUnit.squareFeet} sq.ft` : "Not assessed"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-slate-400 block mb-1">Building Wing</span>
              <span className="font-mono font-bold text-[#070235]">
                {selectedUnit?.wingName ? `Wing ${selectedUnit.wingName}` : "Standard"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              MCS Statutory Formula Base
            </span>
            <p className="text-slate-600 text-[11px]">
              Service charges allocated equally. Sinking fund calculated at 0.25% p.a. of construction cost. Repair fund calculated at 0.75% p.a.
            </p>
          </div>
        </div>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        title="Add New Society Flat / Unit"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUnit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Building</label>
            <select
              value={newUnitData.buildingId}
              onChange={(e) => setNewUnitData({ ...newUnitData, buildingId: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Flat Number</label>
              <input
                type="text"
                required
                value={newUnitData.unitNumber}
                onChange={(e) => setNewUnitData({ ...newUnitData, unitNumber: e.target.value })}
                placeholder="e.g. A-801"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
              <input
                type="number"
                required
                value={newUnitData.floorNumber}
                onChange={(e) => setNewUnitData({ ...newUnitData, floorNumber: Number(e.target.value) })}
                placeholder="e.g. 8"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Configuration</label>
              <select
                value={newUnitData.configuration}
                onChange={(e) => setNewUnitData({ ...newUnitData, configuration: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="COMMERCIAL">Commercial Unit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Built-Up Area (sq.ft)</label>
              <input
                type="number"
                required
                value={newUnitData.areaSqft}
                onChange={(e) => setNewUnitData({ ...newUnitData, areaSqft: Number(e.target.value) })}
                placeholder="e.g. 950"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              className="bg-[#070235] text-white"
            >
              Create Flat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
