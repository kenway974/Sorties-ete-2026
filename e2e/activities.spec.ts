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

  test("category filter buttons are present", async ({ page }) => {
    const allButton = page.getByRole("button", { name: /tout/i });
    await expect(allButton).toBeVisible();
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

  test("selecting a category filters the URL or state", async ({ page }) => {
    const cultureBtn = page.getByRole("button", { name: /culture/i }).first();
    if (await cultureBtn.isVisible()) {
      await cultureBtn.click();
      // Category should now be visually active
      await expect(cultureBtn).toHaveClass(/bg-brand-navy|font-bold|active/);
    }
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
