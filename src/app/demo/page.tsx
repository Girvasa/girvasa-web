"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  HelpCircle,
  Building2,
  Users,
  Video,
  Clock,
  Sparkles
} from "lucide-react";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    role: "secretary",
    societyName: "",
    units: "120",
    city: "Mumbai MMR",
    phone: "",
    email: "",
    preferredDate: "",
    presentationMode: "virtual"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
          
          {/* Top Sovereign Trust Strip */}
          <section className="w-full bg-primary text-on-primary py-space-sm px-gutter">
            <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-space-sm font-label-md text-label-md">
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                <span className="font-semibold text-secondary-fixed">Q2 2025 Audit Season:</span>
                <span className="text-surface-variant">Priority walkthrough slots open for Mumbai, Pune, Thane &amp; PCMC federations.</span>
              </div>
              <div className="flex items-center gap-space-lg text-surface-variant">
                <span className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">verified</span>
                  MCS Act Sec. 79 &amp; 154B Ready
                </span>
                <span className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">lock</span>
                  Non-Disclosure &amp; Ledger Confidentiality Protected
                </span>
              </div>
            </div>
          </section>

          {/* Main Hero Booking Split Section */}
          <section className="w-full bg-background py-space-xl px-gutter">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              
              {/* Left Column: Value Pitch & Institutional Proof */}
              <div className="lg:col-span-6 flex flex-col gap-space-lg">
                <div className="flex flex-col gap-space-sm">
                  <div className="inline-flex items-center gap-space-xs w-fit px-space-sm py-1 rounded-full bg-surface-container-high text-primary">
                    <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>co_present</span>
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">Personalized Society Consultation</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                    See Girvasa in Action with Your Society’s Exact Bye-Laws
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                    Join a 30-minute tailored walkthrough with a Maharashtra Co-operative Housing Society specialist. We’ll show you how to automate your next maintenance billing cycle, sync bank statements, and secure your gates without disturbing resident privacy.
                  </p>
                </div>

                {/* Visual Hero Metric Anchor: Real Society Ledger Preview Card */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-secondary">account_balance</span>
                      <div>
                        <div className="font-label-lg text-label-lg text-primary font-bold">Simulated Ledger Sync Engine</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">Sample: Model Bye-Law No. 67 Maintenance Apportionment</div>
                      </div>
                    </div>
                    <span className="px-space-sm py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                      Live Mock Data
                    </span>
                  </div>

                  {/* Micro Metric Bar Graph */}
                  <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between gap-space-md">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Current Sinking Fund Ratio</span>
                      <span className="font-currency-lg text-currency-lg text-primary">99.4% Verified</span>
                    </div>
                    <svg className="w-36 h-10 text-secondary" fill="none" viewBox="0 0 144 40">
                      <path d="M0 32 L20 28 L40 30 L60 18 L80 22 L100 12 L120 16 L144 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                      <path d="M0 32 L20 28 L40 30 L60 18 L80 22 L100 12 L120 16 L144 4 V40 H0 Z" fill="currentColor" fillOpacity="0.12"></path>
                    </svg>
                    <div className="flex flex-col text-right">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Default Risk Reduction</span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">-82% In 90 Days</span>
                    </div>
                  </div>
                </div>

                {/* Structured 4-Point Agenda */}
                <div className="flex flex-col gap-space-sm">
                  <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide font-bold">
                    What We’ll Cover in Your 30-Minute Session
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div className="bg-surface-container-lowest p-space-md rounded-lg flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
                      <div className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">1</div>
                      <h3 className="font-label-lg text-label-lg font-bold text-primary">Bye-Law 67 Billing &amp; 10% Non-Occupancy Capping</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Configure per-sqft repair fund formulas, parking tariffs, and statutory 10% NOC caps in accordance with Bye-Law 166.</p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md rounded-lg flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
                      <div className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">2</div>
                      <h3 className="font-label-lg text-label-lg font-bold text-primary">Tally ERP / Prime &amp; Excel Daybook Migration</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Zero-loss import of historical balances, member share registers (Form 'I'), nomination records (Form 'J'), and bank NEFT records.</p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md rounded-lg flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
                      <div className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">3</div>
                      <h3 className="font-label-lg text-label-lg font-bold text-primary">IoT Boom Barrier &amp; ANPR Gate Hardware Audit</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Full compatibility check for RFID tags, fast-tag boom barriers, guard biometric tablets, and visitor intercom sync.</p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md rounded-lg flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
                      <div className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">4</div>
                      <h3 className="font-label-lg text-label-lg font-bold text-primary">MCS Act Sec. 79 &amp; Form 'N' Audit Readiness</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Answers for Hon. Secretary and Treasurer on managing committee statutory liability, GST credits, and digital AGM quorum logs.</p>
                    </div>
                  </div>
                </div>

                {/* Local 4-Step Onboarding Workflow Diagram */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-secondary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[20px]">route</span>
                      <h3 className="font-label-lg text-label-lg font-bold text-primary">Hassle-Free Walkthrough &amp; Onboarding Process</h3>
                    </div>
                    <span className="px-space-sm py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                      4-Step Go-Live
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    From 15-minute smart data upload to same-day WhatsApp UPI payment links and gate activation.
                  </p>
                  <div className="w-full overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low">
                    <img 
                      src="/images/onboarding_workflow_diagram.jpg" 
                      alt="4-Step Walkthrough and Onboarding Process for Housing Society Managing Committees" 
                      className="w-full h-auto object-cover block" 
                    />
                  </div>
                </div>

                {/* Real Housing Society Social Proof */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                      Trusted by 500+ Housing Societies across Mumbai, Thane, Pune &amp; Navi Mumbai
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">99.8% Renewals</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
                      <span className="font-label-md text-label-md font-bold text-primary">Sea Pearl CHS</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        "Automated 21% interest invoicing recovered ₹8.4L in delinquent dues within 60 days."
                      </span>
                      <span className="font-label-sm text-[11px] text-secondary font-semibold mt-2">Bandra West • 180 Flats</span>
                    </div>
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
                      <span className="font-label-md text-label-md font-bold text-primary">Orchid Woods CHS</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        "1-click TallyPrime export cut our annual audit filing time from 5 weeks to 2 days."
                      </span>
                      <span className="font-label-sm text-[11px] text-secondary font-semibold mt-2">Thane West • 420 Flats</span>
                    </div>
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
                      <span className="font-label-md text-label-md font-bold text-primary">Silver Oak Heights</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        "Guard tablets in Marathi were adopted by our security guards within 15 minutes."
                      </span>
                      <span className="font-label-sm text-[11px] text-secondary font-semibold mt-2">Kothrud, Pune • 260 Flats</span>
                    </div>
                  </div>
                </div>

                {/* Security & Commitment Badges */}
                <div className="grid grid-cols-3 gap-space-md text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
                    <span className="font-label-md text-label-md font-bold text-primary">Zero Commitment</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">No credit card or deposit</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[24px]">task</span>
                    <span className="font-label-md text-label-md font-bold text-primary">Free Migration Audit</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Legacy record mapping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[24px]">shield</span>
                    <span className="font-label-md text-label-md font-bold text-primary">100% Confidential</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Protected under DPDP Act</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Consultation & Demo Booking Form */}
              <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-space-lg shadow-md border border-outline-variant/30 flex flex-col gap-space-md">
                <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-outline-variant/20">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                      Direct Officer Routing • Maharashtra CHS
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                      Request a Committee Presentation
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Select your society attributes to assign the correct regional registrar specialist.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                      Free Audit Pack
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Valued at ₹12,500</span>
                  </div>
                </div>

                {submitted ? (
                  <div className="p-space-xl rounded-xl bg-secondary/10 border border-secondary/30 flex flex-col items-center text-center gap-space-md animate-fade-in my-space-md">
                    <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-headline-md font-bold text-primary">
                        Presentation Scheduled Successfully!
                      </h3>
                      <p className="font-body-md text-on-surface-variant max-w-md">
                        Reference ID: <span className="font-mono font-bold text-primary">DEMO-MH-{Math.floor(1000 + Math.random() * 9000)}</span>
                      </p>
                    </div>
                    <div className="p-space-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-left w-full max-w-md text-body-sm space-y-1">
                      <div><strong className="text-primary">Society:</strong> {formData.societyName || "Housing Society"} ({formData.units} Units)</div>
                      <div><strong className="text-primary">Contact Person:</strong> {formData.fullName} ({formData.role})</div>
                      <div><strong className="text-primary">Phone / Email:</strong> {formData.phone} • {formData.email}</div>
                      <div><strong className="text-primary">Format:</strong> {formData.presentationMode === "virtual" ? "Google Meet / Zoom Walkthrough" : "In-Person Society Clubhouse Visit"}</div>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">
                      Our certified Maharashtra Co-operative Housing specialist will contact you to confirm the time slot and share the Bye-Law audit kit.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Book Another Presentation
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-space-md" id="demo-booking-form">
                    
                    {/* Field 1: Name and Committee Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="full-name">
                          Your Full Name *
                        </label>
                        <input 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="full-name" 
                          placeholder="e.g. Rameshwar Joshi" 
                          required 
                          type="text" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="committee-role">
                          Committee Role *
                        </label>
                        <select 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="committee-role" 
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="secretary">Hon. Secretary (कार्याध्यक्ष / सचिव)</option>
                          <option value="chairman">Chairman / President (अध्यक्ष)</option>
                          <option value="treasurer">Treasurer (खजिनदार)</option>
                          <option value="committee_member">Managing Committee Member</option>
                          <option value="internal_auditor">Internal / Certified Auditor</option>
                          <option value="estate_manager">Estate / Society Administrative Manager</option>
                        </select>
                      </div>
                    </div>

                    {/* Field 2: Society Name & Registered Units */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="society-name">
                          Housing Society Name *
                        </label>
                        <input 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="society-name" 
                          placeholder="e.g. Green Acres Co-op Hsg Society" 
                          required 
                          type="text" 
                          value={formData.societyName}
                          onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="unit-count">
                          Total Flats / Units *
                        </label>
                        <select 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="unit-count" 
                          required
                          value={formData.units}
                          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                        >
                          <option value="40">Under 50 Flats (Single Wing)</option>
                          <option value="80">50 to 100 Flats (Standard CHS)</option>
                          <option value="150">101 to 250 Flats (Mid-Size Complex)</option>
                          <option value="350">251 to 500 Flats (Multi-Tower Complex)</option>
                          <option value="800">500+ Flats (Mega Township / Federation)</option>
                        </select>
                      </div>
                    </div>

                    {/* Field 3: City Location & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="city-district">
                          Location / District *
                        </label>
                        <select 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="city-district" 
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        >
                          <option value="Mumbai MMR">Mumbai City &amp; Suburbs (MMR)</option>
                          <option value="Thane">Thane &amp; Kalyan-Dombivli</option>
                          <option value="Navi Mumbai">Navi Mumbai &amp; Panvel</option>
                          <option value="Pune">Pune City &amp; PCMC</option>
                          <option value="Nagpur">Nagpur / Nashik / Rest of Maharashtra</option>
                          <option value="Other India">Bengaluru / Delhi NCR / Other Metro</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="phone-number">
                          Mobile Number (for WhatsApp Invite) *
                        </label>
                        <input 
                          className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                          id="phone-number" 
                          placeholder="e.g. 98200 12345" 
                          required 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Field 4: Official Email */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md font-semibold text-primary" htmlFor="email-address">
                        Official Society / Personal Email *
                      </label>
                      <input 
                        className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="email-address" 
                        placeholder="secretary@greensociety.org or yourname@gmail.com" 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    {/* Mode of presentation */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md font-semibold text-primary">
                        Preferred Presentation Mode
                      </label>
                      <div className="grid grid-cols-2 gap-space-sm">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, presentationMode: "virtual" })}
                          className={`p-space-sm rounded-lg border text-left flex items-center gap-space-xs transition-colors ${
                            formData.presentationMode === "virtual" 
                              ? "bg-secondary/10 border-secondary text-primary font-semibold" 
                              : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant"
                          }`}
                        >
                          <Video className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-body-sm">Live Google Meet / Zoom</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, presentationMode: "in-person" })}
                          className={`p-space-sm rounded-lg border text-left flex items-center gap-space-xs transition-colors ${
                            formData.presentationMode === "in-person" 
                              ? "bg-secondary/10 border-secondary text-primary font-semibold" 
                              : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant"
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-body-sm">In-Person at Society Office</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-space-xs">
                      <button 
                        type="submit"
                        className="w-full py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Confirm Walkthrough &amp; Claim Free Audit Pack</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                      🔒 No spam. Data held in strict confidentiality under the Digital Personal Data Protection Act 2023.
                    </p>
                  </form>
                )}
              </div>

            </div>
          </section>

        </div>
      </main>
      <WebsiteFooter />
    </div>
  );
}
