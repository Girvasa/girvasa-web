"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Receipt,
  MessageSquareWarning,
  Users,
  Car,
  Bell,
  Calendar,
  Vote,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useTenant } from "@/lib/tenant/TenantContext";
import { endpoints } from "@/lib/api/endpoints";
import { ExecutiveDashboardResponse } from "@/types/report";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { currentSociety, activeSocietyId } = useTenant();
  const [dashboardData, setDashboardData] = useState<ExecutiveDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.dashboard.getExecutiveSummary();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.detail || "Unable to load society dashboard analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {/* Society welcome banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {currentSociety?.societyName || "Housing Society"}
            </h1>
            <Badge variant="success">{currentSociety?.status || "ACTIVE"}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {currentSociety?.city ? `${currentSociety.city}, ${currentSociety.state}` : "Society Administration Console"} • Code:{" "}
            <span className="font-mono font-medium text-slate-700">{currentSociety?.societyCode}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/billing"
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Billing Overview</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <Link
            href="/complaints"
            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Helpdesk Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchDashboard} />
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Financial summary KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                Financial Operations
              </h2>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {dashboardData.financial?.collectionPercentage || 0}% Collection Efficiency
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Billed"
                value={formatCurrency(dashboardData.financial?.totalBilled)}
                subtext="Current fiscal period"
                icon={<Receipt className="w-5 h-5" />}
                variant="blue"
              />
              <StatCard
                title="Total Collected"
                value={formatCurrency(dashboardData.financial?.totalPaid)}
                subtext="Verified inflow"
                icon={<CreditCard className="w-5 h-5" />}
                variant="emerald"
              />
              <StatCard
                title="Total Outstanding"
                value={formatCurrency(dashboardData.financial?.totalOutstanding)}
                subtext="Pending receivables"
                icon={<Receipt className="w-5 h-5" />}
                variant="amber"
              />
              <StatCard
                title="Critical Dues (>90d)"
                value={formatCurrency(dashboardData.financial?.criticalDelinquentOver90Days)}
                subtext="High-risk aging arrears"
                icon={<ShieldAlert className="w-5 h-5" />}
                variant="rose"
              />
            </div>
          </div>

          {/* Operational & Security summary */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Operations & Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Open Complaints"
                value={dashboardData.operational?.openComplaints ?? 0}
                subtext={`${dashboardData.operational?.averageComplaintResolutionHours ?? 0}h avg resolution`}
                icon={<MessageSquareWarning className="w-5 h-5" />}
                variant="amber"
              />
              <StatCard
                title="Visits Today"
                value={dashboardData.security?.visitsToday ?? 0}
                subtext={`${dashboardData.security?.visitorsCurrentlyInside ?? 0} currently on premises`}
                icon={<Users className="w-5 h-5" />}
                variant="indigo"
              />
              <StatCard
                title="Parking Utilization"
                value={`${dashboardData.facility?.parkingOccupancyPercentage ?? 0}%`}
                subtext={`${dashboardData.facility?.allocatedParkingSlots ?? 0} of ${dashboardData.facility?.totalParkingSlots ?? 0} slots`}
                icon={<Car className="w-5 h-5" />}
                variant="blue"
              />
              <StatCard
                title="Active Staff & Vendors"
                value={(dashboardData.operational?.activeStaff ?? 0) + (dashboardData.operational?.activeVendorContracts ?? 0)}
                subtext={`${dashboardData.operational?.activeStaff ?? 0} staff • ${dashboardData.operational?.activeVendorContracts ?? 0} vendor contracts`}
                icon={<Users className="w-5 h-5" />}
                variant="slate"
              />
            </div>
          </div>

          {/* Community Engagement & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Community Engagement" subtitle="Active communication and resident participation">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Notices</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{dashboardData.community?.activeNotices ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Broadcasts published</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Upcoming Events</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{dashboardData.community?.upcomingEvents ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Scheduled activities</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                    <Vote className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Polls</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{dashboardData.community?.activePolls ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {dashboardData.community?.averagePollParticipationPercentage ?? 0}% participation
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center space-x-2 text-amber-600 mb-2">
                    <Receipt className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Amenity Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{dashboardData.facility?.totalAmenityBookings ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Revenue: {formatCurrency(dashboardData.facility?.amenityRevenue)}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Quick Administration Links" subtitle="Fast access to key operational management flows">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/residents"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Manage Residents</div>
                  <div className="text-[11px] text-slate-500 mt-1">Directory & approvals</div>
                </Link>
                <Link
                  href="/payments"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Payment Ledger</div>
                  <div className="text-[11px] text-slate-500 mt-1">Allocations & receipts</div>
                </Link>
                <Link
                  href="/visitors"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Gate Security</div>
                  <div className="text-[11px] text-slate-500 mt-1">Visitor passes & check-in</div>
                </Link>
                <Link
                  href="/notices"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Publish Notices</div>
                  <div className="text-[11px] text-slate-500 mt-1">Broadcast communications</div>
                </Link>
                <Link
                  href="/amenities"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Amenity Bookings</div>
                  <div className="text-[11px] text-slate-500 mt-1">Clubhouse & sports slots</div>
                </Link>
                <Link
                  href="/audit"
                  className="rounded-xl border border-slate-200/70 p-3.5 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold text-slate-900">Security Audit Logs</div>
                  <div className="text-[11px] text-slate-500 mt-1">Tamper-proof event logs</div>
                </Link>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
