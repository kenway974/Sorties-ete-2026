import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("renders without crashing", () => {
    const { container } = render(<Input />);
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("renders a label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeDefined();
  });

  it("associates label with input via htmlFor / id", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
  });

  it("shows error message", () => {
    render(<Input error="Champ obligatoire" />);
    expect(screen.getByText("Champ obligatoire")).toBeDefined();
  });

  it("applies error border class when error is set", () => {
    const { container } = render(<Input error="Oops" />);
    expect(container.querySelector("input")).toHaveClass("border-brand-red");
  });

  it("shows hint when no error is present", () => {
    render(<Input hint="Format: john@example.com" />);
    expect(screen.getByText("Format: john@example.com")).toBeDefined();
  });

  it("hides hint when an error is present", () => {
    render(<Input error="Error" hint="Hint" />);
    expect(screen.queryByText("Hint")).toBeNull();
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the type prop", () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector("input")?.type).toBe("email");
  });

  it("passes placeholder through", () => {
    render(<Input placeholder="Votre email" />);
    expect(screen.getByPlaceholderText("Votre email")).toBeDefined();
  });

  it("uses explicit id over generated one", () => {
    const { container } = render(<Input id="my-input" label="Label" />);
    expect(container.querySelector("#my-input")).not.toBeNull();
  });
});
