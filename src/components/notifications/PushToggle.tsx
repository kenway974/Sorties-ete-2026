"use client";
import { Bell, BellOff, BellRing } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

export default function PushToggle({ userId }: { userId: string }) {
  const { state, subscribed, loading, subscribe, unsubscribe } = usePushNotifications(userId);

  if (state === "unsupported") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-sm">
        <BellOff className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les notifications push ne sont pas supportées sur cet appareil/navigateur.</p>
      </div>
    );
  }

  const denied = state === "denied";

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-brand-cream dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          subscribed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold"
        }`}>
          {subscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rappels d&apos;activités</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">
            {denied
              ? "Notifications bloquées. Autorisez-les dans les réglages de votre navigateur."
              : subscribed
              ? "Vous recevrez un rappel la veille de vos sorties en favori."
              : "Activez pour être rappelé la veille de vos sorties sauvegardées."}
          </p>
        </div>
      </div>
      {!denied && (
        <button
          onClick={subscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
            subscribed
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
              : "bg-brand-navy text-white hover:bg-brand-navy-dark"
          }`}
        >
          {loading ? "..." : subscribed ? "Désactiver" : "Activer"}
        </button>
      )}
    </div>
  );
}
