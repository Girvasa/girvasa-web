"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Car, Search } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { ParkingAreaResponse, ParkingSlotResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function ParkingPage() {
  const { activeSocietyId } = useTenant();
  const [areas, setAreas] = useState<ParkingAreaResponse[]>([]);
  const [slots, setSlots] = useState<ParkingSlotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState("");

  const fetchData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [areasData, slotsData] = await Promise.all([
        endpoints.parking.getAreas(),
        endpoints.parking.getSlots(selectedAreaId || undefined),
      ]);
      const extractArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        return [];
      };
      setAreas(extractArray(areasData));
      setSlots(extractArray(slotsData));
    } catch (err: any) {
      setError(err.detail || "Unable to load parking configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, selectedAreaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<ParkingSlotResponse>[] = [
    {
      header: "Slot Number",
      accessor: (s) => <span className="font-mono font-bold text-slate-900">{s.slotNumber}</span>,
    },
    {
      header: "Parking Zone / Area",
      accessor: (s) => <span className="font-medium text-slate-800">{s.parkingAreaName || "Basement / Open"}</span>,
    },
    {
      header: "Vehicle Classification",
      accessor: (s) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
          {s.slotType || "4-Wheeler"}
        </span>
      ),
    },
    {
      header: "Allocated Unit",
      accessor: (s) => (
        <span className="font-semibold text-blue-600">
          {s.unitNumber ? `Unit ${s.unitNumber}` : "Unallocated / Visitor"}
        </span>
      ),
    },
    {
      header: "Allocation Status",
      accessor: (s) => (
        <Badge variant={s.unitId ? "info" : "success"}>
          {s.unitId ? "Allocated" : "Available"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Vehicle Parking Allocation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Basement lots, open bays, assigned resident parking, and visitor slots.
          </p>
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            placeholder="All Parking Zones"
            options={areas.map((a) => ({ label: a.name, value: a.id }))}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <Table
          columns={columns}
          data={slots}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="No parking slots configured."
        />
      )}
    </div>
  );
}
