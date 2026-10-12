import { test, expect } from "@playwright/test";

test.describe("SaaS Subscription Lifecycle & Enforcement E2E", () => {
  test("loads settings subscription tab, tests 3-day warning banner, expired lockout, and renewal unlock", async ({ page }) => {
    // 1. Navigate to Settings page on the subscription tab
    await page.goto("http://localhost:3000/settings?tab=subscription");

    // Expect SaaS Plan & Subscription tab to be active
    await expect(page.getByText("SaaS Subscription & Tier Management")).toBeVisible();
    await expect(page.getByText("Current Society Plan")).toBeVisible();

    // 2. Test Simulation: 3 Days Left (Ending Soon warning)
    await page.getByRole("button", { name: "Simulate 3 Days Left" }).click();
    await page.waitForTimeout(1000);

    // Expect the Amber Trial Ending Soon warning banner to appear on screen
    await expect(page.getByText("Trial Period Ending Soon")).toBeVisible();
    await expect(page.getByText(/days remaining/i).first()).toBeVisible();

    // 3. Test Simulation: Expired Lockout
    await page.getByRole("button", { name: "Simulate Expired" }).click();
    await page.waitForTimeout(1000);

    // Expect the Red Lockout Box to appear
    await expect(page.getByText("Society Subscription Expired")).toBeVisible();
    await expect(page.getByText("Access Restricted")).toBeVisible();

    // 4. Test Renewal & Reactivation
    await page.getByRole("button", { name: "Pay & Reactivate Society" }).click();
    await page.waitForTimeout(2000);

    // Expect Subscription to be restored to ACTIVE and lockout dismissed
    await expect(page.getByText("Access Restricted")).not.toBeVisible();
    await expect(page.getByText("ACTIVE").first()).toBeVisible();
  });
});
