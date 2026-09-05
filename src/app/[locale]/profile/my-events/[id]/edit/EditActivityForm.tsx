"use client";
import { useState, type ChangeEventHandler } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import ActivityPhotoUpload from "@/components/activities/ActivityPhotoUpload";
import { CURIOSITES, curiosity as curiosityOf } from "@/lib/constants/curiosites";
import type { Activity, CuriosityKey } from "@/types";


interface Props {
  activity: Activity;
  locale: string;
}

export default function EditActivityForm({ activity, locale }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title:            activity.title,
    description:      activity.description,
    curiosity:         activity.curiosity as CuriosityKey | "",
    tags:             activity.tags?.join(", ") ?? "",
    address:          activity.address,
    date:             activity.date,
    time:             activity.time,
    max_participants: activity.max_participants?.toString() ?? "",
    price:            activity.price?.toString() ?? "",
    external_url:     activity.external_url ?? "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.curiosity || !form.address || !form.date || !form.time) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      // Re-geocode if address changed
      let lat = activity.lat;
      let lng = activity.lng;
      if (form.address !== activity.address) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address + ", Paris, France")}&format=json&limit=1`,
            { headers: { "User-Agent": "Hors-Piste/1.0" }, signal: ctrl.signal }
          );
          clearTimeout(t);
          if (geo.ok) {
            const d = await geo.json();
            if (d[0]) { lat = parseFloat(d[0].lat); lng = parseFloat(d[0].lon); }
          }
        } catch { /* geocoding failed, keep existing coords */ }
      }

      const { error: err } = await supabase
        .from("activities")
        .update({
          title:            form.title,
          description:      form.description,
          curiosity:         form.curiosity,
          tags:             form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          address:          form.address,
          lat,
          lng,
          date:             form.date,
          time:             form.time,
          max_participants: form.max_participants ? parseInt(form.max_participants) : null,
          price:            form.price !== "" ? parseFloat(form.price) : null,
          external_url:     form.external_url || null,
          status:           "pending",
          updated_at:       new Date().toISOString(),
        })
        .eq("id", activity.id);

      if (err) throw err;
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Modifications enregistrées !</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Votre activité est repassée en attente de validation.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href={`/${locale}/profile/my-events`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1 inline" />
              Mes activités
            </Button>
          </Link>
          <Link href={`/${locale}/activities/${activity.id}`}>
            <Button>Voir la page →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={`/${locale}/profile/my-events`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      <Input label="Titre *" value={form.title} onChange={set("title")} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
        <textarea
          value={form.description}
          onChange={set("description") as ChangeEventHandler<HTMLTextAreaElement>}
          rows={4}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie *</label>
        <select
          value={form.curiosity}
          onChange={set("curiosity") as ChangeEventHandler<HTMLSelectElement>}
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        >
          <option value="">--</option>
          {CURIOSITES.map((c) => (
            <option key={c.key} value={c.key}>{c.emoji}  {c.label} — {c.tagline}</option>
          ))}
        </select>
      </div>

      <Input label="Tags" value={form.tags} onChange={set("tags")} placeholder="musique, dj, électro" />
      <Input label="Adresse *" value={form.address} onChange={set("address")} required placeholder="10 rue de Rivoli, Paris" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date *" type="date" value={form.date} onChange={set("date")} required />
        <Input label="Heure *" type="time" value={form.time} onChange={set("time")} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Places max" type="number" min="1" value={form.max_participants} onChange={set("max_participants")} />
        <Input label="Prix (€)" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
      </div>

      <Input label="Lien externe" type="url" value={form.external_url} onChange={set("external_url")} placeholder="https://..." />

      <ActivityPhotoUpload
        activityId={activity.id}
        userId={activity.creator_id}
        initialPhotos={(activity.photos ?? []) as { id: string; url: string }[]}
        activityTitle={activity.title}
      />

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Enregistrer les modifications
      </Button>
    </form>
  );
}
