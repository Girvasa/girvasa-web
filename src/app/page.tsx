"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { CheckCircle2, ArrowRight, X, Phone, Building, Calendar } from "lucide-react";

export default function HomePage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    societyName: "",
    units: "",
    role: "Hon. Secretary",
    phone: "",
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoFormSubmitted(true);
    setTimeout(() => {
      // Keep message for 4 seconds then close
      setTimeout(() => {
        setIsDemoModalOpen(false);
        setDemoFormSubmitted(false);
        setDemoFormData({ societyName: "", units: "", role: "Hon. Secretary", phone: "" });
      }, 4000);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
{/*  Interactive Style Snippet for pure CSS toggle support  */}

{/*  Sticky Sub-Nav / Sticky Anchor Bar  */}

{/*  Hero Section  */}
<section className="relative w-full pt-space-xl pb-24 overflow-hidden"><div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[980px] h-[480px] bg-gradient-to-tr from-secondary-container/30 via-surface-container-high/40 to-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div><div className="max-w-[1440px] mx-auto px-gutter flex flex-col items-center text-center"><div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md shadow-sm mb-space-lg"><span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span><span className="font-bold text-secondary uppercase tracking-wider text-[11px]">100% Bye-Law Compliant</span><span className="mx-1 text-outline-variant">•</span><span className="text-primary font-semibold text-[11px]">DPDP Act 2023 Ready</span><span className="mx-1 text-outline-variant">•</span><span className="text-on-surface-variant font-medium text-[11px]">RERA &amp; MCS Act Aligned</span></div><h1 className="font-headline-xl text-[40px] md:text-[52px] leading-[1.12] tracking-tight font-bold text-primary max-w-[900px] mb-space-md">The Digital Operating System for Housing Societies &amp; Gated Communities</h1><p className="font-body-lg text-body-lg text-on-surface-variant max-w-[720px] mb-space-xl">Automate maintenance billing, guard check-ins, accounting audits, and committee governance without paperwork or resident disputes. Built specifically for modern Indian RWAs and Co-operative Housing Societies.</p><div className="flex flex-col sm:flex-row items-center gap-space-md mb-space-xl"><a className="h-12 px-space-xl rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-md hover:bg-primary-container transition-all" href="/pricing"><span className="">Start 15-Day Free Trial</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></a><a className="h-12 px-space-lg rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-sm hover:bg-surface-container transition-all border border-outline-variant/30" href="/demo"><span className="material-symbols-outlined text-[20px] text-secondary">calendar_month</span><span className="">Schedule a Demo</span></a></div><div className="flex flex-wrap items-center justify-center gap-space-md text-[12px] font-medium text-on-surface-variant mb-space-xl"><span className="flex items-center gap-1 text-secondary"><span className="material-symbols-outlined text-[15px]">check_circle</span> Zero Onboarding Fee</span><span className="text-outline-variant">•</span><span className="flex items-center gap-1 text-secondary"><span className="material-symbols-outlined text-[15px]">check_circle</span> 15-Minute Data Migration</span><span className="text-outline-variant">•</span><span className="flex items-center gap-1 text-secondary"><span className="material-symbols-outlined text-[15px]">check_circle</span> Free Guard Tablet Training</span></div><div className="w-full max-w-[1080px] bg-surface-container-lowest rounded-xl p-space-lg shadow-md border border-outline-variant/30 text-left"><div className="flex flex-wrap items-center justify-between border-b border-outline-variant/30 pb-space-md mb-space-md"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">G</div><div><h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Society Administration Hub</h2><p className="font-body-sm text-body-sm text-on-surface-variant">Centralized operations for managing committees</p></div></div><div className="flex items-center gap-2"><span className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-secondary/10 text-secondary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Live System</span></div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md"><div className="p-space-md rounded-lg bg-surface"><span className="font-label-sm text-label-sm text-on-surface-variant">Monthly Collections</span><div className="font-headline-lg text-headline-lg font-bold text-primary mt-1">₹42,85,000</div><span className="text-[12px] text-secondary font-medium mt-1 block">99.4% Invoices Cleared On-Time</span></div><div className="p-space-md rounded-lg bg-surface"><span className="font-label-sm text-label-sm text-on-surface-variant">Active Residents</span><div className="font-headline-lg text-headline-lg font-bold text-primary mt-1">480 Flats</div><span className="text-[12px] text-on-surface-variant mt-1 block">4 Wings • 100% Verified Roster</span></div><div className="p-space-md rounded-lg bg-surface"><span className="font-label-sm text-label-sm text-on-surface-variant">Gate Traffic Today</span><div className="font-headline-lg text-headline-lg font-bold text-primary mt-1">312 Entries</div><span className="text-[12px] text-secondary font-medium mt-1 block">0.4s Avg. Verification, Zero Breaches</span></div><div className="p-space-md rounded-lg bg-surface"><span className="font-label-sm text-label-sm text-on-surface-variant">Open Helpdesk Tickets</span><div className="font-headline-lg text-headline-lg font-bold text-primary mt-1">2 High Priority</div><span className="text-[12px] text-on-surface-variant mt-1 block">SLA Resolution &lt; 4 hrs</span></div></div></div></div></section>
{/*  Partner Societies Strip  */}
<section className="w-full bg-surface-container-lowest py-space-xl">
<div className="max-w-[1440px] mx-auto px-gutter flex flex-col items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold mb-space-lg">
        Empowering Premium Residential Societies Across West India
      </span>
<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-space-lg items-center justify-items-center opacity-80">
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">location_city</span>
<span className="">POWAI HEIGHTS</span>
</div>
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">domain</span>
<span className="">BLUE RIDGE CHS</span>
</div>
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">apartment</span>
<span className="">PALLAZZIO BKC</span>
</div>
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">corporate_fare</span>
<span className="">THANE HORIZON</span>
</div>
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">home_work</span>
<span className="">HINJEWADI GREENS</span>
</div>
<div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold tracking-tight">
<span className="material-symbols-outlined text-secondary">villa</span>
<span className="">BANDRA CREST</span>
</div>
</div>
</div>
</section>
{/*  Chaos vs. Girvasa Split Comparison  */}

{/*  Core Bento Grid Modules  */}
<section className="w-full py-24 bg-surface-container-lowest" id="features"><div className="max-w-[1440px] mx-auto px-gutter flex flex-col items-center"><div className="text-center max-w-[760px] mb-space-lg"><span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Platform Tour</span><h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-space-xs mb-space-sm">All-in-One Society Platform at a Glance</h2><p className="font-body-lg text-body-lg text-on-surface-variant">A single, unified interface for finance, security, resident coordination, and statutory compliance.</p></div><div className="flex flex-wrap items-center justify-center gap-space-sm mb-space-xl"><span className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface border border-outline-variant/30 text-primary font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span><span className="">Automated Billing &amp; Dues</span></span><span className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface border border-outline-variant/30 text-primary font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px] text-secondary">badge</span><span className="">Gate &amp; Visitor Pass</span></span><span className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface border border-outline-variant/30 text-primary font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px] text-secondary">groups</span><span className="">Resident Directory</span></span><span className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface border border-outline-variant/30 text-primary font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span><span className="">Statutory Registers &amp; Bye-Laws</span></span></div><div className="w-full max-w-[1200px] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container/40 p-2 sm:p-4 backdrop-blur-sm"><img className="w-full h-auto rounded-xl object-cover shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiHyq0zS_LbvSTKyUrCOfLoY3BJ1R2MZtttUgT7urs3ac51I1OMq5joJz-RJAFdfDYzRwS4R_aqF5ZlEsWpEoeFYzgnDQoFOhMLB28o__lNBM3Jxb2QnmhxT2byq9qe7KsxR1wdPP2gqQoK4TPlW4tjHJpRonLaC4KhjfXbgnYjX2rQ5t7E_huX7b5KG67tDTTFc5B13jJ9a-tdWh8cM8SS92FodvUU6aNFJ2qbpo" alt="Modern high-resolution UI illustration diagram showcasing housing society smart app features: automated billing ledger invoice with payment status, gatepass security mobile check-in verification badge, digital resident directory card, and statutory register compliance record." /></div></div></section>
{/*  Photo-Rich Real-World Verification Section  */}
<section className="w-full py-24 bg-surface">
<div className="max-w-[1440px] mx-auto px-gutter">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-6 flex flex-col">
<span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider mb-space-xs">Architectural Precision</span>
<h2 className="font-headline-xl text-headline-xl text-primary font-bold mb-space-md">
            Engineered for Modern High-Rises &amp; Expansive Gated Townships
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
            Whether your society consists of a tight-knit 24-flat cooperative building in Dadar or a 2,500-unit township across 40 acres in Pune, Girvasa scales gracefully with zero server latency and hardened role-based partitions.
          </p>
<div className="grid grid-cols-2 gap-space-md"><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">0.4s</div><div className="font-label-md text-label-md text-on-surface-variant">Gate Pass QR / RFID Verification</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">₹0</div><div className="font-label-md text-label-md text-on-surface-variant">Accounting Leakage with Double-Entry Ledger</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">100%</div><div className="font-label-md text-label-md text-on-surface-variant">Data Sovereignty in India (DPDP Act Compliant)</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">15 Mins</div><div className="font-label-md text-label-md text-on-surface-variant">Fast Onboarding via Excel / MyGate / ADDA Migration</div></div></div>
</div>
<div className="lg:col-span-6 relative">
<div className="grid grid-cols-2 gap-space-md"><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">0.4s</div><div className="font-label-md text-label-md text-on-surface-variant">Gate Pass QR / RFID Verification</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">₹0</div><div className="font-label-md text-label-md text-on-surface-variant">Accounting Leakage with Double-Entry Ledger</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">100%</div><div className="font-label-md text-label-md text-on-surface-variant">Data Sovereignty in India (DPDP Act Compliant)</div></div><div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm"><div className="font-currency-lg text-currency-lg text-primary">15 Mins</div><div className="font-label-md text-label-md text-on-surface-variant">Fast Onboarding via Excel / MyGate / ADDA Migration</div></div></div>
</div>
</div>
</div>
</section>
{/*  Transparent SaaS Pricing Section  */}
<section className="w-full py-24 bg-surface-container-lowest" id="pricing">
<div className="max-w-[1440px] mx-auto px-gutter flex flex-col items-center">
<div className="text-center max-w-[800px] mb-space-lg">
<span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Predictable Investment</span>
<h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-space-xs mb-space-sm">
          Simple, Predictable Pricing for Societies of All Scales
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          All tiers include an unrestricted 15-day free trial, full historical ledger import, and staff guard training. No hidden onboarding fees.
        </p>
</div>
{/*  Billing Frequency Toggle (CSS driven)  */}
<div className="flex items-center gap-space-md mb-space-xl p-1 bg-surface-container rounded-lg">
  <button
    type="button"
    onClick={() => setIsAnnual(false)}
    className={`px-space-md py-1.5 rounded-md font-label-md text-label-md font-bold transition-all ${
      !isAnnual ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
    }`}
  >
    Billed Monthly
  </button>
  <button
    type="button"
    onClick={() => setIsAnnual(!isAnnual)}
    className="w-12 h-6 bg-surface-container-high rounded-full relative p-0.5 transition-colors focus:outline-none"
    aria-label="Toggle Billing Frequency"
  >
    <span
      className={`w-5 h-5 bg-primary rounded-full block transition-transform duration-200 transform ${
        isAnnual ? "translate-x-6" : "translate-x-0"
      }`}
    />
  </button>
  <button
    type="button"
    onClick={() => setIsAnnual(true)}
    className={`px-space-md py-1.5 rounded-md font-label-md text-label-md font-bold flex items-center gap-1.5 transition-all ${
      isAnnual ? "bg-surface-container-lowest text-secondary shadow-sm" : "text-on-surface-variant hover:text-secondary"
    }`}
  >
    <span>Billed Annually</span>
    <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary-container text-on-secondary-container uppercase font-bold">
      Save 20% 🎉
    </span>
  </button>
</div>
{/*  Pricing Cards 3-Column Grid  */}
<div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
{/*  Tier 1: Starter  */}
<div className="bg-surface rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="font-headline-md text-headline-md text-primary">Starter</span>
<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Up to 100 Flats</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Ideal for independent cooperative housing societies seeking automated gate passes and compliant maintenance receipts.
            </p>
{/*  Price Display (Monthly default / Yearly toggleable)  */}
<div className="mb-space-lg">
{isAnnual ? (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹1,199</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ mo (₹14,388 billed/yr)</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹1,499</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ month</span>
        </div>
      )}
<span className="text-[11px] text-on-surface-variant">Billed to society general fund</span>
</div>
{/*  Feature Checklist  */}
<ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg"><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Gate Security with 4 Guard Tablet Logins</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Automated Maintenance WhatsApp Links &amp; UPI QR</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Resident Directory &amp; Vehicle Registry</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Basic Maintenance Ticket Helpdesk</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Model Bye-law 166 Interest Calculation</span></li><li className="flex items-center gap-2 text-on-surface-variant/60"><span className="material-symbols-outlined text-[18px]">remove</span><span className="">Section 99 Digital AGM Secret E-Voting</span></li></ul>
</div>
<a className="w-full py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-bold text-center shadow-sm hover:bg-surface-container transition-colors" href="/demo">
            Start 15-Day Free Trial
          </a>
</div>
{/*  Tier 2: Growth (Featured / Popular)  */}
<div className="bg-surface rounded-xl p-space-lg flex flex-col justify-between shadow-xl relative scale-[1.02]">
{/*  Featured Badge  */}
<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-space-md py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase font-bold shadow-md">
            Most Popular for Mid-Sized CHS
          </div>
<div>
<div className="flex items-center justify-between mb-space-sm mt-space-xs">
<span className="font-headline-md text-headline-md text-primary">Growth</span>
<span className="px-2.5 py-1 rounded bg-secondary-container/40 text-secondary font-label-sm text-label-sm font-bold">Up to 300 Flats</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Complete autonomous governance for established societies requiring double-entry audit rigor and turnstile automation.
            </p>
{/*  Price Display  */}
<div className="mb-space-lg">
{isAnnual ? (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹2,799</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ mo (₹33,588 billed/yr)</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹3,499</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ month</span>
        </div>
      )}
<span className="text-[11px] text-secondary font-semibold">Includes Free Guard Training &amp; Excel Migration</span>
</div>
{/*  Feature Checklist  */}
<ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg">
<li className="flex items-center gap-2 font-medium">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Everything in Starter included</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Automated UPI &amp; BBPS Instant Reconciliation</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Double-Entry Daybook &amp; Tally 1-Click Sync</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Staff Biometric &amp; Turnstile Integration</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Model Bye-Law 166 Compound Interest Tracker</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
<span className="">Priority Emergency Phone + WhatsApp Support</span>
</li>
</ul>
</div>
<a className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold text-center shadow-md hover:bg-primary-container transition-colors" href="/demo">
            Start 15-Day Free Trial
          </a>
</div>
{/*  Tier 3: Enterprise  */}
<div className="bg-surface rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="font-headline-md text-headline-md text-primary">Enterprise</span>
<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Unlimited Flats</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Engineered for large gated townships, multi-tower federations, and complexes with multi-gate ANPR license plate barriers.
            </p>
{/*  Price Display  */}
<div className="mb-space-lg">
{isAnnual ? (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹6,399</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ mo (₹76,788 billed/yr)</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="font-currency-lg text-[36px] text-primary">₹7,999</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/ month</span>
        </div>
      )}
<span className="text-[11px] text-on-surface-variant">Includes dedicated Chartered Accountant liaison</span>
</div>
{/*  Feature Checklist  */}
<ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg"><li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Everything in Growth included</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Multi-Gate ANPR &amp; FASTag Hardware Sync</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Section 99 Certified Digital AGM Platform</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Bespoke Multi-Wing Accounting Chart &amp; Audit Pack</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">Dedicated Chartered Accountant Liaison</span></li><li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">check</span><span className="">On-Premise Managing Committee Training</span></li></ul>
</div>
<a className="w-full py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-bold text-center shadow-sm hover:bg-surface-container transition-colors" href="/demo">
            Start 15-Day Free Trial
          </a>
</div>
</div>
{/*  Trust Assurance Footnote  */}
<div className="mt-space-xl flex flex-wrap items-center justify-center gap-space-lg text-on-surface-variant font-label-md text-label-md">
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-[16px]">verified</span> 15-Day Unrestricted Free Trial</span>
<span className="text-outline-variant">•</span>
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-[16px]">cancel</span> Cancel anytime without penalty</span>
<span className="text-outline-variant">•</span>
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-[16px]">lock</span> Zero Commission on Direct UPI Collections</span>
</div>
</div>
</section>
{/*  Verified Testimonials & Social Proof  */}
<section className="w-full py-24 bg-surface" id="testimonials"><div className="max-w-[1440px] mx-auto px-gutter"><div className="text-center max-w-[760px] mx-auto mb-space-xl"><span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Committee Feedback</span><h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-space-xs mb-space-sm">Trusted by Managing Committees</h2><p className="font-body-lg text-body-lg text-on-surface-variant">Hear from committee members and residents who streamlined daily building administration.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg"><div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between"><div><div className="flex items-center gap-1 text-secondary mb-space-md"><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span></div><p className="font-body-md text-body-md text-on-surface mb-space-lg">"Our society of 480 flats had over ₹18 lakhs in overdue maintenance. With Girvasa's automated UPI reminders, our collection rate hit 98% in 60 days. The audit register export saved our treasurer 40 hours during AGM."</p></div><div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant/30"><div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-sm">RS</div><div><h3 className="font-headline-sm text-[14px] text-primary font-semibold">Rajesh Samant</h3><p className="font-label-sm text-label-sm text-on-surface-variant">Chairman • Whispering Meadows CHS, Pune</p></div></div></div><div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between"><div><div className="flex items-center gap-1 text-secondary mb-space-md"><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span></div><p className="font-body-md text-body-md text-on-surface mb-space-lg">"Automated billing eliminated all the back-and-forth about maintenance receipts. Collections are transparent, timely, and completely documented."</p></div><div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant/30"><div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-label-sm">VS</div><div><h3 className="font-headline-sm text-[14px] text-primary font-semibold">Vikramaditya S.</h3><p className="font-label-sm text-label-sm text-on-surface-variant">Hon. Secretary • Powai Heights CHS, Mumbai</p></div></div></div><div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between"><div><div className="flex items-center gap-1 text-secondary mb-space-md"><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span><span className="material-symbols-outlined text-[18px]">star</span></div><p className="font-body-md text-body-md text-on-surface mb-space-lg">"Gate security logging has been effortless. Security staff learned the tablet app in under half an hour, and residents appreciate quick visitor notifications."</p></div><div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant/30"><div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-label-sm">SM</div><div><h3 className="font-headline-sm text-[14px] text-primary font-semibold">Shabana Merchant</h3><p className="font-label-sm text-label-sm text-on-surface-variant">Managing Committee Member • Bandra Crest CHS, Mumbai</p></div></div></div></div></div></section>
{/*  Statutory & Legal Alignment Deep Dive  */}

{/*  Final High-Conversion CTA Banner  */}
<section className="w-full py-24 bg-surface">
<div className="max-w-[1200px] mx-auto px-gutter text-center flex flex-col items-center">
<div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline-xl text-headline-xl font-bold shadow-lg mb-space-md">
        G
      </div>
<h2 className="font-headline-xl text-[38px] md:text-[48px] leading-tight text-primary font-bold max-w-[800px] mb-space-md">
        Ready to Put Your Housing Society on Autopilot?
      </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-[680px] mb-space-xl">
        Set up your building in 15 minutes with our automated Excel roster import. Test every gate pass, payment gateway, and financial ledger free for 15 days.
      </p>
<div className="flex flex-col sm:flex-row items-center gap-space-md w-full justify-center">
<a className="h-12 px-space-xl rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-md hover:bg-primary-container transition-all" href="/pricing">
<span className="">Claim 15-Day Free Trial</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="h-12 px-space-lg rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-sm hover:bg-surface-container transition-all" href="/demo">
<span className="material-symbols-outlined text-[20px] text-secondary">calendar_today</span>
<span className="">Schedule Committee Presentation</span>
</a>
</div>
<div className="mt-space-lg flex items-center gap-space-md text-on-surface-variant text-[12px]">
<span className="">✓ Instant self-onboarding</span>
<span className="">✓ Zero setup charge</span>
<span className="">✓ We import your old records for free</span>
</div>
</div>
</section>
</div>
      </main>
      <WebsiteFooter />

      {/* Interactive Demo Walkthrough Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/70 backdrop-blur-sm flex items-center justify-center p-gutter animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-[560px] rounded-xl shadow-2xl p-space-xl relative border border-outline-variant/30">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {demoFormSubmitted ? (
              <div className="py-space-xl text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-space-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-headline-lg text-primary font-bold">Walkthrough Confirmed!</h3>
                <p className="font-body-md text-on-surface-variant mt-2 max-w-sm">
                  Thank you! A certified Girvasa housing society specialist will contact your committee on{" "}
                  <span className="font-semibold text-primary">{demoFormData.phone}</span> within 2 business hours.
                </p>
                <div className="mt-space-lg p-space-md rounded-lg bg-surface-container text-left w-full text-sm">
                  <div className="font-semibold text-primary">Society: {demoFormData.societyName}</div>
                  <div className="text-on-surface-variant">Units: {demoFormData.units} flats • Role: {demoFormData.role}</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-space-lg">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                    Fast-Track Onboarding
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
                    Book a Society OS Walkthrough
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Our certified housing society systems engineer will demo live gate sync &amp; accounting reconciliation tailored to your CHS bye-laws.
                  </p>
                </div>

                <form className="space-y-space-md" onSubmit={handleDemoSubmit}>
                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1">
                      Society Name &amp; Location
                    </label>
                    <input
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface text-primary font-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="e.g. Palm Meadows CHS, Powai, Mumbai"
                      required
                      type="text"
                      value={demoFormData.societyName}
                      onChange={(e) => setDemoFormData({ ...demoFormData, societyName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-space-md">
                    <div>
                      <label className="block font-label-md text-label-md text-primary mb-1">
                        Number of Flats
                      </label>
                      <input
                        className="w-full px-space-md py-2.5 rounded-lg bg-surface text-primary font-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="e.g. 140"
                        required
                        type="number"
                        min="1"
                        value={demoFormData.units}
                        onChange={(e) => setDemoFormData({ ...demoFormData, units: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-primary mb-1">
                        Your Role in Society
                      </label>
                      <select
                        className="w-full px-space-md py-2.5 rounded-lg bg-surface text-primary font-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={demoFormData.role}
                        onChange={(e) => setDemoFormData({ ...demoFormData, role: e.target.value })}
                      >
                        <option>Hon. Secretary</option>
                        <option>Hon. Treasurer</option>
                        <option>Hon. Chairman</option>
                        <option>Managing Committee Member</option>
                        <option>Facility Manager</option>
                        <option>Resident</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1">
                      Your Phone / WhatsApp Number
                    </label>
                    <input
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface text-primary font-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="+91 98765 43210"
                      required
                      type="tel"
                      value={demoFormData.phone}
                      onChange={(e) => setDemoFormData({ ...demoFormData, phone: e.target.value })}
                    />
                  </div>

                  <button
                    className="w-full py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
                    type="submit"
                  >
                    <span>Confirm Walkthrough &amp; Activate 15-Day Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
