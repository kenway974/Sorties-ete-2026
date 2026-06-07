"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "ps_cookie_ack";

export default function CookieConsent({ locale }: { locale: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-slide-up">
      <div className="max-w-3xl mx-auto glass rounded-2xl shadow-glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            ParisSorties utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement.
            La mesure d&apos;audience est anonyme et sans cookie.{" "}
            <Link href={`/${locale}/legal/confidentialite`} className="underline text-brand-navy dark:text-brand-gold">
              En savoir plus
            </Link>
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 w-full sm:w-auto px-5 py-2 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark active:scale-95 transition-all"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}