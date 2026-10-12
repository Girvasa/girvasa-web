import { test, expect } from "@playwright/test";
import * as fs from "fs";

const BACKEND_LOG = "C:\\Users\\pinda\\.gemini\\antigravity-ide\\brain\\9aafe33a-e206-4bee-b301-e01182dda393\\.system_generated\\tasks\\task-71.log";

function getLatestOtp(phone: string = "+919876545001"): string {
  if (!fs.existsSync(BACKEND_LOG)) {
    throw new Error(`Backend log not found at ${BACKEND_LOG}`);
  }
  const content = fs.readFileSync(BACKEND_LOG, "utf-8");
  const regex = new RegExp(`Phone: \\+?919876545001 => VERIFICATION CODE: (\\d{6})`, "g");
  let match;
  let lastCode = "";
  while ((match = regex.exec(content)) !== null) {
    lastCode = match[1];
  }
  if (!lastCode) {
    throw new Error("No OTP found in log for " + phone);
  }
  return lastCode;
}

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication and Route Protection", () => {
  test("Redirects unauthenticated visitor from / to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator("h1")).toContainText("Sign In to Your Society Portal");
  });

  test("Redirects unauthenticated visitor from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Validates invalid phone numbers on login page", async ({ page }) => {
    await page.goto("/login");
    const input = page.locator("#mobile-number-input");
    await input.fill("123");
    await page.getByRole("button", { name: "Send Verification Code" }).click();
    await expect(page.locator("text=Please enter a valid 10-digit mobile number").first()).toBeVisible();
  });

  test("Performs full interactive UI login and lands on dashboard", async ({ page }) => {
    await page.goto("/login");

    // Enter phone
    const input = page.locator("#mobile-number-input");
    await input.fill("9876545001");
    await page.getByRole("button", { name: "Send Verification Code" }).click();

    // Verify Step 2 UI is displayed
    await expect(page.locator("text=OTP Dispatched")).toBeVisible();
    await expect(page.locator("text=Enter 6-Digit Verification Code")).toBeVisible();

    // Wait a brief moment for OTP delivery log to flush
    await page.waitForTimeout(1000);
    const otp = getLatestOtp("+919876545001");

    // Enter OTP
    const otpInput = page.locator("input[placeholder='e.g. 123456']");
    await otpInput.fill(otp);
    await page.getByRole("button", { name: "Authenticate & Open Society Console" }).click();

    // Confirm navigation to /dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Society Operational Command Center");
  });
});
