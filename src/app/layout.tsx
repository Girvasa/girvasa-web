import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { TenantProvider } from "@/lib/tenant/TenantContext";

import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://girvasa.io"
  ),
  title: {
    default: "Girvasa (Society OS) — Housing Society ERP & Gated Community OS",
    template: "%s | Girvasa (Society OS)",
  },
  description:
    "Automate maintenance billing, guard check-ins, double-entry accounting audits, and committee governance without paperwork or resident disputes. Built for Indian CHS and RWAs.",
  applicationName: "Girvasa Society OS",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/girvasa-logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Girvasa (Society OS) — Housing Society ERP & Gated Community OS",
    description:
      "Automated maintenance billing, guard check-ins, double-entry accounting audits, and committee governance for Indian housing societies.",
    siteName: "Girvasa Society OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Girvasa (Society OS)",
    description:
      "Digital Operating System for Housing Societies & Gated Communities.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-slate-50 antialiased font-sans">
        <AuthProvider>
          <TenantProvider>{children}</TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
