"use client";
import { RARITY_BANDS, rarityBand } from "@/lib/constants/rarity";

interface RarityDialProps {
  value: number;
  onChange?: (v: number) => void;
  /** Sans onChange, le cadran est une simple lecture. */
  readOnly?: boolean;
  compact?: boolean;
}

/**
 * Le cadran d'insolite — le seul réglage du produit.
 *
 * Dix crans plutôt qu'un menu : on le monte comme on monte le son, sans avoir
 * à se décrire soi-même. C'est toute la différence avec un filtre.
 */
export default function RarityDial({ value, onChange, readOnly, compact }: RarityDialProps) {
  const band = rarityBand(value);

  return (
    <div className={compact ? "w-full" : "w-full max-w-sm"}>
      <div className="flex items-end justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-parchment/50">
          Indice d&apos;insolite
        </span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: band?.hex }}
        >
          {value}/10 · {band?.label}
        </span>
      </div>

      <div className="flex gap-1" role="presentation">
        {RARITY_BANDS.flatMap((b) =>
          Array.from({ length: b.max - b.min + 1 }, (_, k) => b.min + k),
        ).map((cran) => {
          const on = cran <= value;
          return (
            <button
              key={cran}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(cran)}
              aria-label={`Indice ${cran} sur 10`}
              className={`h-2.5 flex-1 rounded-full transition-all duration-200 ${
                readOnly ? "cursor-default" : "hover:scale-y-150 cursor-pointer"
              }`}
              style={{
                backgroundColor: on ? rarityBand(cran)!.hex : "rgba(250,245,236,0.12)",
                boxShadow: on ? `0 0 12px ${rarityBand(cran)!.hex}66` : undefined,
              }}
            />
          );
        })}
      </div>

      {!readOnly && (
        <p className="mt-2 text-xs text-parchment/40 leading-snug">
          {band?.desc}. Monte le curseur pour du plus rare.
        </p>
      )}
    </div>
  );
}
