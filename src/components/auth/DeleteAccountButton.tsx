"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountButton() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText.trim().toUpperCase() === "SUPPRIMER";

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: fnErr } = await supabase.functions.invoke("delete-account", { body: {} });
    if (fnErr || !data?.ok) {
      setError("La suppression a échoué. Réessayez ou contactez-nous.");
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-brand-red mb-3">Zone de danger</h2>
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Supprimer mon compte</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-sm">
              Efface définitivement votre compte et vos données (favoris, collections, avis…).
              Action irréversible.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 px-4 py-2 rounded-xl border border-brand-red text-brand-red text-sm font-medium hover:bg-brand-red hover:text-white transition-colors"
        >
          Supprimer
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer définitivement votre compte ?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Toutes vos données personnelles seront effacées. Vos activités publiées approuvées seront anonymisées.
              Cette action ne peut pas être annulée.
            </p>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Tapez <strong>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-red/50 mb-4"
              placeholder="SUPPRIMER"
            />
            {error && <p className="text-sm text-brand-red mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-red text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression…</> : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}