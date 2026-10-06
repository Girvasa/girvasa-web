import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { TenantProvider } from "@/lib/tenant/TenantContext";

export const metadata: Metadata = {
  title: "Girvasa — Society Administration Portal",
  description: "Enterprise multi-tenant society management and administration portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>
          <TenantProvider>{children}</TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
