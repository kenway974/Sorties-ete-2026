import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";

const mockSignIn = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignIn },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => mockSignIn.mockReset());

  it("renders email input", () => {
    render(<LoginForm locale="fr" />);
    const emailInput = screen.getByLabelText("auth.login.email");
    expect(emailInput).toBeDefined();
  });

  it("renders password input", () => {
    const { container } = render(<LoginForm locale="fr" />);
    expect(container.querySelector("input[type='password']")).not.toBeNull();
  });

  it("renders submit button", () => {
    render(<LoginForm locale="fr" />);
    expect(screen.getByRole("button", { name: "auth.login.submit" })).toBeDefined();
  });

  it("renders link to register page", () => {
    render(<LoginForm locale="fr" />);
    const link = screen.getByRole("link", { name: "auth.login.register_link" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/fr/auth/register");
  });

  it("calls signInWithPassword with email and password on submit", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm locale="fr" />);

    fireEvent.change(screen.getByLabelText("auth.login.email"), { target: { value: "user@test.com" } });
    const { container } = render(<LoginForm locale="fr" />);
    fireEvent.change(container.querySelector("input[type='password']"  )!, { target: { value: "secret123" } });
    fireEvent.change(container.querySelector("input[type='email']"  )!, { target: { value: "user@test.com" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mockSignIn).toHaveBeenCalled());
  });

  it("shows error message when signIn fails", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "invalid" } });
    render(<LoginForm locale="fr" />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("auth.errors.invalid_credentials")).toBeDefined();
    });
  });

  it("submit button shows loading state during request", async () => {
    let resolve: (v: unknown) => void;
    mockSignIn.mockReturnValue(new Promise((r) => { resolve = r; }));
    render(<LoginForm locale="fr" />);

    fireEvent.submit(document.querySelector("form")!);
    // Button should be disabled
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
    resolve!({ error: null });
  });
});
