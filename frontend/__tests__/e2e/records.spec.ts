import { test, expect } from "@playwright/test";

test.describe("GEDCOM import flow", () => {
  test("navigates to import page", async ({ page }) => {
    await page.goto("/admin");
    await page.click("button:has-text('GEDCOM')");
    await expect(page.locator("text=Export GEDCOM")).toBeVisible();
  });
});

test.describe("Individual record", () => {
  test("loads individual page shell", async ({ page }) => {
    await page.goto("/individuals/I1");
    await expect(page.locator("text=webtrees")).toBeVisible();
  });
});

test.describe("Family record", () => {
  test("loads family page shell", async ({ page }) => {
    await page.goto("/families/F1");
    await expect(page.locator("text=webtrees")).toBeVisible();
  });
});
