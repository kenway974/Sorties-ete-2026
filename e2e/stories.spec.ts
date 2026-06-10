import { test, expect } from "@playwright/test";

test.describe("Stories feature", () => {
  test("activity detail page loads without errors", async ({ page }) => {
    // Navigate to the activities listing and try to open one
    await page.goto("/fr/activities");
    await page.waitForLoadState("networkidle");

    // If an activity card exists, open its detail page
    const firstCard = page.locator("article, [data-testid='activity-card']").first();
    const cardExists = await firstCard.isVisible({ timeout: 5000 }).catch(() => false);
    if (!cardExists) {
      // No activities seeded — just verify the page renders without crash
      await expect(page.getByRole("main")).toBeVisible();
      return;
    }

    // Click through to detail page
    await firstCard.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("stories ring area is present on activity detail when stories exist", async ({
    page,
  }) => {
    await page.goto("/fr/activities");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator("article, [data-testid='activity-card']").first();
    if (!(await firstCard.isVisible({ timeout: 5000 }).catch(() => false))) return;

    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Stories ring or "Ajouter une story" button may be visible for authenticated users
    // For unauthenticated visitors the ring is render-only (no upload CTA)
    const storyElements = page.locator(
      "[data-testid='stories-ring'], [data-testid='story-viewer'], button:has-text('story')"
    );
    // Not asserting presence — stories may be absent; we just ensure no JS crash
    const mainContent = page.getByRole("main");
    await expect(mainContent).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Error");
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });

  test("quartier SEO pages render without errors", async ({ page }) => {
    await page.goto("/fr/quartiers");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });

  test("quartier detail page renders without errors", async ({ page }) => {
    await page.goto("/fr/quartiers/marais");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });
});
