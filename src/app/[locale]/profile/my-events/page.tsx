import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import type { Activity } from "@/types";

export const metadata: Metadata = {
  title: "Mes activités | ParisSorties",
  robots: { index: false, follow: false },
};

const STATUS_CONFIG: Record<string, { label: string; Icon: React.ElementType; cls: string }> = {
  approved: { label: "Approuvé", Icon: CheckCircle, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
  pending:  { label: "En attente", Icon: Clock,        cls: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"   },
  rejected: { label: "Refusé",    Icon: XCircle,      cls: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"            },
};

export default async function MyEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: myActivities } = await supabase
    .from("activities")
    .select("*, photos:activity_photos(id, url)")
    .eq("creator_id", user.id)
    .order("date", { ascending: false });

  const activities = (myActivities || []) as Activity[];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = activities.filter((a) => a.date >= today);
  const totalParticipants = activities.reduce((s, a) => s + a.current_participants, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-brand-gold mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Profil
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes activités</h1>
        </div>
        <Link
          href={`/${locale}/propose`}
          className="flex items-center gap-1.5 text-sm font-semibold bg-brand-navy text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Proposer
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: activities.length, Icon: Calendar },
          { label: "À venir", value: upcoming.length, Icon: Clock },
          { label: "Inscrits", value: totalParticipants, Icon: Users },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <Icon className="w-5 h-5 text-brand-navy dark:text-brand-gold mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16 bg-brand-cream dark:bg-gray-800/40 rounded-3xl">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Vous n&apos;avez pas encore proposé d&apos;activité</p>
          <Link
            href={`/${locale}/propose`}
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Proposer ma première activité
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const cfg = STATUS_CONFIG[activity.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.Icon;
            const isPast = activity.date < today;
            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 transition-opacity ${isPast ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{activity.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(activity.date, "fr")} · {formatTime(activity.time)}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{activity.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-brand-navy dark:text-brand-gold">
                      {activity.current_participants}
                      {activity.max_participants != null && (
                        <span className="text-sm text-gray-400 font-normal">/{activity.max_participants}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">inscrits</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50">
                  <Link
                    href={`/${locale}/activities/${activity.id}`}
                    className="text-xs text-brand-navy dark:text-brand-gold font-medium hover:underline"
                  >
                    Voir la page →
                  </Link>
                  <Link
                    href={`/${locale}/profile/my-events/${activity.id}/edit`}
                    className="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-brand-navy dark:hover:text-brand-gold transition-colors"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
