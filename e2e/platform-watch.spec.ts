import { test, expect } from "@playwright/test";

test.describe("Platform Live Watch Cockpit E2E", () => {
  test("loads platform watch page and displays telemetry, client societies and user breakdown", async ({ page }) => {
    // Navigate directly to the platform watch page
    await page.goto("http://localhost:3000/platform/watch");

    // Expect page title
    await expect(page.locator("h1")).toContainText("Platform Live Watch");

    // Expect Live Stream badge
    await expect(page.getByText("Live Stream")).toBeVisible();

    // Expect System Engine Status card
    await expect(page.getByText("System Engine Status")).toBeVisible();
    await expect(page.getByText("HEALTHY")).toBeVisible();

    // Expect Client Societies section
    await expect(page.getByText("1. Client Societies & SaaS Adoption")).toBeVisible();
    await expect(page.getByText("Societies Onboarded")).toBeVisible();
    await expect(page.getByText("Total Flats Under Mgmt")).toBeVisible();
    await expect(page.getByText("Estimated Monthly MRR")).toBeVisible();

    // Expect User Concurrency Breakdown section
    await expect(page.getByText("2. User Concurrency Breakdown (Web vs Mobile App)")).toBeVisible();
    await expect(page.getByText("Web Portal Users")).toBeVisible();
    await expect(page.getByText("Mobile App Users")).toBeVisible();

    // Expect Client Societies Directory Table
    await expect(page.getByText("Client Societies Directory")).toBeVisible();
    await expect(page.getByRole("table").getByText("EH_001", { exact: true })).toBeVisible();
  });
});
