"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-brand-navy hover:bg-brand-navy-dark text-white shadow-sm hover:shadow-md active:scale-[0.98]",
  secondary: "bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold shadow-sm hover:shadow-glow-gold active:scale-[0.98]",
  outline: "border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white dark:border-brand-gold dark:text-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy",
  ghost: "text-brand-navy hover:bg-brand-navy/8 dark:text-gray-200 dark:hover:bg-white/10",
  danger: "bg-brand-red hover:bg-red-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/50 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
