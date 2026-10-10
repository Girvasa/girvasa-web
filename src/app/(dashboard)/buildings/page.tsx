"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Layers,
  Search,
  Eye,
  Plus,
  Download,
  Users,
  Car,
  Home,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { endpoints } from "@/lib/api/endpoints";
import { BuildingResponse, UnitResponse, WingResponse } from "@/types/structure";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function BuildingsPage() {
  const { activeSocietyId } = useTenant();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingResponse | null>(null);
  const [wings, setWings] = useState<WingResponse[]>([]);
  const [isLoadingWings, setIsLoadingWings] = useState(false);
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);

  // Form State
  const [bName, setBName] = useState("");
  const [bCode, setBCode] = useState("");
  const [bFloors, setBFloors] = useState("10");
  const [bUnits, setBUnits] = useState("40");
  const [bDesc, setBDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [buildingsData, unitsData] = await Promise.all([
        endpoints.structure.getBuildings(),
        endpoints.structure.getUnits().catch(() => []),
      ]);
      setBuildings(buildingsData || []);
      setUnits(unitsData || []);
      if (buildingsData && buildingsData.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(buildingsData[0].id);
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || "Unable to load society buildings and spatial inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, selectedBuildingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewBuilding = async (building: BuildingResponse) => {
    setSelectedBuilding(building);
    setSelectedBuildingId(building.id);
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

  const handleCreateBuildingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !bCode.trim()) return;
    setIsSubmitting(true);
    try {
      await endpoints.structure.createBuilding({
        name: bName.trim(),
        code: bCode.trim().toUpperCase(),
        totalFloors: parseInt(bFloors, 10) || 1,
        totalUnits: parseInt(bUnits, 10) || 1,
        description: bDesc.trim(),
      });
      await fetchData();
      setIsAddBuildingModalOpen(false);
      setBName("");
      setBCode("");
      setBDesc("");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to create building. Please check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBuildings = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic Metrics Computation
  const totalSocietyUnits = units.length > 0 ? units.length : buildings.reduce((sum, b) => sum + (b.totalUnits || 0), 0);
  const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
  const vacantUnits = units.filter((u) => u.status === "VACANT").length;
  const occupancyRate = totalSocietyUnits > 0 ? ((occupiedUnits / totalSocietyUnits) * 100).toFixed(1) : "0.0";
  const totalAssessableSqFt = units.reduce((sum, u) => sum + (u.squareFeet || 1000), 0);

  // Active Building Units for Spatial Visualizer
  const activeBuildingUnits = units.filter(
    (u) => !selectedBuildingId || u.buildingId === selectedBuildingId
  );
  const floorsMap = activeBuildingUnits.reduce((acc, u) => {
    const f = u.floorNumber ?? 0;
    if (!acc[f]) acc[f] = [];
    acc[f].push(u);
    return acc;
  }, {} as Record<number, UnitResponse[]>);
  const distinctFloors = Object.keys(floorsMap)
    .map(Number)
    .sort((a, b) => b - a);

  const columns: Column<BuildingResponse>[] = [
    {
      header: "Building Code",
      accessor: (b) => <span className="font-mono font-bold text-[#070235]">{b.code}</span>,
    },
    {
      header: "Building / Tower Name",
      accessor: (b) => (
        <div>
          <span className="font-bold text-slate-900 block">{b.name}</span>
          {b.description && <span className="text-[11px] text-slate-400">{b.description}</span>}
        </div>
      ),
    },
    {
      header: "Total Floors",
      accessor: (b) => <span className="text-slate-700 font-medium">{b.totalFloors} floors</span>,
    },
    {
      header: "Total Units",
      accessor: (b) => (
        <span className="font-bold text-[#070235]">
          {units.filter((u) => u.buildingId === b.id).length || b.totalUnits || 0} units
        </span>
      ),
    },
    {
      header: "Status",
      accessor: () => <Badge variant="success">Structural OC Cleared</Badge>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewBuilding(b)}>
            <Eye className="w-3.5 h-3.5 mr-1 text-[#006a61]" />
            Inspect Wings
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Command & Spatial Architecture Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          <span>Society Management</span>
          <span>&rsaquo;</span>
          <span>Buildings &amp; Wings</span>
          <span>&rsaquo;</span>
          <span className="text-[#070235] font-bold">Spatial Architecture</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Buildings, Wings &amp; Spatial Architecture
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Live structural architectural layouts, floor stacking, assessable built-up area formulas, and residency occupancy status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[#070235] text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddBuildingModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold shadow-md hover:bg-[#1e1b4b] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Building</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spatial Metric Cards Strip (Dynamic from API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Units */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Society Units</span>
              <span className="text-2xl font-bold text-[#070235] mt-1">
                {totalSocietyUnits} <span className="text-xs text-slate-400 font-normal">Units</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50 text-[#070235]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-1 border-t border-slate-100">
            <span>{buildings.length} Buildings / Towers Configured</span>
          </div>
        </div>

        {/* Occupancy Breakdown */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Occupancy Rate</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-[#006a61]">{occupancyRate}%</span>
                <span className="text-xs text-slate-500">({occupiedUnits} Active)</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-[#006a61]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-3 mt-1 border-t border-slate-100 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-[#070235] text-white">{occupiedUnits} Occupied</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{vacantUnits} Vacant</span>
          </div>
        </div>

        {/* Assessable Built-Up Area */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Assessable Area</span>
              <span className="text-2xl font-bold text-[#070235] mt-1">
                {totalAssessableSqFt.toLocaleString("en-IN")}{" "}
                <span className="text-xs text-slate-400 font-normal">sq.ft</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-1 border-t border-slate-100">
            <span>Formula: Base Carpet + Common Loading</span>
          </div>
        </div>

        {/* Buildings Registered */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Towers / Wings</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-[#070235]">{buildings.length} Active</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-[#006a61]">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-1 border-t border-slate-100">
            <span>Society Context: {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}</span>
          </div>
        </div>
      </div>

      {/* Floor Stacking Architecture Dynamic Visualizer */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-[#070235]" />
              <h2 className="text-base font-bold text-[#070235]">Floor Stacking Architecture</h2>
            </div>
            <p className="text-xs text-slate-500">Live elevation and unit distribution for active society structures.</p>
          </div>

          {/* Dynamic Building Tabs */}
          {buildings.length > 0 && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
              {buildings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedBuildingId === b.id
                      ? "bg-white text-[#070235] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedBuildingId === b.id ? "bg-[#006a61]" : "bg-slate-400"}`}></span>
                  <span>{b.name} ({b.code})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#070235]"></span> Occupied Unit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200"></span> Vacant Unit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-100 border border-teal-300"></span> Under Maintenance
          </span>
        </div>

        {/* Dynamic Floor Slices */}
        {distinctFloors.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium">No units mapped to this building yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {distinctFloors.map((floor) => {
              const floorUnits = floorsMap[floor] || [];
              return (
                <div key={floor} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-20 shrink-0 text-center text-xs font-bold text-[#070235] bg-white py-2 rounded shadow-sm">
                    Floor {floor}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 flex-1 text-xs">
                    {floorUnits.map((u) => {
                      const isOccupied = u.status === "OCCUPIED";
                      return (
                        <div
                          key={u.id}
                          className={`p-2 rounded flex flex-col cursor-pointer transition-all ${
                            isOccupied
                              ? "bg-[#070235] text-white hover:opacity-90"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{u.unitNumber}</span>
                            <span className={`text-[9px] uppercase font-bold ${isOccupied ? "text-indigo-300" : "text-slate-500"}`}>
                              {u.unitType || "UNIT"}
                            </span>
                          </div>
                          <span className={`text-[10px] ${isOccupied ? "text-indigo-200" : "text-slate-500"}`}>
                            {u.squareFeet || 1000} sq.ft • {u.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buildings Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#070235]">Configured Society Buildings</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <Table
            columns={columns}
            data={filteredBuildings}
            keyExtractor={(b) => b.id}
            isLoading={isLoading}
            emptyMessage="No buildings registered for this society."
          />
        )}
      </div>

      {/* Add Building Modal */}
      <Modal
        isOpen={isAddBuildingModalOpen}
        onClose={() => setIsAddBuildingModalOpen(false)}
        title="Add Building / Wing"
        description="Configure a new structural tower or wing in the housing society."
        maxWidth="md"
      >
        <form onSubmit={handleCreateBuildingSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Building Name *</label>
            <Input
              placeholder="e.g. Tower C / Parijat Wing"
              value={bName}
              onChange={(e) => setBName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Building Code *</label>
              <Input
                placeholder="e.g. TWR-C"
                value={bCode}
                onChange={(e) => setBCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Floors</label>
              <Input
                type="number"
                min="1"
                value={bFloors}
                onChange={(e) => setBFloors(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Units Count</label>
            <Input
              type="number"
              min="1"
              value={bUnits}
              onChange={(e) => setBUnits(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#070235] focus:outline-none bg-white text-[#131b2e]"
              rows={2}
              placeholder="Wing characteristics or architectural notes..."
              value={bDesc}
              onChange={(e) => setBDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddBuildingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Building"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inspect Wings Modal */}
      {selectedBuilding && (
        <Modal
          isOpen={!!selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          title={`Wings in ${selectedBuilding.name} (${selectedBuilding.code})`}
          description="Structural wing subdivisions for this building."
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {isLoadingWings ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading wing configuration...</div>
            ) : wings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No wings configured for this building.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {wings.map((w) => (
                  <div key={w.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#070235]">{w.name} ({w.code})</span>
                      <span className="text-slate-400 text-[11px] block">{w.totalFloors} floors</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedBuilding(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
