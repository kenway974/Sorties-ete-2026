import { cn } from "@/lib/utils/cn";

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Chargement" className={cn("flex items-center justify-center py-12", className)}>
      <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin" />
    </div>
  );
}
