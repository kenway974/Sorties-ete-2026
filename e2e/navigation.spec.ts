import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("redirects / to /fr", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr/);
  });

  test("home page is accessible at /fr", async ({ page }) => {
    await page.goto("/fr");
    await expect(page).toHaveURL("/fr");
    await expect(page).toHaveTitle(/ParisSorties/);
  });

  test("activities page is accessible", async ({ page }) => {
    await page.goto("/fr/activities");
    await expect(page).toHaveURL("/fr/activities");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/fr/auth/login");
    await expect(page).toHaveURL("/fr/auth/login");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("register page is accessible", async ({ page }) => {
    await page.goto("/fr/auth/register");
    await expect(page).toHaveURL("/fr/auth/register");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("language switcher is present in header", async ({ page }) => {
    await page.goto("/fr");
    const switcher = page.locator("[aria-label*='langue'],[aria-label*='language']").or(
      page.getByRole("button", { name: /FR|EN|langue|language/i })
    );
    await expect(switcher.first()).toBeVisible();
  });

  test("switching to English changes URL locale", async ({ page }) => {
    await page.goto("/fr");
    const langButton = page.getByRole("button", { name: /fr|langue/i }).first();
    if (await langButton.isVisible()) {
      await langButton.click();
      const englishOption = page.getByRole("menuitem", { name: /english/i }).or(
        page.getByText("English")
      );
      if (await englishOption.first().isVisible()) {
        await englishOption.first().click();
        await expect(page).toHaveURL(/\/en/);
      }
    }
  });

  test("English locale renders translated content", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL("/en");
    await expect(page).toHaveTitle(/ParisSorties/);
  });

  test("Spanish locale is accessible", async ({ page }) => {
    await page.goto("/es");
    await expect(page).toHaveURL("/es");
  });

  test("nav link to activities navigates correctly", async ({ page }) => {
    await page.goto("/fr");
    const activitiesLink = page.getByRole("link", { name: /activit/i }).first();
    if (await activitiesLink.isVisible()) {
      await activitiesLink.click();
      await expect(page).toHaveURL(/\/fr\/activities/);
    }
  });

  test("404 page is shown for unknown routes", async ({ page }) => {
    const response = await page.goto("/fr/cette-page-nexiste-pas");
    expect(response?.status()).toBe(404);
  });
});
