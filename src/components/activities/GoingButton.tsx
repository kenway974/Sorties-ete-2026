"use client";
import { Users2 } from "lucide-react";
import { useGoingStatus } from "@/lib/hooks/useGoingStatus";

interface GoingButtonProps {
  activityId: string;
  userId: string | null;
  className?: string;
}

export default function GoingButton({ activityId, userId, className = "" }: GoingButtonProps) {
  const { going, count, toggle, loading } = useGoingStatus(activityId, userId);

  return (
    <button
      onClick={toggle}
      disabled={loading || !userId}
      title={!userId ? "Connectez-vous pour indiquer votre intérêt" : undefined}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
        ${going
          ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600"
          : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-brand-navy hover:text-brand-navy dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
        } disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <Users2 className="w-4 h-4" />
      <span>{going ? "J'y vais ✓" : "J'y vais"}</span>
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
          ${going ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
