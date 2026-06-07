"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Check, Trash2, X, BookMarked } from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/types";

interface Props {
  collectionId: string;
  title: string;
  activities: Activity[];
  isOwner: boolean;
  locale: string;
}

export default function CollectionContent({ collectionId, title, activities: initial, isOwner, locale }: Props) {
  const router = useRouter();
  const [activities, setActivities] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, text: `Découvre ma collection « ${title} » sur ParisSorties`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const removeItem = async (activityId: string) => {
    const supabase = createClient();
    await supabase.from("collection_items").delete().match({ collection_id: collectionId, activity_id: activityId });
    setActivities((a) => a.filter((x) => x.id !== activityId));
  };

  const deleteCollection = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("collections").delete().eq("id", collectionId);
    router.push(`/${locale}/collections`);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={share}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-navy dark:hover:border-brand-gold text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
        >
          {copied ? <><Check className="w-4 h-4 text-green-500" /> Lien copié</> : <><Share2 className="w-4 h-4" /> Partager</>}
        </button>
        {isOwner && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-red text-sm font-medium text-gray-500 hover:text-brand-red transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Cette collection est vide.</p>
          <p className="text-sm mt-1">Ajoutez des activités depuis leur page de détail.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activities.map((activity) => (
            <div key={activity.id} className="relative group">
              {isOwner && (
                <button
                  onClick={() => removeItem(activity.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 hover:bg-brand-red hover:text-white transition-all"
                  title="Retirer de la collection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer cette collection ?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                Annuler
              </button>
              <button onClick={deleteCollection} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}