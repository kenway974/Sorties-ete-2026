import { test, expect } from "@playwright/test";

test.describe("La Roulette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fr/roulette");
  });

  test("ne demande rien avant de montrer", async ({ page }) => {
    // Aucun formulaire d'entrée : c'est tout le principe.
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /La Roulette/ })).toBeVisible();
  });

  test("propose le cadran d'insolite", async ({ page }) => {
    await expect(page.getByText(/Indice d'insolite/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Indice 9 sur 10/ })).toBeVisible();
  });

  test("enchaîne sur « Encore » quand le catalogue est garni", async ({ page }) => {
    const encore = page.getByRole("button", { name: /Encore/ });
    // Catalogue vide : la Roulette le dit au lieu de tourner à vide.
    if (!(await encore.isVisible().catch(() => false))) {
      await expect(page.getByText(/Tu as tout vu|On fouille/)).toBeVisible();
      return;
    }
    const avant = await page.getByRole("heading").nth(1).textContent();
    await encore.click();
    await expect(page.getByRole("heading").nth(1)).not.toHaveText(avant ?? "");
  });
});
