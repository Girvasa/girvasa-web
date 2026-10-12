import { test, expect } from "@playwright/test";
import * as path from "path";

const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/qa/screenshots");

test.describe("Responsive Viewport & Mobile Navigation", () => {
  test("Mobile viewport (375x667): renders header and toggles mobile sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Capture mobile dashboard screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard-mobile.png") });

    // Header hamburger button
    const menuButton = page.locator("button[aria-label='Toggle menu']").or(page.locator("header button").first());
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Verify sidebar drawer is now open
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "sidebar-drawer-mobile.png") });

    // Close button in sidebar
    const closeButton = sidebar.locator("button").first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Verify sidebar is translated out of view
    await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);
  });

  test("Tablet viewport (768x1024): renders responsive dashboard without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard");

    // Capture tablet dashboard screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard-tablet.png") });

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("Tablet viewport: renders table pages (buildings, billing) cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/buildings");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "buildings-tablet.png") });

    await page.goto("/billing");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "billing-tablet.png") });
  });
});
