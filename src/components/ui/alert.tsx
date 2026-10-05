import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const iconMap = {
    info: <Info className="h-5 w-5 text-sky-400 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
  };

  const borderStyles = {
    info: "border-sky-800/60 bg-sky-950/40 text-sky-200",
    success: "border-emerald-800/60 bg-emerald-950/40 text-emerald-200",
    warning: "border-amber-800/60 bg-amber-950/40 text-amber-200",
    error: "border-rose-800/60 bg-rose-950/40 text-rose-200",
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-sm",
        borderStyles[variant],
        className,
      )}
      {...props}
    >
      {iconMap[variant]}
      <div className="space-y-1 text-sm">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
