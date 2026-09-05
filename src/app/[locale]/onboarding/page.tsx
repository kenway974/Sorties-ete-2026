"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, ChevronRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { CURIOSITES } from "@/lib/constants/curiosites";
import type { CuriosityKey } from "@/types";


export default function OnboardingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<CuriosityKey[]>([]);
  const [saving, setSaving] = useState(false);

  const togglePref = (cat: CuriosityKey) =>
    setPrefs((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]));

  const finish = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ preferences: prefs }).eq("id", user.id);
    }
    router.replace(`/${locale}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-brand-navy" : "bg-gray-200 dark:bg-gray-700"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-navy rounded-2xl mb-6 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Bienvenue sur<br />Hors-Piste
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
              En 30 secondes, dis-nous ce qui t&apos;intéresse et on personnalise ton expérience parisienne.
            </p>
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
              Commencer <ChevronRight className="w-4 h-4 ml-1 inline" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Tes envies</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Choisis les catégories qui t&apos;intéressent (optionnel)
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CURIOSITES.map(({ key, emoji, label }) => {
                const selected = prefs.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePref(key)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20"
                        : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-navy flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                    <span className="text-2xl">{emoji}</span>
                    <span className={`text-xs font-medium leading-tight text-center ${selected ? "text-brand-navy dark:text-brand-gold" : "text-gray-600 dark:text-gray-300"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>Retour</Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center animate-fade-in-up">
            <div className="text-6xl mb-5">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">C&apos;est parti !</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
              {prefs.length > 0
                ? `Super ! On a noté ${prefs.length} catégorie${prefs.length > 1 ? "s" : ""}. Ton feed sera personnalisé dès maintenant.`
                : "Tu découvriras toutes les activités parisiennes dans ton feed."}
            </p>
            <Button size="lg" className="w-full" loading={saving} onClick={finish}>
              Explorer Paris
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
