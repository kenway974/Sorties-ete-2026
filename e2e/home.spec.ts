import { test, expect } from "@playwright/test";

test.describe("Accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fr");
  });

  test("porte le titre du produit", async ({ page }) => {
    await expect(page).toHaveTitle(/Hors-Piste/);
  });

  test("affiche l'en-tête et le logo", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("banner").getByText(/Hors/)).toBeVisible();
  });

  test("met la Roulette en action principale", async ({ page }) => {
    const cta = page.getByRole("link", { name: /Fais tourner la Roulette/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/fr\/roulette/);
  });

  test("présente les six curiosités", async ({ page }) => {
    for (const label of [
      "Ça remue", "Ça se mérite", "Ça se fabrique",
      "Ça se joue", "Ça sort du temps", "Ça n'a aucun sens",
    ]) {
      await expect(page.getByRole("heading", { name: label })).toBeVisible();
    }
  });

  test("une curiosité mène au catalogue filtré", async ({ page }) => {
    await page.getByRole("heading", { name: "Ça se mérite" }).click();
    await expect(page).toHaveURL(/curiosite=secret/);
  });

  test("expose les cinq paliers d'insolite", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Introuvable/ })).toBeVisible();
  });

  test("affiche le pied de page", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
