"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Profile, ActivityCategory } from "@/types";

const PREFS: ActivityCategory[] = [
  "soirees", "concerts", "expositions", "restaurants", "bars",
  "sport", "culture", "famille", "etudiants", "networking", "loisirs",
];

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ username: "", bio: "", preferred_language: "fr" });
  const [prefs, setPrefs] = useState<ActivityCategory[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push(`/${locale}/auth/login`); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({ username: data.username || "", bio: data.bio || "", preferred_language: "fr" });
        setPrefs(data.preferences || []);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, preferences: prefs, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      setSaveError("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const togglePref = (cat: ActivityCategory) =>
    setPrefs((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <Input
          label="Pseudo"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Mes préférences</label>
          <div className="flex flex-wrap gap-2">
            {PREFS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => togglePref(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  prefs.includes(cat)
                    ? "bg-brand-navy text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        {saveError && <p className="text-sm text-brand-red">{saveError}</p>}
        <Button onClick={save} loading={saving} className="w-full">
          {saved ? "✓ Enregistré !" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
