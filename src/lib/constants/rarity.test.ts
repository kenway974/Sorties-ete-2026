import { describe, it, expect } from "vitest";
import {
  RARITY_BANDS, RARITY_FLOOR, rarityBand, rarityLabel, rarityHex,
} from "./rarity";

describe("indice d'insolite", () => {
  it("couvre 1 à 10 sans trou ni recouvrement", () => {
    const couverts = RARITY_BANDS.flatMap((b) =>
      Array.from({ length: b.max - b.min + 1 }, (_, k) => b.min + k),
    );
    expect(couverts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("place le plancher du catalogue dans la plage", () => {
    expect(RARITY_FLOOR).toBeGreaterThanOrEqual(1);
    expect(RARITY_FLOOR).toBeLessThanOrEqual(10);
    expect(rarityBand(RARITY_FLOOR)).not.toBeNull();
  });

  it("classe chaque note dans son palier", () => {
    expect(rarityLabel(1)).toBe("Sage");
    expect(rarityLabel(5)).toBe("Peu commun");
    expect(rarityLabel(10)).toBe("Introuvable");
  });

  it("borne les valeurs hors échelle au lieu de rendre null", () => {
    expect(rarityLabel(0)).toBe("Sage");
    expect(rarityLabel(99)).toBe("Introuvable");
  });

  it("arrondit les notes non entières", () => {
    expect(rarityLabel(7.4)).toBe("Rare");
  });

  it("distingue explicitement l'absence de note", () => {
    // null n'est pas 0 : c'est « le scoring n'a pas tourné », et l'interface
    // doit pouvoir masquer la pastille plutôt qu'afficher « Sage ».
    expect(rarityBand(null)).toBeNull();
    expect(rarityLabel(null)).toBe("Non noté");
    expect(rarityHex(null)).toBeTruthy();
  });
});
