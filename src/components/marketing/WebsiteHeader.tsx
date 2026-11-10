"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Calendar, ArrowRight, ShieldCheck, Check, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function WebsiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"EN" | "MR" | "HI">("EN");
  const [langToast, setLangToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && isAuthenticated;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLangChange = (lang: "EN" | "MR" | "HI") => {
    setActiveLang(lang);
    if (lang === "MR") {
      setLangToast("मराठी भाषा इंटरफेस सक्रिय केला (Marathi bye-law templates active)");
    } else if (lang === "HI") {
      setLangToast("हिंदी भाषा इंटरफ़ेस सक्रिय किया (Hindi CHS templates active)");
    } else {
      setLangToast("English interface active (MCS Act 1960 default)");
    }
    setTimeout(() => setLangToast(null), 3000);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20 transition-all">
        <div className="h-16 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-space-md">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-space-sm select-none group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold shadow-sm transition-transform group-hover:scale-105">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary leading-none">
                GIRVASA
              </span>
              <span className="font-label-sm text-[10px] text-secondary font-semibold uppercase tracking-wider">
                Society OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-space-lg font-label-md text-label-md text-on-surface-variant">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 transition-colors relative ${
                    active
                      ? "font-bold text-primary"
                      : "hover:text-primary font-medium"
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-space-md">
            {/* Direct Helpline Call */}
            <a
              className="hidden xl:flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors px-2 py-1 rounded-md hover:bg-surface-container"
              href="tel:+918850409901"
              title="Direct Managing Committee Helpline (Mon-Sat 9AM-8PM)"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">call</span>
              <span className="font-semibold">+91 8850 40 9901</span>
            </a>

            {/* Multilingual Switcher */}
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
              {(["EN", "MR", "HI"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangChange(lang)}
                  className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold transition-all ${
                    activeLang === lang
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Authenticated Dashboard Button or Sign In / Book Demo */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user?.fullName && (
                  <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold border border-outline-variant/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="max-w-[120px] truncate">{user.fullName}</span>
                  </span>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3.5 sm:px-4 py-2 rounded-lg font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all hover:shadow"
                  title="Access Society OS Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-secondary-fixed" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                </Link>
              </div>
            ) : (
              <>
                {/* Sign In */}
                <Link
                  href="/login"
                  className="font-label-md text-label-md font-semibold text-primary hover:text-secondary transition-colors px-2 py-1 rounded-md hover:bg-surface-container"
                >
                  Sign In
                </Link>

                {/* CTA Book Demo */}
                <Link
                  href="/demo"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 sm:px-4 py-2 rounded-lg font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all hover:shadow"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                    calendar_today
                  </span>
                  <span>Book a Demo</span>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-primary hover:bg-surface-container transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-4 py-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      active
                        ? "bg-surface-container font-bold text-primary"
                        : "text-on-surface-variant hover:bg-surface hover:text-primary font-medium"
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && <ArrowRight className="w-4 h-4 text-primary" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between py-1">
                <span className="font-label-sm text-on-surface-variant">Language:</span>
                <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
                  {(["EN", "MR", "HI"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLangChange(lang)}
                      className={`px-3 py-1 rounded font-label-sm font-bold transition-all ${
                        activeLang === lang
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href="tel:+918850409901"
                className="flex items-center gap-2 text-on-surface-variant py-2 px-3 font-label-md bg-surface-container-low rounded-lg"
              >
                <Phone className="w-4 h-4 text-secondary" />
                <span>Helpline: +91 8850 40 9901</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 w-full text-center py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container shadow-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-secondary-fixed" />
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-lg border border-outline-variant/40 text-primary font-label-md font-semibold hover:bg-surface-container"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/demo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container shadow-sm"
                    >
                      Book Demo
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Language Switcher Toast Notification */}
      {langToast && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-lg shadow-xl font-label-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 border border-secondary/40">
          <Check className="w-4 h-4 text-secondary-fixed" />
          <span>{langToast}</span>
        </div>
      )}
    </>
  );
}
