import { test as setup, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth-helper";
import * as fs from "fs";
import * as path from "path";

const AUTH_FILE = path.resolve(__dirname, "../playwright/.auth/admin.json");

setup("Authenticate Admin Alpha and store session state", async ({ page, context }) => {
  const dir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await loginAsAdmin(page);
  await expect(page).toHaveURL(/.*\/dashboard/);

  // Store storageState (cookies & localStorage)
  await context.storageState({ path: AUTH_FILE });
});
