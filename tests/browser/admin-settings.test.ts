import { expect, test } from "@playwright/test";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { waitForHydration } from "../lib/utils";

// Changing the instance settings is tested in shared-settings/, as it affects
// all other tests

test.describe("instance settings", () => {
  test("render for admins", async ({ page }) => {
    const admin = await createUser(undefined, undefined, "admin");
    await login(page, admin.email, DEFAULT_PASSWORD);

    await page.goto("/admin/settings");
    await waitForHydration(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "Instance settings" })
    ).toBeVisible();
  });

  test("are not available to managers", async ({ page }) => {
    const location = await createLocation("multiple");
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    await login(page, manager.email, DEFAULT_PASSWORD);

    await page.goto("/admin");
    await expect(page).toHaveURL(`/admin/${location.slug}`);
    await expect(page.getByRole("link", { name: "Locations" })).toHaveCount(0);

    const response = await page.goto("/admin/settings");
    expect(response?.status()).toBe(404);
  });
});
