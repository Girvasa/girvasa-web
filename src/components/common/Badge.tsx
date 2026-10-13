import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "sm",
  ...props
}) => {
  const variants = {
    success: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    warning: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    danger: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
    info: "bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]",
    neutral: "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-sm font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
