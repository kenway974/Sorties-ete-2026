"use client";
import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

const DISMISSED_KEY = "ps_push_dismissed";

export default function PushPrompt({ userId }: { userId: string | null }) {
  const [visible, setVisible] = useState(false);
  const { state, subscribed, loading, subscribe } = usePushNotifications(userId);

  useEffect(() => {
    if (!userId) return;
    if (state === "unsupported" || state === "denied" || subscribed) return;
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {}
    // Delay to avoid competing with page load animations
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [userId, state, subscribed]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch {}
    setVisible(false);
  };

  const handleSubscribe = async () => {
    await subscribe();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40 animate-slide-up">
      <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-navy/30 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Ne ratez plus rien
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Recevez une alerte la veille des activités que vous avez ajoutées en favoris.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-3 py-1.5 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors disabled:opacity-60"
            >
              {loading ? "…" : "Activer"}
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
