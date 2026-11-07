"use client";

import React from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { ShieldCheck, Printer, Scale, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
<div className="w-full max-w-[1600px] mx-auto px-gutter-mobile md:px-gutter py-space-lg">
<div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-outline-variant/20">
<div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
<span className="">Girvasa Legal Portal</span>
<span className="text-outline-variant">/</span>
<span className="text-secondary font-semibold">Governance &amp; Statutory Agreements</span>
</div>
<div className="flex items-center gap-space-sm">
<span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Statutory SaaS Agreement • Maharashtra Co-operative Societies Act 1960 &amp; DPDP Act 2023 Compliant</span>
<button 
  onClick={() => typeof window !== "undefined" && window.print()}
  className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
  type="button"
>
  <span className="material-symbols-outlined text-[16px]">print</span>
  Print Agreement
</button>
</div>
</div>

<section className="mb-space-xl rounded-xl bg-surface-container-lowest p-space-lg md:p-space-xl shadow-sm relative overflow-hidden"><div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-primary-container to-secondary-fixed"></div>
<div className="flex flex-col lg:flex-row gap-space-lg items-start justify-between">
<div className="space-y-space-xs max-w-xl">
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
Statutory Subscription Terms
</div>
<h1 className="font-headline-lg text-headline-lg text-primary font-bold">
Master Subscription Agreement &amp; Terms of Service
</h1>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
Governing the deployment, statutory data custody, and cloud operations of Girvasa Society OS for Co-operative Housing Societies (CHS), RWAs, and Apartment Owners Associations (AOA).
</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full lg:w-auto flex-1">
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between space-y-space-sm hover:bg-surface-container transition-colors">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[22px]">shield</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-primary">Housing Society Retains 100% Data Ownership</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
Under DPDP Act 2023, the Society/RWA is the sole Data Fiduciary and Girvasa operates strictly as Data Processor. Instant export of all member registers, general ledgers, and audit logs.
</p>
</div>
<div className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">verified_user</span> DPDP Fiduciary Protected
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between space-y-space-sm hover:bg-surface-container transition-colors">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[22px]">receipt_long</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-primary">Statutory Bye-Law Billing &amp; Fixed Transparency</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
Predictable per-flat pricing, 30-day notice for billing cycle changes, zero proprietary lock-in. Full data portability in Tally XML &amp; standard CSV.
</p>
</div>
<div className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">sync_alt</span> Open Data Portability
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between space-y-space-sm hover:bg-surface-container transition-colors">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[22px]">cloud_done</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-primary">99.9% Uptime &amp; Offline Gate Continuity</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
Critical gate pass authorization continues offline during broadband disruptions. Sub-second ledger and visitor transactions.
</p>
</div>
<div className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">wifi_off</span> Offline Gate Sync
</div>
</div>
</div>
</div></section>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start relative">
<aside className="lg:col-span-4 sticky top-24 space-y-space-md">
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-sm">
<div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
<span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Table of Contents</span>
<span className="font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">7 Articles</span>
</div>
<nav className="flex flex-col space-y-0.5 font-label-md text-label-md" id="toc-nav"><a className="toc-link px-space-sm py-2 rounded-lg hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between bg-surface-container text-primary font-bold" href="#sec-1">
<span className="truncate">1. Scope of Subscription &amp; Statutory License</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-2">
<span className="truncate">2. Managing Committee &amp; User Responsibilities</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-3">
<span className="truncate">3. Pricing, Bye-Law Billing &amp; Payment Terms</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-4">
<span className="truncate">4. Service Level Agreement (SLA) &amp; Gate Continuity</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-5">
<span className="truncate">5. DPDP Act Data Ownership &amp; Handover Guarantee</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-6">
<span className="truncate">6. Term, Suspension &amp; Amicable Handover</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a>
<a className="toc-link px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all flex items-center justify-between" href="#sec-7">
<span className="truncate">7. Governing Law &amp; Dispute Resolution</span>
<span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
</a></nav>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low shadow-sm space-y-space-sm"><div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm font-bold">
<span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
MCS Act &amp; Bye-law Compliance
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
Fully pre-configured for Model Bye-laws 65–71 (Accounts &amp; Statutory Audit), Model Bye-law 166 (Compound Interest Calculation capped at 21% p.a.), Form 'I' (Register of Members), and Form 'J' (Statutory Member List for Deputy Registrar).
</p>
<div className="p-space-xs rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
<span className="font-semibold text-primary">Registrar Audit Compliant:</span> Certified for deployment across Mumbai, Pune, Thane &amp; MMR Urban Co-operative Circles.
</div></div>
</aside>
<div className="lg:col-span-8 space-y-space-xl"><article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-1"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">01</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Scope of Subscription &amp; Statutory Software License</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 1</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
Girvasa grants the Society a non-exclusive, non-transferable cloud subscription to Girvasa Society OS, specifically engineered for Co-operative Housing Societies (CHS), Apartment Owners Associations (AOA), and Resident Welfare Associations (RWA). The cloud infrastructure is strictly compliant with the Maharashtra Co-operative Societies (MCS) Act 1960.
</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-low space-y-1">
<div className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary">
<span className="material-symbols-outlined text-[16px] text-primary">account_balance</span> Accounts &amp; NOC Capping
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Automated billing enforcing Bye-law 65-71, 10% Non-Occupancy Charge (NOC) capping, and statutory interest accrual under Bye-law 166.</p>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low space-y-1">
<div className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary">
<span className="material-symbols-outlined text-[16px] text-secondary">badge</span> Form 'I' &amp; 'J' Registers
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Statutory register of members (Form I) and annual list of members (Form J) for official filing with the Deputy Registrar.</p>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low space-y-1">
<div className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary">
<span className="material-symbols-outlined text-[16px] text-outline">how_to_vote</span> Section 99 AGM E-Voting
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Tamper-evident digital secret ballots, AGM resolution voting, and committee elections compliant with cooperative guidelines.</p>
</div>
</div>
<p className="font-body-sm text-body-sm">
Subscription plans are billed on an agreed per-unit basis as outlined in the Society's Schedule of Services, inclusive of automated continuous security patching, regular data backups, and standard helpdesk support.
</p>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-2"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">02</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Managing Committee &amp; User Responsibilities</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 2</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
To ensure governance integrity and compliance with statutory standards, the Society (acting through its Managing Committee or designated office-bearers) warrants and agrees to:
</p>
<ul className="list-disc pl-5 space-y-1 text-body-md font-body-md">
<li className=""><strong>Managing Committee Authorization:</strong> Ensure that individuals operating administrator privileges hold formal authorization pursuant to a valid Managing Committee Resolution or General Body Meeting (GBM) minuted approval.</li>
<li className=""><strong>Statutory Register Maintenance:</strong> Maintain accurate member rosters, share capital allocations, flat occupancy records, and designated vehicle registers.</li>
<li className=""><strong>Role-Based Access Governance:</strong> Diligently assign role-based permissions (Chairman, Hon. Secretary, Treasurer, Estate Manager, Security Staff) and promptly revoke administrative access upon change of committee office-bearers.</li>
<li className=""><strong>Credential Confidentiality &amp; Security:</strong> Uphold rigorous secrecy of administrator credentials and multi-factor authentication devices, notifying Girvasa immediately upon any suspected compromise or unauthorized portal access.</li>
</ul>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-3"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">03</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Pricing, Bye-Law Billing &amp; Payment Terms</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 3</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
Girvasa enforces transparent, predictable pricing tailored to housing society budgets, eliminating unexpected expenses or proprietary lock-ins:
</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md my-space-sm">
<div className="p-space-md rounded-xl bg-surface-container-low space-y-1">
<div className="font-headline-sm text-headline-sm font-bold text-primary">Per-Flat-Per-Month Billing</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Fees are computed strictly on the number of registered flats or units. All invoices explicitly itemize applicable GST, with zero hidden onboarding or migration fees.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low space-y-1">
<div className="font-headline-sm text-headline-sm font-bold text-primary">Direct Bank Transfers &amp; 30-Day Notice</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Payments are routed directly to the Society's designated bank account via NEFT/RTGS/UPI without third-party escrow. Any rate adjustments require 30 days prior written notice.</p>
</div>
</div>
<p className="font-body-sm text-body-sm">
No activation surcharges, data extraction fees, or penal charges shall be levied upon subscription conclusion. Billing cycles synchronize with monthly or quarterly society accounting schedules.
</p>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-4"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">04</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Service Level Agreement (SLA) &amp; Gate Continuity</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 4</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
Girvasa guarantees a monthly platform service availability SLA of <strong>99.9%</strong> across all cloud modules, ensuring mission-critical gate operations and financial reconciliations operate without disruption.
</p>
<ul className="list-disc pl-5 space-y-1 text-body-md font-body-md">
<li className=""><strong>Scheduled Maintenance Windows:</strong> Essential upgrades and database maintenance are conducted strictly between 01:00 AM and 04:00 AM IST on non-billing dates, with mandatory 48-hour prior notification to society administrators.</li>
<li className=""><strong>Offline Gate Terminal Continuity:</strong> Local security gate tablets cache active resident vehicle RFID data and pre-authorized visitor tokens, enabling uninterrupted entry verification even during extended broadband outages.</li>
<li className=""><strong>Priority Statutory Support Desk:</strong> Managing Committee members and accounting staff receive escalated ticket resolution from 9:00 AM to 7:00 PM IST (Mon–Sat), with 24/7 automated gate security emergency triage.</li>
</ul>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-5"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">05</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">DPDP Act Data Ownership &amp; Handover Guarantee</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 5</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
Under the Digital Personal Data Protection (DPDP) Act 2023, the Society is the designated <strong>Data Fiduciary</strong>, and Girvasa acts exclusively as the <strong>Data Processor</strong>. Girvasa shall never sell, monetize, or display third-party advertisements against resident or financial data.
</p>
<div className="p-space-md rounded-xl bg-secondary-fixed/20 border border-secondary/20 space-y-2">
<div className="flex items-center gap-2 text-secondary font-headline-sm text-headline-sm font-bold">
<span className="material-symbols-outlined text-[20px]">folder_zip</span>
Statutory Complete Data Handover Guarantee
</div>
<p className="font-body-sm text-body-sm text-on-surface">
At any point during the subscription or within 14 days following account transition, the Managing Committee may download an unencrypted, standardized export archive comprising:
</p>
<ul className="list-disc pl-5 font-body-sm text-body-sm text-on-surface-variant space-y-1">
<li className="">Complete General Ledgers, Vouchers, and Member Daybooks in standard <strong>Tally XML</strong> and CSV formats.</li>
<li className="">Statutory Form 'I' Member Registers, Form 'J' annual lists, and Form 14 Member Nomination archives.</li>
<li className="">Visitor logs, gate security audit trails, and managing committee meeting minutes in signed PDF formats.</li>
</ul>
<p className="font-label-sm text-label-sm font-semibold text-secondary">
All data handover archives are supplied free of cost, with zero retention holds, legal liens, or proprietary formatting.
</p>
</div>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-6"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">06</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Term, Suspension &amp; Amicable Handover</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 6</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
Subscription continuity is designed around mutual operational respect and cooperative transparency, free of restrictive cancellation lock-ins:
</p>
<ul className="list-disc pl-5 space-y-1 text-body-md font-body-md">
<li className=""><strong>30-Day Notice for Termination:</strong> Either the Society or Girvasa may terminate the subscription agreement by serving 30 calendar days written notice via official committee email.</li>
<li className=""><strong>15-Day Unrestricted Evaluation Trial:</strong> Newly onboarded housing societies receive full access to all statutory modules for 15 days with zero payment obligation or credit card deposit required.</li>
<li className=""><strong>30-Day Transition Grace Period:</strong> Following subscription termination, administrators retain 30 calendar days of read-only access to download statutory archives before server tenant data is securely purged in compliance with DPDP standards.</li>
</ul>
</div></article>

<article className="scroll-mt-24 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md" id="sec-7"><div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary font-label-md text-label-md">07</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">Governing Law, Cooperative Jurisdiction &amp; Dispute Resolution</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Section 7</span>
</div>
<div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
<p className="">
This Agreement shall be governed by, and construed in accordance with, the laws of the Republic of India and the provisions of the Maharashtra Co-operative Societies Act 1960.
</p>
<p className="">
In the event of any query, dispute, or difference arising out of this agreement, the Managing Committee and Girvasa leadership agree to first initiate an amicable dispute resolution meeting within 15 calendar days.
</p>
<p className="">
Should an amicable settlement not be arrived at, disputes relating to software services shall be subject to the exclusive jurisdiction of the competent civil courts in Mumbai, Maharashtra, without prejudice to the statutory powers of the Co-operative Court or Registrar of Co-operative Societies for intra-society disputes.
</p>
</div></article>

<div className="p-space-lg rounded-xl bg-primary text-on-primary shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md"><div className="space-y-1 text-center md:text-left">
<h3 className="font-headline-md text-headline-md font-bold">Have Questions Regarding Committee Bylaws or Statutory Terms?</h3>
<p className="font-body-sm text-body-sm text-on-primary/80 max-w-xl">
Our onboarding and compliance team is available to assist managing committees with onboarding resolutions, custom billing cycles, or statutory data migration queries.
</p>
</div>
<a className="px-space-lg py-2.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high transition-colors font-label-lg text-label-lg font-bold shrink-0 shadow-sm text-center" href="mailto:desk@girvasa.in">
Contact Legal &amp; Compliance Desk
</a></div></div>
</div>
</div>
</div>

      </main>
      <WebsiteFooter />
    </div>
  );
}
