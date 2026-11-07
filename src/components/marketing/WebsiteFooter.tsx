"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function WebsiteFooter() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && isAuthenticated;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 5000);
    }
  };

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold shadow-sm">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary leading-none">
                  GIRVASA
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Society OS
                </span>
              </div>
            </Link>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              The sovereign digital governance and double-entry accounting operating system engineered exclusively for Indian Housing Societies, CHS Federations, and Gated Communities.
            </p>

            {/* Direct Contact Details */}
            <div className="flex flex-col gap-2 font-label-md text-label-md text-on-surface-variant pt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  support_agent
                </span>
                <span>Committee Support:</span>
                <a className="font-semibold text-primary hover:underline" href="tel:+918850409901">
                  +91 8850 40 9901
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  mail
                </span>
                <span>Official Enquiries:</span>
                <a className="font-semibold text-primary hover:underline" href="mailto:desk@girvasa.in">
                  desk@girvasa.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  location_on
                </span>
                <span>Regional Deployments:</span>
                <span className="font-medium text-primary">Mumbai • Pune • Thane, Maharashtra</span>
              </div>
            </div>

            {/* Committee Bye-law Circular Updates Signup */}
            <div className="mt-2 pt-4 border-t border-outline-variant/30">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-2">
                Statutory Bye-Law &amp; Audit Bulletins:
              </span>
              {subscribed ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Subscribed! You will receive Maharashtra CHS circular updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="treasurer@society.org"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary text-primary"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Platform Column */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-lg text-label-lg font-bold text-primary uppercase tracking-wider mb-1">
              Platform Modules
            </span>
            <Link
              href="/features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Features &amp; Modules
            </Link>
            <Link
              href="/features#billing"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Bye-Law 67 Invoicing &amp; Tally
            </Link>
            <Link
              href="/features#security"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Guard Tablet GatePass
            </Link>
            <Link
              href="/features#directory"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Resident &amp; Vehicle Roster
            </Link>
            <Link
              href="/features#statutory"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Forms I &amp; J Registers
            </Link>
            <Link
              href="/pricing"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium text-secondary"
            >
              Pricing &amp; ROI Calculator
            </Link>
          </div>

          {/* Governance & Trust Column */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-lg text-label-lg font-bold text-primary uppercase tracking-wider mb-1">
              Governance &amp; Trust
            </span>
            <Link
              href="/about"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              About Girvasa &amp; Mission
            </Link>
            <Link
              href="/contact"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Support &amp; Regional Hubs
            </Link>
            <Link
              href="/privacy"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Privacy Policy &amp; DPDP Act
            </Link>
            <Link
              href="/terms"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Terms &amp; Subscription Agreement
            </Link>
            <span className="font-body-md text-body-md text-on-surface-variant/75 text-xs">
              MCS Act 1960 Bye-Laws 166 Aligned
            </span>
          </div>

          {/* Society Portal Column */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-lg text-label-lg font-bold text-primary uppercase tracking-wider mb-1">
              Society Portal
            </span>
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {isLoggedIn ? "Managing Committee Dashboard" : "Managing Committee Sign In"}
            </Link>
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {isLoggedIn ? "Resident Portal Dashboard" : "Resident Portal Access"}
            </Link>
            <Link
              href="/demo"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-semibold text-secondary"
            >
              Book Committee Walkthrough
            </Link>
            <a
              href="https://wa.me/918850409901?text=Hello%20Girvasa,%20our%20society%20would%20like%20a%20walkthrough%20presentation"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>WhatsApp Direct Line</span>
              <span className="material-symbols-outlined text-[14px] text-green-600">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal & Accreditations Bar */}
        <div className="pt-6 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 font-label-md text-label-md text-on-surface-variant text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center md:justify-start">
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px] text-secondary">gavel</span>
              Maharashtra Co-operative Societies Act 1960 Aligned
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px] text-secondary">security</span>
              DPDP Act 2023 Ready &amp; ISO 27001 Standard
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span>256-Bit Encrypted Multi-Tenant Cloud</span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span>© 2026 Girvasa (Society OS).</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
