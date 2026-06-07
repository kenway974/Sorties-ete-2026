"use client";
import { useState, useEffect, useCallback } from "react";
import { BookMarked, Plus, Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  activityId: string;
  userId: string | null;
  locale: string;
}

interface Col {
  id: string;
  title: string;
  is_public: boolean;
  has: boolean;
}

export default function AddToCollectionButton({ activityId, userId, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [cols, setCols] = useState<Col[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();
    const [{ data: collections }, { data: items }] = await Promise.all([
      supabase.from("collections").select("id, title, is_public").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("collection_items").select("collection_id").eq("activity_id", activityId),
    ]);
    const inSet = new Set((items ?? []).map((i) => i.collection_id));
    setCols((collections ?? []).map((c) => ({ ...c, has: inSet.has(c.id) })));
    setLoading(false);
  }, [userId, activityId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const toggle = async (col: Col) => {
    if (busyId) return;
    setBusyId(col.id);
    const supabase = createClient();
    if (col.has) {
      await supabase.from("collection_items").delete().match({ collection_id: col.id, activity_id: activityId });
    } else {
      await supabase.from("collection_items").insert({ collection_id: col.id, activity_id: activityId });
    }
    setCols((cs) => cs.map((c) => (c.id === col.id ? { ...c, has: !c.has } : c)));
    setBusyId(null);
  };

  const createAndAdd = async () => {
    if (!userId || !newTitle.trim()) return;
    setBusyId("new");
    const supabase = createClient();
    const { data: col } = await supabase
      .from("collections")
      .insert({ title: newTitle.trim(), is_public: true, user_id: userId })
      .select("id, title, is_public")
      .single();
    if (col) {
      await supabase.from("collection_items").insert({ collection_id: col.id, activity_id: activityId });
      setCols((cs) => [{ ...col, has: true }, ...cs]);
      setNewTitle("");
      setCreating(false);
    }
    setBusyId(null);
  };

  if (!userId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-navy dark:hover:border-brand-gold transition-colors"
        title="Ajouter à une collection"
        aria-label="Ajouter à une collection"
      >
        <BookMarked className="w-5 h-5 text-gray-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-slide-up sm:animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Ajouter à une collection</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : (
                <>
                  {cols.length === 0 && !creating && (
                    <p className="text-sm text-gray-400 text-center py-6">Aucune collection. Créez-en une !</p>
                  )}
                  {cols.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => toggle(col)}
                      disabled={busyId === col.id}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                        col.has
                          ? "border-brand-navy bg-brand-navy/5 dark:border-brand-gold dark:bg-brand-gold/10"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <BookMarked className="w-4 h-4 text-brand-navy dark:text-brand-gold shrink-0" />
                        {col.title}
                      </span>
                      {busyId === col.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : col.has ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600" />
                      )}
                    </button>
                  ))}
                </>
              )}

              {creating ? (
                <div className="flex gap-2 pt-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
                    placeholder="Nom de la collection"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-navy/50"
                  />
                  <button
                    onClick={createAndAdd}
                    disabled={!newTitle.trim() || busyId === "new"}
                    className="px-4 rounded-xl bg-brand-navy text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {busyId === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-brand-navy hover:text-brand-navy dark:hover:text-brand-gold transition-colors mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle collection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}