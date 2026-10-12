import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/qa/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe("All Application Routes Discovery & Render Validation", () => {
  const routes = [
    { path: "/dashboard", name: "dashboard", expectedTitle: /Command Center|Dashboard/i },
    { path: "/buildings", name: "buildings", expectedTitle: /Building/i },
    { path: "/units", name: "units", expectedTitle: /Unit/i },
    { path: "/residents", name: "residents", expectedTitle: /Resident/i },
    { path: "/billing", name: "billing", expectedTitle: /Bill|Invoice/i },
    { path: "/payments", name: "payments", expectedTitle: /General Ledger|Payment|Collection/i },
    { path: "/complaints", name: "complaints", expectedTitle: /Complaint|Helpdesk/i },
    { path: "/visitors", name: "visitors", expectedTitle: /Visitor/i },
    { path: "/amenities", name: "amenities", expectedTitle: /Amenit/i },
    { path: "/parking", name: "parking", expectedTitle: /Parking/i },
    { path: "/notices", name: "notices", expectedTitle: /Notice/i },
    { path: "/events", name: "events", expectedTitle: /Event/i },
    { path: "/polls", name: "polls", expectedTitle: /Democratic Resolution|Poll|E-Voting/i },
    { path: "/documents", name: "documents", expectedTitle: /Document/i },
    { path: "/staff", name: "staff", expectedTitle: /Staff/i },
    { path: "/vendors", name: "vendors", expectedTitle: /Vendor/i },
    { path: "/reports", name: "reports", expectedTitle: /Report|Analytic/i },
    { path: "/audit", name: "audit", expectedTitle: /Audit/i },
    { path: "/settings", name: "settings", expectedTitle: /Setting/i },
    { path: "/society", name: "society", expectedTitle: /Society/i },
    { path: "/profile", name: "profile", expectedTitle: /Profile|Account/i },
    { path: "/onboarding", name: "onboarding", expectedTitle: /Onboarding|Setup|Wizard|Command Center/i },
  ];

  for (const r of routes) {
    test(`Route ${r.path} renders successfully without crash`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(r.path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(r.path === "/onboarding" ? /.*(\/onboarding|\/dashboard)/ : new RegExp(r.path), { timeout: 10000 });

      // Allow UI hydration and components to settle
      await page.waitForTimeout(500);

      // Capture screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${r.name}-desktop.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Verify header or content
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      await expect(heading).toHaveText(r.expectedTitle);

      // Verify no fatal unhandled React crash
      const errorBoundary = page.locator("text=Application error").or(page.locator("text=An error occurred"));
      await expect(errorBoundary).toHaveCount(0);
    });
  }
});
