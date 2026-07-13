import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/webtrees/);
  });

  test("shows navigation bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1:has-text('webtrees')")).toBeVisible();
  });

  test("shows stats card", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Statistics")).toBeVisible();
  });

  test("shows on this day card", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=On this day")).toBeVisible();
  });
});

test.describe("Search page", () => {
  test("loads and shows search form", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1:has-text('Search')")).toBeVisible();
    await expect(page.locator("input[name='q']")).toBeVisible();
    await expect(page.locator("button:has-text('Search')")).toBeVisible();
  });

  test("search input is focusable", async ({ page }) => {
    await page.goto("/search");
    const input = page.locator("input[name='q']");
    await expect(input).toBeFocused();
  });
});

test.describe("Places page", () => {
  test("loads and shows places grid", async ({ page }) => {
    await page.goto("/places");
    await expect(page.locator("h1:has-text('Places')")).toBeVisible();
  });

  test("has working search filter", async ({ page }) => {
    await page.goto("/places");
    await page.fill("input[id='place-search']", "London");
    await expect(page.locator("text=London, England")).toBeVisible();
  });
});

test.describe("Media gallery", () => {
  test("loads and shows filter tabs", async ({ page }) => {
    await page.goto("/media");
    await expect(page.locator("h1:has-text('Media Gallery')")).toBeVisible();
    await expect(page.locator("button:has-text('Photo')")).toBeVisible();
    await expect(page.locator("button:has-text('Document')")).toBeVisible();
  });

  test("filter tabs work", async ({ page }) => {
    await page.goto("/media");
    await page.click("button:has-text('Document')");
    await expect(page.locator("button:has-text('Document')")).toHaveAttribute("data-state", "active");
  });
});

test.describe("Admin dashboard", () => {
  test("loads and shows control panel", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1:has-text('Control Panel')")).toBeVisible();
  });

  test("shows stats cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("text=Individuals")).toBeVisible();
    await expect(page.locator("text=Families")).toBeVisible();
  });

  test("has tabbed navigation", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("button:has-text('Data')")).toBeVisible();
  });
});

test.describe("Login page", () => {
  test("loads and shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[id='username']")).toBeVisible();
    await expect(page.locator("input[id='password']")).toBeVisible();
    await expect(page.locator("button:has-text('Sign In')")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("sidebar link to family trees", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("button:has-text('Family trees')").first();
    await expect(link).toBeVisible();
  });

  test("charts link in nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("button:has-text('Charts')")).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("pages have proper heading hierarchy", async ({ page }) => {
    for (const path of ["/", "/search", "/places", "/media", "/admin"]) {
      await page.goto(path);
      const h1s = await page.locator("h1").count();
      expect(h1s).toBe(1);
    }
  });

  test("forms have labels", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("label:has-text('Username')")).toBeVisible();
    await expect(page.locator("label:has-text('Password')")).toBeVisible();
  });
});
