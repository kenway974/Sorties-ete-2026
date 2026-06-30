"use client";
import { useState, type ChangeEventHandler } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MOODS } from "@/lib/constants/moods";
import type { ActivityCategory, ActivityMood } from "@/types";

const CATEGORIES: ActivityCategory[] = [
  "soirees", "concerts", "expositions", "restaurants", "bars",
  "sport", "culture", "famille", "etudiants", "networking", "loisirs", "salons",
];

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking",
  loisirs: "Loisirs", salons: "Salons & Conventions",
};

const VIBE_TAGS = [
  { key: "festif", emoji: "🎉", label: "Festif" },
  { key: "live-music", emoji: "🎵", label: "Live Music" },
  { key: "art", emoji: "🎨", label: "Art & Créatif" },
  { key: "gastronomie", emoji: "🍽️", label: "Gastro" },
  { key: "sport", emoji: "💪", label: "Sportif" },
  { key: "plein-air", emoji: "🌿", label: "Plein air" },
  { key: "culture", emoji: "🏛️", label: "Culture" },
  { key: "famille", emoji: "👨‍👩‍👧", label: "Famille" },
];

// Suggest vibe tags based on selected category
const CATEGORY_VIBES: Partial<Record<ActivityCategory, string[]>> = {
  soirees: ["festif"],
  concerts: ["live-music", "festif"],
  expositions: ["art", "culture"],
  restaurants: ["gastronomie"],
  bars: ["festif"],
  sport: ["sport"],
  culture: ["culture"],
  famille: ["famille"],
};

// Suggest moods based on selected category (mirrors the import inference defaults)
const CATEGORY_MOODS: Partial<Record<ActivityCategory, ActivityMood[]>> = {
  soirees: ["rencontrer", "decompresser"],
  concerts: ["decompresser", "solo", "decouvrir"],
  expositions: ["solo", "esprit", "decouvrir"],
  restaurants: ["rencontrer"],
  bars: ["rencontrer", "decompresser"],
  sport: ["ressourcer", "air"],
  culture: ["esprit", "solo", "decouvrir"],
  famille: ["air"],
  etudiants: ["rencontrer", "decompresser"],
  networking: ["rencontrer", "esprit"],
  loisirs: ["decompresser", "decouvrir"],
  salons: ["decouvrir", "rencontrer"],
};

interface ProposeFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function ProposeForm({ userId, onSuccess }: ProposeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "" as ActivityCategory | "",
    tags: [] as string[], moods: [] as ActivityMood[], address: "", date: "", time: "",
    max_participants: "", price: "", external_url: "",
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value as ActivityCategory | "";
    // Auto-suggest vibe tags + moods when category changes (non-destructive: only adds)
    const suggestedTags = cat ? (CATEGORY_VIBES[cat as ActivityCategory] ?? []) : [];
    const suggestedMoods = cat ? (CATEGORY_MOODS[cat as ActivityCategory] ?? []) : [];
    setForm((f) => ({
      ...f,
      category: cat,
      tags: [...new Set([...f.tags, ...suggestedTags])],
      moods: [...new Set([...f.moods, ...suggestedMoods])],
    }));
  };

  const toggleTag = (key: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(key) ? f.tags.filter((t) => t !== key) : [...f.tags, key],
    }));
  };

  const toggleMood = (key: ActivityMood) => {
    setForm((f) => ({
      ...f,
      moods: f.moods.includes(key) ? f.moods.filter((m) => m !== key) : [...f.moods, key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.address || !form.date || !form.time) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) {
        setError("Vous devez vérifier votre adresse email avant de proposer une activité. Consultez votre boîte mail.");
        setLoading(false);
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", userId)
        .gte("created_at", todayStart.toISOString());
      if ((count ?? 0) >= 3) {
        setError("Vous avez atteint la limite de 3 propositions par jour. Réessayez demain.");
        setLoading(false);
        return;
      }

      let lat = 48.8566;
      let lng = 2.3522;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address + ", Paris, France")}&format=json&limit=1`,
          { headers: { "User-Agent": "MoodMap/1.0 (contact@paris-sorties.fr)" }, signal: controller.signal }
        );
        clearTimeout(timeout);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData[0]) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); }
        }
      } catch {
        // Nominatim timeout or error — fallback to Paris center
      }

      const { data: inserted, error: err } = await supabase.from("activities").insert({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags,
        moods: form.moods,
        address: form.address,
        lat,
        lng,
        date: form.date,
        time: form.time,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        price: form.price ? parseFloat(form.price) : null,
        external_url: form.external_url || null,
        status: "pending",
        creator_id: userId,
        current_participants: 0,
      }).select("id").single();
      if (err) throw err;

      if (inserted?.id) {
        supabase.functions.invoke("moderate-activity", {
          body: { activityId: inserted.id },
        }).catch(() => {});
      }

      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titre" value={form.title} onChange={set("title")} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          value={form.description}
          onChange={set("description") as ChangeEventHandler<HTMLTextAreaElement>}
          rows={4}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
        <select
          value={form.category}
          onChange={handleCategoryChange}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold"
        >
          <option value="">--</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Vibe tags */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ambiance{" "}
          <span className="font-normal text-gray-400">(optionnel · aide les utilisateurs à trouver ton événement)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {VIBE_TAGS.map(({ key, emoji, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => toggleTag(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                form.tags.includes(key)
                  ? "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Moods / envies */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quelle envie ?{" "}
          <span className="font-normal text-gray-400">(optionnel · pour qui / quel état d&apos;esprit)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(({ key, emoji, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => toggleMood(key as ActivityMood)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                form.moods.includes(key as ActivityMood)
                  ? "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      <Input label="Adresse" value={form.address} onChange={set("address")} required placeholder="10 rue de Rivoli, Paris" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" value={form.date} onChange={set("date")} required min={new Date().toISOString().split("T")[0]} />
        <Input label="Heure" type="time" value={form.time} onChange={set("time")} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Places max" type="number" min="1" value={form.max_participants} onChange={set("max_participants")} />
        <Input label="Prix (€)" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
      </div>

      <Input label="Lien externe" type="url" value={form.external_url} onChange={set("external_url")} placeholder="https://..." />

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Proposer l&apos;activité
      </Button>
    </form>
  );
}
