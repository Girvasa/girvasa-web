import { test, expect } from "@playwright/test";

test.describe("SaaS Subscription Lifecycle & Zero-Fee Payment Checkout E2E", () => {
  test("loads settings subscription tab, switches plans, sees Direct UPI/Bank payment options, and submits UTR", async ({ page }) => {
    // 1. Navigate to Settings page on the subscription tab
    await page.goto("http://localhost:3000/settings?tab=subscription");

    // Expect SaaS Plan & Subscription tab and all plan options to be visible
    await expect(page.getByText("SaaS Subscription & Tier Management")).toBeVisible();
    await expect(page.getByText("Current Society Plan")).toBeVisible();
    await expect(page.getByText("Starter Plan").first()).toBeVisible();
    await expect(page.getByText("Enterprise Plan").first()).toBeVisible();

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

    // 4. Open Zero-Fee Payment Options for any plan from Lockout Banner
    await page.getByRole("button", { name: /Enterprise Plan/i }).first().click();
    await page.getByRole("button", { name: /Pay & Reactivate Society/i }).click();
    await page.getByRole("button", { name: /Pay & Reactivate Society \(Zero-Fee UPI \/ Bank\)/i }).click();

    // Verify Direct UPI + Bank Transfer + UTR submission options render cleanly
    await expect(page.getByText(/Option A: Direct UPI/i).first()).toBeVisible();
    await expect(page.getByText(/Option B: Bank Transfer \(NEFT \/ IMPS/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/432912345678 or NEFT reference/i).first()).toBeVisible();
  });
});
