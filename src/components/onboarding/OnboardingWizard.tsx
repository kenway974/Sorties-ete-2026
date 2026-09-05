"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, X, Check } from "lucide-react";
import { CURIOSITES } from "@/lib/constants/curiosites";

const ARRONDISSEMENTS = [
  "1er", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "10e",
  "11e", "12e", "13e", "14e", "15e", "16e", "17e", "18e", "19e", "20e",
];


const BUDGETS = [
  { key: "free", label: "Gratuit uniquement", desc: "Que du 0€" },
  { key: "low", label: "Petit budget", desc: "< 20€" },
  { key: "medium", label: "Budget moyen", desc: "20–50€" },
  { key: "any", label: "Peu importe", desc: "Tout voir" },
];

const KEY = "ps_onboarded";

export default function OnboardingWizard({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [arrond, setArrond] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  const dismiss = (save = false) => {
    setExiting(true);
    if (save) {
      try { localStorage.setItem("ps_prefs", JSON.stringify({ arrond, cats, budget })); } catch {}
    }
    try { localStorage.setItem(KEY, "1"); } catch {}
    setTimeout(() => setVisible(false), 280);
  };

  const finish = () => {
    dismiss(true);
    const params = new URLSearchParams();
    if (cats.length === 1) params.set("curiosite", cats[0]);
    if (budget === "free") params.set("price", "free");
    router.push(`/${locale}/activities${params.toString() ? "?" + params.toString() : ""}`);
  };

  if (!visible) return null;

  const STEPS = [
    {
      title: "Ton quartier préféré ?",
      subtitle: "On mettra les activités proches en avant.",
      content: (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {ARRONDISSEMENTS.map((a) => (
            <button
              key={a}
              onClick={() => setArrond((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])}
              className={`py-2 px-1 rounded-xl text-sm font-medium border-2 transition-all ${
                arrond.includes(a)
                  ? "bg-brand-navy border-brand-navy text-white scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-navy"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Tes envies du moment ?",
      subtitle: "Sélectionne une ou plusieurs catégories.",
      content: (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CURIOSITES.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => setCats((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key])}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${
                cats.includes(key)
                  ? "bg-brand-navy border-brand-navy text-white scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-navy"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Ton budget habituel ?",
      subtitle: "Pour filtrer les activités selon ton portefeuille.",
      content: (
        <div className="space-y-3">
          {BUDGETS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setBudget(key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                budget === key
                  ? "bg-brand-navy border-brand-navy text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-navy text-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="text-left">
                <p className="font-semibold text-sm">{label}</p>
                <p className={`text-xs ${budget === key ? "text-white/70" : "text-gray-400"}`}>{desc}</p>
              </div>
              {budget === key && <Check className="w-5 h-5 shrink-0" />}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dismiss()} />

      {/* Modal */}
      <div className={`relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${exiting ? "translate-y-4 scale-95" : "translate-y-0 scale-100"}`}>
        {/* Header */}
        <div className="bg-brand-navy px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-gold/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-gold" />
              </div>
              <span className="text-white font-bold text-sm">Personnalise ton expérience</span>
            </div>
            <button onClick={() => dismiss()} className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-brand-gold" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{current.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{current.subtitle}</p>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-none">{current.content}</div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => dismiss()}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Passer
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 transition-colors"
              >
                Retour
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-brand-navy-dark hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {isLast ? "C'est parti !" : "Suivant"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-brand-navy w-4" : "bg-gray-300 dark:bg-gray-600"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
