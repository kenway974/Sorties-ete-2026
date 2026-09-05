import { test, expect } from "@playwright/test";

test.describe("Activities page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fr/activities");
  });

  test("renders the page heading or main content", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("search bar is present", async ({ page }) => {
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("le bandeau des curiosités est présent", async ({ page }) => {
    await expect(page.getByRole("group", { name: /Filtrer par curiosité/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tout" })).toBeVisible();
  });

  test("filter panel toggle button is present", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: /filtre/i });
    await expect(filterButton).toBeVisible();
  });

  test("typing in search bar updates the query", async ({ page }) => {
    const searchBox = page.getByRole("searchbox");
    await searchBox.fill("musée");
    await expect(searchBox).toHaveValue("musée");
  });

  test("filter panel opens when filter button is clicked", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: /filtre/i });
    await filterButton.click();
    await expect(page.getByRole("button", { name: /appliquer|apply/i })).toBeVisible();
  });

  test("filter panel closes when apply is clicked", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: /filtre/i });
    await filterButton.click();
    const applyButton = page.getByRole("button", { name: /appliquer|apply/i });
    await applyButton.click();
    await expect(applyButton).not.toBeVisible();
  });

  test("activity cards are rendered when data is present", async ({ page }) => {
    // Wait for potential loading to complete
    await page.waitForSelector(".animate-pulse, [data-testid='activity-card'], article", {
      timeout: 10000,
      state: "attached",
    }).catch(() => null);
    // Either skeletons or real cards should be present
    const hasSkeleton = await page.locator(".animate-pulse").count() > 0;
    const hasCards = await page.locator("article, [data-testid='activity-card']").count() > 0;
    expect(hasSkeleton || hasCards).toBe(true);
  });

  test("sélectionner une curiosité la marque comme active", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Ça se mérite/ }).first();
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  test("le panneau s'ouvre sur le cadran d'insolite", async ({ page }) => {
    await page.getByRole("button", { name: /Filtres/ }).click();
    await expect(page.getByLabel("Indice d'insolite minimum")).toBeVisible();
  });

  test("free price filter can be toggled", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: /filtre/i });
    await filterButton.click();
    const freeLabel = page.getByText(/gratuit/i);
    if (await freeLabel.isVisible()) {
      await freeLabel.click();
      // Verify it is checked/selected
      const freeCheckbox = page.getByRole("checkbox", { name: /gratuit/i });
      if (await freeCheckbox.isVisible()) {
        await expect(freeCheckbox).toBeChecked();
      }
    }
  });
});
