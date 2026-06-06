"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookMarked, Globe, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewCollectionPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Connectez-vous pour creer une collection."); setLoading(false); return; }
    const { data, error: err } = await supabase
      .from("collections")
      .insert({ title: title.trim(), description: description.trim() || null, is_public: isPublic, user_id: user.id })
      .select()
      .single();
    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/${locale}/collections/${data.id}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href={`/${locale}/collections`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy dark:hover:text-brand-gold mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour aux collections
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-navy/10 dark:bg-brand-navy/30 flex items-center justify-center">
          <BookMarked className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nouvelle collection</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Titre *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mes bars a cocktails preferes..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/50 transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Decrivez votre selection..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/50 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visibilite</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: true, icon: Globe, label: "Publique", desc: "Visible par tous" },
              { v: false, icon: Lock, label: "Privee", desc: "Visible uniquement par vous" },
            ].map(({ v, icon: Icon, label, desc }) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setIsPublic(v)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                  isPublic === v
                    ? "bg-brand-navy border-brand-navy text-white"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-navy"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className={`text-xs ${isPublic === v ? "text-white/70" : "text-gray-400"}`}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full py-3.5 rounded-2xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:scale-100"
        >
          {loading ? "Creation..." : "Creer la collection"}
        </button>
      </form>
    </div>
  );
}