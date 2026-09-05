import { describe, it, expect } from "vitest";
import { CURIOSITES, CURIOSITY_KEYS, curiosity, isCuriosity } from "./curiosites";

describe("curiosités", () => {
  it("en compte six", () => {
    expect(CURIOSITES).toHaveLength(6);
    expect(CURIOSITY_KEYS).toHaveLength(6);
  });

  it("n'a pas de clé en double", () => {
    expect(new Set(CURIOSITY_KEYS).size).toBe(CURIOSITY_KEYS.length);
  });

  it("donne une teinte distincte à chacune", () => {
    const teintes = CURIOSITES.map((c) => c.hex);
    expect(new Set(teintes).size).toBe(teintes.length);
  });

  it("renseigne tous les champs d'affichage", () => {
    for (const c of CURIOSITES) {
      expect(c.emoji).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.desc).toBeTruthy();
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/i);
      expect(c.gradient).toContain("from-");
    }
  });

  it("retrouve une curiosité par sa clé", () => {
    expect(curiosity("secret").label).toBe("Ça se mérite");
  });

  it("retombe sur la bizarrerie plutôt que de renvoyer undefined", () => {
    // L'appelant affiche toujours quelque chose : une valeur inconnue en base
    // ne doit jamais faire planter une carte.
    expect(curiosity("inconnue").key).toBe("bizarrerie");
    expect(curiosity(null).key).toBe("bizarrerie");
    expect(curiosity(undefined).key).toBe("bizarrerie");
  });

  it("reconnaît les clés valides", () => {
    expect(isCuriosity("frisson")).toBe(true);
    expect(isCuriosity("concerts")).toBe(false);
  });
});
