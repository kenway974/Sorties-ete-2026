import { cn } from "@/lib/utils/cn";

const variantStyles = {
  navy: "bg-brand-navy text-white",
  gold: "bg-brand-gold text-white",
  red: "bg-brand-red text-white",
  green: "bg-green-500 text-white",
  gray: "bg-gray-100 text-gray-700",
  outline: "border border-brand-navy text-brand-navy",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
  className?: string;
}

export default function Badge({ children, variant = "navy", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
