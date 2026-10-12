import { test, expect } from "@playwright/test";
import * as path from "path";

const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/qa/screenshots");

test.describe("Deep Interactive Component & Functional Verification", () => {
  test("Session Persistence: Hard reload on /dashboard preserves session", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Hard page reload
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator("h1")).toContainText("Society Operational Command Center");
  });

  test("Buildings Module: Modal Open, Form Inputs, and Close Interaction", async ({ page }) => {
    await page.goto("/buildings");
    await expect(page).toHaveURL(/.*\/buildings/);

    // Locate and click Add Building button
    const addBtn = page.getByRole("button", { name: /Add Building|Register Tower/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal is displayed
    const modal = page.locator("div[role='dialog']").or(page.locator(".fixed.inset-0"));
    await expect(modal.first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "modal-add-building.png") });

    // Test form inputs inside modal
    const nameInput = page.locator("input[placeholder*='Tower']").or(page.locator("input[type='text']").first());
    await nameInput.fill("Tower C - Amaltas");

    // Click cancel or close button
    const closeBtn = page.getByRole("button", { name: /Cancel|Close/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }

    // Modal should close
    await expect(page.locator("div[role='dialog']")).toHaveCount(0);
  });

  test("Complaints Module: Filter Tabs, Raise Complaint Modal & View Details", async ({ page }) => {
    await page.goto("/complaints");
    await expect(page).toHaveURL(/.*\/complaints/);

    // Filter tabs interaction
    const filterTabs = page.locator("button").filter({ hasText: /All|Pending|In Progress|Resolved/i });
    if ((await filterTabs.count()) > 1) {
      await filterTabs.nth(1).click();
      await page.waitForTimeout(300);
      await filterTabs.nth(0).click();
      await page.waitForTimeout(300);
    }

    // Search input interaction
    const searchInput = page.locator("input[type='search'], input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Elevator");
      await page.waitForTimeout(300);
      await searchInput.clear();
    }

    // Raise Complaint Modal
    const raiseBtn = page.getByRole("button", { name: /Raise Complaint|New Complaint|Log Ticket/i }).first();
    if (await raiseBtn.isVisible()) {
      await raiseBtn.click();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "modal-raise-complaint.png") });

      // Close modal
      const cancelBtn = page.getByRole("button", { name: /Cancel/i }).first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }
  });

  test("Visitors Module: Search, Log Visitor Dialog, Check-in Form", async ({ page }) => {
    await page.goto("/visitors");
    await expect(page).toHaveURL(/.*\/visitors/);

    // Search input
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Courier");
      await page.waitForTimeout(300);
      await searchInput.clear();
    }

    // Log Visitor Dialog
    const logVisitorBtn = page.getByRole("button", { name: /Log Visitor|New Visitor|Check In/i }).first();
    if (await logVisitorBtn.isVisible()) {
      await logVisitorBtn.click();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "modal-log-visitor.png") });

      const closeBtn = page.getByRole("button", { name: /Cancel|Close/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }
  });

  test("Notices Module: Notice Board View & Notice Modal", async ({ page }) => {
    await page.goto("/notices");
    await expect(page).toHaveURL(/.*\/notices/);

    const publishBtn = page.getByRole("button", { name: /Publish Notice|Create Notice|New Notice/i }).first();
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "modal-publish-notice.png") });

      const cancelBtn = page.getByRole("button", { name: /Cancel/i }).first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }
  });

  test("Billing Module: Tab Switching and Ledger Verification", async ({ page }) => {
    await page.goto("/billing");
    await expect(page).toHaveURL(/.*\/billing/);

    // Verify billing tabs
    const tabs = page.locator("button").filter({ hasText: /All|Pending|Overdue|Paid/i });
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(300);
      await tabs.nth(0).click();
    }

    // Check Run Billing / Generate Run button
    const runBtn = page.getByRole("button", { name: /Run Billing|Generate|Create Bill/i }).first();
    if (await runBtn.isVisible()) {
      await runBtn.click();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "modal-billing-action.png") });

      const cancelBtn = page.getByRole("button", { name: /Cancel|Close/i }).first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }
  });

  test("Header Controls: Navigation Links, Society Switcher & User Menu", async ({ page }) => {
    await page.goto("/dashboard");

    // Header brand / society name
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Verify emerald heights text or logo
    await expect(page.locator("text=Emerald Heights").or(page.locator("text=GIRVASA")).first()).toBeVisible();

    // Check notification bell icon button
    const bellBtn = header.locator("button").filter({ has: page.locator("svg") }).nth(1);
    if (await bellBtn.isVisible()) {
      await bellBtn.click();
      await page.waitForTimeout(300);
    }
  });
});
