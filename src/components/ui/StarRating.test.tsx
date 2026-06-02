import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "./StarRating";

describe("StarRating", () => {
  it("renders exactly 5 buttons", () => {
    render(<StarRating value={3} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("calls onChange with the clicked star index", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("3 étoile(s)"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange with 1 for the first star", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("1 étoile(s)"));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("calls onChange with 5 for the last star", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("5 étoile(s)"));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("does NOT call onChange in readonly mode", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readonly />);
    fireEvent.click(screen.getByLabelText("3 étoile(s)"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables all buttons in readonly mode", () => {
    render(<StarRating value={4} readonly />);
    screen.getAllByRole("button").forEach((btn) => expect(btn).toBeDisabled());
  });

  it("enables all buttons when not readonly", () => {
    render(<StarRating value={2} onChange={vi.fn()} />);
    screen.getAllByRole("button").forEach((btn) => expect(btn).not.toBeDisabled());
  });
});
