import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterForm from "./RegisterForm";

const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signUp: mockSignUp },
  }),
}));

const fillForm = (container: HTMLElement, opts: {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}) => {
  const inputs = container.querySelectorAll("input");
  if (opts.username !== undefined) fireEvent.change(inputs[0], { target: { value: opts.username } });
  if (opts.email !== undefined) fireEvent.change(inputs[1], { target: { value: opts.email } });
  if (opts.password !== undefined) fireEvent.change(inputs[2], { target: { value: opts.password } });
  if (opts.confirm !== undefined) fireEvent.change(inputs[3], { target: { value: opts.confirm } });
};

describe("RegisterForm", () => {
  beforeEach(() => mockSignUp.mockReset());

  it("renders 4 input fields", () => {
    const { container } = render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    expect(container.querySelectorAll("input")).toHaveLength(4);
  });

  it("renders submit button", () => {
    render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: /cr[ée]er/i })).toBeDefined();
  });

  it("renders link to login page", () => {
    render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    const link = screen.getByRole("link", { name: /se connecter/i });
    expect(link.getAttribute("href")).toBe("/fr/auth/login");
  });

  it("shows error when passwords do not match", async () => {
    const { container } = render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    fillForm(container, { username: "john", email: "j@test.com", password: "abc12345", confirm: "different" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => {
      expect(screen.getByText("Les mots de passe ne correspondent pas")).toBeDefined();
    });
  });

  it("shows error when password is too short", async () => {
    const { container } = render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    fillForm(container, { username: "john", email: "j@test.com", password: "short", confirm: "short" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => {
      expect(screen.getByText("Le mot de passe doit contenir au moins 8 caractères")).toBeDefined();
    });
  });

  it("does NOT call signUp when passwords mismatch", async () => {
    const { container } = render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    fillForm(container, { username: "john", email: "j@test.com", password: "abc12345", confirm: "xyz12345" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("Les mots de passe ne correspondent pas")).toBeDefined());
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp with email, password and username on valid form", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const onSuccess = vi.fn();
    const { container } = render(<RegisterForm locale="fr" onSuccess={onSuccess} />);
    fillForm(container, { username: "john", email: "john@test.com", password: "password123", confirm: "password123" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
        email: "john@test.com",
        password: "password123",
      }));
    });
  });

  it("calls onSuccess callback after successful signup", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const onSuccess = vi.fn();
    const { container } = render(<RegisterForm locale="fr" onSuccess={onSuccess} />);
    fillForm(container, { username: "john", email: "john@test.com", password: "password123", confirm: "password123" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("shows supabase error when email is already taken", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "User already registered" } });
    const { container } = render(<RegisterForm locale="fr" onSuccess={vi.fn()} />);
    fillForm(container, { username: "john", email: "dup@test.com", password: "password123", confirm: "password123" });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => {
      expect(screen.getByText("Cet email est déjà utilisé")).toBeDefined();
    });
  });
});
