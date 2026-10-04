import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
        emerald:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        amber:
          "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-400",
        warning:
          "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-400",
        rose: "border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-400",
        danger:
          "border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-400",
        purple:
          "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
        outline: "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
