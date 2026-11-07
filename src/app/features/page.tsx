"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Calendar, 
  Layers, 
  FileSpreadsheet, 
  Receipt, 
  Key, 
  Users, 
  Check, 
  FileText 
} from "lucide-react";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "billing" | "security" | "directory" | "compliance">("all");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleExportSample = (formatName: string) => {
    setDownloadNotice(`Generated sample ${formatName} according to MCS Act 1960. Sample download initiated.`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
          {/* Hero Section & System Topology Overview */}
          <section className="relative w-full bg-primary text-on-primary py-space-xl overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-gutter flex flex-col gap-space-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/20 self-start text-secondary-fixed">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Statutory CHS ERP &amp; Gate Automation
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-primary font-bold tracking-tight">
                    Legally Compliant. Operationally Sound. Effortless.
                  </h1>
                  <p className="font-body-md text-body-md text-surface-container-high/80">
                    Automated Bye-Law 166 billing, DPDP-ready gatepass security, Section 99 secret e-voting, and MCS Act statutory registers in unified real-time ledger sync.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                    <Link 
                      className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-colors shadow-sm" 
                      href="/demo"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      <span>Book Interactive Demo</span>
                    </Link>
                    <a 
                      className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 border border-surface-container-high/20 font-label-md text-label-md font-semibold text-on-primary transition-colors" 
                      href="#all-modules"
                    >
                      <span>Explore 4 Pillars</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-7 flex flex-col">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-surface-container-high/20 bg-surface-container-lowest/10">
                    <img 
                      src="/images/platform_features_mockup.jpg" 
                      alt="Girvasa Housing Society Smart App and Web Management Features Overview" 
                      className="w-full h-auto object-cover rounded-xl shadow-2xl" 
                    />
                  </div>
                </div>
              </div>

              {/* Fast Jump Module Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
                <button 
                  onClick={() => setActiveTab("billing")}
                  className={`flex items-center gap-space-xs p-space-sm rounded-lg transition-all text-left ${
                    activeTab === "billing" ? "bg-secondary text-on-secondary shadow-md" : "bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === "billing" ? "text-on-secondary" : "text-secondary-fixed"}`}>receipt_long</span>
                  <span className="font-label-md text-label-md font-semibold">1. Bye-Law 166 Billing</span>
                </button>
                <button 
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-space-xs p-space-sm rounded-lg transition-all text-left ${
                    activeTab === "security" ? "bg-secondary text-on-secondary shadow-md" : "bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === "security" ? "text-on-secondary" : "text-secondary-fixed"}`}>shield</span>
                  <span className="font-label-md text-label-md font-semibold">2. Gate &amp; DPDP Pass</span>
                </button>
                <button 
                  onClick={() => setActiveTab("directory")}
                  className={`flex items-center gap-space-xs p-space-sm rounded-lg transition-all text-left ${
                    activeTab === "directory" ? "bg-secondary text-on-secondary shadow-md" : "bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === "directory" ? "text-on-secondary" : "text-secondary-fixed"}`}>record_voice_over</span>
                  <span className="font-label-md text-label-md font-semibold">3. Helpdesk &amp; SLA Hub</span>
                </button>
                <button 
                  onClick={() => setActiveTab("compliance")}
                  className={`flex items-center gap-space-xs p-space-sm rounded-lg transition-all text-left ${
                    activeTab === "compliance" ? "bg-secondary text-on-secondary shadow-md" : "bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === "compliance" ? "text-on-secondary" : "text-secondary-fixed"}`}>account_balance</span>
                  <span className="font-label-md text-label-md font-semibold">4. Form I &amp; J Registers</span>
                </button>
              </div>
            </div>
          </section>

          {/* Deep-Dive Pillar Overview: Architecture & Ecosystem */}
          <section className="w-full bg-surface-container-low py-space-xl border-b border-surface-container-high/40">
            <div className="w-full max-w-[1600px] mx-auto px-gutter flex flex-col gap-space-lg items-center text-center">
              <div className="flex flex-col items-center gap-space-xs max-w-2xl">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  <span className="material-symbols-outlined text-[14px]">hub</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Multi-Tier Co-operative ERP Engine
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
                  Centralized Architecture. Zero Ledger Fragmentation.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Reconcile Bye-Law 166 maintenance ledgers, biometric gate passes, resident ticketing SLAs, and MCS Act statutory records over an immutable double-entry architecture.
                </p>
              </div>
              <div className="group w-full max-w-5xl rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-surface-container-high/40 bg-surface-container-lowest p-2">
                <div className="overflow-hidden rounded-lg">
                  <img 
                    src="/images/ecosystem_diagram.jpg" 
                    alt="Girvasa Society OS Unified Cloud Core Architecture Ecosystem Diagram" 
                    className="w-full h-auto object-cover rounded-lg shadow-sm transition-transform duration-500 ease-out group-hover:scale-[1.015]" 
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
                <span className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[16px] text-secondary">account_balance_wallet</span>
                  Double-Entry General Ledger
                </span>
                <span className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[16px] text-secondary">lock_clock</span>
                  DPDP Act 2023 Masked Logs
                </span>
                <span className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[16px] text-secondary">sync_alt</span>
                  Sub-Second Real-Time Core Sync
                </span>
                <span className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  CAG / Co-operative Audit Grade
                </span>
              </div>
            </div>
          </section>

          {/* Module Filter Tab Bar */}
          <section className="w-full py-space-md bg-surface-container-lowest sticky top-16 z-30 border-b border-surface-container-high/60 shadow-sm" id="all-modules">
            <div className="w-full max-w-[1600px] mx-auto px-gutter flex items-center justify-between gap-space-md overflow-x-auto">
              <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider hidden md:inline">
                Module Filter:
              </span>
              <div className="flex items-center gap-space-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all shrink-0 ${
                    activeTab === "all" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                  }`}
                >
                  All 4 Modules
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all shrink-0 ${
                    activeTab === "billing" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                  }`}
                >
                  1. Billing &amp; Accounting
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all shrink-0 ${
                    activeTab === "security" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                  }`}
                >
                  2. Gate &amp; Security
                </button>
                <button
                  onClick={() => setActiveTab("directory")}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all shrink-0 ${
                    activeTab === "directory" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                  }`}
                >
                  3. Helpdesk &amp; SLA
                </button>
                <button
                  onClick={() => setActiveTab("compliance")}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all shrink-0 ${
                    activeTab === "compliance" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                  }`}
                >
                  4. Statutory Registers
                </button>
              </div>
              <Link 
                href="/demo"
                className="hidden lg:inline-flex items-center gap-1 text-secondary font-label-md text-label-md font-bold hover:underline shrink-0"
              >
                Schedule Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Feedback Notice Toast */}
          {downloadNotice && (
            <div className="w-full max-w-[1600px] mx-auto px-gutter pt-space-sm">
              <div className="p-space-sm rounded-lg bg-secondary/15 border border-secondary text-primary font-label-md flex items-center justify-between gap-space-sm animate-fade-in">
                <div className="flex items-center gap-space-xs">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  <span>{downloadNotice}</span>
                </div>
                <button onClick={() => setDownloadNotice(null)} className="text-secondary font-bold text-label-sm">Dismiss</button>
              </div>
            </div>
          )}

          {/* Detailed Pillars Deep Dive */}
          <section className="w-full py-space-xl bg-surface">
            <div className="w-full max-w-[1600px] mx-auto px-gutter flex flex-col gap-space-xl">
              
              {/* Module 1: Billing & Accounting */}
              {(activeTab === "all" || activeTab === "billing") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start pb-space-xl border-b border-surface-container-high/40" id="billing-accounting">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs text-secondary">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Module 01</span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        MCS Bye-Law 166 &amp; 167 Compliant
                      </span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl font-bold text-primary">Billing &amp; Double-Entry Accounting</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                      Statutory maintenance bill generation, instant Bharat BillPay (BBPS) &amp; Dynamic UPI QR, automated interest calculations at 21% p.a., and tally-ready export.
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-space-xs">
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                        Bye-Law 166 Itemization
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">qr_code_2</span>
                        Dynamic NPCI UPI QR
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">receipt_long</span>
                        Tally XML &amp; Daybook Export
                      </span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-xs mt-2">
                      <h4 className="font-label-md text-label-md font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                        Statutory Bye-Law 67 Fund Breakdown
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Calculates exact Sinking Fund (0.25% p.a. of construction cost) and Repair Fund (0.75% p.a.), with 10% non-occupancy charges on rented flats automatically capped under Bye-Law 43.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container-high/40">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">Statutory Maintenance Bill (Oct 2024)</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Unit: B-402 • Built-up: 940 sq.ft • Member: Rajesh K. Nair</span>
                      </div>
                      <span className="px-space-sm py-1 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold">
                        Bye-Law 166 Auto-Run
                      </span>
                    </div>
                    <div className="flex flex-col gap-space-xs text-body-sm">
                      <div className="flex justify-between py-1 border-b border-surface-container-high/20">
                        <span>Property Taxes &amp; Water Charges (Shared Equal)</span>
                        <span className="font-semibold">₹1,420.00</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-surface-container-high/20">
                        <span>Common Area Maintenance &amp; Security Services</span>
                        <span className="font-semibold">₹1,850.00</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-surface-container-high/20">
                        <span>Sinking Fund (0.25% p.a. of Construction Cost)</span>
                        <span className="font-semibold">₹650.00</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-surface-container-high/20">
                        <span>Repair &amp; Maintenance Fund (0.75% p.a.)</span>
                        <span className="font-semibold">₹850.00</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-surface-container-high/20">
                        <span>Lift Overhaul AMC &amp; Insurance Premium Fund</span>
                        <span className="font-semibold">₹480.00</span>
                      </div>
                      <div className="flex justify-between py-space-xs font-bold text-primary pt-space-xs text-[16px]">
                        <span>Total Current Dues</span>
                        <span className="text-secondary">₹5,250.00</span>
                      </div>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                      <span>Due Date: 15-Nov-2024 (Simple Interest @ 21% p.a. post due date)</span>
                      <span className="text-secondary font-semibold">NPCI Dynamic UPI QR &amp; BBPS Live</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 2: Gate & Security */}
              {(activeTab === "all" || activeTab === "security") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start pb-space-xl border-b border-surface-container-high/40" id="gate-security">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs text-secondary">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Module 02</span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        DPDP Act 2023 Compliant
                      </span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl font-bold text-primary">Gate &amp; Perimeter Security Desk</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                      Ultra-fast multilingual guard terminal, ANPR vehicle barrier sync, privacy-safe visitor pass, and live daily staff biometric attendance.
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-space-xs">
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">smartphone</span>
                        WhatsApp &amp; App Approval
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
                        Delivery Passcode &amp; Queue
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">badge</span>
                        Domestic Staff Biometrics
                      </span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-xs mt-2">
                      <h4 className="font-label-md text-label-md font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
                        Zero Phone Number Leaks at Guard Desk
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Guard tablets display masked resident identifiers (Flat 402 instead of 98200XXXXX). Delivery personnel enter 6-digit OTP passcodes without phone dialing.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container-high/40">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Gate Terminal Live Feed (Main Gate 01)</span>
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">Android POS &amp; Tablet Ready</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Guest / Cab Entry</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">Vikram Solanki</span>
                        <span className="text-body-sm text-[11px] text-on-surface-variant">Unit: Wing A-601 • MH-02-CB-1904</span>
                        <span className="text-secondary font-label-sm text-[11px] font-bold">Approved by Resident (09:42 AM)</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Courier / Logistics</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">Zomato Agent #482</span>
                        <span className="text-body-sm text-[11px] text-on-surface-variant">Delivery for: Wing B-102</span>
                        <span className="text-primary font-label-sm text-[11px] font-semibold">Gate OTP Verified &amp; Cleared</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Daily Domestic Staff</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">Sunita K. (Housekeeper)</span>
                        <span className="text-body-sm text-[11px] text-on-surface-variant">Permitted: Flats 301, 304, 502</span>
                        <span className="text-secondary font-label-sm text-[11px] font-bold">Punch In: 08:15 AM (RFID/Face)</span>
                      </div>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-lg text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                      <span>DPDP Act 2023 Compliance: Resident phone numbers &amp; visitor data fully masked on guard display.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 3: Resident Directory & Helpdesk */}
              {(activeTab === "all" || activeTab === "directory") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start pb-space-xl border-b border-surface-container-high/40" id="resident-helpdesk">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs text-secondary">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Module 03</span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        SLA &amp; Communication Hub
                      </span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl font-bold text-primary">Resident Directory &amp; SLA Helpdesk</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                      Verified KYC directory, geo-tagged photo tickets with SLA escalation, vendor AMC logs, and official MCS Act meeting circulars.
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-space-xs">
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                        Owner / Tenant KYC Ledger
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">campaign</span>
                        Emergency Digital Broadcast
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">confirmation_number</span>
                        Auto-Escalated SLA Tickets
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container-high/40">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Live Community Circulars &amp; Work Orders</span>
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">Real-Time Push Alerts</span>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">announcement</span>
                          <div>
                            <span className="font-label-md text-label-md font-bold text-primary">Official Circular: Overhead Water Tank Bi-Monthly Cleaning</span>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Gravity feeder tanks disinfection scheduled Thursday 10:00 AM - 03:00 PM. Alternate booster pump active.</p>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">Today, 08:30 AM</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-space-xs">
                          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">build</span>
                          <div>
                            <span className="font-label-md text-label-md font-bold text-primary">Ticket #318: B-Wing Passenger Lift Leveling Sensor Glitch</span>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Raised by Flat 703 • AMC Technician Dispatched (Otis India) • SLA: 2 Hrs Target</p>
                          </div>
                        </div>
                        <span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-secondary/10 text-secondary font-semibold shrink-0">
                          Vendor En Route
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 4: Statutory Registers */}
              {(activeTab === "all" || activeTab === "compliance") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start" id="statutory-registers">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs text-secondary">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Module 04</span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        MCS Act 1960 Section 32 &amp; 38
                      </span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl font-bold text-primary">Statutory Registers &amp; Compliance Hub</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                      Mandatory Co-operative Society Form 'I' (Register of Members), Form 'J' (List of Members), Share Certificate Ledger, and Section 99 Secret E-Voting.
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-space-xs">
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
                        Form 'I' &amp; 'J' Registers
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                        Share Certificate Ledger
                      </span>
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-primary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
                        AGM Minutes &amp; E-Voting
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container-high/40">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Statutory Register Dashboard (Inspection Ready)</span>
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">Auditor Portal Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">Form 'I' Register of Members</span>
                        <span className="text-body-sm text-on-surface-variant">128 Enrolled Primary / Associate Members</span>
                        <span className="text-secondary font-label-sm text-label-sm font-semibold">DDR Verified &amp; Signed</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">Form 'J' List of Members</span>
                        <span className="text-body-sm text-on-surface-variant">Annual Filing to Registrar of Societies</span>
                        <span className="text-secondary font-label-sm text-label-sm font-semibold">FY 2023-24 Submitted</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">Share Certificate Register</span>
                        <span className="text-body-sm text-on-surface-variant">640 Distinctive Shares (₹50 each) Allotted</span>
                        <span className="text-secondary font-label-sm text-label-sm font-semibold">Digital Signature Attached</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">General Body Minutes (AGM/SGM)</span>
                        <span className="text-body-sm text-on-surface-variant">Last AGM: 28-Sep-2024 • Quorum 84% Recorded</span>
                        <span className="text-secondary font-label-sm text-label-sm font-semibold">Resolutions 1 to 9 Passed</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-xs">
                      <button 
                        onClick={() => handleExportSample("Form 'I' and 'J' Registers")}
                        className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                        <span>Export Statutory Formats (PDF/Excel)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Bottom Conversion Callout Banner */}
          <section className="w-full bg-primary-container text-on-primary py-space-xl">
            <div className="w-full max-w-[1600px] mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex flex-col max-w-2xl gap-space-xs">
                <h3 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-primary">
                  Ready to audit-proof your society operations?
                </h3>
                <p className="font-body-lg text-body-lg text-surface-container-highest">
                  Transition your CHS or RWA in 48 hours with assisted historical ledger migration &amp; Bye-Law setup.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-md shrink-0">
                <Link 
                  className="px-space-lg py-3 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-fixed transition-colors shadow-md" 
                  href="/demo"
                >
                  Schedule a Demo
                </Link>
                <Link 
                  className="px-space-lg py-3 rounded-lg bg-surface-container-highest/10 border border-surface-container-highest/20 text-on-primary font-label-lg text-label-lg font-bold hover:bg-surface-container-highest/20 transition-colors" 
                  href="/demo"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>
      <WebsiteFooter />
    </div>
  );
}
