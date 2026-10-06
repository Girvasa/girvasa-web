"use client";

import React, { useEffect, useState, useCallback } from "react";
import { BarChart3, Download, FileSpreadsheet, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { endpoints } from "@/lib/api/endpoints";
import { ExecutiveDashboardResponse } from "@/types/report";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { activeSocietyId } = useTenant();
  const [data, setData] = useState<ExecutiveDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await endpoints.dashboard.getExecutiveSummary();
      setData(res);
    } catch (err: any) {
      setError(err.detail || "Unable to load reporting metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited financial, facility, security, and operational reporting data.
          </p>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Financial Performance Summary" subtitle="Verified dues and collections snapshot">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Billed Volume</span>
                <span className="font-bold text-slate-900">{formatCurrency(data.financial?.totalBilled)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Collections Verified</span>
                <span className="font-bold text-emerald-700">{formatCurrency(data.financial?.totalPaid)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Outstanding Receivables</span>
                <span className="font-bold text-amber-700">{formatCurrency(data.financial?.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Collection Efficiency Ratio</span>
                <span className="font-bold text-slate-900">{data.financial?.collectionPercentage || 0}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Critical Delinquent Arrears (&gt;90 days)</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(data.financial?.criticalDelinquentOver90Days)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Operational & Facility Metrics" subtitle="Facility load and resolution speed">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Open Service Complaints</span>
                <span className="font-bold text-slate-900">{data.operational?.openComplaints ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Mean Resolution Time</span>
                <span className="font-bold text-slate-900">
                  {data.operational?.averageComplaintResolutionHours ?? 0} hours
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Amenity Reservations</span>
                <span className="font-bold text-slate-900">{data.facility?.totalAmenityBookings ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Amenity Revenue Collected</span>
                <span className="font-bold text-slate-900">{formatCurrency(data.facility?.amenityRevenue)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Parking Capacity Occupied</span>
                <span className="font-bold text-slate-900">
                  {data.facility?.parkingOccupancyPercentage ?? 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
