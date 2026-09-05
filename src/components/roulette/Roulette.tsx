"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shuffle, Heart, ArrowUpRight, MapPin, CalendarDays, Loader2, RotateCcw,
} from "lucide-react";
import { curiosity as curiosityOf, CURIOSITES } from "@/lib/constants/curiosites";
import { RARITY_FLOOR, rarityBand } from "@/lib/constants/rarity";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import { useFavorites } from "@/lib/hooks/useFavorites";
import RarityDial from "./RarityDial";
import type { Activity } from "@/types";

/** En dessous, on recharge un paquet sans attendre que l'écran soit vide. */
const REFILL_AT = 3;

interface RouletteProps {
  locale: string;
  userId: string | null;
}

/**
 * La Roulette — le point d'entrée du produit.
 *
 * On ne demande rien à l'utilisateur : ni son humeur, ni avec qui il sort, ni
 * ce qu'il cherche. On ne peut pas chercher ce dont on ignore l'existence, et
 * c'est précisément le problème de l'insolite. Alors on montre. Une sortie à
 * la fois, plein écran, et un seul bouton : « Encore ».
 *
 * Le seul réglage est le cadran d'insolite, qu'on monte comme on monte le son.
 */
export default function Roulette({ locale, userId }: RouletteProps) {
  const [deck, setDeck] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [epuise, setEpuise] = useState(false);
  const [minRarity, setMinRarity] = useState(RARITY_FLOOR);
  const [tirage, setTirage] = useState(0);

  // Mémorisé pour la session : on ne remontre pas deux fois la même chose.
  const seen = useRef<string[]>([]);
  const { favoriteIds, toggle } = useFavorites(userId);

  const piocher = useCallback(
    async (rarity: number, reset: boolean) => {
      setLoading(true);
      if (reset) seen.current = [];
      try {
        const params = new URLSearchParams({ rarity: String(rarity) });
        // On borne l'exclusion : au-delà, l'URL devient déraisonnable et le
        // vivier a de toute façon largement tourné.
        if (seen.current.length > 0) params.set("vus", seen.current.slice(-60).join(","));

        const res = await fetch(`/api/activities/roulette?${params}`);
        const json = await res.json();
        const tirees: Activity[] = json.activities ?? [];

        if (reset) {
          setDeck(tirees);
        } else {
          // Le vivier ignore les cartes déjà en main (elles ne sont « vues »
          // qu'une fois passées) : on dédoublonne à l'ajout.
          setDeck((prev) => {
            const deja = new Set(prev.map((a) => a.id));
            return [...prev, ...tirees.filter((a) => !deja.has(a.id))];
          });
        }
        setEpuise(Boolean(json.epuise) && tirees.length === 0);
      } catch {
        setEpuise(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    piocher(minRarity, true);
  }, [minRarity, piocher]);

  const courante = deck[0];

  const encore = useCallback(() => {
    if (!courante) return;
    seen.current.push(courante.id);
    setDeck((d) => d.slice(1));
    setTirage((t) => t + 1);
  }, [courante]);

  // Recharge en fond dès que le paquet s'amincit.
  useEffect(() => {
    if (!loading && !epuise && deck.length <= REFILL_AT) {
      piocher(minRarity, false);
    }
  }, [deck.length, loading, epuise, minRarity, piocher]);

  // Au clavier : espace pour enchaîner, G pour garder.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.code === "Space") { e.preventDefault(); encore(); }
      if (e.key.toLowerCase() === "g" && courante && userId) toggle(courante.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [encore, courante, userId, toggle]);

  const cur = courante ? curiosityOf(courante.curiosity) : CURIOSITES[0];
  const band = rarityBand(courante?.rarity);
  const photo = courante?.photos?.[0]?.url;
  const estFavori = courante ? favoriteIds.has(courante.id) : false;

  return (
    <div className="relative min-h-[100dvh] bg-ink-deep overflow-hidden grain">
      {/* Halos teintés à la curiosité de la carte affichée. */}
      <div
        className="halo w-[560px] h-[560px] -top-40 -left-32 transition-colors duration-700"
        style={{ backgroundColor: cur.hex }}
      />
      <div
        className="halo w-[420px] h-[420px] -bottom-32 -right-24 transition-colors duration-700"
        style={{ backgroundColor: cur.hexDeep }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col min-h-[100dvh]">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-3xl sm:text-4xl text-parchment leading-none">
              La <span className="text-gilded">Roulette</span>
            </h1>
            <p className="text-parchment/40 text-sm mt-1.5">
              On ne te demande rien. On montre.
            </p>
          </div>
          <Link
            href={`/${locale}/activities`}
            className="text-xs text-parchment/40 hover:text-parchment/80 transition-colors shrink-0 underline underline-offset-4"
          >
            Voir la liste
          </Link>
        </div>

        {/* La carte */}
        <div className="flex-1 flex items-center justify-center py-2">
          {loading && deck.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-parchment/40">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm">On fouille…</span>
            </div>
          ) : !courante ? (
            <div className="text-center text-parchment/60 max-w-sm">
              <p className="text-2xl font-display text-parchment mb-2">
                Tu as tout vu.
              </p>
              <p className="text-sm leading-relaxed mb-6">
                À ce niveau d&apos;insolite, le catalogue est épuisé. Baisse le
                cadran d&apos;un cran, ou reviens quand les agendas auront livré.
              </p>
              <button
                onClick={() => piocher(minRarity, true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-parchment/25 text-parchment/80 hover:bg-parchment/10 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Recommencer
              </button>
            </div>
          ) : (
            <article
              key={courante.id}
              className="w-full rounded-3xl overflow-hidden shadow-vitrine animate-deal bg-ink-soft"
            >
              {/* Visuel */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                {photo ? (
                  <Image
                    src={photo}
                    alt=""
                    fill
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${cur.gradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent" />

                {/* Bandeau de curiosité */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span
                    style={{ backgroundColor: cur.hex }}
                    className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg"
                  >
                    {cur.emoji} {cur.label}
                  </span>
                  {band && (
                    <span
                      style={{ borderColor: band.hex, color: band.hex }}
                      className="px-3 py-1.5 rounded-full border bg-ink-deep/70 backdrop-blur-sm text-xs font-bold tabular-nums"
                    >
                      {courante.rarity}/10 · {band.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Texte */}
              <div className="px-5 sm:px-7 pb-6 -mt-10 relative">
                <h2 className="text-2xl sm:text-3xl text-parchment leading-tight mb-3 text-balance">
                  {courante.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-parchment/50 mb-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatDate(courante.date, "fr")}
                    {courante.time ? ` · ${formatTime(courante.time)}` : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {courante.address.split(",")[0]}
                  </span>
                  <span className="font-semibold text-gold">
                    {formatPrice(courante.price, "Gratuit")}
                  </span>
                </div>

                <p className="text-parchment/65 text-sm leading-relaxed line-clamp-3 mb-2">
                  {courante.description}
                </p>

                {courante.rarity_note && (
                  <p className="text-xs text-parchment/35 italic leading-snug border-l-2 border-parchment/15 pl-3">
                    {courante.rarity_note}
                  </p>
                )}
              </div>
            </article>
          )}
        </div>

        {/* Commandes */}
        {courante && (
          <div className="shrink-0 pt-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={encore}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gold text-ink font-bold text-base hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-gold"
              >
                <Shuffle className="w-5 h-5" />
                Encore
              </button>

              {userId && (
                <button
                  onClick={() => toggle(courante.id)}
                  aria-label={estFavori ? "Retirer des gardés" : "Garder"}
                  aria-pressed={estFavori}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl border border-parchment/20 hover:border-parchment/50 hover:bg-parchment/5 transition-all active:scale-95"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      estFavori ? "fill-frisson text-frisson scale-110" : "text-parchment/70"
                    }`}
                  />
                </button>
              )}

              <Link
                href={`/${locale}/activities/${courante.id}`}
                aria-label="Ouvrir la fiche"
                className="w-14 h-14 flex items-center justify-center rounded-2xl border border-parchment/20 hover:border-parchment/50 hover:bg-parchment/5 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-5 h-5 text-parchment/70" />
              </Link>
            </div>

            <div className="filet mb-5" />

            <RarityDial value={minRarity} onChange={setMinRarity} />

            <p className="mt-4 text-[11px] text-parchment/25 text-center">
              <kbd className="px-1.5 py-0.5 rounded bg-parchment/10">espace</kbd> pour enchaîner
              {userId && (
                <>
                  {" · "}
                  <kbd className="px-1.5 py-0.5 rounded bg-parchment/10">G</kbd> pour garder
                </>
              )}
              {tirage > 0 && ` · ${tirage} vue${tirage > 1 ? "s" : ""}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
