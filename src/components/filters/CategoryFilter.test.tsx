import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryFilter from "./CategoryFilter";

describe("CategoryFilter", () => {
  it("renders all 12 category buttons (all + 11 categories)", () => {
    render(<CategoryFilter selected={null} onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(12);
  });

  it("calls onChange(null) when \"all\" button is clicked", () => {
    const onChange = vi.fn();
    render(<CategoryFilter selected="concerts" onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with the category key when a category is clicked", () => {
    const onChange = vi.fn();
    render(<CategoryFilter selected={null} onChange={onChange} />);
    // "soirees" is the second button (index 1)
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledWith("soirees");
  });

  it("applies active styles to the selected category", () => {
    render(<CategoryFilter selected="concerts" onChange={vi.fn()} />);
    // Find the concerts button (index 2 after "all" and "soirees")
    const buttons = screen.getAllByRole("button");
    const concertsBtn = buttons[2]; // concerts is 3rd
    expect(concertsBtn.className).toContain("bg-brand-navy");
  });

  it("applies active styles to \"all\" when nothing is selected", () => {
    render(<CategoryFilter selected={null} onChange={vi.fn()} />);
    const allBtn = screen.getAllByRole("button")[0];
    expect(allBtn.className).toContain("bg-brand-navy");
  });

  it("does NOT apply active styles to unselected categories", () => {
    render(<CategoryFilter selected="concerts" onChange={vi.fn()} />);
    const sportBtn = screen.getAllByRole("button")[6]; // sport
    expect(sportBtn.className).not.toContain("bg-brand-navy");
  });
});
