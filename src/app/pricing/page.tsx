"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Calculator, 
  Sparkles,
  Clock,
  TrendingUp,
  Building2
} from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [flats, setFlats] = useState(140);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Pricing rates
  // Monthly prices
  const starterMonthly = 1499;
  const growthMonthly = 3499;
  const enterpriseMonthly = 7999;

  // Annual prices (approx 20% discount)
  const starterAnnual = 14390; // ~1,199/mo
  const growthAnnual = 33590;  // ~2,799/mo
  const enterpriseAnnual = 76790; // ~6,399/mo

  // Dynamic ROI calculation based on slider
  let recommendedTier = "Growth Tier";
  let tierCost = isAnnual ? growthAnnual / 12 : growthMonthly;
  if (flats <= 100) {
    recommendedTier = "Starter Tier";
    tierCost = isAnnual ? starterAnnual / 12 : starterMonthly;
  } else if (flats > 300) {
    recommendedTier = "Enterprise Tier";
    tierCost = isAnnual ? enterpriseAnnual / 12 : enterpriseMonthly;
  }

  const costPerFlatMonth = (tierCost / flats).toFixed(1);
  // Defaulter recovery under Bye-Law 166: 8% defaulters * avg dues ₹3,800 * 12 mo * 21% interest * 75% recovery efficiency
  const defaulterUnits = Math.max(1, Math.round(flats * 0.08));
  const annualDefaultPool = defaulterUnits * 3800 * 12;
  const interestRecovered = Math.round(annualDefaultPool * 0.21 * 0.75);
  // Hours saved: ~0.25 hr per unit/month in bill generation, WhatsApp dispatch, tally entries
  const hoursSaved = Math.max(16, Math.round(flats * 0.22));

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Are there any onboarding, setup, or data migration fees?",
      a: "Zero. Girvasa has ₹0 onboarding or setup charges. Our dedicated engineering and accounting team assists your Managing Committee in migrating historical member rosters, share registers, opening ledger balances, and vehicle data free of cost."
    },
    {
      q: "How does billing work for our Co-operative Housing Society?",
      a: "Billing is based on your society's registered flat count. Societies paying annually receive an instant 20% discount. Invoices are generated as statutory GST tax receipts suitable for your annual society audit filing."
    },
    {
      q: "Can we export our society’s accounting data to Tally ERP 9 or TallyPrime?",
      a: "Yes. Girvasa provides seamless 1-click XML export compatible with Tally ERP 9 and TallyPrime. Your auditor or society accountant can reconcile daybooks, bank receipts, and statutory ledgers in seconds without double data entry."
    },
    {
      q: "Is Girvasa fully compliant with Maharashtra Co-operative Societies Act 1960?",
      a: "100% yes. All penalty calculations adhere strictly to Model Bye-law 166 (simple interest up to 21% p.a.). Statutory Registers (Form I, Form J, Share Register, Nomination Register) follow statutory state formats, and all resident data is sovereignly stored in Tier-IV Mumbai data centers."
    },
    {
      q: "What hardware is required for the security gates?",
      a: "Girvasa runs on standard Android tablets (minimum 8-inch screen, 4G LTE or Wi-Fi). On Annual Growth and Enterprise plans, we offer complimentary pre-configured ruggedized tablets with tamper-proof kiosk mode and vernacular guard training."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
          
          {/* Value Proposition & Header Section */}
          <section className="w-full bg-gradient-to-b from-surface to-surface-container-low px-gutter py-space-xl relative overflow-hidden">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center text-center py-space-lg">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-label-sm text-label-sm font-semibold mb-space-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>100% Bye-Law Compliant • DPDP Act 2023 Ready • Model Bye-Law 166 Aligned</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary max-w-3xl tracking-tight mb-space-sm font-bold">
                Predictable, Transparent Investment for Housing Societies of All Scales
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-space-lg">
                Flat per-unit rates designed for Co-operative Housing Societies (CHS), RWAs, and large Gated Townships. Zero hidden onboarding fees, no setup penalties, and instant 15-day unrestricted trial.
              </p>
              
              {/* Active Billing Switcher */}
              <div className="flex items-center gap-space-xs bg-surface-container-lowest p-1.5 rounded-full border border-outline-variant/40 shadow-sm">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={`px-space-lg py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                    !isAnnual ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                  }`}
                  type="button"
                >
                  Monthly Billing
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={`px-space-lg py-2 rounded-full font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs ${
                    isAnnual ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                  }`}
                  type="button"
                >
                  <span>Annual Billing</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Interactive 3-Tier Pricing Cards Grid */}
          <section className="w-full bg-background px-gutter py-space-xl">
            <div className="w-full max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
                
                {/* Starter Tier */}
                <div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl border border-outline-variant/30 hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Starter</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Up to 100 Flats / Co-op Societies
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                      Essential digital gate security, automated billing, and compliance for smaller housing societies.
                    </p>
                    <div className="mb-space-lg pb-space-md border-b border-outline-variant/30">
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">₹</span>
                        <span className="font-headline-xl text-headline-xl text-primary font-bold">
                          {isAnnual ? "14,390" : starterMonthly.toLocaleString('en-IN')}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {isAnnual ? "/ year" : "/ month"}
                        </span>
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary font-semibold mt-1">
                        {isAnnual ? "Billed annually (~₹1,199/month)" : "Billed monthly without annual rebate"}
                      </p>
                    </div>
                    <div className="space-y-space-sm mb-space-lg">
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Digital visitor log &amp; 4 guard tablet logins</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Automated monthly maintenance bills via WhatsApp PDF</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">UPI QR &amp; BBPS zero-commission collection links</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Model Bye-law 166 compound interest (21% p.a.) calculation</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Resident &amp; vehicle spatial directory</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Standard email &amp; ticketing helpdesk SLA &lt; 24 hrs</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link 
                      className="w-full flex items-center justify-center py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors" 
                      href="/demo"
                    >
                      Start 15-Day Free Trial
                    </Link>
                  </div>
                </div>

                {/* Growth Tier (Recommended) */}
                <div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl border-2 border-primary shadow-md hover:shadow-xl transition-all relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider shadow-sm">
                    Most Popular for CHS
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-space-xs mt-1">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Growth</span>
                      <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
                        101 to 300 Flats / Mid-Sized CHS
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                      Complete statutory banking, automated Tally sync, member registers, and digital AGM e-voting.
                    </p>
                    <div className="mb-space-lg pb-space-md border-b border-outline-variant/30">
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">₹</span>
                        <span className="font-headline-xl text-headline-xl text-primary font-bold">
                          {isAnnual ? "33,590" : growthMonthly.toLocaleString('en-IN')}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {isAnnual ? "/ year" : "/ month"}
                        </span>
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary font-semibold mt-1">
                        {isAnnual ? "Billed annually (~₹2,799/month)" : "Billed monthly without annual rebate"}
                      </p>
                    </div>
                    <div className="space-y-space-sm mb-space-lg">
                      <div className="flex items-start gap-space-sm text-on-surface font-semibold text-primary">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Everything in Starter included</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Direct bank reconciliation (ICICI, HDFC, Saraswat, SBI)</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Statutory Form I &amp; Form J member registers with instant PDF</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Automated 1-click Tally ERP 9 / TallyPrime XML sync</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Staff biometric &amp; turnstile attendance tracking</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Section 99 compliant digital secret AGM e-voting</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Priority WhatsApp &amp; phone assistance (9 AM - 7 PM)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link 
                      className="w-full flex items-center justify-center py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-colors shadow-sm" 
                      href="/demo"
                    >
                      Start 15-Day Free Trial
                    </Link>
                  </div>
                </div>

                {/* Enterprise Tier */}
                <div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl border border-outline-variant/30 hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">Enterprise</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">
                        300+ Flats / Multi-Wing Townships
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                      For multi-tower complexes, large federations, and complex multi-wing societies.
                    </p>
                    <div className="mb-space-lg pb-space-md border-b border-outline-variant/30">
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">₹</span>
                        <span className="font-headline-xl text-headline-xl text-primary font-bold">
                          {isAnnual ? "76,790" : enterpriseMonthly.toLocaleString('en-IN')}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {isAnnual ? "/ year" : "/ month"}
                        </span>
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary font-semibold mt-1">
                        {isAnnual ? "Billed annually (~₹6,399/month)" : "Billed monthly without annual rebate"}
                      </p>
                    </div>
                    <div className="space-y-space-sm mb-space-lg">
                      <div className="flex items-start gap-space-sm text-on-surface font-semibold text-primary">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Everything in Growth included</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Multi-gate ANPR camera &amp; FASTag barrier integration</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Multi-wing statutory federation accounts consolidation</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Share certificate digital ledger &amp; transfer workflows</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Custom Chart of Accounts &amp; statutory balance sheet (Form N-1, N-2)</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">Dedicated Chartered Accountant &amp; Auditor liaison</span>
                      </div>
                      <div className="flex items-start gap-space-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                        <span className="font-body-sm text-body-sm">On-premise committee training &amp; priority 99.99% SLA</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link 
                      className="w-full flex items-center justify-center py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors" 
                      href="/demo"
                    >
                      Schedule Committee Walkthrough
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Interactive Society Cost & Defaulter Recovery Calculator */}
          <section className="w-full bg-surface-container-low px-gutter py-space-xl border-y border-outline-variant/30">
            <div className="w-full max-w-[1200px] mx-auto">
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-md border border-outline-variant/30 flex flex-col gap-space-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-outline-variant/20 pb-space-md">
                  <div className="flex flex-col gap-1">
                    <div className="inline-flex items-center gap-space-xs text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      <Calculator className="w-4 h-4" />
                      <span>Interactive Society ROI &amp; Defaulter Recovery Calculator</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
                      Calculate Your Society's Exact Monthly Cost &amp; Savings
                    </h2>
                  </div>
                  <div className="px-space-md py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-label-md text-label-md font-bold self-start md:self-auto">
                    Recommended: {recommendedTier}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                  {/* Slider Control */}
                  <div className="lg:col-span-7 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <label htmlFor="flats-slider" className="font-label-lg text-label-lg font-bold text-primary">
                        Total Flats / Units in Society:
                      </label>
                      <span className="text-headline-md font-bold text-primary bg-surface-container-low px-space-md py-1 rounded-lg border border-outline-variant/30">
                        {flats} Flats
                      </span>
                    </div>

                    <input 
                      id="flats-slider"
                      type="range" 
                      min="20" 
                      max="800" 
                      step="10" 
                      value={flats}
                      onChange={(e) => setFlats(parseInt(e.target.value, 10))}
                      className="w-full h-3 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
                    />

                    <div className="flex justify-between text-body-sm text-on-surface-variant font-medium">
                      <span>20 Flats (Small CHS)</span>
                      <span>150 Flats (Mid-Size)</span>
                      <span>400 Flats (Large Wing)</span>
                      <span>800+ Flats (Township)</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low/60 border border-outline-variant/20 text-body-sm text-on-surface-variant">
                      <p className="leading-relaxed">
                        <strong className="text-primary font-semibold">Model Bye-Law 166 Impact:</strong> Automated WhatsApp billing with dynamic UPI QR codes and strict 21% p.a. penal interest reduces delinquent payments within 90 days.
                      </p>
                    </div>
                  </div>

                  {/* Calculated Metric Badges */}
                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                        Cost Per Flat / Month
                      </span>
                      <div className="text-headline-lg font-bold text-primary mt-2">
                        ₹{costPerFlatMonth}
                      </div>
                      <span className="font-body-sm text-[11px] text-secondary font-semibold">
                        Less than a cup of tea per flat
                      </span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                        Admin Hours Saved
                      </span>
                      <div className="text-headline-lg font-bold text-primary mt-2">
                        {hoursSaved} hrs/mo
                      </div>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        In secretary reconciliation &amp; chasing
                      </span>
                    </div>

                    <div className="sm:col-span-2 p-space-md rounded-xl bg-secondary/10 border border-secondary/20 flex flex-col justify-between">
                      <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
                        Estimated Delinquent Dues &amp; Interest Recovered
                      </span>
                      <div className="text-headline-lg font-bold text-primary mt-1">
                        ₹{interestRecovered.toLocaleString('en-IN')} / year
                      </div>
                      <span className="font-body-sm text-[11px] text-secondary font-semibold mt-1">
                        Net Positive ROI: Recovery exceeds subscription cost by 3x to 6x.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Feature Comparison Matrix & Diagram */}
          <section className="w-full bg-background px-gutter py-space-xl border-b border-outline-variant/30">
            <div className="w-full max-w-[1200px] mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-space-lg">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-label-sm text-label-sm font-semibold mb-2">
                  <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                  <span>Why Indian Societies Upgrade</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs font-bold">
                  Eliminate Paper Leaks &amp; Manual Ledger Chaos
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  See how transitioning from physical registers to Girvasa Society OS prevents dues leakage, saves countless committee hours, and ensures dispute-free audit compliance.
                </p>
              </div>

              {/* Local Comparison Diagram */}
              <div className="bg-surface-container-lowest rounded-xl p-space-sm sm:p-space-md border border-outline-variant/30 shadow-sm overflow-hidden mb-space-xl">
                <img 
                  src="/images/comparison_diagram.jpg" 
                  alt="Comparison between Manual Traditional Society Management and Girvasa Society OS Digital ERP" 
                  className="w-full h-auto rounded-lg object-cover" 
                  loading="lazy" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-md px-space-sm pb-space-xs">
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50 border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">warning</span>
                    <div>
                      <h4 className="font-label-lg text-label-lg font-bold text-primary">Traditional Manual Process</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Manual physical registers, paper loss risks, uncollected cheques, and contested annual AGM audits.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-secondary/10 border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified</span>
                    <div>
                      <h4 className="font-label-lg text-label-lg font-bold text-primary">Girvasa Digital ERP</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Automated dynamic UPI collections, instantaneous Tally &amp; GST export, zero dues leakage, and 100% audit peace of mind.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular Module Table */}
              <div className="text-center max-w-2xl mx-auto mb-space-lg">
                <h3 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Inspect Every Capability by Tier
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Compare feature depths across Security, Double-Entry Finance, Statutory Compliance, and Support agreements.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="py-space-md px-space-lg font-headline-sm text-headline-sm text-primary w-2/5">Capabilities &amp; Features</th>
                        <th className="py-space-md px-space-md font-headline-sm text-headline-sm text-center text-on-surface-variant w-1/5">Starter</th>
                        <th className="py-space-md px-space-md font-headline-sm text-headline-sm text-center text-primary bg-surface-container w-1/5">Growth (Recommended)</th>
                        <th className="py-space-md px-space-md font-headline-sm text-headline-sm text-center text-on-surface-variant w-1/5">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group 1: Core Security & Gate Defense */}
                      <tr className="bg-surface-container-high/40">
                        <td className="py-2.5 px-space-lg font-label-md text-label-md font-bold uppercase tracking-wider text-primary" colSpan={4}>
                          1. Core Security &amp; Gate Defense
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Visitor Daily Entry &amp; Resident OTP Pass</td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Daily Domestic Help / Maid Biometric Attendance</td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Boom Barrier &amp; ANPR Number Plate Integration</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40 bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>

                      {/* Group 2: Statutory Accounting & MCS Bye-Law 166 */}
                      <tr className="bg-surface-container-high/40">
                        <td className="py-2.5 px-space-lg font-label-md text-label-md font-bold uppercase tracking-wider text-primary" colSpan={4}>
                          2. Statutory Accounting &amp; MCS Bye-Law 166
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Automated WhatsApp PDF Invoicing &amp; Dynamic UPI QR</td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Compound Interest Penalty Calculation (21% p.a. Bye-Law 166)</td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30 font-bold"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">BBPS &amp; Direct Bank Statement Auto-Reconciliation</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Statutory Balance Sheet (Form N-1 &amp; N-2) &amp; Profit/Loss</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">TallyPrime &amp; Tally ERP 9 Direct 2-Way Sync</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>

                      {/* Group 3: Society Governance & MCS Act 1960 Modules */}
                      <tr className="bg-surface-container-high/40">
                        <td className="py-2.5 px-space-lg font-label-md text-label-md font-bold uppercase tracking-wider text-primary" colSpan={4}>
                          3. Society Governance &amp; MCS Act 1960 Modules
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Digital Form I (Register of Members) &amp; Form J (List of Members)</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Share Certificate Digital Registry &amp; Transfer Audit Trail</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Section 99 Certified AGM &amp; E-Voting Engine</td>
                        <td className="py-3 px-space-md text-center text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]">remove</span></td>
                        <td className="py-3 px-space-md text-center text-secondary bg-surface-container/30"><span className="material-symbols-outlined text-[18px]">check</span></td>
                        <td className="py-3 px-space-md text-center text-secondary"><span className="material-symbols-outlined text-[18px]">check</span></td>
                      </tr>

                      {/* Group 4: Implementation & SLA Support */}
                      <tr className="bg-surface-container-high/40">
                        <td className="py-2.5 px-space-lg font-label-md text-label-md font-bold uppercase tracking-wider text-primary" colSpan={4}>
                          4. Implementation &amp; SLA Support
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Historical Excel / MyGate / ADDA Data Migration</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-on-surface-variant">Self-serve CSV</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-secondary font-semibold bg-surface-container/30">Free Dedicated Engineer</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-secondary font-semibold">Turnkey Full-Service</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Guaranteed Platform Uptime</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-on-surface-variant">99.5%</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-primary font-semibold bg-surface-container/30">99.9%</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-secondary font-bold">99.99% Enterprise SLA</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-space-lg font-body-sm text-body-sm text-on-surface">Support Desk Channel</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-on-surface-variant">Ticket Helpdesk</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-secondary font-semibold bg-surface-container/30">Priority WhatsApp &amp; Phone</td>
                        <td className="py-3 px-space-md text-center font-label-sm text-label-sm text-secondary font-bold">Dedicated Account Manager &amp; CA Support</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions (Interactive Accordion) */}
          <section className="w-full bg-background px-gutter py-space-xl">
            <div className="w-full max-w-[850px] mx-auto">
              <div className="text-center mb-space-xl">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-space-xs font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Clear answers about billing, data migration, and onboarding.
                </p>
              </div>
              <div className="space-y-space-sm" id="faq-container">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleFaq(idx)}
                    className="faq-item bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 cursor-pointer hover:border-secondary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-space-md">
                      <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                        {faq.q}
                      </h3>
                      <span className={`material-symbols-outlined text-primary text-[20px] transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-secondary" : ""}`}>
                        expand_more
                      </span>
                    </div>
                    {openFaq === idx && (
                      <div className="pt-space-sm text-body-md text-on-surface-variant leading-relaxed animate-fade-in border-t border-outline-variant/20 mt-space-sm">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* High-Conversion Executive CTA Banner */}
          <section className="w-full bg-primary text-on-primary px-gutter py-space-xl relative overflow-hidden">
            <div className="w-full max-w-[800px] mx-auto text-center flex flex-col items-center py-space-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-primary mb-space-sm font-bold">
                Ready to streamline your society management?
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container max-w-xl mb-space-lg">
                Experience seamless gate security and error-free accounting with zero upfront commitment. Full 15-day unconstrained access.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-space-md justify-center">
                <Link 
                  className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-colors shadow-sm" 
                  href="/demo"
                >
                  Start 15-Day Free Trial
                </Link>
                <Link 
                  className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-surface-container-lowest/10 text-on-primary hover:bg-surface-container-lowest/20 font-label-md text-label-md font-semibold transition-colors" 
                  href="/demo"
                >
                  Schedule a Walkthrough
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
