import { Page } from "@playwright/test";
import * as fs from "fs";

export function getLatestOtp(phone: string = "+919876545001"): string {
  if (process.env.TEST_OTP) {
    return process.env.TEST_OTP;
  }
  const dir =
    process.env.BACKEND_LOG_DIR ||
    "C:\\Users\\pinda\\.gemini\\antigravity-ide\\brain\\9aafe33a-e206-4bee-b301-e01182dda393\\.system_generated\\tasks";
  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith("task-") && f.endsWith(".log"))
      .map((f) => ({ path: `${dir}\\${f}`, time: fs.statSync(`${dir}\\${f}`).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    for (const file of files) {
      const content = fs.readFileSync(file.path, "utf-8");
      const regex = new RegExp(`Phone: \\+?919876545001 => VERIFICATION CODE: (\\d{6})`, "g");
      let match;
      let lastCode = "";
      while ((match = regex.exec(content)) !== null) {
        lastCode = match[1];
      }
      if (lastCode) return lastCode;
    }
  }
  return "123456";
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  const input = page.locator("#mobile-number-input");
  await input.fill("9876545001");
  await page.getByRole("button", { name: "Send Verification Code" }).click();
  await page.waitForTimeout(1000);
  const otp = getLatestOtp("+919876545001");
  const otpInput = page.locator("input[placeholder='e.g. 123456']");
  await otpInput.fill(otp);
  await page.getByRole("button", { name: "Authenticate & Open Society Console" }).click();
  await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
}
