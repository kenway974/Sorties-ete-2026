"use client";
import { useState } from "react";
import { Users, Activity, Clock, Flag, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatters";
import type { Activity as ActivityType } from "@/types";

interface Props {
  pendingActivities: ActivityType[];
  stats: { users: number; activities: number; pending: number; reports: number };
}

export default function AdminClient({ pendingActivities: initial, stats }: Props) {
  const [pending, setPending] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);

  const handle = async (id: string, status: "approved" | "rejected") => {
    setProcessing(id);
    const supabase = createClient();
    await supabase.from("activities").update({ status }).eq("id", id);
    setPending((p) => p.filter((a) => a.id !== id));
    setProcessing(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Utilisateurs", value: stats.users, color: "text-blue-600 bg-blue-50" },
          { icon: Activity, label: "Activités", value: stats.activities, color: "text-green-600 bg-green-50" },
          { icon: Clock, label: "En attente", value: stats.pending, color: "text-amber-600 bg-amber-50" },
          { icon: Flag, label: "Signalements", value: stats.reports, color: "text-red-600 bg-red-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">File de modération</h2>
      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun contenu en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="gray">{activity.category}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(activity.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{activity.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.address} — {formatDate(activity.date)} {activity.time?.slice(0, 5)}
                  </p>
                  {activity.creator && (
                    <p className="text-xs text-gray-400">Par: {activity.creator.username}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handle(activity.id, "approved")}
                    disabled={processing === activity.id}
                    className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    title="Approuver"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handle(activity.id, "rejected")}
                    disabled={processing === activity.id}
                    className="p-2 rounded-xl bg-red-50 text-brand-red hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Refuser"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
