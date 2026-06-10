"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PushToggle from "@/components/notifications/PushToggle";
import DeleteAccountButton from "@/components/auth/DeleteAccountButton";
import UserBadges from "@/components/profile/UserBadges";
import type { BadgeStats } from "@/components/profile/UserBadges";
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
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push(`/${locale}/auth/login`); return; }
      const [profileRes, regCount, reviewCount, activityCount] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("activity_registrations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("activities").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
      ]);
      if (profileRes.data) {
        const data = profileRes.data;
        setProfile(data);
        setForm({ username: data.username || "", bio: data.bio || "", preferred_language: "fr" });
        setPrefs(data.preferences || []);
        setBadgeStats({
          activitiesRegistered: regCount.count ?? 0,
          activitiesCreated: activityCount.count ?? 0,
          reviewsWritten: reviewCount.count ?? 0,
          profileComplete: !!(data.username && data.bio && data.preferences?.length > 0),
        });
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Mon profil</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
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

      {badgeStats && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <UserBadges stats={badgeStats} />
        </div>
      )}

      {profile && (
        <div className="mt-6">
          <Link
            href={`/${locale}/profile/my-events`}
            className="flex items-center justify-between w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:border-brand-navy dark:hover:border-brand-gold transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/8 dark:bg-brand-gold/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mes activités</p>
                <p className="text-xs text-gray-400">Dashboard organisateur</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors text-lg">→</span>
          </Link>
        </div>
      )}

      {profile && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Notifications</h2>
          <PushToggle userId={profile.id} />
        </div>
      )}

      {profile && <DeleteAccountButton />}
    </div>
  );
}
