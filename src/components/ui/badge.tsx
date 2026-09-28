import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-200 border-slate-700",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    error: "bg-rose-950/80 text-rose-300 border-rose-800/60",
    info: "bg-sky-950/80 text-sky-300 border-sky-800/60",
    outline: "bg-transparent text-slate-300 border-slate-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
