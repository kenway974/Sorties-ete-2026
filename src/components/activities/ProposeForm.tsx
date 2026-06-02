"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ActivityCategory } from "@/types";

const CATEGORIES: ActivityCategory[] = [
  "soirees", "concerts", "expositions", "restaurants", "bars",
  "sport", "culture", "famille", "etudiants", "networking", "loisirs",
];

interface ProposeFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function ProposeForm({ userId, onSuccess }: ProposeFormProps) {
  const t = useTranslations("propose.form");
  const tc = useTranslations("categories");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "" as ActivityCategory | "",
    tags: "", address: "", date: "", time: "",
    max_participants: "", price: "", external_url: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
      // Geocode address via Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address + ", Paris, France")}&format=json&limit=1`
      );
      const geoData = await geoRes.json();
      const lat = geoData[0] ? parseFloat(geoData[0].lat) : 48.8566;
      const lng = geoData[0] ? parseFloat(geoData[0].lon) : 2.3522;

      const { error: err } = await supabase.from("activities").insert({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
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
      });
      if (err) throw err;
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label={t("title")} value={form.title} onChange={set("title")} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t("description")}</label>
        <textarea
          value={form.description}
          onChange={set("description") as any}
          rows={4}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t("category")}</label>
        <select
          value={form.category}
          onChange={set("category") as any}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        >
          <option value="">--</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{tc(c)}</option>
          ))}
        </select>
      </div>

      <Input label={t("tags")} value={form.tags} onChange={set("tags")} placeholder="musique, dj, électro" />
      <Input label={t("address")} value={form.address} onChange={set("address")} required placeholder="10 rue de Rivoli, Paris" />

      <div className="grid grid-cols-2 gap-3">
        <Input label={t("date")} type="date" value={form.date} onChange={set("date")} required min={new Date().toISOString().split("T")[0]} />
        <Input label={t("time")} type="time" value={form.time} onChange={set("time")} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label={t("max_participants")} type="number" min="1" value={form.max_participants} onChange={set("max_participants")} />
        <Input label={t("price")} type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
      </div>

      <Input label={t("external_url")} type="url" value={form.external_url} onChange={set("external_url")} placeholder="https://..." />

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        {t("submit")}
      </Button>
    </form>
  );
}
