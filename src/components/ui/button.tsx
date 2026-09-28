import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700",
      outline:
        "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 focus:ring-slate-500",
      ghost:
        "bg-transparent text-slate-300 hover:bg-slate-800/60 focus:ring-slate-500",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
      link: "bg-transparent text-indigo-400 underline-offset-4 hover:underline p-0 focus:ring-0",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0 justify-center",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-1.5" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
