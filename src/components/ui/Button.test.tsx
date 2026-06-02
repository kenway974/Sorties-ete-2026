import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Valider</Button>);
    expect(screen.getByText("Valider")).toBeDefined();
  });

  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when loading=true", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows a spinner svg when loading=true", () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("does not fire onClick while loading", () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Loading</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is disabled when disabled=true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies primary variant classes by default", () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-brand-navy");
  });

  it("applies danger variant classes", () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-brand-red");
  });

  it("applies outline variant classes", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("border-brand-navy");
  });

  it("applies lg size classes", () => {
    const { container } = render(<Button size="lg">Big</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("px-6");
  });

  it("applies sm size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("px-3");
  });

  it("merges custom className", () => {
    const { container } = render(<Button className="w-full">Full</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("w-full");
  });

  it("renders as a button element", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });
});
