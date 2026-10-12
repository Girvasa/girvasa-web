import { test, expect } from "@playwright/test";

test.describe("Exhaustive Filters & Dropdowns Verification Across All Modules", () => {
  test("1. Billing Module: Wing, Status, Channel dropdowns and Search input", async ({ page }) => {
    await page.goto("/billing");
    await expect(page).toHaveURL(/.*\/billing/);
    await page.waitForTimeout(1000);

    // Locate the 3 select dropdowns
    const selects = page.locator("select");
    const wingSelect = selects.nth(0);
    const statusSelect = selects.nth(1);
    const channelSelect = selects.nth(2);

    // Test Status Dropdown
    await statusSelect.selectOption("paid");
    await page.waitForTimeout(300);
    await statusSelect.selectOption("unpaid");
    await page.waitForTimeout(300);
    await statusSelect.selectOption("defaulters");
    await page.waitForTimeout(300);
    await statusSelect.selectOption("all");
    await page.waitForTimeout(300);

    // Test Wing Dropdown
    await wingSelect.selectOption("wing-a");
    await page.waitForTimeout(300);
    await wingSelect.selectOption("wing-b");
    await page.waitForTimeout(300);
    await wingSelect.selectOption("all");
    await page.waitForTimeout(300);

    // Test Channel Dropdown
    await channelSelect.selectOption("bbps");
    await page.waitForTimeout(300);
    await channelSelect.selectOption("upi");
    await page.waitForTimeout(300);
    await channelSelect.selectOption("all");
    await page.waitForTimeout(300);

    // Test Search Input
    const searchInput = page.locator("input[placeholder*='Search']").first();
    await searchInput.fill("A-101");
    await page.waitForTimeout(300);
    await searchInput.clear();
    await page.waitForTimeout(300);
  });

  test("2. Residents Module: Wing, Occupancy, KYC dropdowns and Search input", async ({ page }) => {
    await page.goto("/residents");
    await expect(page).toHaveURL(/.*\/residents/);
    await page.waitForTimeout(1000);

    const selects = page.locator("select");
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Wing Filter
    await selects.nth(0).selectOption("wing-a");
    await page.waitForTimeout(300);
    await selects.nth(0).selectOption("wing-b");
    await page.waitForTimeout(300);
    await selects.nth(0).selectOption("all");
    await page.waitForTimeout(300);

    // Occupancy Filter
    await selects.nth(1).selectOption("owner");
    await page.waitForTimeout(300);
    await selects.nth(1).selectOption("tenant");
    await page.waitForTimeout(300);
    await selects.nth(1).selectOption("all");
    await page.waitForTimeout(300);

    // KYC Filter
    await selects.nth(2).selectOption("pending");
    await page.waitForTimeout(300);
    await selects.nth(2).selectOption("all");
    await page.waitForTimeout(300);

    // Search filter
    const searchInput = page.locator("input[placeholder*='Search']").first();
    await searchInput.fill("Aarav");
    await page.waitForTimeout(300);
    await searchInput.clear();
    await page.waitForTimeout(300);
  });

  test("3. Complaints Module: Category pill filters and Search input", async ({ page }) => {
    await page.goto("/complaints");
    await expect(page).toHaveURL(/.*\/complaints/);
    await page.waitForTimeout(1000);

    // Filter pill buttons
    const filterPills = page.locator("button").filter({ hasText: /All Tickets|Elevator|Plumbing|Electrical|Security|High Priority/i });
    const pillCount = await filterPills.count();
    if (pillCount > 1) {
      await filterPills.nth(1).click();
      await page.waitForTimeout(300);
      await filterPills.nth(0).click();
      await page.waitForTimeout(300);
    }

    // Search input
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Elevator");
      await page.waitForTimeout(300);
      await searchInput.clear();
      await page.waitForTimeout(300);
    }
  });

  test("4. Visitors Module: Category tabs and Visitor search input", async ({ page }) => {
    await page.goto("/visitors");
    await expect(page).toHaveURL(/.*\/visitors/);
    await page.waitForTimeout(1000);

    // Category tabs
    const categoryTabs = page.locator("button").filter({ hasText: /All Entries|Deliveries|Domestic Staff|Expected Guests|Exited/i });
    const tabCount = await categoryTabs.count();
    if (tabCount > 1) {
      await categoryTabs.nth(1).click();
      await page.waitForTimeout(300);
      await categoryTabs.nth(0).click();
      await page.waitForTimeout(300);
    }

    // Search input
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Amazon");
      await page.waitForTimeout(300);
      await searchInput.clear();
      await page.waitForTimeout(300);
    }
  });

  test("5. Units Spatial Inventory: Building, Status dropdowns and Flat search", async ({ page }) => {
    await page.goto("/units");
    await expect(page).toHaveURL(/.*\/units/);
    await page.waitForTimeout(1000);

    const selects = page.locator("select");
    const count = await selects.count();
    if (count >= 1) {
      // Select status dropdown
      const statusSelect = page.locator("select").filter({ hasText: /Occupied|Vacant|All Occupancy/i }).first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption({ label: "Occupied" });
        await page.waitForTimeout(300);
        await statusSelect.selectOption({ label: "Vacant" });
        await page.waitForTimeout(300);
        await statusSelect.selectOption("");
        await page.waitForTimeout(300);
      }
    }

    // Search input
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("101");
      await page.waitForTimeout(300);
      await searchInput.clear();
      await page.waitForTimeout(300);
    }
  });

  test("6. Settings Governance: Maintenance Method & Billing Cycle Dropdowns", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/.*\/settings/);
    await page.waitForTimeout(1000);

    // Switch to Billing Tab
    await page.click('button:has-text("Billing & Reserve Formulas")');
    await page.waitForTimeout(500);

    // Test Maintenance Calculation Method dropdown
    const methodSelect = page.locator("select").filter({ hasText: /Fixed Flat Amount|Area-Based/i }).first();
    await expect(methodSelect).toBeVisible();

    // Verify option toggle
    await methodSelect.selectOption("PER_SQFT");
    await page.waitForTimeout(300);
    await expect(page.locator("text=Monthly Rate (₹ per sq. ft.)")).toBeVisible();

    await methodSelect.selectOption("FIXED_AMOUNT");
    await page.waitForTimeout(300);
    await expect(page.locator("text=Monthly Maintenance Amount (₹ per flat)")).toBeVisible();

    // Test Billing Cycle Frequency dropdown
    const cycleSelect = page.locator("select").filter({ hasText: /Monthly|Quarterly/i }).first();
    await expect(cycleSelect).toBeVisible();
    await cycleSelect.selectOption("QUARTERLY");
    await page.waitForTimeout(200);
    await cycleSelect.selectOption("MONTHLY");
    await page.waitForTimeout(200);
  });
});
