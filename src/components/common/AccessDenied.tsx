import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";

export const AccessDenied: React.FC<{ message?: string }> = ({
  message = "You do not have administrative permission to view this section for the current society.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-amber-100 bg-amber-50/40 my-8">
      <div className="rounded-full bg-amber-100 p-4 text-amber-600 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">Access Restricted (403)</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md">{message}</p>
      <div className="mt-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
