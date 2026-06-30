import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fr");
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/MoodMap/);
  });

  test("renders the header with logo", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByText("MoodMap")).toBeVisible();
  });

  test("renders category filter buttons", async ({ page }) => {
    const allButton = page.getByRole("button", { name: /tout/i });
    await expect(allButton).toBeVisible();
  });

  test("renders search bar", async ({ page }) => {
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("renders the map container", async ({ page }) => {
    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test("map/list toggle is visible on mobile", async ({ page, isMobile }) => {
    if (isMobile) {
      const toggleButton = page.getByRole("button", { name: /liste|carte/i });
      await expect(toggleButton).toBeVisible();
    }
  });

  test("search bar accepts input", async ({ page }) => {
    const searchBox = page.getByRole("searchbox");
    await searchBox.fill("musée");
    await expect(searchBox).toHaveValue("musée");
  });

  test("search bar clear button appears after typing", async ({ page }) => {
    const searchBox = page.getByRole("searchbox");
    await searchBox.fill("tour eiffel");
    const clearButton = page.getByRole("button", { name: /effacer|clear/i });
    await expect(clearButton).toBeVisible();
  });

  test("clicking a category filter marks it as active", async ({ page }) => {
    const cultureButton = page.getByRole("button", { name: /culture/i }).first();
    if (await cultureButton.isVisible()) {
      await cultureButton.click();
      await expect(cultureButton).toHaveClass(/bg-brand-navy/);
    }
  });

  test("footer is rendered", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
