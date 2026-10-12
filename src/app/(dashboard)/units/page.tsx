"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  Plus,
  Download,
  Building,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  RefreshCw,
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

  // Bulk Excel/CSV Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importBuildingId, setImportBuildingId] = useState("");
  interface ParsedUnitRow {
    unitNumber: string;
    floorNumber: number;
    configuration: string;
    areaSqft: number;
    unitType: string;
    isValid: boolean;
    error?: string;
  }
  const [parsedRows, setParsedRows] = useState<ParsedUnitRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState<string | null>(null);

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
      if (bList.length > 0) {
        if (!newUnitData.buildingId) {
          setNewUnitData((prev) => ({ ...prev, buildingId: bList[0].id }));
        }
        if (!importBuildingId) {
          setImportBuildingId(bList[0].id);
        }
      }
    } catch (err: any) {
      setError(err?.detail || "Unable to load society units.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, selectedBuildingId, selectedStatus, search, newUnitData.buildingId, importBuildingId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleDownloadSampleCsv = () => {
    let csv = "Unit Number,Floor Number,Configuration,Area (SqFt),Type\n";
    // 46 Flats across 7 floors:
    // Floors 1 to 5: 7 flats each (flats 1 & 2 are 3BHK 1250 sqft, flats 3 to 7 are 2BHK 950 sqft)
    for (let floor = 1; floor <= 5; floor++) {
      for (let flat = 1; flat <= 7; flat++) {
        const unitNo = `${floor}0${flat}`;
        const config = flat <= 2 ? "3BHK" : "2BHK";
        const area = flat <= 2 ? 1250 : 950;
        csv += `${unitNo},${floor},${config},${area},RESIDENTIAL\n`;
      }
    }
    // Floor 6: 6 flats (flats 1 & 2 are 3BHK, flats 3 to 6 are 2BHK)
    for (let flat = 1; flat <= 6; flat++) {
      const unitNo = `60${flat}`;
      const config = flat <= 2 ? "3BHK" : "2BHK";
      const area = flat <= 2 ? 1250 : 950;
      csv += `${unitNo},6,${config},${area},RESIDENTIAL\n`;
    }
    // Floor 7: 5 flats (flats 1 & 2 are 3BHK, flats 3 to 5 are 2BHK)
    for (let flat = 1; flat <= 5; flat++) {
      const unitNo = `70${flat}`;
      const config = flat <= 2 ? "3BHK" : "2BHK";
      const area = flat <= 2 ? 1250 : 950;
      csv += `${unitNo},7,${config},${area},RESIDENTIAL\n`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "girvasa_46_flats_sample_roster.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkImportError(null);
    setBulkImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          setBulkImportError("The uploaded CSV file is empty or contains only headers.");
          setParsedRows([]);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.replace(/["']/g, "").trim().toLowerCase());
        const unitIdx = headers.findIndex((h) => h.includes("unit") || h.includes("flat"));
        const floorIdx = headers.findIndex((h) => h.includes("floor"));
        const configIdx = headers.findIndex((h) => h.includes("config") || h.includes("bhk"));
        const areaIdx = headers.findIndex((h) => h.includes("area") || h.includes("sqft"));
        const typeIdx = headers.findIndex((h) => h.includes("type"));

        const rows: ParsedUnitRow[] = [];
        const seenUnits = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.replace(/["']/g, "").trim());
          if (cols.length < 2) continue;

          const unitNumber = unitIdx !== -1 ? cols[unitIdx] : cols[0];
          const floorNumber = floorIdx !== -1 ? parseInt(cols[floorIdx], 10) : parseInt(cols[1], 10);
          const configuration = configIdx !== -1 && cols[configIdx] ? cols[configIdx].toUpperCase() : "2BHK";
          const areaSqft = areaIdx !== -1 && cols[areaIdx] ? parseFloat(cols[areaIdx]) : (configuration === "3BHK" ? 1250 : 950);
          const unitType = typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx].toUpperCase() : "RESIDENTIAL";

          let isValid = true;
          let errorMsg: string | undefined;

          if (!unitNumber) {
            isValid = false;
            errorMsg = "Missing unit number";
          } else if (seenUnits.has(unitNumber.toUpperCase())) {
            isValid = false;
            errorMsg = `Duplicate unit (${unitNumber})`;
          } else if (isNaN(floorNumber) || floorNumber < 0) {
            isValid = false;
            errorMsg = "Invalid floor level";
          }

          if (unitNumber) {
            seenUnits.add(unitNumber.toUpperCase());
          }

          rows.push({
            unitNumber,
            floorNumber: isNaN(floorNumber) ? 1 : floorNumber,
            configuration: configuration || "2BHK",
            areaSqft: isNaN(areaSqft) ? 950 : areaSqft,
            unitType: unitType || "RESIDENTIAL",
            isValid,
            error: errorMsg,
          });
        }

        if (rows.length === 0) {
          setBulkImportError("No valid rows could be parsed from the file.");
        }
        setParsedRows(rows);
      } catch (err: any) {
        setBulkImportError("Failed to parse file: " + (err.message || "Unknown error"));
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (!importBuildingId) {
      setBulkImportError("Please select a target building.");
      return;
    }
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setBulkImportError("No valid unit rows to import.");
      return;
    }

    setIsImporting(true);
    setBulkImportError(null);
    setBulkImportSuccess(null);
    setImportProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    const failures: string[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await endpoints.structure.createUnit({
          buildingId: importBuildingId,
          unitNumber: row.unitNumber,
          floorNumber: row.floorNumber,
          unitType: row.unitType,
          configuration: row.configuration,
          areaSqft: row.areaSqft,
        });
        successCount++;
      } catch (err: any) {
        failures.push(`${row.unitNumber}: ${err.detail || err.message || "Failed"}`);
      }
      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setIsImporting(false);
    if (failures.length > 0) {
      setBulkImportError(`Imported ${successCount} flats. Failed ${failures.length} flats: ${failures.slice(0, 3).join(", ")}${failures.length > 3 ? "..." : ""}`);
    } else {
      setBulkImportSuccess(`Successfully imported all ${successCount} flats into the building!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setParsedRows([]);
        setFileName("");
        setBulkImportSuccess(null);
        setImportProgress(null);
      }, 1800);
    }
    fetchUnits();
  };

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
          <span className="text-[11px] text-[#006a61] font-medium">{u.wingName ? `Wing ${u.wingName}` : "Single Tower"}</span>
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
              onClick={() => {
                setIsImportModalOpen(true);
                setBulkImportError(null);
                setBulkImportSuccess(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#006a61] text-xs font-semibold shadow-sm hover:bg-teal-100/80 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#006a61]" />
              <span>Import Flats (Excel / CSV)</span>
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
                {selectedUnit?.wingName ? `Wing ${selectedUnit.wingName}` : "Single Tower"}
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

      {/* Bulk Excel/CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          if (!isImporting) {
            setIsImportModalOpen(false);
            setBulkImportError(null);
            setBulkImportSuccess(null);
          }
        }}
        title="Bulk Ingest Flats (Excel / CSV Spreadsheet)"
        description="Upload a structured CSV/Excel sheet to automatically create all flats across floors with their 2BHK/3BHK classifications."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {bulkImportError && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{bulkImportError}</span>
            </div>
          )}

          {bulkImportSuccess && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bulkImportSuccess}</span>
            </div>
          )}

          {/* Building Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Building</label>
            <select
              value={importBuildingId}
              onChange={(e) => setImportBuildingId(e.target.value)}
              disabled={isImporting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#070235]"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 1: Template Download */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-[#070235] block">Step 1: Download Standard Template</span>
              <span className="text-[11px] text-slate-500">
                Pre-configured with 46 flats across 7 floors (Floors 1-5: 7 flats, Floor 6: 6 flats, Floor 7: 5 flats).
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-[#070235] text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download 46-Flat Template (.csv)</span>
            </button>
          </div>

          {/* Step 2: File Upload Dropzone */}
          <div className="p-4 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/40 text-center">
            <Upload className="w-8 h-8 text-[#006a61] mx-auto mb-2 opacity-80" />
            <label className="cursor-pointer">
              <span className="text-xs font-bold text-[#006a61] hover:underline block">
                Click here to choose or upload your Excel / CSV file
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Accepts .csv exported from Microsoft Excel, Google Sheets, or Apple Numbers
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileParse}
                disabled={isImporting}
                className="hidden"
              />
            </label>
            {fileName && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-teal-300 text-xs font-semibold text-teal-800 shadow-sm">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#006a61]" />
                <span>Selected: {fileName}</span>
              </div>
            )}
          </div>

          {/* Step 3: Live Preview & Inspection */}
          {parsedRows.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#070235]">Ingestion Inspection &amp; Preview</span>
                <span className="text-[11px] text-slate-500">
                  {parsedRows.filter((r) => r.isValid).length} of {parsedRows.length} valid
                </span>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Flats</span>
                  <span className="text-base font-bold text-[#070235]">{parsedRows.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                  <span className="text-[10px] text-teal-600 uppercase font-semibold block">3 BHK Units</span>
                  <span className="text-base font-bold text-[#006a61]">
                    {parsedRows.filter((r) => r.configuration === "3BHK").length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] text-indigo-600 uppercase font-semibold block">2 BHK Units</span>
                  <span className="text-base font-bold text-[#070235]">
                    {parsedRows.filter((r) => r.configuration === "2BHK").length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Floors</span>
                  <span className="text-base font-bold text-slate-800">
                    {Math.max(...parsedRows.map((r) => r.floorNumber), 1)}
                  </span>
                </div>
              </div>

              {/* Scrollable Preview Table */}
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-semibold text-[11px]">
                    <tr>
                      <th className="py-1.5 px-2.5">Unit #</th>
                      <th className="py-1.5 px-2.5">Floor</th>
                      <th className="py-1.5 px-2.5">Configuration</th>
                      <th className="py-1.5 px-2.5">Assessable Area</th>
                      <th className="py-1.5 px-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? "hover:bg-slate-50/50" : "bg-rose-50/50"}>
                        <td className="py-1.5 px-2.5 font-bold text-slate-900">{row.unitNumber}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">Floor {row.floorNumber}</td>
                        <td className="py-1.5 px-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.configuration === "3BHK"
                                ? "bg-teal-100 text-[#006a61]"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {row.configuration}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-600">{row.areaSqft} sq.ft</td>
                        <td className="py-1.5 px-2.5 text-right">
                          {row.isValid ? (
                            <span className="inline-flex items-center text-emerald-700 text-[10px] font-semibold gap-0.5">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-700 text-[10px] font-semibold gap-0.5">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p className="text-[10px] text-slate-400 text-center italic">
                  Showing first 15 of {parsedRows.length} units. All valid units will be ingested.
                </p>
              )}
            </div>
          )}

          {/* Progress Indicator */}
          {isImporting && importProgress && (
            <div className="space-y-1.5 p-3 rounded-xl bg-teal-50 border border-teal-200">
              <div className="flex justify-between text-xs font-semibold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#006a61]" />
                  Ingesting units into society database...
                </span>
                <span>
                  {importProgress.current} / {importProgress.total} (
                  {Math.round((importProgress.current / importProgress.total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-teal-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006a61] transition-all duration-200"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              disabled={isImporting}
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              disabled={isImporting || parsedRows.filter((r) => r.isValid).length === 0}
              onClick={handleExecuteBulkImport}
              isLoading={isImporting}
              className="bg-[#006a61] hover:bg-[#00524b] text-white"
            >
              {isImporting
                ? "Ingesting..."
                : `Commit & Ingest ${parsedRows.filter((r) => r.isValid).length} Flats`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unit Dossier Modal */}
      {selectedUnit && (
        <Modal
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
          title={`Flat Dossier — Unit ${selectedUnit.unitNumber}`}
          description={`Comprehensive structural and occupancy records for Unit ${selectedUnit.unitNumber}.`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Header Strip */}
            <div className="flex items-center justify-between p-4 bg-[#f2f3ff] rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#070235] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedUnit.unitNumber}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedUnit.buildingName || "Main Tower"} • Floor {selectedUnit.floorNumber}
                  </h3>
                  <span className="text-slate-500 text-xs">
                    {selectedUnit.wingName ? `Wing: ${selectedUnit.wingName} • ` : ""}
                    Configuration: {selectedUnit.configuration || "2BHK"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedUnit.status)}
                <span className="text-[11px] text-slate-400 block mt-1">
                  Assessable: {selectedUnit.squareFeet || 1000} sq.ft
                </span>
              </div>
            </div>

            {/* Spatial & Physical Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Premises Type</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedUnit.unitType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Floor Level</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">Level {selectedUnit.floorNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Carpet / Built-up</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedUnit.squareFeet || 1000} sq.ft</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Building Tower</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedUnit.buildingName || "Society Tower"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Subdivision Wing</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedUnit.wingName || "Single Tower"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Registration</span>
                <span className="font-semibold text-[#006a61] text-xs mt-0.5 block">Form I Compliant</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUnit(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
