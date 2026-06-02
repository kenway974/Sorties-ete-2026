import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Concerts</Badge>);
    expect(screen.getByText("Concerts")).toBeDefined();
  });

  it("applies navy variant by default", () => {
    const { container } = render(<Badge>Navy</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-brand-navy");
  });

  it("applies gold variant", () => {
    const { container } = render(<Badge variant="gold">Gold</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-brand-gold");
  });

  it("applies red variant", () => {
    const { container } = render(<Badge variant="red">Red</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-brand-red");
  });

  it("applies green variant", () => {
    const { container } = render(<Badge variant="green">Green</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-green-500");
  });

  it("applies gray variant", () => {
    const { container } = render(<Badge variant="gray">Gray</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-gray-100");
  });

  it("applies outline variant", () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("border");
  });

  it("merges custom className", () => {
    const { container } = render(<Badge className="text-xl">Big</Badge>);
    expect(container.firstChild as HTMLElement).toHaveClass("text-xl");
  });

  it("renders as a span", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test").tagName).toBe("SPAN");
  });
});
