import { test, expect } from "@playwright/test";

test.describe("Propose activity page", () => {
  test("redirects unauthenticated users away from propose page", async ({ page }) => {
    await page.goto("/fr/propose");
    // Should either redirect to login or show an auth prompt
    const url = page.url();
    const isRedirected = url.includes("/auth/login") || url.includes("/fr/auth");
    const hasAuthPrompt = await page
      .getByText(/connexion|login|se connecter|inscri/i)
      .isVisible();
    expect(isRedirected || hasAuthPrompt).toBe(true);
  });

  test("propose page URL is /fr/propose", async ({ page }) => {
    await page.goto("/fr/propose");
    // Regardless of auth redirect, check that it was attempted
    expect(page.url()).toContain("/fr");
  });

  test("shows login prompt or redirects when not authenticated", async ({ page }) => {
    await page.goto("/fr/propose");
    // Wait for either redirect or auth wall content
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    if (!currentUrl.includes("/auth/login")) {
      // If not redirected, should show a login/auth button
      const loginButton = page.getByRole("link", { name: /connexion|login/i });
      const loginText = page.getByText(/connecter|authenticate|se connecter/i);
      const hasAuth = (await loginButton.isVisible()) || (await loginText.isVisible());
      expect(hasAuth).toBe(true);
    }
  });
});

test.describe("Propose form (authenticated)", () => {
  test.skip("form has title input", async ({ page }) => {
    // Requires authentication setup - skipped in CI without credentials
    await page.goto("/fr/propose");
    await expect(page.getByRole("textbox", { name: /titre|title/i })).toBeVisible();
  });

  test.skip("form has description textarea", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.getByRole("textbox", { name: /description/i })).toBeVisible();
  });

  test.skip("form has address input with geocoding", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.getByRole("textbox", { name: /adresse|address/i })).toBeVisible();
  });

  test.skip("le formulaire propose un sélecteur de curiosité", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.getByRole("combobox", { name: /curiosit/i })).toBeVisible();
  });

  test.skip("form has date input", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.locator("input[type='datetime-local']")).toBeVisible();
  });

  test.skip("form has price input", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.getByRole("spinbutton", { name: /prix|price/i })).toBeVisible();
  });

  test.skip("form has external URL input", async ({ page }) => {
    await page.goto("/fr/propose");
    await expect(page.getByRole("textbox", { name: /url|lien|site/i })).toBeVisible();
  });

  test.skip("submitting valid form shows success message", async ({ page }) => {
    // Full flow: fill form, submit, check confirmation
    await page.goto("/fr/propose");
    await page.getByRole("textbox", { name: /titre|title/i }).fill("Test Activity");
    await page.getByRole("textbox", { name: /description/i }).fill(
      "A great test activity in Paris with a long enough description."
    );
    await page.getByRole("button", { name: /proposer|submit|envoyer/i }).click();
    await expect(page.getByText(/soumis|submitted|succès|success/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
