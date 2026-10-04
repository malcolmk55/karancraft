import * as React from "react";
import { cn } from "@/lib/utils";
import { SexType } from "@/types/medical";
import { Mars, Venus } from "lucide-react";

export interface PatientAvatarProps {
  sex?: SexType | string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PatientAvatar({
  sex,
  name,
  size = "md",
  className,
}: PatientAvatarProps) {
  const isFemale =
    sex === "female" ||
    sex === "زن" ||
    (name && (name.includes("خانم") || name.includes("زهرا") || name.includes("مریم") || name.includes("نسرین") || name.includes("سارا")));

  const sizeClasses = {
    xs: "h-7 w-7 rounded-lg",
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
    xl: "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl",
  };

  const svgSizes = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10 sm:h-12 sm:w-12",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-700/70 dark:bg-slate-800 dark:text-slate-300 shadow-2xs transition-colors",
        sizeClasses[size],
        className
      )}
      aria-label={isFemale ? "بیمار خانم" : "بیمار آقا"}
    >
      {isFemale ? (
        // Clean, professional female avatar SVG
        <Venus />
      ) : (
        // Clean, professional male avatar SVG
        <Mars/>
      )}
    </div>
  );
}
