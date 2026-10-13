import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "slate";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  variant = "emerald",
}) => {
  const iconBgs = {
    blue: "bg-emerald-50 text-[#107A48]",
    emerald: "bg-emerald-50 text-[#107A48]",
    amber: "bg-amber-50 text-[#B45309]",
    rose: "bg-rose-50 text-[#B91C1C]",
    indigo: "bg-slate-100 text-[#1E293B]",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {icon && <div className={cn("rounded-lg p-2.5", iconBgs[variant])}>{icon}</div>}
      </div>
      <div className="mt-3">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h4>
        {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
      </div>
    </div>
  );
};
