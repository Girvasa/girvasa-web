"use client";

import React from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Users, 
  HeartHandshake,
  Building,
  Gavel,
  Lock,
  Landmark,
  Layers,
  Phone
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
          
          {/* Subtle Ambient Glow */}
          <div className="relative w-full max-w-[1600px] mx-auto overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-secondary/15 via-primary/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

            {/* HERO SECTION */}
            <section className="py-space-xl" id="values">
              <div className="text-center max-w-4xl mx-auto mb-space-xl">
                <span className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-space-sm">
                  <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                  THE GIRVASA STORY • SOVEREIGN CIVIC INFRASTRUCTURE
                </span>
                <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight mt-1">
                  Pioneering Sovereign Digital Governance for Indian Housing Societies
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto mt-space-md">
                  Built by housing society committee veterans and enterprise engineers to eliminate paperwork, eradicate billing disputes, and bring institutional transparency to community living.
                </p>
              </div>

              {/* Trusted Society Ecosystem Local Diagram Card */}
              <div className="group mb-space-xl rounded-xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-md hover:shadow-xl border border-outline-variant/30 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">hub</span>
                      The Trusted Society Framework
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                      • Multi-Stakeholder Sovereign Architecture
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    100% Bye-Law Compliance &amp; Data Trust
                  </span>
                </div>
                
                <div className="rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30 shadow-sm">
                  <img 
                    src="/images/trusted_society_ecosystem.jpg" 
                    alt="The Girvasa Trusted Society Ecosystem - Multi-Stakeholder Sovereign Architecture" 
                    className="w-full h-auto object-cover block transition-transform duration-500 ease-out group-hover:scale-[1.015]" 
                  />
                </div>

                <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm font-label-md text-label-md text-on-surface-variant">
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Multi-Stakeholder Sovereign Architecture • 100% Bye-Law Compliant • Auditable &amp; Zero-Ad Tracking
                  </p>
                  <div className="flex items-center gap-space-sm shrink-0 font-label-sm text-label-sm font-semibold text-primary">
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                      Auditable
                    </span>
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
                      Zero Ad Tracking
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Pillars of Girvasa Bento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">gavel</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">Statutory Rigor Over Gimmicks</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        We prioritize 100% alignment with the Maharashtra Co-operative Societies Act 1960 and Model Bye-laws over consumer advertising. Every balance sheet, interest invoice, and register is audit-ready for the Deputy Registrar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">shield</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">Zero-Commercialization Privacy Pledge</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        We believe community data belongs solely to the society. We never monetize resident contact lists, sell insurance leads, or force promotional banners into resident living spaces.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">account_balance</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">Double-Entry Accounting Precision</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Eliminating informal cash registers with bank-grade reconciliation. Automated Bye-law 166 compound interest, 10% non-occupancy charge capping, and 1-click TallyPrime synchronization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">devices</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">Guard-Friendly Practical Usability</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Software built for the real world. Simple vernacular tablet interfaces (Marathi, Hindi, English) that security guards master in under 15 minutes, with full offline continuity during broadband disruptions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TEAM & ADVISORY BOARD (Local Photos) */}
            <section className="py-space-xl" id="team">
              <div className="text-center max-w-2xl mx-auto mb-space-xl">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Our People</span>
                <h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-1">Founding Team &amp; Advisors</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  A balanced team combining practical software engineering with firsthand co-operative housing management experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                
                {/* Rohan Deshmukh */}
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-52 rounded-lg overflow-hidden bg-surface-container-low mb-space-md relative">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Rohan Deshmukh - Co-Founder & CEO" 
                        src="/images/team/rohan_deshmukh.jpg" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary/90 text-on-primary font-label-sm text-label-sm font-semibold">
                        Co-Founder &amp; CEO
                      </div>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Rohan Deshmukh</h4>
                    <span className="font-label-sm text-label-sm text-secondary font-medium block mt-0.5">Co-Founder &amp; CEO</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                      Former Managing Committee Secretary in Dadar with 12+ years in cloud infrastructure. Spearheaded the digital transformation of 14 heritage cooperative societies across Mumbai MMR.
                    </p>
                  </div>
                </div>

                {/* Pooja Kulkarni */}
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-52 rounded-lg overflow-hidden bg-surface-container-low mb-space-md relative">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Pooja Kulkarni - Co-Founder & CTO" 
                        src="/images/team/pooja_kulkarni.jpg" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary/90 text-on-primary font-label-sm text-label-sm font-semibold">
                        Co-Founder &amp; CTO
                      </div>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Pooja Kulkarni</h4>
                    <span className="font-label-sm text-label-sm text-secondary font-medium block mt-0.5">Co-Founder &amp; CTO</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                      Ex-Fintech Systems Architect. Designed high-throughput distributed transaction engines handling ₹500Cr+ in annual dues reconciliation with zero ledger drift.
                    </p>
                  </div>
                </div>

                {/* V. K. Sawant */}
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-52 rounded-lg overflow-hidden bg-surface-container-low mb-space-md relative">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="V. K. Sawant - Senior Governance Advisor" 
                        src="/images/team/vk_sawant.jpg" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-secondary/90 text-on-secondary font-label-sm text-label-sm font-semibold">
                        Senior Advisor
                      </div>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">V. K. Sawant</h4>
                    <span className="font-label-sm text-label-sm text-secondary font-medium block mt-0.5">Senior Governance Advisor</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                      Former Joint Registrar of Co-operative Societies (Govt. of Maharashtra, Retd.). Over 30 years guiding cooperative law, model bye-law reforms, and statutory dispute resolution.
                    </p>
                  </div>
                </div>

                {/* CA Meenakshi Iyer */}
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-52 rounded-lg overflow-hidden bg-surface-container-low mb-space-md relative">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="CA Meenakshi Iyer - Statutory Audit Advisor" 
                        src="/images/team/meenakshi_iyer.jpg" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-secondary/90 text-on-secondary font-label-sm text-label-sm font-semibold">
                        Statutory Advisor
                      </div>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">CA Meenakshi Iyer</h4>
                    <span className="font-label-sm text-label-sm text-secondary font-medium block mt-0.5">Statutory Audit &amp; Finance Advisor</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                      Senior Partner at Iyer &amp; Mandke Chartered Accountants. Certified Cooperative Society Auditor advising on Section 79 &amp; 81 statutory audits and sinking fund investment compliance.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* COMPANY MILESTONES & JOURNEY TIMELINE */}
            <section className="py-space-xl">
              <div className="text-center max-w-2xl mx-auto mb-space-xl">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Chronology of Execution</span>
                <h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-1">From Seed Cohort to Township Scale</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  How Girvasa evolved from a 12-society pilot in Dadar to an institutional operating standard across Tier 1 Indian metros.
                </p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-surface-container-highest"></div>
                <div className="space-y-space-xl">
                  
                  {/* Milestone 1 */}
                  <div className="relative flex flex-col md:flex-row items-center gap-space-lg">
                    <div className="w-full md:w-1/2 md:text-right">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">Q1 2021 • MUMBAI</span>
                      <h4 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">The 12-Society Dadar &amp; Matunga Pilot</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Deep study of 84 manual registers across heritage cooperative societies. Normalized complex bye-law billing and eliminated 100% of physical receipt disputes.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 z-10 shadow-md">
                      <span className="material-symbols-outlined text-[20px]">flag</span>
                    </div>
                    <div className="w-full md:w-1/2 rounded-lg bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Validated Output</span>
                      <p className="font-body-sm text-body-sm font-semibold text-primary mt-1">
                        Eliminated 100% of physical receipt book disputes within 90 days.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 2 */}
                  <div className="relative flex flex-col md:flex-row-reverse items-center gap-space-lg">
                    <div className="w-full md:w-1/2 md:text-left">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">Q3 2022 • PUNE EXPANSION</span>
                      <h4 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">Township Scale &amp; Multi-Wing Federation</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Expanded to Hinjawadi &amp; Baner high-rises (2,000+ units). Introduced dynamic gate sync, boom barrier ANPR integration, and multi-wing sub-ledgers.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 z-10 shadow-md">
                      <span className="material-symbols-outlined text-[20px]">apartment</span>
                    </div>
                    <div className="w-full md:w-1/2 rounded-lg bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Platform Scaling</span>
                      <p className="font-body-sm text-body-sm font-semibold text-primary mt-1">
                        Handled 120,000 concurrent gate scans monthly with sub-200ms latency.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className="relative flex flex-col md:flex-row items-center gap-space-lg">
                    <div className="w-full md:w-1/2 md:text-right">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">Q4 2023 • STATUTORY MILESTONE</span>
                      <h4 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">Direct State Federation Interoperability</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Integrated automated Form 1 (Balance Sheet) &amp; Form 2 (Profit &amp; Loss) export modules aligned with Maharashtra State standards, reducing audit turnaround from 45 days to 48 hours.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 z-10 shadow-md">
                      <span className="material-symbols-outlined text-[20px]">verified_user</span>
                    </div>
                    <div className="w-full md:w-1/2 rounded-lg bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Audit Efficiency</span>
                      <p className="font-body-sm text-body-sm font-semibold text-primary mt-1">
                        Statutory annual audit sign-off accelerated from 45 days to 48 hours.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 4 */}
                  <div className="relative flex flex-col md:flex-row-reverse items-center gap-space-lg">
                    <div className="w-full md:w-1/2 md:text-left">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">PRESENT ERA • NATIONWIDE SCALE</span>
                      <h4 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">The Sovereign Community Standard</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Managing over ₹420 Crore in annual society collections across Mumbai, Pune, and Thane. Zero security breaches, zero advertisement tracking, and 100% data sovereignty.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 z-10 shadow-md">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    </div>
                    <div className="w-full md:w-1/2 rounded-lg bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Civic Benchmark</span>
                      <p className="font-body-sm text-body-sm font-semibold text-primary mt-1">
                        Zero resident data ads, 99.8% on-time maintenance collection rate.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* TRUST BADGES, SECURITY & COMPLIANCE */}
            <section className="py-space-xl" id="statutory-alignment">
              <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-space-lg mb-space-lg gap-space-md border-b border-outline-variant/20">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Banking Grade Guardrails</span>
                    <h3 className="font-headline-lg text-headline-lg font-bold text-primary mt-1">Data Sovereignty &amp; Infrastructure Compliance</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Girvasa treats housing society records with identical regulatory rigour to scheduled commercial bank depositor ledgers.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-secondary/10 text-secondary font-label-md text-label-md font-semibold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    MeitY Empanelled Cloud Residency
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">location_on</span>
                      </div>
                      <h5 className="font-headline-sm text-headline-sm text-primary font-bold">Mumbai Data Residency</h5>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      MeitY Empanelled Cloud Residency. All financial ledgers and resident data remain strictly within AWS Mumbai (ap-south-1) Tier-IV facilities.
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">security</span>
                      </div>
                      <h5 className="font-headline-sm text-headline-sm text-primary font-bold">ISO 27001 Certified</h5>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Rigorous Information Security Management System covering platform infrastructure, CI/CD pipelines, and access perimeters.
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">dns</span>
                      </div>
                      <h5 className="font-headline-sm text-headline-sm text-primary font-bold">SOC-2 Type II Attested</h5>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Continuous independent auditing of system availability, processing integrity, and resident privacy controls.
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">verified_user</span>
                      </div>
                      <h5 className="font-headline-sm text-headline-sm text-primary font-bold">DPDP Act 2023 Compliant</h5>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Fully compliant Data Processor guarantees with explicit resident consent, zero ad telemetry, and right-to-erasure workflows.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CALL TO ACTION / REGULATORY CONSULTATION */}
            <section className="py-space-xl text-center">
              <div className="rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary p-space-xl shadow-xl flex flex-col items-center">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed font-bold">
                  Get Started
                </span>
                <h2 className="font-headline-xl text-headline-xl font-bold mt-2 max-w-2xl">
                  Ready to Experience Sovereign Society Governance?
                </h2>
                <p className="font-body-lg text-body-lg text-inverse-on-surface/90 max-w-xl mt-space-sm mb-space-lg">
                  Join over 500 forward-thinking housing societies that have streamlined billing, gatepass security, and statutory compliance with Girvasa.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-space-md">
                  <Link 
                    className="inline-flex items-center gap-space-xs px-space-xl py-3 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md hover:bg-secondary-fixed transition-colors" 
                    href="/demo"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span>Schedule Committee Presentation</span>
                  </Link>
                  <a 
                    className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container-lowest/10 text-on-primary hover:bg-surface-container-lowest/20 font-label-lg text-label-lg font-semibold transition-colors backdrop-blur-sm" 
                    href="tel:+918850409901"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                    <span>Speak with Co-Founders (+91 8850 40 9901)</span>
                  </a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
      <WebsiteFooter />
    </div>
  );
}
