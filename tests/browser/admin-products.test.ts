import { expect, test } from "@playwright/test";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { waitForHydration } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("admin products", () => {
  test("filters apply the option that was just selected", async ({ page }) => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    const active = await createProduct(location);
    const inactive = await createProduct(location);
    await pb.collection("products").update(inactive.id, { active: false });
    const activeCard = page.getByTestId(`product-card-${active.id}`);
    const inactiveCard = page.getByTestId(`product-card-${inactive.id}`);

    await login(page, manager.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/products`);
    await waitForHydration(page);
    await expect(activeCard).toBeVisible();
    await expect(inactiveCard).toBeVisible();

    // Select options with the keyboard, like a user does, so the browser
    // fires its own input and change events
    const status = page.getByLabel("Status");
    await status.focus();

    await page.keyboard.press("ArrowDown"); // Active
    await expect(status).toHaveValue("active");
    await expect(activeCard).toBeVisible();
    await expect(inactiveCard).toHaveCount(0);

    await page.keyboard.press("ArrowDown"); // Inactive
    await expect(status).toHaveValue("inactive");
    await expect(inactiveCard).toBeVisible();
    await expect(activeCard).toHaveCount(0);

    // Both products have a description, so none is missing one
    const missing = page.getByLabel("Missing info");
    await missing.focus();
    await page.keyboard.press("ArrowDown"); // No photo
    await expect(missing).toHaveValue("photo");
    await expect(inactiveCard).toBeVisible();
    await page.keyboard.press("ArrowDown"); // No description
    await expect(missing).toHaveValue("description");
    await expect(inactiveCard).toHaveCount(0);
    await expect(activeCard).toHaveCount(0);
  });
});
