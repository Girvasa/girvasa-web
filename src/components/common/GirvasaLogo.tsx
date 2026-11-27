import React from "react";
import { cn } from "@/lib/utils";

export interface GirvasaLogoProps {
  /** Square icon size in pixels. Defaults to 36. */
  size?: number;
  /** Visual presentation: "auto" renders navy mark on transparent plate, "white" renders light mark for dark backgrounds, "plated" adds a soft white card frame. */
  variant?: "default" | "white" | "plated";
  /** Optional className for wrapper styling (e.g. group-hover transitions). */
  className?: string;
}

/**
 * Official Girvasa Society OS brand mark component.
 * Uses crisp vector SVG artwork (`/brand/girvasa-logo*.svg`) for consistent rendering across web views.
 */
export const GirvasaLogo: React.FC<GirvasaLogoProps> = ({
  size = 36,
  variant = "plated",
  className,
}) => {
  const src =
    variant === "white"
      ? "/brand/girvasa-logo-white.svg"
      : "/brand/girvasa-logo.svg";

  if (variant === "default" || variant === "white") {
    return (
      <img
        src={src}
        alt="Girvasa"
        width={size}
        height={size}
        className={cn("shrink-0 object-contain select-none", className)}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-slate-200/80 shadow-sm select-none",
        className
      )}
    >
      <img
        src={src}
        alt="Girvasa"
        className="w-full h-full object-contain"
      />
    </span>
  );
};

