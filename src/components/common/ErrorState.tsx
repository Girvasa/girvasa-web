import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message = "An error occurred while communicating with the Society OS backend. Please verify your connection or try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-red-100 bg-red-50/50">
      <div className="rounded-full bg-red-100 p-3 text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-700 max-w-md">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="danger" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
