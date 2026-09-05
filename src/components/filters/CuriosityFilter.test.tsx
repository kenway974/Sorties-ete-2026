import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CuriosityFilter from "./CuriosityFilter";
import { CURIOSITES } from "@/lib/constants/curiosites";

describe("CuriosityFilter", () => {
  it("affiche « Tout » plus une pastille par curiosité", () => {
    render(<CuriosityFilter selected={null} onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(CURIOSITES.length + 1);
  });

  it("renvoie null quand on clique sur « Tout »", () => {
    const onChange = vi.fn();
    render(<CuriosityFilter selected="frisson" onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("renvoie la clé de la curiosité cliquée", () => {
    const onChange = vi.fn();
    render(<CuriosityFilter selected={null} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledWith(CURIOSITES[0].key);
  });

  it("déselectionne quand on reclique sur la curiosité active", () => {
    const onChange = vi.fn();
    render(<CuriosityFilter selected={CURIOSITES[0].key} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("marque la curiosité sélectionnée comme active", () => {
    render(<CuriosityFilter selected="frisson" onChange={vi.fn()} />);
    const btn = screen.getByRole("button", { pressed: true });
    expect(btn.textContent).toContain("Ça remue");
  });

  it("marque « Tout » comme actif quand rien n'est sélectionné", () => {
    render(<CuriosityFilter selected={null} onChange={vi.fn()} />);
    const btn = screen.getByRole("button", { pressed: true });
    expect(btn.textContent).toBe("Tout");
  });
});
