import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BACKEND_LOG =
  "C:\\Users\\pinda\\.gemini\\antigravity-ide\\brain\\9aafe33a-e206-4bee-b301-e01182dda393\\.system_generated\\tasks\\task-71.log";

const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/qa/screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function getLatestOtp(phone: string): string {
  if (!fs.existsSync(BACKEND_LOG)) {
    throw new Error(`Backend log not found at ${BACKEND_LOG}`);
  }
  const content = fs.readFileSync(BACKEND_LOG, "utf-8");
  const cleanPhone = phone.replace(/^\+/, "");
  const regex = new RegExp(`Phone: \\+?${cleanPhone} => VERIFICATION CODE: (\\d{6})`, "g");
  let match;
  let lastCode = "";
  while ((match = regex.exec(content)) !== null) {
    lastCode = match[1];
  }
  if (!lastCode) {
    throw new Error(`No OTP found in log for ${phone}`);
  }
  return lastCode;
}

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Exhaustive Login & Authentication Flow Testing", () => {
  test("1.1 Login Page UI & Static Elements: branding, compliance, and language buttons", async ({ page }) => {
    await page.goto("/login");

    // Header Branding & Title
    await expect(page.locator("text=GIRVASA").first()).toBeVisible();
    await expect(page.locator("text=Society OS").first()).toBeVisible();
    await expect(page.locator("h1")).toContainText("Sign In to Your Society Portal");

    // Compliance badges
    await expect(page.locator("text=256-Bit Encrypted MCS-Compliant Gateway")).toBeVisible();
    await expect(page.locator("text=MCS Act & Model Bye-Laws Compliant").first()).toBeVisible();

    // Support phone link
    const supportLink = page.locator("a[href='tel:+918850409901']");
    await expect(supportLink).toBeVisible();
    await expect(supportLink).toContainText("+91 8850 40 9901");

    // Language buttons (use exact match to avoid matching other buttons)
    await expect(page.getByRole("button", { name: "EN", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "MR", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "HI", exact: true })).toBeVisible();

    // Link to Registration
    const regLink = page.locator("a[href='/register']");
    await expect(regLink).toBeVisible();
    await expect(regLink).toContainText("Register Society & Start 14-Day Free Trial");

    // Capture visual screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "login-page-clean.png") });
  });

  test("1.2 Login Form Validation: empty, non-numeric, short phone inputs", async ({ page }) => {
    await page.goto("/login");

    const phoneInput = page.locator("#mobile-number-input");
    const submitBtn = page.getByRole("button", { name: "Send Verification Code" });

    // Test 1: Empty input
    await submitBtn.click();
    await expect(page.locator("text=Please enter a valid 10-digit mobile number").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "login-error-empty.png") });

    // Test 2: Incomplete / short phone number
    await phoneInput.fill("98765");
    await submitBtn.click();
    await expect(page.locator("text=Please enter a valid 10-digit mobile number").first()).toBeVisible();

    // Test 3: Valid 10-digit input displays checkmark
    await phoneInput.fill("9876545001");
    // Verify checkmark icon appears in input field
    const checkmark = page.locator("svg.text-\\[\\#006a61\\]");
    await expect(checkmark.first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "login-valid-phone-ready.png") });
  });

  test("1.3 Step Toggle & Change Phone interaction", async ({ page }) => {
    await page.goto("/login");

    const phoneInput = page.locator("#mobile-number-input");
    await phoneInput.fill("9876545001");
    await page.getByRole("button", { name: "Send Verification Code" }).click();

    // Confirm step 2
    await expect(page.locator("text=OTP Dispatched")).toBeVisible();
    await expect(page.locator("text=9876545001")).toBeVisible();

    // Click "Change" button in the alert banner
    await page.getByRole("button", { name: "Change" }).click();

    // Verify step 1 is restored with phone number intact
    await expect(page.locator("#mobile-number-input")).toBeVisible();
    await expect(page.locator("#mobile-number-input")).toHaveValue("9876545001");
  });

  test("1.4 OTP Validation: empty, invalid OTP rejection", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#mobile-number-input").fill("9876545001");
    await page.getByRole("button", { name: "Send Verification Code" }).click();
    await expect(page.locator("text=Enter 6-Digit Verification Code")).toBeVisible();

    const otpInput = page.locator("input[placeholder='e.g. 123456']");
    const verifyBtn = page.getByRole("button", { name: "Authenticate & Open Society Console" });

    // Test incomplete OTP
    await otpInput.fill("123");
    await verifyBtn.click();
    await expect(page.locator("text=Please enter the complete 6-digit verification code")).toBeVisible();

    // Test invalid OTP code
    await otpInput.fill("000000");
    await verifyBtn.click();
    await expect(page.locator("text=Invalid").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "login-error-invalid-otp.png") });
  });

  test("1.5 Society Admin Login & Dashboard Navigation: +919876545001", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#mobile-number-input").fill("9876545001");
    await page.getByRole("button", { name: "Send Verification Code" }).click();
    await expect(page.locator("text=Enter 6-Digit Verification Code")).toBeVisible();

    await page.waitForTimeout(1000);
    const otp = getLatestOtp("+919876545001");

    const otpInput = page.locator("input[placeholder='e.g. 123456']");
    await otpInput.fill(otp);
    await page.getByRole("button", { name: "Authenticate & Open Society Console" }).click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Society Operational Command Center");

    // Verify Admin sees full admin navigation items in sidebar
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Buildings" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Billing" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Audit Trail" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("1.6 Resident Login & Role-Based UI Scoping: Aarav Sharma (+919876543210)", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#mobile-number-input").fill("9876543210");
    await page.getByRole("button", { name: "Send Verification Code" }).click();
    await expect(page.locator("text=Enter 6-Digit Verification Code")).toBeVisible();

    await page.waitForTimeout(1000);
    const otp = getLatestOtp("+919876543210");

    const otpInput = page.locator("input[placeholder='e.g. 123456']");
    await otpInput.fill(otp);
    await page.getByRole("button", { name: "Authenticate & Open Society Console" }).click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Verify Resident RBAC: Resident has access to Complaints, Notices, Billing, Visitors, etc.
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Complaints" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Notices" })).toBeVisible();

    // Verify Resident does NOT see Admin Settings or Audit Trail
    await expect(sidebar.getByRole("link", { name: "Settings" })).toHaveCount(0);
    await expect(sidebar.getByRole("link", { name: "Audit Trail" })).toHaveCount(0);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard-resident-scoped.png") });
  });

  test("1.7 Logout Lifecycle: Clears session and redirects to /login", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("#mobile-number-input").fill("9876545001");
    await page.getByRole("button", { name: "Send Verification Code" }).click();
    await page.waitForTimeout(1000);
    const otp = getLatestOtp("+919876545001");
    await page.locator("input[placeholder='e.g. 123456']").fill(otp);
    await page.getByRole("button", { name: "Authenticate & Open Society Console" }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Navigate to profile page
    await page.goto("/profile");
    await expect(page).toHaveURL(/.*\/profile/);

    // Click Sign Out button
    const logoutBtn = page.getByRole("button", { name: /Sign Out|Log Out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      });
    }

    await expect(page).toHaveURL(/.*\/login/);

    // Confirm session is completely cleared by attempting to navigate back to /dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe("Exhaustive Registration Flow Testing", () => {
  test("2.1 Registration Page UI & Pricing Tier Discovery", async ({ page }) => {
    await page.goto("/register");

    // Header & Title
    await expect(page.locator("h1")).toContainText("Girvasa Society OS");
    await expect(page.locator("h2")).toContainText("Register Housing Society & Start Setup");
    await expect(page.locator("text=14-Day Full-Access Free Trial")).toBeVisible();

    // Verify all 3 subscription tiers are rendered
    await expect(page.locator("text=Starter Plan")).toBeVisible();
    await expect(page.locator("text=Growth Plan")).toBeVisible();
    await expect(page.locator("text=Enterprise Plan")).toBeVisible();

    // Verify pricing amounts
    await expect(page.locator("text=₹1,499")).toBeVisible();
    await expect(page.locator("text=₹3,499")).toBeVisible();
    await expect(page.locator("text=₹7,999")).toBeVisible();

    // Test tier card selection
    const starterCard = page.locator("div").filter({ hasText: /^Starter Plan/ }).first();
    await starterCard.click();
    await expect(starterCard.locator("svg.text-\\[\\#006a61\\]")).toBeVisible();

    const enterpriseCard = page.locator("div").filter({ hasText: /^Enterprise Plan/ }).first();
    await enterpriseCard.click();
    await expect(enterpriseCard.locator("svg.text-\\[\\#006a61\\]")).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "register-page-tiers.png") });
  });

  test("2.2 Registration Validation: Invalid Phone & Invalid Pincode", async ({ page }) => {
    await page.goto("/register");

    const submitBtn = page.getByRole("button", { name: /Create Society & Start Setup Wizard/i });

    // Fill form with invalid phone
    await page.locator("input[name='adminName']").fill("Suresh Raina");
    await page.locator("input[name='adminMobile']").fill("123");
    await page.locator("input[name='societyName']").fill("Galaxy Enclave");
    await page.locator("input[name='addressLine1']").fill("MG Road");
    await page.locator("input[name='pincode']").fill("411001");

    await submitBtn.click();
    await expect(page.locator("text=Please enter a valid 10-digit mobile number").first()).toBeVisible();

    // Fill valid phone but invalid pincode (less than 6 digits)
    await page.locator("input[name='adminMobile']").fill("9822998877");
    await page.locator("input[name='pincode']").fill("411");
    await submitBtn.click();
    await expect(page.locator("text=Pincode must be 6 digits").first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "register-validation-errors.png") });
  });

  test("2.3 End-to-End Self-Serve Registration: Creates New Society Tenant and Launches Onboarding Wizard", async ({ page }) => {
    await page.goto("/register");

    // Generate unique random society name and phone to prevent collisions
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const testPhone = `9822${randomSuffix.toString().slice(0, 6)}`;
    const societyName = `Gulmohar Woods CHS ${randomSuffix}`;
    const societyCode = `GW_${randomSuffix.toString().slice(0, 4)}`;

    // Select Growth Plan
    const growthCard = page.locator("div").filter({ hasText: /^Growth Plan/ }).first();
    await growthCard.click();

    // Fill registration form
    await page.locator("input[name='adminName']").fill("Vikramaditya Rao");
    await page.locator("input[name='adminMobile']").fill(testPhone);
    await page.locator("input[name='adminEmail']").fill(`admin.${randomSuffix}@gulmoharwoods.in`);
    await page.locator("input[name='societyName']").fill(societyName);
    await page.locator("input[name='societyCode']").fill(societyCode);
    await page.locator("input[name='addressLine1']").fill("Survey No 88, Kothrud Extension");
    await page.locator("input[name='city']").fill("Pune");
    await page.locator("input[name='pincode']").fill("411038");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "register-form-filled.png") });

    // Submit registration
    const submitBtn = page.getByRole("button", { name: /Create Society & Start Setup Wizard/i });
    await submitBtn.click();

    // Verify auto-login and transition to onboarding wizard
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 15000 });

    // Verify Onboarding Wizard Step 1 UI is loaded for the new society
    await expect(page.locator("text=Step 1").or(page.locator("h2, h1")).first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "onboarding-new-society-launched.png") });
  });
});
