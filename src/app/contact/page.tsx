"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import { 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send,
  Clock,
  Building2,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    contactInfo: "",
    societyAndCity: "",
    inquiryPriority: "Tally & Excel Daybook Migration",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `TKT-MH-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generatedId);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <WebsiteHeader />
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center py-space-xl px-gutter-mobile md:px-gutter">
        <div className="flex flex-col w-full">
          
          {/* Top Intro Section */}
          <section className="w-full max-w-[1600px] mx-auto pb-space-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low rounded-xl p-space-lg md:p-space-xl relative overflow-hidden shadow-sm border border-outline-variant/30">
              <div className="max-w-2xl relative z-10 flex flex-col gap-space-xs">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-secondary w-fit shadow-sm border border-secondary/20">
                  <span className="material-symbols-outlined text-[15px]">support_agent</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    COMMITTEE HELPDESK &amp; ONBOARDING SUPPORT
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                  Connect with the Girvasa Support &amp; Deployment Team
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Dedicated operational assistance for Housing Society Managing Committees, Treasurers, Estate Managers, and Resident Welfare Associations across India.
                </p>
              </div>
              <div className="flex items-center gap-space-sm relative z-10">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-sm border border-outline-variant/30 flex flex-col min-w-[170px]">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                    COMMITTEE SUPPORT HOURS
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    9 AM – 7 PM IST
                  </span>
                  <span className="font-body-sm text-[11px] text-secondary font-medium">
                    Mon through Sat (Emergency Gate: 24/7)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Support & Contact Split Layout */}
          <section className="w-full max-w-[1600px] mx-auto py-space-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              
              {/* Form Section */}
              <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm border border-outline-variant/30">
                <div className="flex flex-col gap-1 pb-space-md border-b border-outline-variant/20 mb-space-md">
                  <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                    Request Onboarding, Walkthrough or Technical Assistance
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Fill out your society credentials and our Maharashtra-certified housing deployment team will respond within 2 business hours.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-space-xl rounded-xl bg-secondary/10 border border-secondary/30 flex flex-col items-center text-center gap-space-md animate-fade-in my-space-md">
                    <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-headline-md font-bold text-primary">
                        Inquiry Dispatched Successfully!
                      </h3>
                      <p className="font-body-md text-on-surface-variant max-w-md">
                        Tracking Reference: <span className="font-mono font-bold text-primary">{ticketId}</span>
                      </p>
                    </div>
                    <div className="p-space-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-left w-full max-w-md text-body-sm space-y-1">
                      <div><strong className="text-primary">Society:</strong> {formData.societyAndCity}</div>
                      <div><strong className="text-primary">Contact:</strong> {formData.fullName} ({formData.contactInfo})</div>
                      <div><strong className="text-primary">Priority Focus:</strong> {formData.inquiryPriority}</div>
                      <div><strong className="text-primary">Response Target:</strong> Under 2 business hours</div>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">
                      Our regional support desk officer has received your ticket and will contact you via WhatsApp and email.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="fullName">
                        Full Name &amp; Committee Designation *
                      </label>
                      <input 
                        className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="fullName" 
                        name="fullName" 
                        placeholder="e.g. Rajesh Deshmukh (Hon. Secretary)" 
                        required 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="contactInfo">
                        Mobile Number &amp; Email Address *
                      </label>
                      <input 
                        className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="contactInfo" 
                        name="contactInfo" 
                        placeholder="e.g. 98200 12345 or secretary@powaiheights.org" 
                        required 
                        type="text" 
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="societyAndCity">
                        Society Name, Wing Count &amp; Location *
                      </label>
                      <input 
                        className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="societyAndCity" 
                        name="societyAndCity" 
                        placeholder="e.g. Whispering Meadows CHS (4 Wings, 320 Flats), Kothrud, Pune" 
                        required 
                        type="text" 
                        value={formData.societyAndCity}
                        onChange={(e) => setFormData({ ...formData, societyAndCity: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="inquiryPriority">
                        Primary Nature of Inquiry *
                      </label>
                      <select 
                        className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="inquiryPriority" 
                        name="inquiryPriority"
                        value={formData.inquiryPriority}
                        onChange={(e) => setFormData({ ...formData, inquiryPriority: e.target.value })}
                      >
                        <option value="Tally & Excel Daybook Migration">Tally ERP 9 / Prime &amp; Excel Daybook Migration (Historical Ledgers)</option>
                        <option value="Model Bye-Law 166 Setup">Model Bye-Law 166 Automated Billing &amp; Dynamic UPI Setup</option>
                        <option value="Guard Terminal & ANPR Demo">Guard Tablet &amp; IoT Boom Barrier / ANPR Gate Demo</option>
                        <option value="Section 99 AGM E-Voting">Section 99 Digital Secret AGM E-Voting &amp; Quorum</option>
                        <option value="Technical Support">Existing Society Account Technical Support</option>
                        <option value="General Consultation">General Committee Walkthrough &amp; Quote Request</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="message">
                        Message / Current Software Issues *
                      </label>
                      <textarea 
                        className="p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" 
                        id="message" 
                        name="message" 
                        placeholder="Briefly describe your society requirements or software challenges (e.g. MyGate / ADDA / Manual Excel registers, uncollected dues)..." 
                        required 
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="pt-space-xs">
                      <button 
                        className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm" 
                        type="submit"
                      >
                        <span>Submit Committee Request</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Direct Info & Hubs */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                
                {/* Direct Contact Details Card */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Direct Contact Channels
                  </h3>
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-start gap-space-sm">
                      <span className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                        <Phone className="w-4 h-4 text-secondary" />
                      </span>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-bold">
                          Priority Helpline
                        </span>
                        <a className="font-headline-sm text-headline-sm text-primary font-bold hover:text-secondary transition-colors" href="tel:+918850409901">
                          +91 8850 40 9901
                        </a>
                        <span className="font-body-sm text-[12px] text-on-surface-variant block mt-0.5">
                          Directline for Hon. Secretaries &amp; Treasurers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm">
                      <span className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                        <Mail className="w-4 h-4 text-secondary" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-bold">
                          Email Support Desks
                        </span>
                        <a className="font-body-md text-body-md text-primary font-semibold hover:text-secondary transition-colors" href="mailto:support@girvasa.in">
                          support@girvasa.in <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(Helpdesk &amp; Accounting)</span>
                        </a>
                        <a className="font-body-md text-body-md text-primary font-semibold hover:text-secondary transition-colors" href="mailto:onboarding@girvasa.in">
                          onboarding@girvasa.in <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(Historical Ledger Migration)</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm">
                      <span className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                        <Clock className="w-4 h-4 text-secondary" />
                      </span>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-bold">
                          Operational Support Hours
                        </span>
                        <span className="font-body-md text-body-md text-on-surface font-semibold">
                          Monday to Saturday, 9:00 AM – 7:00 PM IST
                        </span>
                        <span className="font-body-sm text-[12px] text-secondary font-medium block mt-0.5">
                          Emergency Gate Bypass &amp; Guard Hotline: 24x7x365
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Deployments */}
                <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm border border-outline-variant/30">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Building2 className="w-4 h-4 text-secondary" />
                      <span className="font-label-md text-label-md font-bold">Registered Corporate Office</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Level 7, Platina Tower, G Block, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051
                    </p>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span className="font-label-md text-label-md font-bold">Regional Tech &amp; Field Hub</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Baner Tech Center, High Street, Pune, Maharashtra 411045
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="w-full max-w-[1600px] mx-auto pt-space-lg pb-space-xl">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Common questions about getting started with Girvasa Society OS.
                </p>
              </div>
              <div className="flex flex-col divide-y divide-outline-variant/20">
                <details className="py-space-sm group" open>
                  <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-primary font-semibold cursor-pointer list-none">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
                      Can Girvasa conduct an in-person presentation for our Managing Committee or AGM?
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-on-surface-variant">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed pl-7">
                    Yes. Our senior deployment specialists provide in-person presentations across Mumbai MMR, Pune, and Bengaluru directly at your society clubhouse or committee room, including live demonstration of Bye-Law 166 billing and gate pass tablets.
                  </p>
                </details>

                <details className="py-space-sm group">
                  <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-primary font-semibold cursor-pointer list-none">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
                      How are our historical accounting ledgers, pending dues, and member rosters migrated?
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-on-surface-variant">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed pl-7">
                    We provide a zero-effort data migration service. Our team extracts and maps your past 3 to 10 years of general ledger entries, member deposit ledgers, and vehicle records from Excel, Tally ERP 9 / TallyPrime, or legacy society software within 48 hours without operational downtime.
                  </p>
                </details>

                <details className="py-space-sm group">
                  <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-primary font-semibold cursor-pointer list-none">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
                      What hardware is required for the security gates, and do you supply guard tablets?
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-on-surface-variant">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed pl-7">
                    Girvasa runs on standard Android/iOS tablets (minimum 8-inch, 4G LTE enabled). We provide complimentary pre-configured ruggedized tablets with tamper-proof kiosk mode on all Annual Growth and Enterprise plans, complete with vernacular training for security personnel.
                  </p>
                </details>

                <details className="py-space-sm group">
                  <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-primary font-semibold cursor-pointer list-none">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
                      How does Girvasa ensure complete compliance with the DPDP Act 2023 and MCS Act 1960?
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-on-surface-variant">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed pl-7">
                    Girvasa maintains strict Indian data residency with Tier-IV servers in Mumbai. Resident phone numbers are encrypted and masked, marketing advertisements are completely prohibited, and statutory registers (Form I, Form J, Share Certificates) are generated in exact compliance with statutory government formats.
                  </p>
                </details>
              </div>
            </div>
          </section>

        </div>
      </main>
      <WebsiteFooter />
    </div>
  );
}
