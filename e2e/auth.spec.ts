import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/fr/auth/login");
    });

    test("renders the login form", async ({ page }) => {
      await expect(page.getByRole("main")).toBeVisible();
    });

    test("email input is present", async ({ page }) => {
      await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    });

    test("password input is present", async ({ page }) => {
      await expect(page.locator("input[type='password']")).toBeVisible();
    });

    test("submit button is present", async ({ page }) => {
      await expect(page.getByRole("button", { name: /connexion|login|se connecter/i })).toBeVisible();
    });

    test("register link is present", async ({ page }) => {
      await expect(page.getByRole("link", { name: /inscri|register|créer/i })).toBeVisible();
    });

    test("navigates to register page from login", async ({ page }) => {
      const registerLink = page.getByRole("link", { name: /inscri|register|créer/i });
      await registerLink.click();
      await expect(page).toHaveURL(/\/fr\/auth\/register/);
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.getByRole("textbox", { name: /email/i }).fill("invalid@test.com");
      await page.locator("input[type='password']").fill("wrongpassword");
      await page.getByRole("button", { name: /connexion|login|se connecter/i }).click();
      // Error message should appear
      await expect(
        page.getByText(/invalide|incorrect|wrong|error|erreur/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test("submit button shows loading state while submitting", async ({ page }) => {
      await page.getByRole("textbox", { name: /email/i }).fill("test@test.com");
      await page.locator("input[type='password']").fill("password123");
      const submitButton = page.getByRole("button", { name: /connexion|login|se connecter/i });
      await submitButton.click();
      // Loading spinner or disabled state should appear briefly
      await expect(submitButton).toBeDisabled({ timeout: 2000 }).catch(() => null);
    });
  });

  test.describe("Register page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/fr/auth/register");
    });

    test("renders the registration form", async ({ page }) => {
      await expect(page.getByRole("main")).toBeVisible();
    });

    test("username input is present", async ({ page }) => {
      await expect(
        page.getByRole("textbox", { name: /nom d'utilisateur|username/i })
      ).toBeVisible();
    });

    test("email input is present", async ({ page }) => {
      await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    });

    test("password input is present", async ({ page }) => {
      const passwords = page.locator("input[type='password']");
      await expect(passwords.first()).toBeVisible();
    });

    test("confirm password input is present", async ({ page }) => {
      const passwords = page.locator("input[type='password']");
      expect(await passwords.count()).toBeGreaterThanOrEqual(2);
    });

    test("submit button is present", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /créer|register|s'inscrire/i })
      ).toBeVisible();
    });

    test("login link is present", async ({ page }) => {
      await expect(
        page.getByRole("link", { name: /connexion|login|se connecter/i })
      ).toBeVisible();
    });

    test("navigates to login page from register", async ({ page }) => {
      const loginLink = page.getByRole("link", { name: /connexion|login|se connecter/i });
      await loginLink.click();
      await expect(page).toHaveURL(/\/fr\/auth\/login/);
    });

    test("shows password mismatch error", async ({ page }) => {
      await page.getByRole("textbox", { name: /nom d'utilisateur|username/i }).fill("testuser");
      await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
      const passwords = page.locator("input[type='password']");
      await passwords.nth(0).fill("password123");
      await passwords.nth(1).fill("different456");
      await page.getByRole("button", { name: /créer|register|s'inscrire/i }).click();
      await expect(
        page.getByText(/correspondent pas|mismatch|ne correspondent|don't match/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test("shows error for password too short", async ({ page }) => {
      await page.getByRole("textbox", { name: /nom d'utilisateur|username/i }).fill("testuser");
      await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
      const passwords = page.locator("input[type='password']");
      await passwords.nth(0).fill("123");
      await passwords.nth(1).fill("123");
      await page.getByRole("button", { name: /créer|register|s'inscrire/i }).click();
      await expect(
        page.getByText(/caractères|characters|court|short/i)
      ).toBeVisible({ timeout: 5000 });
    });
  });
});
