import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        "bg-[#E8E8E6] text-[#080808] hover:bg-[#D6D6D4] active:bg-[#FFFFFF] font-medium border border-transparent shadow-none",
      secondary:
        "bg-transparent text-[#E5E5E5] border border-white/15 hover:bg-white/[0.06] hover:text-white shadow-none",
      outline:
        "border border-white/10 bg-transparent text-[#D0D0CE] hover:bg-white/[0.04] hover:text-white",
      ghost: "bg-transparent text-[#909090] hover:text-[#F5F5F3] hover:bg-white/[0.04]",
      destructive:
        "bg-rose-950/80 text-rose-300 border border-rose-800/40 hover:bg-rose-900/80 shadow-none",
      link: "bg-transparent text-[#E8E8E6] underline-offset-4 hover:underline p-0 focus:ring-0",
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
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-1.5" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
