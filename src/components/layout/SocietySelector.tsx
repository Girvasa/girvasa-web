"use client";

import React, { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useTenant } from "@/lib/tenant/TenantContext";

export const SocietySelector: React.FC = () => {
  const { societies, currentSociety, activeSocietyId, switchSociety, isLoadingTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoadingTenant && !currentSociety) {
    return (
      <div className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400">
        <Building2 className="w-4 h-4 animate-pulse" />
        <span>Loading society...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#107A48]/20"
      >
        <Building2 className="w-4 h-4 text-[#107A48]" />
        <span className="font-semibold text-slate-900 max-w-[140px] sm:max-w-[200px] truncate">
          {currentSociety ? currentSociety.societyName : "Select Society"}
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
          {currentSociety?.societyCode || "—"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Switch Society
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {societies.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">No society memberships</div>
            ) : (
              societies.map((soc) => {
                const isSelected = soc.societyId === activeSocietyId;
                return (
                  <button
                    key={soc.societyId}
                    onClick={() => {
                      switchSociety(soc.societyId);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{soc.societyName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{soc.societyCode}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#107A48]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
