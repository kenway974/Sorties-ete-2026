import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterPanel from "./FilterPanel";
import { RARITY_FLOOR } from "@/lib/constants/rarity";
import type { ActivityFilters } from "@/types";

const vide: ActivityFilters = { sortBy: "rarity", minRarity: RARITY_FLOOR };

/** Ouvre le panneau, puis déplie la section nommée (toutes sont repliées
 *  sauf l'indice d'insolite, qui est le réglage principal). */
function ouvrir(section?: string) {
  fireEvent.click(screen.getAllByRole("button")[0]);
  if (section) fireEvent.click(screen.getByText(section));
}

describe("FilterPanel", () => {
  it("affiche le bouton d'ouverture", () => {
    render(<FilterPanel filters={vide} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Filtres/ })).toBeDefined();
  });

  it("garde le panneau fermé au départ", () => {
    render(<FilterPanel filters={vide} onChange={vi.fn()} />);
    expect(screen.queryByText("Affiner")).toBeNull();
  });

  it("ouvre le panneau sur le cadran d'insolite, déplié", () => {
    render(<FilterPanel filters={vide} onChange={vi.fn()} />);
    ouvrir();
    expect(screen.getByText("Affiner")).toBeDefined();
    expect(screen.getByLabelText("Indice d'insolite minimum")).toBeDefined();
  });

  it("remonte le seuil d'insolite", () => {
    const onChange = vi.fn();
    render(<FilterPanel filters={vide} onChange={onChange} />);
    ouvrir();
    fireEvent.change(screen.getByLabelText("Indice d'insolite minimum"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByText(/Appliquer/));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minRarity: 8 }));
  });

  it("ne descend jamais le curseur sous le plancher du catalogue", () => {
    render(<FilterPanel filters={vide} onChange={vi.fn()} />);
    ouvrir();
    const curseur = screen.getByLabelText("Indice d'insolite minimum") as HTMLInputElement;
    expect(Number(curseur.min)).toBe(RARITY_FLOOR);
  });

  it("sélectionne une curiosité", () => {
    const onChange = vi.fn();
    render(<FilterPanel filters={vide} onChange={onChange} />);
    ouvrir("Curiosité");
    fireEvent.click(screen.getByText(/Ça se mérite/));
    fireEvent.click(screen.getByText(/Appliquer/));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ curiosity: "secret" }));
  });

  it("sélectionne une date", () => {
    const onChange = vi.fn();
    render(<FilterPanel filters={vide} onChange={onChange} />);
    ouvrir("Quand");
    fireEvent.click(screen.getByText("Aujourd'hui"));
    fireEvent.click(screen.getByText(/Appliquer/));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dateFilter: "today" }));
  });

  it("sélectionne le prix gratuit", () => {
    const onChange = vi.fn();
    render(<FilterPanel filters={vide} onChange={onChange} />);
    ouvrir("Prix");
    fireEvent.click(screen.getByText(/Gratuit/));
    fireEvent.click(screen.getByText(/Appliquer/));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priceFilter: "free" }));
  });

  it("efface les filtres posés", () => {
    const onChange = vi.fn();
    const actifs: ActivityFilters = {
      sortBy: "rarity", minRarity: RARITY_FLOOR, dateFilter: "today", priceFilter: "free",
    };
    render(<FilterPanel filters={actifs} onChange={onChange} />);
    ouvrir();
    fireEvent.click(screen.getByText("Effacer"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateFilter: null, priceFilter: null, curiosity: null }),
    );
  });

  it("compte les filtres actifs sur le bouton", () => {
    const actifs: ActivityFilters = { sortBy: "rarity", minRarity: RARITY_FLOOR, dateFilter: "today" };
    render(<FilterPanel filters={actifs} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Filtres 1/ })).toBeDefined();
  });

  it("ne compte pas le seuil par défaut comme un filtre posé", () => {
    render(<FilterPanel filters={vide} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Filtres$/ })).toBeDefined();
  });
});
