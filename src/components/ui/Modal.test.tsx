import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
  it("does not render content when open=false", () => {
    render(<Modal open={false} onClose={vi.fn()}><p>Hidden</p></Modal>);
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("renders content when open=true", () => {
    render(<Modal open={true} onClose={vi.fn()}><p>Visible</p></Modal>);
    expect(screen.getByText("Visible")).toBeDefined();
  });

  it("renders the title when provided", () => {
    render(<Modal open={true} onClose={vi.fn()} title="Mon titre"><p>Body</p></Modal>);
    expect(screen.getByText("Mon titre")).toBeDefined();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test"><p>Content</p></Modal>);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test"><p>Content</p></Modal>);
    const header = screen.getByText("Test").parentElement!;
    const closeBtn = header.querySelector("button")!;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render X button when no title provided", () => {
    render(<Modal open={true} onClose={vi.fn()}><p>No title</p></Modal>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("applies md size class by default", () => {
    const { container } = render(<Modal open={true} onClose={vi.fn()} title="T"><p>X</p></Modal>);
    expect(container.querySelector(".max-w-lg")).not.toBeNull();
  });

  it("applies lg size class", () => {
    const { container } = render(<Modal open={true} onClose={vi.fn()} title="T" size="lg"><p>X</p></Modal>);
    expect(container.querySelector(".max-w-2xl")).not.toBeNull();
  });

  it("does not call onClose on Escape when closed", () => {
    const onClose = vi.fn();
    render(<Modal open={false} onClose={onClose}><p>X</p></Modal>);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
